// PM2 설정 파일 - 서버와 터널을 함께 관리

module.exports = {
  apps: [
    {
      name: 'ai-task-server',
      script: 'server.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'localtunnel',
      script: './start-tunnel.sh',
      watch: false,
      autorestart: true,
      max_restarts: 999999,
      min_uptime: '10s',
      error_file: './logs/tunnel-error.log',
      out_file: './logs/tunnel-out.log'
    }
  ]
};
