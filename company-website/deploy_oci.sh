#!/usr/bin/env bash
# ==============================================================================
# ER:ON Website - Oracle Cloud Infrastructure (OCI) One-Click Deploy Script
# Supported OS: Oracle Linux 8/9, RHEL, CentOS, Rocky, Alma, Ubuntu, Debian
# ==============================================================================

set -e

echo "=========================================================="
echo " [ER:ON] 오라클 클라우드(OCI) 웹서버 자동 설치 및 배포 시작 "
echo "=========================================================="

# OS 감지 (Oracle Linux vs Ubuntu/Debian)
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID=$ID
    OS_VERSION=$VERSION_ID
else
    OS_ID="unknown"
fi

echo ">> 감지된 운영체제: $OS_ID (Version: $OS_VERSION)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_ROOT="/var/www/html"

# 0. 메모리 부족(OOM Killed) 방지를 위한 Swap 메모리(2GB) 자동 구성
SWAP_EXISTS=$(swapon --show | wc -l)
if [ "$SWAP_EXISTS" -le 1 ]; then
    echo ">> [메모리 최적화] 1GB 미세 인스턴스를 위한 Swap 메모리(2GB) 생성 중..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
    fi
    echo ">> Swap 메모리 2GB 활성화 완료!"
fi

# 1. 패키지 설치 & OS별 방화벽/유저 설정
if [[ "$OS_ID" == "ol" || "$OS_ID" == "oracle" || "$OS_ID" == "rhel" || "$OS_ID" == "centos" || "$OS_ID" == "rocky" || "$OS_ID" == "alma" ]]; then
    echo ">> [1/5] Oracle Linux(RHEL 계열) 패키지 업데이트 및 Nginx 설치 중..."
    sudo dnf clean all || true
    sudo dnf install -y nginx firewalld || sudo yum install -y nginx

    WEB_USER="nginx"
    CONF_DIR="/etc/nginx/conf.d"
    CONF_FILE="/etc/nginx/conf.d/default.conf"

    echo ">> [2/5] Oracle Linux 방화벽 (firewalld) 80, 443 포트 개방 중..."
    sudo systemctl enable --now firewalld || true
    sudo firewall-cmd --permanent --add-service=http || true
    sudo firewall-cmd --permanent --add-service=https || true
    sudo firewall-cmd --permanent --add-port=80/tcp || true
    sudo firewall-cmd --permanent --add-port=443/tcp || true
    sudo firewall-cmd --reload || true

else
    echo ">> [1/5] Ubuntu/Debian 계열 패키지 업데이트 및 Nginx 설치 중..."
    sudo apt update -y
    sudo apt install -y nginx iptables-persistent netfilter-persistent

    WEB_USER="www-data"
    CONF_DIR="/etc/nginx/sites-available"
    CONF_FILE="/etc/nginx/sites-available/default"

    echo ">> [2/5] Ubuntu 방화벽 (iptables / ufw) 80, 443 포트 개방 중..."
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
    sudo netfilter-persistent save || true

    if command -v ufw >/dev/null 2>&1; then
        sudo ufw allow 80/tcp || true
        sudo ufw allow 443/tcp || true
    fi
fi

# 3. 배포 디렉토리 생성 및 소스 복사
echo ">> [3/5] 웹사이트 파일 배포 ($WEB_ROOT)..."
sudo mkdir -p "$WEB_ROOT"

sudo cp -f "$SCRIPT_DIR/index.html" "$WEB_ROOT/"
sudo cp -f "$SCRIPT_DIR/style.css" "$WEB_ROOT/"
sudo cp -f "$SCRIPT_DIR/script.js" "$WEB_ROOT/"

# 소유자 및 권한 설정
sudo chown -R $WEB_USER:$WEB_USER "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# SELinux 보안 컨텍스트 설정 (Oracle Linux / RHEL 전용)
if command -v getenforce >/dev/null 2>&1; then
    if [ "$(getenforce)" != "Disabled" ]; then
        echo ">> [SELinux] 웹 접근 보안 컨텍스트 적용 중..."
        sudo setsebool -P httpd_can_network_connect 1 || true
        sudo chcon -R -t httpd_sys_content_t "$WEB_ROOT" || true
    fi
fi

# 4. Nginx 가상 호스트 설정 (공용 IP & 도메인 모두 접속 가능하도록 구성)
echo ">> [4/5] Nginx 가상 호스트 설정 적용 ($CONF_FILE)..."
sudo mkdir -p "$(dirname "$CONF_FILE")"

sudo cat << 'EOF' | sudo tee "$CONF_FILE" > /dev/null
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    # 공용 IP 및 모든 도메인으로 즉시 접속 허용
    server_name _;

    root /var/www/html;
    index index.html;

    # Gzip 고성능 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json;

    # 보안 헤더
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # 정적 파일 캐시
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 기본 라우팅
    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /index.html;
}
EOF

# Ubuntu의 경우 sites-enabled 심볼릭 링크 연결
if [ "$OS_ID" = "ubuntu" ] || [ "$OS_ID" = "debian" ]; then
    sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
fi

# 5. Nginx 문법 검사 및 서비스 활성화/재시작
echo ">> [5/5] Nginx 설정 검사 및 서비스 시작..."
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

PUBLIC_IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "서버_공용_IP")

echo "=========================================================="
echo " 🎉 [ER:ON] $OS_ID 서버 배포가 성공적으로 완료되었습니다!"
echo ""
echo " 🌐 브라우저 접속 주소 (도메인 연결 전):"
echo "    http://$PUBLIC_IP"
echo ""
echo " ※ 주의: 오라클 클라우드 콘솔의 VCN 보안 목록(Security Lists)에서"
echo "    수신 규칙(Ingress Rule) 80 및 443 포트가 반드시 열려 있어야 합니다."
echo " ※ 추후 도메인 연결 및 SSL(HTTPS) 적용은 DEPLOYMENT_GUIDE.md를 참고하세요."
echo "=========================================================="
