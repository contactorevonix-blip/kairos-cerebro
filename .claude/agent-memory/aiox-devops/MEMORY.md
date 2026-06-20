# Memory Index — aiox-devops (Gage)

- [Regras de Push](feedback-push-rules.md) — force-push só em main/Vercel, staging selectivo, nunca pull antes de push
- [Remote & Branches](reference-remote-repo.md) — origin contactorevonix-blip/kairos-cerebro, branches main + refactor-prod-ready
- [Pre-push test race](project-pre-push-test-race.md) — node --test concurrency races on shared .synapse registry; fixed via --test-concurrency=1, never --no-verify
