# KAIROS — Deploy Guide

## Produção: kairo.snipercheck.com

### Stack
- **Runtime**: Node.js 20 + PM2
- **Reverse proxy**: Caddy (SSL automático via Let's Encrypt)
- **Servidor**: VPS Ubuntu 22.04 (Hetzner CX22 — €4/mês)

### Deploy inicial
```bash
# No VPS como root:
bash <(curl -s https://raw.githubusercontent.com/contactorevonix-blip/kairos-cerebro/main/deploy/setup-server.sh)
```

### Deploy de actualizações
```bash
cd /opt/kairos
git pull origin main
pm2 restart kairos-api
```

### DNS (adicionar no registar do domínio)
```
Tipo: A
Nome: kairo
Valor: [IP do VPS]
TTL: 300
```

### Monitorização
```bash
pm2 status          # Estado do processo
pm2 logs kairos-api # Logs em tempo real
pm2 monit           # Dashboard
```
