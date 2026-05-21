# GDPR Checklist — @Rex
> Preencher antes do primeiro cliente pagante europeu. @Rex valida.

## Artigo 17 — Direito ao Esquecimento
- [x] Endpoint DELETE /api/gdpr/forget/:tenantId implementado
- [ ] Teste de end-to-end do esquecimento em produção
- [ ] Documentação para clientes

## Artigo 25 — Privacy by Design
- [ ] Verificar antes do Passo 6
- [ ] PII nunca em logs sem salt
- [ ] Auditoria de endpoints que processam PII

## Artigo 32 — Segurança do Tratamento
- [x] AES-256-GCM em vault
- [x] KAIROS_PII_SALT para pseudonimização
- [ ] Pentest externo (pré-launch)

## Artigo 30 — Registo de Actividades
- [ ] Criar registo de tratamentos de dados
- [ ] Documentar base legal para cada tratamento

## LGPD (Brasil)
- [ ] Verificar equivalência LGPD após análise jurídica
- [ ] Aviso de privacidade em PT-BR no site
