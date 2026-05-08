#!/bin/bash
# KAIROS — Setup completo num VPS Ubuntu/Debian
# Corre como root: bash setup-server.sh

set -e
echo "=== KAIROS Server Setup ==="

# 1. Update e dependências base
apt update && apt upgrade -y
apt install -y git curl wget ufw

# 2. Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. PM2
npm install -g pm2

# 4. Caddy (SSL automático)
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 5. Firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 8787
ufw --force enable

# 6. Clonar o projecto
mkdir -p /opt/kairos
cd /opt/kairos
git clone https://github.com/contactorevonix-blip/kairos-cerebro.git .

# 7. Criar logs
mkdir -p /var/log/kairos
mkdir -p /opt/kairos/logs

# 8. Configurar Caddy
cp /opt/kairos/deploy/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy

# 9. Arrancar com PM2
cd /opt/kairos
cat > ecosystem.prod.config.js << 'PMEOF'
module.exports = {
  apps: [{
    name: 'kairos-api',
    script: 'packages/sniper-api/server.js',
    cwd: '/opt/kairos',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 8787,
    },
    error_file: '/var/log/kairos/error.log',
    out_file: '/var/log/kairos/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
PMEOF

pm2 start ecosystem.prod.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "=== KAIROS está online ==="
echo "URL: https://kairo.snipercheck.com"
echo "Health: https://kairo.snipercheck.com/health"
echo ""
echo "PRÓXIMO PASSO: Adiciona o DNS A record:"
echo "  kairo.snipercheck.com → $(curl -s ifconfig.me)"
