# Nginx 경량 Alpine 이미지를 기반으로 정적 웹 호스팅
FROM nginx:alpine

# 기본 설정 파일 교체
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 웹사이트 정적 파일 복사
COPY . /usr/share/nginx/html

# 불필요한 설정 및 가이드 파일 제거
RUN rm -f /usr/share/nginx/html/nginx.conf \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/DEPLOYMENT_GUIDE.md

# 80 포트 개방
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
