#!/bin/bash

# ngrok 터널 스크립트
# localtunnel보다 훨씬 안정적

PORT=3000

echo "🚀 Starting ngrok tunnel..."
echo "📍 Port: $PORT"
echo ""
echo "⚠️  ngrok 설치 필요: brew install ngrok"
echo "⚠️  ngrok authtoken 설정: ngrok config add-authtoken YOUR_TOKEN"
echo ""

# ngrok 실행
# 무료: URL이 매번 바뀜
ngrok http $PORT

# 유료 ($8/월): 고정 도메인
# ngrok http $PORT --domain=ai-task.ngrok-free.app
