# ==========================================
# 1단계: 빌드 환경 (Maven & Eclipse Temurin JDK 21)
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Maven 래퍼 및 설정 복사 (캐시 효율화)
COPY pom.xml .
COPY src ./src

# 의존성 다운로드 및 애플리케이션 패키징 (테스트는 CI에서 기검증되므로 빌드 시간 단축)
RUN ./mvnw clean package -DskipTests 2>/dev/null || (apk add --no-cache maven && mvn clean package -DskipTests)

# ==========================================
# 2단계: 경량 런타임 환경 (Eclipse Temurin JRE 21)
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# 보안 강화를 위한 비루트(non-root) 실행 사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 빌드 결과물 JAR 복사
COPY --from=builder /app/target/youtube-live-archive-*.jar app.jar

# 소유권 변경
RUN chown -R appuser:appgroup /app

USER appuser

# 백엔드 API 기본 포트 노출
EXPOSE 8080

# 컨테이너 헬스체크 (Actuator 또는 기본 헬스체크 엔드포인트)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

# 컨테이너 메모리 최적화 JVM 플래그 (cgroup 인식 및 MaxRAMPercentage 75% 할당)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
