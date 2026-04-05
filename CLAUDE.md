# MailSifu — Claude Operating Context

## Project
Internal OTP-focused inbox for a small team (<10 users). Receiving OTP emails via Forward Email, surfacing them in a clean inbox UI.

## Stack
- Next.js 15 + TypeScript + Tailwind CSS 4 + Prisma 5
- Auth.js 5 beta (credentials, JWT strategy)
- Supabase PostgreSQL (pooler on aws-1-ap-southeast-1)
- Forward Email for inbound email (SMTP provider)
- Vercel for hosting

## Key Domains
- `mailsifu.com` — production app UI (Vercel)
- `rx.mailsifu.com` — receiving domain (Forward Email)

## Architecture Decisions
- NO full mail server — just inbox product + OTP extraction
- Auth: JWT strategy with credentials provider (email/password, bcrypt)
- DB: Supabase PostgreSQL, Prisma ORM (pooler port 6543, direct port 5432)
- Inbound: Forward Email webhook → `/api/webhooks/forwardemail` → ReceivedMessage + OtpExtraction
- Inbound (legacy): Resend webhook → `/api/webhooks/resend` → same pipeline (deprecated)

## PRD Phases
1. ✅ App Foundation — Auth.js, protected routes, user/workspace models
2. ✅ Inbound Email — Forward Email webhook, message persistence, OTP extraction
3. ✅ OTP Inbox MVP — inbox list, OTP display with copy, search/filter, read/archive
4. ✅ Domain & Alias UX — domain management, DNS verification via Forward Email API, alias CRUD

## Current State
- All 4 phases complete and deployed
- OTP extraction supports both numeric and alphanumeric codes (e.g. VT79NA)
- OTP extraction falls back to stripped HTML when bodyText is empty
- Sidebar is in shared app layout (persists across navigation)
- Font preconnect added for Material Icons
- Generated branding: logo icon (envelope+shield), signin art (abstract coral)
- Playwright smoke tests: 15 tests covering auth, pages, mobile, API health
- Deploy via `vercel --prod` CLI (no GitHub auto-deploy)

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
