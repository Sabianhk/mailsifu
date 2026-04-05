# MailSifu — Claude Operating Context

## Project
Internal OTP-focused inbox for a small team (<10 users). Receiving OTP emails via Resend, surfacing them in a clean inbox UI.

## Stack
- Next.js 15 + TypeScript + Tailwind CSS 4 + Prisma 5
- Auth.js 5 beta (credentials, JWT strategy)
- Supabase PostgreSQL (pooler on aws-0-ap-southeast-1)
- Forward Email for inbound email (SMTP provider)
- Vercel for hosting

## Key Domains
- `staging.mailsifu.com` — app UI
- `rx.mailsifu.com` — receiving domain (Forward Email)

## Architecture Decisions
- NO full mail server — just inbox product + OTP extraction
- Auth: JWT strategy with credentials provider (email/password, bcrypt)
- DB: Supabase PostgreSQL, Prisma ORM (pooler port 6543, direct port 5432)
- Inbound: Forward Email webhook → `/api/webhooks/forwardemail` → ReceivedMessage + OtpExtraction
- Inbound (legacy): Resend webhook → `/api/webhooks/resend` → same pipeline (deprecated)

## PRD Phases
1. ✅ App Foundation — Auth.js, protected routes, user/workspace models
2. ✅ Resend Inbound — webhook endpoint, event logging, message persistence, OTP extraction (CODED)
3. 🔄 OTP Inbox MVP — inbox list, OTP display, search/filter, read/archive
4. ⬜ Domain & Alias UX

## Current State
- Phase 2 code is complete (webhook route, inbound processing, OTP extraction)
- Phase 3 (inbox UI) needs to be built
- Middleware is a stub — needs real auth protection
- DB is Supabase, migrations are baselined

## Code Conventions
- TypeScript strict mode
- Tailwind for styling — calm, clean, premium feel
- Server components by default, 'use client' only when needed
- Prisma client imported from `@/lib/prisma`
- Keep files small and focused

## What NOT to do
- Do NOT build outbound compose/reply
- Do NOT overengineer permissions
- Do NOT change existing Prisma models unless fixing bugs
- Do NOT install heavy UI libraries — use Tailwind
