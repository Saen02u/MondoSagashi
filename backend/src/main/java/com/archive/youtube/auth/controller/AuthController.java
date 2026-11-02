package com.archive.youtube.auth.controller;

import com.archive.youtube.auth.dto.AuthStatusResponse;
import com.archive.youtube.auth.dto.CsrfResponse;
import com.archive.youtube.auth.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 관리자 인증/인가 및 세션 관리 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    /**
     * 관리자 로그인
     * 인증 성공 시 서버 측 세션(JSESSIONID)을 발급합니다.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthStatusResponse> login(
        @Valid @RequestBody LoginRequest loginRequest,
        HttpServletRequest request
    ) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password())
        );

        SecurityContext securityContext = SecurityContextHolder.getContext();
        securityContext.setAuthentication(authentication);

        // 세션에 SecurityContext 바인딩
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        String role = authentication.getAuthorities().stream()
            .findFirst()
            .map(Object::toString)
            .orElse("ROLE_ADMIN");

        return ResponseEntity.ok(AuthStatusResponse.authenticated(authentication.getName(), role));
    }

    /**
     * 관리자 로그아웃
     * 현재 세션을 무효화합니다.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "로그아웃되었습니다."));
    }

    /**
     * 현재 로그인 세션 상태 확인
     */
    @GetMapping("/me")
    public ResponseEntity<AuthStatusResponse> getAuthStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String role = auth.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_ADMIN");
            return ResponseEntity.ok(AuthStatusResponse.authenticated(auth.getName(), role));
        }
        return ResponseEntity.ok(AuthStatusResponse.unauthenticated());
    }

    /**
     * SPA CSRF 토큰 발급/조회 엔드포인트
     */
    @GetMapping("/csrf")
    public ResponseEntity<CsrfResponse> getCsrfToken(HttpServletRequest request) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            return ResponseEntity.ok(new CsrfResponse(
                csrfToken.getToken(),
                csrfToken.getHeaderName(),
                csrfToken.getParameterName()
            ));
        }
        return ResponseEntity.ok(new CsrfResponse("", "X-XSRF-TOKEN", "_csrf"));
    }
}
