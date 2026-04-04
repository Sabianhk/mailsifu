# MailSifu Smoke Test Report

**Date:** 2026-03-31 16:36 GMT+2
**Target:** https://mailsifu.com
**Method:** agent-browser (headless Chrome via CDP)
**Authenticated as:** stanley@lumislinks.com (Admin)

---

## Summary

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Homepage loads (200) | PASS | Clean landing page, "OTP inbox, crystal clear" hero |
| 2 | API health endpoint | PASS | `GET /api/health` returns 200 |
| 3 | Sign-in page renders | PASS | Email/password form, clean layout |
| 4 | Login with credentials | PASS | Redirects to `/app/inbox` after login |
| 5 | Inbox page (`/app/inbox`) | PASS | Shows sidebar nav (Inbox, Domains, Users), empty inbox state, search placeholder |
| 6 | Domains page (`/app/domains`) | PASS | Shows 7 domains (rx.lumislinks.com verified, others pending DNS). Initial skeleton loading then renders. |
| 7 | Domain detail page | PASS | Shows verification status, MX record DNS settings for rx.lumislinks.com |
| 8 | Admin users page (`/app/admin/users`) | PASS | Shows 2 members (Admin, Stanley), both Admin role, "Add New User" form |
| 9 | Console errors | PASS | No JavaScript errors detected during navigation |
| 10 | Mobile homepage (375x812) | PASS | Responsive layout, text readable, CTA visible |
| 11 | Mobile authenticated pages | BLOCKED | Vercel Security Checkpoint triggered (Code 21) — bot detection on viewport change. Not an app bug. |

## Route HTTP Status Codes

| Route | Status | Expected |
|-------|--------|----------|
| `GET /` | 200 | 200 |
| `GET /api/health` | 200 | 200 |
| `GET /auth/signin` | 200 | 200 |
| `GET /app/inbox` (unauthenticated) | 307 | 307 (redirect to signin) |
| `GET /app/domains` (unauthenticated) | 307 | 307 (redirect to signin) |
| `GET /app/admin/users` (unauthenticated) | 307 | 307 (redirect to signin) |

## Console Errors

**None found.** Error listener installed and checked across multiple page navigations — no `error` or `unhandledrejection` events captured.

## Observations

- **Skeleton loading on Domains page:** The domains page initially renders skeleton placeholders for ~2-3 seconds before content appears. This is normal for data-fetched pages but could feel slow.
- **Search disabled:** Inbox search shows "Search is coming soon" (disabled input). Domains page has an active search box.
- **Leftover test domains:** Several test domains visible (test123verify.com, testsmoke1774716812687.com, smoketest1774716909537.com, smoke123.com) — likely from prior automated testing. Consider cleanup.
- **Vercel bot protection:** Mobile viewport testing on authenticated pages triggered Vercel Security Checkpoint (Code 21). This is Vercel's WAF, not an app bug. Real mobile users would pass the challenge.

## Recommendations

1. **Clean up test domains** — Remove test/smoke domains from the domains list to keep the workspace tidy.
2. **Monitor skeleton loading times** — If domains page loading exceeds 3s in production, consider adding a cache or optimizing the API call.
3. **No critical issues found** — The app is functional across all tested routes with proper auth guards, clean UI, and no JS errors.

---

**Result: 10/10 tests PASS, 1 BLOCKED (external bot protection, not an app issue)**
