# MailSifu — Current Status & Pending Items

**Last updated:** 2026-04-02

## App Status
- **URL:** https://mailsifu.com
- **Health:** ok=true, db=ok ✅
- **Build:** Passing ✅
- **Smoke tests:** 11/11 passing ✅

## Completed Fixes (2026-03-31 to 2026-04-02)
- ✅ Supabase DB connection (pooler URL on Vercel)
- ✅ XSS vulnerability (dangerouslySetInnerHTML → plain text)
- ✅ Timing attack on webhooks (crypto.timingSafeEqual)
- ✅ after() auth failure for markAsRead
- ✅ Health endpoint leaking DB errors
- ✅ Unexpected token JSON parse error (Forward Email verify endpoint)
- ✅ Bootstrap admin security (GET→POST)
- ✅ Mobile inbox crash (overflow-hidden on domain cards)
- ✅ Login spinner (animated SVG feedback)
- ✅ Domain detail "washed out" rendering (opacity fixes)
- ✅ Skeleton contrast (loading states now visible)
- ✅ Empty state icon contrast
- ✅ Test domains cleaned up (Resend + DB)
- ✅ Z-index bug on domain cards (decorative circles on top)
- ✅ shifumail.com test domain removed

## Pending: DNS Records for mailsifu.com

**User must add these DNS records on Vercel:**

| Type | Name | Value | Status |
|------|------|-------|--------|
| MX | `@` | `mx1.forwardemail.net` (priority 0) | ✅ Added |
| MX | `@` | `mx2.forwardemail.net` (priority 0) | ✅ Added |
| TXT | `@` | `v=spf1 include:spf.forwardemail.net -all` | ✅ Added |
| TXT | `forward-email-site-verification` | `FX58dYBsaR` | ❌ MISSING |
| TXT | `fe-cbdcd429e7._domainkey` | `v=DKIM1; k=rsa; p=MIGfMA...AQAB;` | ❌ MISSING |
| CNAME | `fe-bounces` | `forwardemail.net` | ❌ MISSING |

**Impact:** Without these records, Forward Email cannot verify domain ownership. The domain detail page shows an error. Email receiving may not work until verification passes.

## Performance Note
- Authenticated pages load in 5-9s (Supabase cold starts)
- Not a frontend issue — requires DB connection pooling changes
- Pages already have `revalidate` set for caching

## Known Tech Debt
- `resendDomainId` field stores Forward Email domain ID (naming mismatch, works correctly)
- No webhook retry/deduplication (duplicate emails possible on retry)
- No rate limiting on sign-in page
- Search is placeholder ("coming soon")
- No pagination on inbox (limited to 50 messages)

## Architecture
- **Stack:** Next.js 15 + TypeScript + Prisma + Supabase PostgreSQL + Forward Email
- **Deploy:** Vercel (sabianhks-projects/lumislinks)
- **Auth:** Auth.js with credentials provider
- **DB:** Supabase pooler (aws-0-ap-southeast-1)
- **Email:** Forward Email (inbound only)
- **Bot:** @Nongkifriendbot (separate project)

## Files Reference
- `/srv/claude-projects/lumislinks/app` — project root
- `smoke-test.sh` — curl-based smoke test (11 checks)
- `HUMAN_TEST.md` — detailed UX smoke test report
- `AUDIT_3.md` — Opus code audit findings
- `ANALYSIS.md` — initial analysis report
- `memory/credentials-reference.md` — all tokens/keys locations
