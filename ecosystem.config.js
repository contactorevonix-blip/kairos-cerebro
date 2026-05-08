// PM2 — KAIROS process manager
module.exports = {
  apps: [{
    name: 'kairos-api',
    script: 'packages/sniper-api/server.js',
    cwd: '/c/Users/lealp/KAIROS_CEREBRO',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 8787,
    },
    error_file: 'logs/kairos-error.log',
    out_file: 'logs/kairos-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
