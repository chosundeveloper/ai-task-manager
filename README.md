# 🤖 AI Task Manager

ChatGPT에서 지시사항을 받아 Gemini AI가 자동으로 프로젝트를 개발하는 시스템

## 📋 개요

AI Task Manager는 ChatGPT로부터 개발 요청을 받아 Jira 스타일의 티켓으로 관리하고,
Gemini AI가 실제 코드를 생성하는 자동화된 개발 워크플로우입니다.

## ✨ 주요 기능

- 🎫 **Jira 스타일 티켓 관리**: 개발 요청을 티켓으로 관리
- 🤖 **AI 기반 자동 개발**: Gemini AI가 완전한 프로젝트 생성
- 📊 **실시간 대시보드**: 티켓 상태를 한눈에 확인
- 🔄 **수동 트리거**: 원할 때만 개발 시작
- 📁 **프로젝트 관리**: 생성된 프로젝트를 자동으로 정리

## 🚀 워크플로우

```
ChatGPT → 지시사항 전송 → 티켓 생성
                ↓
         대시보드에 표시
                ↓
         [개발 버튼] 클릭
                ↓
         Gemini가 코드 생성
                ↓
         projects/ 폴더에 저장
```

## 🛠️ 기술 스택

- **Backend**: Node.js, Express
- **AI**: Google Gemini 2.0 Flash
- **Frontend**: Vanilla HTML/CSS/JS, TailwindCSS
- **WebSocket**: 실시간 로그 스트리밍

## 📦 설치 방법

### 1. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/ai-task-manager.git
cd ai-task-manager
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사해서 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 Gemini API 키 입력:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. 서버 실행

```bash
npm start
```

또는 개발 모드:

```bash
npm run dev
```

## 📱 사용 방법

### 1. 서버 실행
```bash
npm start
```

### 2. 터널 설정 (ChatGPT 연동용)

ChatGPT Actions에서 로컬 서버에 접근하려면 터널이 필요합니다.

#### 옵션 1: ngrok (가장 안정적, 추천)
```bash
# 설치
brew install ngrok

# ngrok 가입 후 토큰 설정
ngrok config add-authtoken YOUR_TOKEN

# 터널 실행
./start-ngrok.sh
```

#### 옵션 2: localtunnel (무료, 자동 재연결)
```bash
# 설치
npm install -g localtunnel

# 터널 실행 (자동 재시작 포함)
./start-tunnel.sh
```

#### 옵션 3: Cloudflare Tunnel (무료, 고정 URL)
```bash
# 설치
brew install cloudflare/cloudflare/cloudflared

# 설정 및 실행
cloudflared tunnel login
cloudflared tunnel create ai-task-manager
cloudflared tunnel run ai-task-manager
```

**비교표:**

| 서비스 | 무료 | 안정성 | 고정 URL | 추천도 |
|--------|------|--------|----------|--------|
| ngrok | ⭕ (제한) | ⭐⭐⭐⭐⭐ | ❌ (유료) | ⭐⭐⭐⭐⭐ |
| localtunnel | ✅ | ⭐⭐ | ⭕ | ⭐⭐⭐ |
| Cloudflare | ✅ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |

### 3. ChatGPT Actions 설정

1. ChatGPT GPT Builder 열기
2. Actions → Create new action
3. Schema 입력:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Task API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://YOUR-TUNNEL-URL"
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

**URL 업데이트:**
- ngrok: `https://xxxx-xx-xxx-xxx-xxx.ngrok-free.app`
- localtunnel: `https://gpt-task-api.loca.lt`
- Cloudflare: `https://ai-task.yourdomain.com`

### 4. ChatGPT에 지시사항 전송

이제 ChatGPT에서 다음처럼 요청하면 자동으로 티켓이 생성됩니다:

