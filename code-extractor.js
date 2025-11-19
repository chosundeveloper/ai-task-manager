// 코드 블록 추출 및 파일 생성 유틸리티
const fs = require('fs').promises;
const path = require('path');

/**
 * Markdown에서 코드 블록 추출
 */
function extractCodeBlocks(markdown) {
  const codeBlocks = [];
  const regex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    codeBlocks.push({ language, code });
  }

  return codeBlocks;
}

/**
 * 파일 경로 추출 (주석이나 제목에서)
 */
function extractFilePath(markdown, codeBlock) {
  // "src/components/Button.tsx" 형식 찾기
  const pathRegex = /(?:\/|^)([\w-]+\/[\w\/-]+\.[\w]+)/g;
  const matches = [...markdown.matchAll(pathRegex)];

  if (matches.length > 0) {
    // 가장 가까운 경로 찾기
    return matches[0][1];
  }

  return null;
}

/**
 * Gemini 응답에서 프로젝트 구조 추출
 */
function extractProjectStructure(markdown) {
  const files = [];

  // 전체 텍스트를 섹션별로 분리
  const sections = markdown.split(/^#{1,3}\s+/gm);

  for (const section of sections) {
    // 파일 경로가 포함된 섹션 찾기 (예: src/utils/timeFormatter.ts)
    const filePathMatch = section.match(/`([^`]+\.(tsx?|jsx?|css|json|html|md))`/);

    if (filePathMatch) {
      const filePath = filePathMatch[1];

      // 해당 섹션에서 코드 블록 찾기
      const codeBlocks = extractCodeBlocks(section);

      if (codeBlocks.length > 0) {
        // 첫 번째 코드 블록을 파일 내용으로 사용
        files.push({
          path: filePath,
          content: codeBlocks[0].code,
          language: codeBlocks[0].language
        });
      }
    }
  }

  return files;
}

/**
 * 프로젝트 파일들을 실제로 생성
 */
async function createProjectFiles(projectName, files, baseDir) {
  const projectDir = path.join(baseDir, 'projects', projectName);

  // 프로젝트 디렉토리 생성
  await fs.mkdir(projectDir, { recursive: true });

  const createdFiles = [];

  for (const file of files) {
    const fullPath = path.join(projectDir, file.path);
    const dir = path.dirname(fullPath);

    // 디렉토리 생성
    await fs.mkdir(dir, { recursive: true });

    // 파일 쓰기
    await fs.writeFile(fullPath, file.content, 'utf8');

    createdFiles.push({
      path: file.path,
      fullPath,
      size: file.content.length
    });
  }

  return { projectDir, files: createdFiles };
}

/**
 * README 생성
 */
async function createReadme(projectDir, projectName, instructions) {
  const readme = `# ${projectName}

## 프로젝트 설명

${instructions}

## 생성된 파일들

이 프로젝트는 Gemini AI가 자동으로 생성했습니다.

## 설치 및 실행

\`\`\`bash
npm install
npm run dev
\`\`\`
`;

  await fs.writeFile(path.join(projectDir, 'README.md'), readme, 'utf8');
}

module.exports = {
  extractCodeBlocks,
  extractProjectStructure,
  createProjectFiles,
  createReadme
};
