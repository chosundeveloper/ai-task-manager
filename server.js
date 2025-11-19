require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const { extractProjectStructure, createProjectFiles } = require('./code-extractor');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const JIRA_DIR = path.join(__dirname, 'tickets');
const TASKS_DIR = path.join(__dirname, 'tasks');

app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// WebSocket 연결 관리
let wsClients = [];
wss.on('connection', (ws) => {
  wsClients.push(ws);
  console.log('WebSocket client connected');
  ws.on('close', () => {
    wsClients = wsClients.filter(client => client !== ws);
  });
});

function broadcastLog(message, type = 'info') {
  const log = { message, type, timestamp: new Date().toISOString() };
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(log));
    }
  });
  console.log(`[${type}] ${message}`);
}

// Jira tickets 조회 (dashboard.html에서 사용)
app.get('/api/tickets', async (req, res) => {
  try {
    await fs.mkdir(JIRA_DIR, { recursive: true });
    const files = await fs.readdir(JIRA_DIR);
    const tickets = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(JIRA_DIR, file), 'utf-8');
        tickets.push(JSON.parse(content));
      }
    }

    res.json(tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('티켓 조회 오류:', error);
    res.status(500).json({ error: '티켓 조회 실패' });
  }
});

// Jira 티켓 생성 (ChatGPT에서 호출)
app.post('/task', async (req, res) => {
  try {
    const { instructions } = req.body;

    if (!instructions) {
      return res.status(400).json({ error: 'instructions 필드가 필요합니다' });
    }

    broadcastLog(`📥 새로운 지시사항 수신: ${instructions.substring(0, 100)}...`, 'info');

    // 지시사항 파일 저장
    await fs.mkdir(TASKS_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const taskFilename = `task_${timestamp}.txt`;
    const taskPath = path.join(TASKS_DIR, taskFilename);
    await fs.writeFile(taskPath, instructions);

    broadcastLog(`💾 지시사항 파일 생성: ${taskFilename}`, 'success');

    // Jira 티켓 ID 생성
    await fs.mkdir(JIRA_DIR, { recursive: true });
    const existingTickets = await fs.readdir(JIRA_DIR);
    const ticketNumbers = existingTickets
      .filter(f => f.startsWith('TASK-'))
      .map(f => parseInt(f.split('-')[1]))
      .filter(n => !isNaN(n));
    const nextNumber = ticketNumbers.length > 0 ? Math.max(...ticketNumbers) + 1 : 1;
    const ticketId = `TASK-${nextNumber}`;

    // 중복 체크 (같은 제목이 있는지)
    const duplicateCheck = await Promise.all(
      existingTickets
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          const content = await fs.readFile(path.join(JIRA_DIR, f), 'utf-8');
          return JSON.parse(content);
        })
    );

    const isDuplicate = duplicateCheck.some(ticket =>
      ticket.title === instructions.substring(0, 100) && ticket.status !== 'completed'
    );

    if (isDuplicate) {
      broadcastLog(`⚠️ 중복된 티켓이 이미 존재합니다`, 'warning');
      return res.json({
        message: '중복된 티켓이 이미 존재합니다',
        duplicate: true
      });
    }

    // Jira 티켓 생성
    const ticket = {
      id: ticketId,
      title: instructions.substring(0, 100),
      description: instructions,
      status: 'pending',
      createdAt: new Date().toISOString(),
      taskFile: taskFilename
    };

    await fs.writeFile(
      path.join(JIRA_DIR, `${ticketId}.json`),
      JSON.stringify(ticket, null, 2)
    );

    broadcastLog(`🎫 Jira 티켓 생성: ${ticketId}`, 'success');

    res.json({
      message: '티켓이 생성되었습니다',
      ticketId: ticketId,
      taskFile: taskFilename,
      jiraUrl: `http://localhost:${PORT}/jira.html`
    });

  } catch (error) {
    console.error('오류 발생:', error);
    broadcastLog(`❌ 오류: ${error.message}`, 'error');
    res.status(500).json({ error: error.message });
  }
});

// Gemini 개발 실행 (dashboard.html의 개발 버튼에서 호출)
app.post('/api/develop/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticketPath = path.join(JIRA_DIR, `${ticketId}.json`);

    // 티켓 로드
    const ticketContent = await fs.readFile(ticketPath, 'utf-8');
    const ticket = JSON.parse(ticketContent);

    if (ticket.status === 'in_progress' || ticket.status === 'completed') {
      return res.json({
        message: '이미 진행 중이거나 완료된 티켓입니다',
        ticket
      });
    }

    // 상태 업데이트
    ticket.status = 'in_progress';
    ticket.startedAt = new Date().toISOString();
    await fs.writeFile(ticketPath, JSON.stringify(ticket, null, 2));

    broadcastLog(`🚀 개발 시작: ${ticketId}`, 'info');

    // Gemini API 호출
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `다음 요구사항에 따라 완전한 프로젝트를 생성해주세요:

${ticket.description}

응답 형식:
1. 프로젝트 이름을 먼저 명시
2. 각 파일의 경로와 내용을 markdown 코드블록으로 작성
3. 예시:
## \`src/App.tsx\`
\`\`\`typescript
// 파일 내용
\`\`\`

모든 필요한 파일을 포함해주세요 (package.json, 설정 파일 등).`;

    broadcastLog(`🤖 Gemini에 요청 전송 중...`, 'info');

    const result = await model.generateContent(prompt);
    const generatedText = result.response.text();

    broadcastLog(`✅ Gemini 응답 수신 (${generatedText.length} chars)`, 'success');

    // 코드 추출 및 파일 생성
    const projectName = ticket.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 50);
    const projectFiles = extractProjectStructure(generatedText);

    if (projectFiles.length > 0) {
      const projectResult = await createProjectFiles(projectName, projectFiles, path.join(__dirname, 'projects'));
      broadcastLog(`📁 ${projectFiles.length}개 파일 생성 완료`, 'success');

      // 티켓 완료 처리
      ticket.status = 'completed';
      ticket.completedAt = new Date().toISOString();
      ticket.projectPath = projectResult.projectPath;
      ticket.filesCreated = projectFiles.length;
      await fs.writeFile(ticketPath, JSON.stringify(ticket, null, 2));

      res.json({
        message: '개발 완료',
        ticket,
        projectPath: projectResult.projectPath,
        filesCreated: projectFiles.length
      });
    } else {
      ticket.status = 'failed';
      ticket.error = '코드 블록을 찾을 수 없습니다';
      await fs.writeFile(ticketPath, JSON.stringify(ticket, null, 2));

      res.json({
        message: '코드 추출 실패',
        ticket
      });
    }

  } catch (error) {
    console.error('개발 실행 오류:', error);
    broadcastLog(`❌ 개발 오류: ${error.message}`, 'error');

    // 티켓 실패 처리
    const ticketPath = path.join(JIRA_DIR, `${req.params.ticketId}.json`);
    const ticketContent = await fs.readFile(ticketPath, 'utf-8');
    const ticket = JSON.parse(ticketContent);
    ticket.status = 'failed';
    ticket.error = error.message;
    await fs.writeFile(ticketPath, JSON.stringify(ticket, null, 2));

    res.status(500).json({ error: error.message, ticket });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 서버 시작: http://localhost:${PORT}`);
  console.log(`📊 대시보드: http://localhost:${PORT}/dashboard.html`);
  console.log(`🎫 Jira: http://localhost:${PORT}/jira.html`);
});
