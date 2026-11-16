# 🚀 ER:ON 홈페이지 오라클 클라우드(OCI) 배포 & 도메인 연결 완벽 가이드

본 가이드는 첨부자료(ER:ON 임상 의사결정 보조 시스템)를 기반으로 제작된 회사 홈페이지를 **오라클 클라우드(Oracle Cloud Infrastructure, OCI)의 평생 무료(Always Free) 서버에 배포**하고, **추후 도메인을 연결하는 방법**을 다룹니다.

> 🐧 **운영체제 호환성**:  
> **Oracle Linux 8 / 9** 및 **Ubuntu 20.04 / 22.04 / 24.04** 모두 완벽하게 지원됩니다.

---

## 📁 프로젝트 파일 구성

```text
company-website/
├── index.html            # ER:ON 메인 홈페이지 (반응형, 접근성 최적화)
├── style.css             # 메디컬 AI 테크 감성의 최신 UI/UX 디자인 시스템
├── script.js             # 실시간 인터랙티브 시뮬레이터 & 테마 엔진
├── nginx.conf            # Nginx 고성능 압축 & 보안 헤더 & IP 직접 접속 설정
├── deploy_oci.sh         # [추천] Oracle Linux 9 / Ubuntu 자동 감지 원클릭 배포 스크립트
├── Dockerfile            # Docker 컨테이너 빌드 파일 (선택)
├── docker-compose.yml    # Docker Compose 파일 (선택)
└── DEPLOYMENT_GUIDE.md   # 본 가이드 문서
```

---

## ☁️ 1단계: 오라클 클라우드(OCI) 가상 머신(VM) 생성

