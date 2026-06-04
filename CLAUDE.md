# CLAUDE.md — BluVideo OS

> Contexto LOCAL del proyecto. Auto-cargado por Claude Code al abrir el workspace en este directorio.

## Proyecto
BluVideo OS — internal content & social media marketing workspace for Bluveo.

## Stack
- **Frontend:** HTML/CSS/JS (vanilla, no framework)
- **Database:** Supabase (PostgreSQL + RLS + Auth) — accessed via browser JS client
- **Hosting:** Vercel (static)
- **Email:** Resend (free tier)
- **Automation:** n8n (free tier)
- **Visuals:** Bloom (free tier, manual use)
- **Publishing:** Buffer intent URLs + Meta Business Suite direct links

## What is NOT in this project
- No Claude API (prompts generated in UI, pasted manually to Claude web)
- No Ayrshare (replaced with Buffer intent URLs)
- No AgencyAnalytics (manual metrics entry)
- No Next.js migration planned

## Users
Internal Bluveo team only. No client-facing features in this phase.

## Key files
- `index.html` — main SPA shell (all views rendered via JS)
- `bluvideo.css` — all styles
- `bluvideo.js` — all logic (view routing, state, interactions)
- `BLUVEO_SOCIAL_WORKFLOW_BLUEPRINT.md` — full system blueprint (reference)
- `Technical Brief Bluveo Content & Ma.txt` — original brief

## Current phase
**Phase 1 — Supabase integration.** Connecting the existing UI to Supabase for data persistence (posts, briefs, kanban state, analytics logs). Auth via Supabase email/password.

## Environment variables needed
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Conventions
- Conventional Commits (Co-authored-by: [agent] <agent@masterweb>)
- Branches: main ← develop ← feat/* or fix/*
- Secrets only in Vercel env vars (never in code)