**올바른 형식 (상세):**
```
목표: React Todo 앱 개발
핵심기능:
- 할일 추가/삭제/완료 기능
- LocalStorage 자동 저장
- 반응형 디자인

기술스택: React, TypeScript, TailwindCSS

파일구조:
- src/App.tsx (메인)
- src/components/TodoItem.tsx
- src/hooks/useTodos.ts

구현요구사항:
1. TypeScript 타입 안전성 보장
2. 컴포넌트 재사용성 고려
3. 접근성 (a11y) 준수
4. 모바일 친화적 UI
5. 코드 주석 포함
```

**잘못된 형식 (짧음):**
```
Todo 앱 만들어줘
```

### 3. 대시보드 확인

브라우저에서 `http://localhost:3000/dashboard.html` 접속

### 4. 개발 시작

- 생성된 티켓의 **[🚀 개발]** 버튼 클릭
- Gemini가 자동으로 프로젝트 생성
- `projects/` 폴더에서 생성된 코드 확인

## 📂 프로젝트 구조

```
ai-task-manager/
├── server.js              # Express 서버
├── code-extractor.js      # 코드 추출 유틸리티
├── package.json
├── .env                   # 환경 변수 (git 제외)
├── .gitignore
├── README.md
├── public/
│   ├── index.html         # 메인 페이지
│   ├── dashboard.html     # Jira 스타일 대시보드
│   └── jira.html          # 티켓 관리 UI
├── tickets/               # 티켓 JSON 파일
├── tasks/                 # 작업 텍스트 파일
├── projects/              # 생성된 프로젝트들
└── tools/                 # Python 유틸리티
    ├── dashboard/
    │   └── generate_board.py
    └── requirements/
```

## 🔌 API 엔드포인트

### POST /task
새 티켓 생성

**Request:**
```json
{
  "instructions": "개발 지시사항"
}
```

**Response:**
```json
{
  "message": "티켓이 생성되었습니다",
  "ticketId": "TASK-1",
  "taskFile": "task_2025-11-19T12-00-00-000Z.txt",
  "jiraUrl": "http://localhost:3000/jira.html"
}
```

### GET /api/tickets
모든 티켓 조회

**Response:**
```json
[
  {
    "id": "TASK-1",
    "title": "React로 간단한 Todo 앱을 만들어줘",
    "description": "전체 지시사항...",
    "status": "pending",
    "createdAt": "2025-11-19T12:00:00.000Z"
  }
]
```

### POST /api/develop/:ticketId
특정 티켓 개발 시작

**Response:**
```json
{
  "message": "개발이 완료되었습니다",
  "filesCreated": 5,
  "projectPath": "/Users/john/projects/ai-task-manager/projects/react-todo-app"
}
```

## 🎨 대시보드

### Jira 스타일 보드
- **Backlog**: 대기 중인 작업
- **In Progress**: 진행 중인 작업
- **Review**: 검토 중
- **Done**: 완료된 작업

### 티켓 상태
- ⏳ **pending**: 대기 중
- 🔄 **in_progress**: 진행 중
- ✅ **completed**: 완료
- ❌ **failed**: 실패

## 🔧 설정

### 포트 변경
`.env` 파일에서 PORT 변경:
```
PORT=8080
```

### Gemini 모델 변경
`server.js` 174번째 줄:
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
```

## 🐛 트러블슈팅

### 티켓이 생성되지 않음
- `.env` 파일에 `GEMINI_API_KEY`가 설정되어 있는지 확인
- `tickets/`, `tasks/` 디렉토리가 존재하는지 확인

### 개발이 시작되지 않음
- Gemini API 키가 유효한지 확인
- 네트워크 연결 확인
- 콘솔 로그에서 에러 메시지 확인

### 프로젝트가 생성되지 않음
- `projects/` 디렉토리 쓰기 권한 확인
- Gemini 응답이 올바른 형식인지 확인

## 📝 TODO

- [ ] GitHub Actions를 통한 자동 배포
- [ ] Notion 연동
- [ ] 티켓 우선순위 기능
- [ ] 프로젝트 템플릿 시스템
- [ ] 다중 AI 모델 지원

## 🤝 기여

이슈와 Pull Request를 환영합니다!

## 📄 라이선스

MIT License

## 👨‍💻 개발자

Created with ❤️ by ChatGPT + Gemini
