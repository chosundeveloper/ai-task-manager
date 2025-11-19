# 🚇 localtunnel 상세 사용 가이드

## 1. 설치

```bash
npm install -g localtunnel
```

## 2. 사용 방법

### 옵션 A: 수동 실행

**터미널 1 - 서버 실행:**
```bash
cd /Users/john/projects/ai-task-manager
npm start
```

**터미널 2 - 터널 실행:**
```bash
lt --port 3000 --subdomain gpt-task-api
```

**출력:**
```
your url is: https://gpt-task-api.loca.lt
```

### 옵션 B: 자동 재연결 스크립트 (추천)

**터미널 1 - 서버:**
```bash
npm start
```

**터미널 2 - 터널 (자동 재연결):**
```bash
./start-tunnel.sh
```

## 3. 첫 접속 시 IP 인증 (중요!)

localtunnel은 보안을 위해 첫 접속 시 IP 인증이 필요합니다.

### 단계:

1. **브라우저에서 터널 URL 접속**
   ```
   https://gpt-task-api.loca.lt
   ```

2. **"Friendly Reminder" 페이지 표시됨**
   ```
   ┌─────────────────────────────────────┐
   │  Friendly Reminder                  │
   │  This is a localtunnel service      │
   │                                     │
   │  Click to Continue                  │
   │                                     │
   │  Your IP: xxx.xxx.xxx.xxx          │
   └─────────────────────────────────────┘
   ```

3. **"Click to Continue" 클릭**

4. **자동으로 서비스 접속됨**

**참고:**
- IP 인증은 각 브라우저/IP마다 1회만 필요
- ChatGPT Actions에서는 자동으로 처리됨

## 4. ChatGPT Actions 설정

### 4-1. GPT Builder 열기
1. ChatGPT → Explore GPTs → Create
2. Configure → Actions

### 4-2. Schema 입력

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Task API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://gpt-task-api.loca.lt"
    }
  ],
  "paths": {
    "/task": {
      "post": {
        "operationId": "createTask",
        "summary": "지시사항 전송",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "instructions": {
                    "type": "string",
                    "description": "상세한 개발 지시사항"
                  }
                },
                "required": ["instructions"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  }
}
```

### 4-3. Instructions 추가

```
사용자가 프로젝트 개발을 요청하면:

1. 먼저 상세한 요구사항을 질문:
  - 목표가 무엇인가?
  - 핵심 기능은?
  - 사용할 기술은?
  - 어떤 파일 구조를 원하는가?

2. 다음 형식으로 정리:

목표: [구체적 목표]
핵심기능:
- 기능1 (상세 설명)
- 기능2 (상세 설명)
기술스택: [구체적 기술]
파일구조: [어떤 파일들 필요한지]
구현요구사항: [상세 요구사항 5개 이상]

3. 위 형식의 상세 내용을 instructions에 담아 createTask 호출
4. "✅ 상세 지시사항 전송됨" 응답
5. 실패하면 사용자에게 알림

절대 짧은 한 줄로 보내지 마세요. 반드시 상세하게.
```

## 5. 실전 워크플로우

### 전체 프로세스:

```
1. 서버 시작
   터미널 1: npm start
   → http://localhost:3000 실행 중

2. 터널 시작
   터미널 2: ./start-tunnel.sh
   → https://gpt-task-api.loca.lt 활성화

3. ChatGPT에서 요청
   "React Todo 앱을 만들어줘..."
   → ChatGPT가 상세 요구사항 수집
   → createTask API 호출
   → 티켓 생성

4. 대시보드 확인
   http://localhost:3000/dashboard.html
   → 새 티켓 확인

5. 개발 시작
   [🚀 개발] 버튼 클릭
   → Gemini가 코드 생성
   → projects/ 폴더에 저장
```

## 6. 문제 해결

### 문제 1: "connection refused"
```bash
# 해결: 서버가 실행 중인지 확인
npm start
```

### 문제 2: "tunnel disconnected"
```bash
# 해결: 자동 재연결 스크립트 사용
./start-tunnel.sh  # 자동으로 재연결됨
```

### 문제 3: "subdomain already taken"
```bash
# 해결 1: 다른 subdomain 사용
lt --port 3000 --subdomain my-unique-name-123

# 해결 2: subdomain 없이 사용 (랜덤 URL)
lt --port 3000
```

### 문제 4: ChatGPT에서 연결 안됨
```bash
# 체크리스트:
1. 서버 실행 확인: npm start
2. 터널 실행 확인: ./start-tunnel.sh
3. 브라우저에서 수동 접속 테스트: https://gpt-task-api.loca.lt
4. IP 인증 완료했는지 확인
5. ChatGPT Actions URL 확인
```

## 7. 고급 옵션

### 포트 변경
```bash
lt --port 8080 --subdomain gpt-task-api
```

### 랜덤 URL 사용 (subdomain 없이)
```bash
lt --port 3000
# 출력: https://random-name-123.loca.lt
```

### 로컬 호스트 지정
```bash
lt --port 3000 --local-host 127.0.0.1
```

### 커스텀 헤더 추가
```bash
lt --port 3000 --subdomain gpt-task-api --print-requests
```

## 8. 대안 (더 안정적)

localtunnel이 자주 끊긴다면:

### ngrok (추천)
```bash
brew install ngrok
ngrok http 3000
# 무료, 더 안정적, 웹 UI 제공
```

### Cloudflare Tunnel
```bash
brew install cloudflare/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:3000
# 무료, 가장 안정적
```

## 9. 보안 주의사항

⚠️ **중요:**
- localtunnel은 공개 인터넷에 노출됩니다
- `.env` 파일의 API 키가 코드에 포함되지 않도록 주의
- 민감한 정보는 환경 변수로 관리
- 개발/테스트 용도로만 사용 권장

## 10. 빠른 참조

| 명령어 | 설명 |
|--------|------|
| `lt --port 3000` | 기본 실행 (랜덤 URL) |
| `lt --port 3000 --subdomain NAME` | 고정 subdomain |
| `./start-tunnel.sh` | 자동 재연결 (추천) |
| `Ctrl + C` | 터널 종료 |

## 11. 체크리스트

### 시작 전:
- [ ] Node.js 설치됨
- [ ] npm install 완료
- [ ] .env 파일에 GEMINI_API_KEY 설정
- [ ] localtunnel 설치: `npm install -g localtunnel`

### 실행:
- [ ] 터미널 1: `npm start` (서버)
- [ ] 터미널 2: `./start-tunnel.sh` (터널)
- [ ] 브라우저: `https://gpt-task-api.loca.lt` 접속 확인
- [ ] IP 인증 완료

### ChatGPT 설정:
- [ ] GPT Builder → Actions → Schema 입력
- [ ] URL: `https://gpt-task-api.loca.lt`
- [ ] Instructions 추가
- [ ] Test 실행

### 작동 확인:
- [ ] ChatGPT에서 개발 요청
- [ ] 터미널에서 로그 확인
- [ ] `http://localhost:3000/dashboard.html`에서 티켓 확인
- [ ] 개발 버튼 클릭 → 코드 생성 확인
