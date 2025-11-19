#!/bin/bash

# localtunnel 자동 재시작 스크립트
# 연결이 끊기면 자동으로 재연결

SUBDOMAIN="gpt-task-api"
PORT=3000
MAX_RETRIES=999999

echo "🚀 Starting localtunnel with auto-restart..."
echo "📍 URL: https://${SUBDOMAIN}.loca.lt"
echo ""

retry_count=0

while [ $retry_count -lt $MAX_RETRIES ]; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting tunnel (attempt $((retry_count + 1)))..."

    # localtunnel 실행
    lt --port $PORT --subdomain $SUBDOMAIN

    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "✅ Tunnel closed normally"
        break
    else
        echo "⚠️ Tunnel disconnected (exit code: $exit_code)"
        echo "🔄 Restarting in 5 seconds..."
        sleep 5
        retry_count=$((retry_count + 1))
    fi
done

echo "❌ Max retries reached or tunnel stopped"