1. **오라클 클라우드 콘솔 로그인**: [https://cloud.oracle.com](https://cloud.oracle.com)
2. **인스턴스 생성 이동**: 좌측 햄버거 메뉴(≡) &rarr; `컴퓨트(Compute)` &rarr; `인스턴스(Instances)` &rarr; **인스턴스 생성(Create Instance)** 클릭
3. **인스턴스 사양 설정**:
   - **이름**: `eron-web-server` (자유롭게 입력)
   - **이미지**: **`Oracle Linux 9`** (또는 `Ubuntu 22.04/24.04`) 선택
   - **구성(Shape)**:
     - *추천 1*: `Ampere ARM (VM.Standard.A1.Flex)` - OCPU 1~4, RAM 6~24GB (Always Free 지원)
     - *추천 2*: `AMD (VM.Standard.E2.1.Micro)` - OCPU 1, RAM 1GB (Always Free)
   - **네트워킹**: `공용 IPv4 주소 할당 (Assign a public IPv4 address)` 체크
   - **SSH 키 추가**: **`전용 키 저장(Save Private Key)`** 버튼을 클릭하여 `.key` 파일을 컴퓨터에 반드시 안전하게 보관
4. **생성 완료 후 공용 IP 확인**:
   - 인스턴스가 `실행 중(Running)` 상태가 되면 발급된 **공용 IP(Public IP, 예: `152.xx.xx.xx`)**를 복사합니다.

---

## 🛡️ 2단계: OCI 수신 규칙 (80, 443 포트 개방) ⭐ 필수!

> ⚠️ **주의**: 오라클 클라우드는 기본적으로 가상 방화벽에서 웹 포트(80, 443)가 차단되어 있습니다. 콘솔에서 수신 규칙을 추가하지 않으면 웹사이트에 접속되지 않습니다.

1. OCI 콘솔 &rarr; 생성한 인스턴스의 상세 페이지 이동
2. `주 VNIC` 섹션 &rarr; 연결된 **서브넷(Subnet)** 링크 클릭
3. **기본 보안 목록 (Default Security List for ...)** 클릭
4. **수신 규칙 추가 (Add Ingress Rules)** 클릭 후 아래와 같이 입력:
   - **소스 CIDR**: `0.0.0.0/0`
   - **IP 프로토콜**: `TCP`
   - **대상 포트 범위**: `80,443`
   - **설명**: `ER:ON Web Server HTTP and HTTPS`
5. **수신 규칙 추가** 버튼 클릭

---

## ⚡ 3단계: 도메인 연결 전, 공용 IP로 즉시 배포 (원클릭)

도메인이 아직 없더라도 **공용 IP(`http://[서버-공용-IP]`)**로 브라우저에서 바로 웹사이트를 띄울 수 있습니다.

### 💡 SSH 기본 접속 계정 차이:
- **Oracle Linux 9**: 계정명이 **`opc`** 입니다. (예: `opc@152.xx.xx.xx`)
- **Ubuntu**: 계정명이 **`ubuntu`** 입니다. (예: `ubuntu@152.xx.xx.xx`)

---

### 방법 A. 원클릭 스크립트 배포 (가장 빠르고 간편한 방법)

1. **로컬 PC에서 서버로 파일 업로드**:
   내 컴퓨터의 터미널(PowerShell 또는 명령 프롬프트)에서 프로젝트 폴더를 서버로 전송합니다.
   ```bash
   # Oracle Linux 9인 경우 (계정: opc)
   scp -i "C:/path/to/your-key.key" -r "c:/Users/YUN/test/company-website" opc@152.xx.xx.xx:~/

   # (참고) Ubuntu인 경우: ubuntu@152.xx.xx.xx:~/
   ```

2. **서버 SSH 접속**:
   ```bash
   # Oracle Linux 9 접속
   ssh -i "C:/path/to/your-key.key" opc@152.xx.xx.xx
   ```

3. **원클릭 배포 스크립트 실행**:
   `deploy_oci.sh` 스크립트가 Oracle Linux 9를 자동 감지하여 `dnf`, `firewalld`, `SELinux` 설정을 한 번에 완료합니다:
   ```bash
   cd ~/company-website
   chmod +x deploy_oci.sh
   ./deploy_oci.sh
   ```

> 실행이 완료되면 즉시 웹 브라우저에서 **`http://152.xx.xx.xx`** 를 입력하여 ER:ON 홈페이지를 확인할 수 있습니다!

---

### (참고) Oracle Linux 9에서 수동으로 설치/설정할 경우 명령어
원클릭 스크립트를 쓰지 않고 직접 설정하고 싶으시다면 아래 명령어들을 순서대로 입력하시면 됩니다:
```bash
# 1. Nginx 및 방화벽 패키지 설치
sudo dnf install -y nginx firewalld policycoreutils-python-utils

# 2. 방화벽 80, 443 포트 개방
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 3. 웹 파일 복사 및 권한, SELinux 허용
sudo mkdir -p /var/www/html
sudo cp -r ~/company-website/index.html ~/company-website/style.css ~/company-website/script.js /var/www/html/
sudo chown -R nginx:nginx /var/www/html
sudo chmod -R 755 /var/www/html
sudo chcon -R -t httpd_sys_content_t /var/www/html

# 4. Nginx 가상호스트 설정 및 실행
sudo cp ~/company-website/nginx.conf /etc/nginx/conf.d/default.conf
sudo nginx -t
sudo systemctl enable --now nginx
```

---

## 🌐 4단계: [추후 진행] 도메인 연결 및 SSL(HTTPS) 인증서 적용

도메인을 구매하신 후 다음 단계로 연결하시면 됩니다.

### Step 4-1. 도메인 등록처(가비아, 후이즈, Cloudflare 등) DNS 레코드 등록
도메인 관리 페이지의 DNS 설정으로 이동하여 **A 레코드**를 등록합니다:

| 유형 (Type) | 호스트 (Name) | 값 (Value / IP) | TTL |
| :---: | :---: | :---: | :---: |
| **A** | `@` (루트) | **오라클 클라우드 공용 IP (`152.xx.xx.xx`)** | 300 또는 기본 |
| **A** | `www` | **오라클 클라우드 공용 IP (`152.xx.xx.xx`)** | 300 또는 기본 |

*(DNS 변경 사항이 전 세계에 전파되는 데 약 5~15분이 소요됩니다.)*

### Step 4-2. Nginx 설정에 도메인 이름 반영
서버에 SSH 접속 후 설정 파일을 엽니다:
```bash
# Oracle Linux 9
sudo nano /etc/nginx/conf.d/default.conf
```
`server_name _;` 부분을 구매하신 도메인으로 변경합니다:
```nginx
server_name yourdomain.com www.yourdomain.com;
```
저장 후 Nginx 설정을 다시 로드합니다:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4-3. 무료 Let's Encrypt SSL (HTTPS) 적용 (Certbot)
Oracle Linux 9 기준 Certbot 설치 및 인증서 자동 발급:
```bash
# EPEL 저장소 활성화 및 certbot 설치
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

# 인증서 발급 및 HTTPS 자동 적용
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
- 이메일 주소 입력 & 약관 동의(`Y`)
- 인증서가 발급되면 HTTP 접속 시 자동으로 안전한 HTTPS로 리다이렉트됩니다.
- 인증서는 90일마다 자동으로 갱신됩니다 (`sudo certbot renew --dry-run`으로 확인 가능).

---

## 💡 유지보수 & 콘텐츠 수정 팁

1. **텍스트 또는 디자인 수정 시**:
   - 로컬에서 파일 수정 후 `scp`로 서버에 덮어쓰기:
     ```bash
     scp -i your-key.key c:/Users/YUN/test/company-website/index.html opc@152.xx.xx.xx:/var/www/html/
     ```
2. **Nginx 상태 확인 명령어**:
   ```bash
   sudo systemctl status nginx     # 상태 확인
   sudo systemctl restart nginx    # 재시작
   sudo tail -f /var/log/nginx/error.log  # 에러 로그 모니터링
   ```
