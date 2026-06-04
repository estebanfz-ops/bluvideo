# PROJECT_STATE.md — BluVideo OS

**Última actualización:** 2026-06-03

## Estado actual
- **Fase:** Phase 1 — Supabase integration
- **Branch activa:** main (develop branch no creada aún)
- **Deploy:** https://bluvideo.vercel.app (producción, estático)
- **GitHub:** https://github.com/estebanfz-ops/bluvideo

## Lo que existe hoy
- [x] UI completa en HTML/CSS/JS (index.html + bluvideo.css + bluvideo.js)
- [x] Vercel deployment funcionando
- [x] GitHub repo conectado
- [ ] Supabase — no conectado
- [ ] Auth — no implementado
- [ ] Data persistence — solo en memoria (no persiste entre recargas)

## Vistas del dashboard (todas existen en UI, ninguna tiene backend)
- Dashboard — métricas estáticas
- Briefing Engine — genera prompts para copiar a Claude web
- Create — editor de contenido
- Kanban — tablero de estados (drag & drop)
- Calendar — vista mensual
- Analytics — entrada manual de métricas
- Integrations — configuración

## Pending Phase 1
- [ ] Crear proyecto Supabase
- [ ] Diseñar schema (posts, briefs, kanban_cards, analytics_logs)
- [ ] Conectar Supabase JS client al HTML/CSS/JS existente
- [ ] Auth (email/password para equipo Bluveo)
- [ ] Persistir kanban cards en Supabase
- [ ] Persistir briefs en Supabase
- [ ] Persistir analytics logs en Supabase
- [ ] Env vars en Vercel

## Decisiones tomadas
- Stack: HTML/CSS/JS + Supabase browser client (sin Next.js)
- No Ayrshare, no Claude API, no AgencyAnalytics (zero-cost)
- Solo uso interno (no multi-tenant, RLS simplificado)
