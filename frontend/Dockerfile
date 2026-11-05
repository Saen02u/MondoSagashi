# ==========================================
# 1단계: 빌드 환경 (Node.js 22 Alpine)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# 의존성 패키지 명세 복사 및 설치 (캐시 레이어 활용)
COPY package.json ./
RUN npm install

# 소스코드 전체 복사 및 프로덕션 빌드 (TypeScript 컴파일 & Vite 번들링)
COPY . .
RUN npm run build

# ==========================================
# 2단계: Nginx 경량 프로덕션 서빙 환경
# ==========================================
FROM nginx:1.27-alpine AS runner

# 커스텀 Nginx 설정 복사 (SPA 라우팅 및 /api 프록시)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 산출물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 기본 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
