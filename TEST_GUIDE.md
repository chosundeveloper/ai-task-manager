# 🧪 전체 플로우 테스트 가이드

## 준비 사항

### 1. 환경 설정 확인
```bash
cd /Users/john/projects/ai-task-manager

# .env 파일 확인
cat .env
# GEMINI_API_KEY가 설정되어 있어야 함
```

### 2. 의존성 확인
```bash
# node_modules 확인
ls node_modules

# 없으면 설치
npm install
```

## 테스트 시나리오

### 시나리오 1: 로컬 테스트 (ChatGPT 없이)

#### 1단계: 서버 시작
```bash
# 터미널 1
npm start
```

**예상 출력:**
```
Server running on http://localhost:3000
```

#### 2단계: 대시보드 열기
브라우저에서:
```
http://localhost:3000/dashboard.html
```

**확인사항:**
- [ ] Jira 스타일 보드가 보임
- [ ] 기존 정적 티켓들(계산기, 메모, 타이머)이 보임

#### 3단계: 티켓 생성 (수동 API 테스트)
```bash
# 터미널 2
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": "목표: 간단한 계산기 앱
핵심기능:
- 사칙연산 (+, -, *, /)
- 결과 표시
- 초기화 버튼

기술스택: HTML, CSS, JavaScript

파일구조:
- index.html
- style.css
- script.js

구현요구사항:
1. 반응형 디자인
2. 깔끔한 UI
3. 키보드 입력 지원
4. 에러 처리
5. 소수점 계산 지원"
  }'
```

**예상 출력:**
```json
{
  "message": "티켓이 생성되었습니다",
  "ticketId": "TASK-1",
  "taskFile": "task_2025-11-19T...",
  "jiraUrl": "http://localhost:3000/jira.html"
}
```

**확인사항:**
- [ ] `tasks/` 폴더에 txt 파일 생성됨
- [ ] `tickets/` 폴더에 TASK-1.json 생성됨

```bash
# 파일 확인
ls tasks/
ls tickets/
cat tickets/TASK-1.json
```

#### 4단계: 대시보드에서 티켓 확인
브라우저를 새로고침하거나 5초 대기

**확인사항:**
- [ ] 새 티켓이 Backlog 컬럼 맨 위에 나타남
- [ ] 티켓에 `TASK-1` ID 표시
- [ ] 상태 배지가 "대기 중" (주황색)
- [ ] `🚀 개발` 버튼 보임

#### 5단계: 개발 버튼 클릭
1. `🚀 개발` 버튼 클릭
2. 확인 대화상자에서 "확인" 클릭

**예상 동작:**
1. 버튼이 사라지고 "🔄 개발 중..." 표시
2. 터미널에서 Gemini API 호출 로그 보임:
   ```
   🚀 개발 시작: TASK-1
   🤖 Gemini에 요청 전송 중...
   ✅ Gemini 응답 수신 (XXXX chars)
   📁 프로젝트 생성: /Users/john/projects/ai-task-manager/projects/XXX
   ```

3. 완료 후 알림:
   ```
   ✅ 개발이 완료되었습니다

   파일 생성: 5개
   경로: /Users/john/projects/ai-task-manager/projects/calculator-app
   ```

**확인사항:**
- [ ] `projects/` 폴더에 새 프로젝트 생성됨
- [ ] 티켓 상태가 "✅ 완료"로 변경
- [ ] 생성된 파일 개수 표시

```bash
# 생성된 프로젝트 확인
ls projects/
ls projects/[프로젝트명]/
```

### 시나리오 2: ChatGPT 연동 테스트

#### 1단계: 서버 + 터널 시작
```bash
# 터미널 1
npm start

# 터미널 2
./start-tunnel.sh
```

**확인:**
```
your url is: https://gpt-task-api.loca.lt
```

#### 2단계: 브라우저에서 터널 접속
```
https://gpt-task-api.loca.lt
```
- "Click to Continue" 클릭
- 메인 페이지 보이면 성공

#### 3단계: ChatGPT Actions 설정
(QUICK_START.md 참조)

#### 4단계: ChatGPT에서 요청
```
"React로 Todo 앱을 만들어줘"
```

**ChatGPT가 할 일:**
1. 상세 요구사항 질문
2. 답변 정리
3. `createTask` API 호출
4. "✅ 상세 지시사항 전송됨" 응답

**터미널 확인:**
```
📥 새로운 지시사항 수신: 목표: React Todo 앱...
💾 지시사항 파일 생성: task_XXXX.txt
🎫 Jira 티켓 생성: TASK-2
```

#### 5단계: 대시보드 확인
```
http://localhost:3000/dashboard.html
```

**확인사항:**
- [ ] TASK-2 티켓이 자동으로 나타남 (5초 이내)
- [ ] `🚀 개발` 버튼 보임

#### 6단계: 개발 실행
`🚀 개발` 버튼 클릭

**확인사항:**
- [ ] Gemini가 React 프로젝트 생성
- [ ] `projects/` 폴더에 저장
- [ ] 완료 알림 표시

## 체크리스트

### 전체 플로우 확인
- [ ] ChatGPT → /task → 파일 생성 ✅
- [ ] 파일 생성 → 티켓 자동 생성 ✅
- [ ] 티켓 → 대시보드 표시 (5초 자동 새로고침) ✅
- [ ] 대시보드 → `🚀 개발` 버튼 ✅
- [ ] 개발 버튼 → Gemini 코드 생성 ✅
- [ ] 코드 생성 → projects/ 저장 ✅
- [ ] 상태 업데이트 (pending → in_progress → completed) ✅

### 에러 처리 확인
- [ ] GEMINI_API_KEY 없을 때 에러 표시
- [ ] 중복 티켓 생성 방지
- [ ] 개발 실패 시 "failed" 상태 + 재시도 버튼
- [ ] 네트워크 오류 시 사용자 알림

## 문제 해결

### 티켓이 생성되지 않음
```bash
# 로그 확인
tail -f logs/server-out.log

# 폴더 권한 확인
ls -la tasks/
ls -la tickets/
```

### 대시보드에 티켓이 안 보임
1. 브라우저 콘솔 열기 (F12)
2. 네트워크 탭에서 `/api/tickets` 요청 확인
3. 5초 대기 (자동 새로고침)
4. 수동 새로고침 (Cmd+R 또는 F5)

### 개발 버튼 클릭 시 에러
```bash
# .env 확인
cat .env | grep GEMINI_API_KEY

# API 키 유효성 테스트
curl -X POST http://localhost:3000/api/develop/TASK-1
```

### Gemini 응답 없음
- API 키 확인
- 인터넷 연결 확인
- Google AI Studio에서 할당량 확인

## 성공 기준

모든 항목이 ✅ 이면 완벽하게 작동하는 것입니다:

1. ✅ ChatGPT에서 요청 → 티켓 자동 생성
2. ✅ 대시보드에 티켓 실시간 표시
3. ✅ `🚀 개발` 버튼으로 수동 트리거
4. ✅ Gemini가 코드 자동 생성
5. ✅ projects/ 폴더에 완성된 프로젝트 저장
6. ✅ 상태 자동 업데이트 (pending → in_progress → completed)

## 다음 단계

모든 테스트 통과 후:
- [ ] GitHub에 푸시
- [ ] README 업데이트
- [ ] Notion 연동 (선택사항)
- [ ] 프로덕션 배포 (선택사항)
