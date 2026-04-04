# MailSifu — Code Audit 3 (2026-03-31)

**Date:** 2026-03-31
**Scope:** All files under `src/` plus `prisma/schema.prisma`, `next.config.ts`, `package.json`
**Build status after fixes:** ✅ `npm run build` — zero errors

---

## Bugs Fixed

### 1. Open Redirect in Sign-in
**File:** `src/app/auth/signin/page.tsx`
**Severity:** HIGH

`callbackUrl` from `searchParams` was passed directly to `router.push()` without validation:

```ts
// before
const callbackUrl = searchParams.get('callbackUrl') ?? '/app/inbox'
// ...
router.push(callbackUrl)   // ← attacker passes https://evil.com
```

An attacker crafting `/auth/signin?callbackUrl=https://evil.com` would redirect a logged-in user off-site — standard phishing vector. Next-Auth only sanitises `callbackUrl` when it controls the redirect; here the code used `redirect: false` and called `router.push()` manually, bypassing that protection.

**Fix:** Validate that the value is a relative path (starts with `/` but not `//`).

```ts
const raw = searchParams.get('callbackUrl') ?? ''
const callbackUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/app/inbox'
```

---

### 2. Sensitive Token Presence Exposed in Health Endpoint
**File:** `src/app/api/health/route.ts`
**Severity:** MEDIUM

`/api/health` is unauthenticated. It returned:

```json
{ "BOOTSTRAP_ADMIN_TOKEN": true, ... }
```

This lets any anonymous caller enumerate whether the bootstrap-admin endpoint is a viable attack target. An attacker who sees `true` knows the endpoint accepts token auth and is worth brute-forcing or targeting.

**Fix:** Removed `BOOTSTRAP_ADMIN_TOKEN` from the env status object. The `ok` computation (which only checked `DATABASE_URL` and `AUTH_SECRET`) is unchanged.

---

### 3. Unhandled Clipboard Promise Rejection
**File:** `src/app/app/inbox/InboxView.tsx`
**Severity:** LOW

```ts
// before
navigator.clipboard.writeText(code).then(() => { ... })
// no .catch() — rejection silently dropped or may surface as unhandled promise
```

If the user denies the `clipboard-write` permission, the rejected promise propagates unhandled. In some browser+framework combinations this triggers global error handlers or console noise.

**Fix:** Added `.catch(() => {})` — the fallback already exists below for older browsers, so swallowing the error is correct here.

---

### 4. WEBHOOK_URL Double-Slash When AUTH_URL Has Trailing Slash
**Files:** `src/app/app/domains/actions.ts`, `src/app/app/domains/[id]/actions.ts`
**Severity:** LOW

```ts
// before — in both files
const WEBHOOK_URL = `${process.env.AUTH_URL ?? 'https://mailsifu.com'}/api/webhooks/forwardemail`
```

If `AUTH_URL` is set as `https://staging.mailsifu.com/` (with trailing slash), the URL becomes `https://staging.mailsifu.com//api/webhooks/forwardemail`. Most servers tolerate double slashes but Forward Email's webhook registration may reject or misroute it.

**Fix:** Strip trailing slash before interpolation.

```ts
const _baseUrl = (process.env.AUTH_URL ?? 'https://mailsifu.com').replace(/\/$/, '')
const WEBHOOK_URL = `${_baseUrl}/api/webhooks/forwardemail`
```

---

## Security Scan — Findings Requiring Manual Fix

### A. Missing Email Format Validation in `createUser`
**File:** `src/app/app/admin/users/actions.ts`
**Severity:** LOW

The server action checks `if (!email)` but not email format. Values like `"test"` or `"test@"` pass the guard and are stored in the DB. The `<input type="email">` provides client-side-only validation, trivially bypassed via curl.

**Recommended fix — add after the existing empty-check:**
```ts
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address' }
```

_(File is root-owned in this environment and could not be modified automatically.)_

---

## Security Scan — No Action Required

| Area | Result |
|------|--------|
| SQL / NoSQL injection | ✅ All DB access via Prisma parameterised queries |
| XSS | ✅ Email `bodyText` rendered as React children (auto-escaped). `bodyHtml` is stored but never rendered. No `dangerouslySetInnerHTML` anywhere. |
| CSRF | ✅ Next.js Server Actions enforce `Origin` header check built-in |
| Auth bypass | ✅ Middleware protects all `/app/*` routes; every server action also calls `auth()` independently |
| Workspace access control | ✅ All DB mutations verify workspace membership before operating |
| Webhook signature | ✅ HMAC-SHA256 + `timingSafeEqual`; 5-min replay window for Resend; raw HMAC for Forward Email |
| Bootstrap token | ✅ `timingSafeEqual` comparison; 404 in production |
| Hardcoded secrets | ✅ None found — all secrets via `process.env` |
| Path traversal | ✅ No direct filesystem access outside of framework-managed paths |
| Prototype pollution | ✅ No `Object.assign` with unvalidated external input |
| API key leakage | ✅ `FORWARD_EMAIL_API_KEY` and `RESEND_API_KEY` only used server-side |

---

## Remaining Suggestions (Not Bugs)

1. **Rate limiting on sign-in** — No brute-force protection on the credentials endpoint. Low risk for <10 internal users, but worth adding if ever exposed publicly.

2. **Dev endpoints on staging** — `/api/dev/bootstrap-admin` and `/api/dev/seed-inbox` gate on `NODE_ENV === 'production'`. Staging must explicitly set this or both endpoints remain open.

3. **Inbox pagination** — `take: 50` hardcoded in the inbox query. Fine now; add pagination before message volume grows.

4. **Webhook deduplication** — Forward Email may retry webhooks on non-200 or transient failures. Duplicate messages could be stored. Consider deduplicating on a hash of `from + to + subject + receivedAt` or a provider-supplied message ID.

5. **Dead code: `src/lib/resend-api.ts`** — `createDomain`, `getDomain`, `verifyDomain` are no longer imported anywhere. The app migrated to Forward Email for domain management. Safe to delete.

6. **Next-Auth beta warnings** — Pre-existing `jose` Edge Runtime warnings from `next-auth@5.0.0-beta`. Not introduced by this audit. Resolve by upgrading to a stable next-auth 5.x when available.
