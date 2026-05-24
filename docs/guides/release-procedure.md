# Release Procedure — Kairos Check

> SOP canónico para releases. O Gage (`*release`) segue este documento.
> Não saltar passos mesmo em patch releases — cada excepção cria um incidente.

## Tipos de Release

| Tipo | Quando | Exemplo |
|---|---|---|
| PATCH | Bug fixes, config changes | 0.1.0 → 0.1.1 |
| MINOR | Nova feature, backward compatible | 0.1.1 → 0.2.0 |
| MAJOR | Breaking change, nova API | 0.2.0 → 1.0.0 |

---

## Pipeline Obrigatório (sem excepções)

### 1. Quality Gate
```bash
npm test                          # 5 testes devem passar
npm run validate:claude-sync      # 28/28 synced, 0 drift
```

### 2. Version Bump
```bash
# Editar package.json → version
# Seguir semver: MAJOR.MINOR.PATCH
```

### 3. Commit + Tag
```bash
git add package.json
git commit -m "chore: bump version to vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z — <descrição uma linha>"
```

### 4. Push (via Gage)
```bash
AIOX_ACTIVE_AGENT=devops git push origin refactor-prod-ready:main
AIOX_ACTIVE_AGENT=devops git push origin vX.Y.Z
```

### 5. Verificar Deploy
- Railway auto-deploys de main → aguardar ~90s
- GitHub Actions deploy.yml → tests → smoke tests automáticos
- `curl https://api.kairoscheck.net/health` → `"status":"OPERATIONAL"`

### 6. GitHub Release
```bash
gh release create vX.Y.Z --title "vX.Y.Z — <título>" --notes "$(cat <<'EOF'
## O que mudou

- feat: ...
- fix: ...
- chore: ...

## Como fazer upgrade

Nenhuma acção necessária — Railway auto-deploya.
EOF
)"
```

---

## Rollback

Se smoke tests falharem após deploy:
1. Railway Dashboard → Deployments → deploy anterior → **Rollback**
2. Verificar: `curl https://api.kairoscheck.net/health`
3. Investigar causa nos logs: `railway logs --service kairos-cerebro`

---

## Smoke Tests Automáticos

O GitHub Actions `smoke-test.yml` corre de 10 em 10 minutos e verifica:
- `GET /health` → OPERATIONAL
- `GET /` → não 5xx
- `GET /pricing` → não 5xx
- `GET /api/billing/plans` → não 5xx

Falha = alerta no GitHub Actions Summary.

---

## Lições (não repetir)

- Railway auto-deploya de `main` — não de outras branches
- Push via `git push origin <branch>:main` quando branch local ≠ main
- `AIOX_ACTIVE_AGENT=devops` obrigatório no comando git push (Constitution Article II)
- `railway variables --json` expõe TODOS os secrets — nunca correr em sessão partilhada
