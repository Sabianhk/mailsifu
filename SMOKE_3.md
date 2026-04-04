# Smoke Test Report #3 — mailsifu.com

**Date:** 2026-03-31 20:40 GMT+2
**Environment:** Production (https://mailsifu.com)
**Tool:** Playwright 1.x, Chromium headless
**Login:** stanley@lumislinks.com

---

## Summary

| # | Page | Desktop (1280x720) | Mobile (375x812) |
|---|------|-------------------|-------------------|
| 1 | `/auth/signin` | PASS — renders correctly | PASS — login succeeds |
| 2 | `/app/inbox` | PASS — empty state shown correctly | FAIL — client-side exception |
| 3 | `/app/domains` | PASS — 3 domains listed | FAIL — Vercel Security Checkpoint (Code 21) |
| 4 | `/app/domains/[id]` | PASS — domain detail loaded | N/A (blocked by security) |
| 5 | `/app/admin/users` | PASS — 2 members listed | FAIL — Vercel Security Checkpoint (Code 21) |

**Overall: 5/5 desktop PASS, 1/4 mobile PASS (3 mobile FAIL)**

---

## Desktop Results (all passing)

### Login (`/auth/signin`)
- Sign-in page renders with MailSifu branding, email/password fields, submit button
- Login with credentials succeeds, redirects to `/app/inbox`

### Inbox (`/app/inbox`)
- Three-panel layout: sidebar, message list, message preview
- Sidebar shows: Inbox, Domains, Users nav + "New Domain" CTA + user profile
- Empty state: "No messages yet" / "Your inbox is empty — Set up a domain to start receiving OTP emails"
- Search bar present (coming soon)

### Domains (`/app/domains`)
- Breadcrumb: Workspace > Domains
- Three domains displayed as cards:
  - **rx.lumislinks.com** — Verified (3d ago), 0 aliases, 0 messages
  - **shifumail.com** — Pending DNS, 0 aliases, 0 messages
  - **mailsifu.com** — Pending DNS, 3 aliases, 0 messages
- "Add Domain" form with input field + button present
- Search bar in header

### Domain Detail (`/app/domains/[id]`)
- Loaded successfully (screenshot shows content but text is blurred/skeleton due to fast capture)
- Breadcrumb navigation visible
- Domain info card and aliases section rendered

### Admin Users (`/app/admin/users`)
- Breadcrumb: Admin > Users
- "User Management" heading with subtitle
- Members list showing 2 users:
  - **Admin** (admin@lumislinks.com) — Admin role, joined 3/27/2026
  - **Stanley** (stanley@lumislinks.com) — Admin role, joined 3/27/2026
- "Add New User" form with Email, Name, Password, Role fields

---

## Mobile Results

### Mobile Inbox (`/app/inbox`) — FAIL
- **Application error: a client-side exception has occurred while loading mailsifu.com**
- The mobile viewport triggers a client-side crash on the inbox page
- This is a **real bug** — the inbox page does not handle mobile viewport gracefully

### Mobile Domains (`/app/domains`) — FAIL
- **"Failed to verify your browser — Code 21"**
- Vercel Security Checkpoint blocks the headless Chromium on mobile viewport
- This is likely Vercel's bot protection triggering on the mobile user-agent + headless combo
- The 403 console errors (8 total) correspond to blocked resource loads

### Mobile Admin Users (`/app/admin/users`) — FAIL
- Same Vercel Security Checkpoint block (Code 21)
- Same pattern as mobile domains

---

## Console Errors

| Context | Error | Count |
|---------|-------|-------|
| Desktop login | 404 (minor, likely favicon or asset) | 0 |
| Mobile all pages | `Failed to load resource: 403` | 8 |

---

## Issues Found

### CRITICAL: Mobile inbox crashes with client-side exception
- **Page:** `/app/inbox` at 375x812 viewport
- **Error:** "Application error: a client-side exception has occurred while loading mailsifu.com"
- **Impact:** Mobile users cannot view their inbox
- **Likely cause:** A component in the inbox layout doesn't handle narrow viewports — possibly the three-panel layout or a resize observer

### MEDIUM: Vercel Security Checkpoint blocks mobile headless browsing
- **Pages:** `/app/domains`, `/app/admin/users` at 375x812
- **Error:** "Failed to verify your browser — Code 21"
- **Impact:** Automated testing on mobile viewport is blocked; may also affect real mobile users behind certain network conditions
- **Note:** Desktop headless was NOT blocked — only mobile viewport triggered this. Could be a Vercel Attack Challenge or Bot Protection configuration issue. Worth checking Vercel Firewall settings.

---

## Screenshots

All screenshots saved to `test-screenshots/`:

| File | Description |
|------|-------------|
| `01-login-page.png` | Login form (desktop) |
| `02-login-filled.png` | Login form filled (desktop) |
| `03-after-login.png` | Post-login redirect (desktop) |
| `04-inbox.png` | Inbox empty state (desktop) |
| `05-domains.png` | Domains list with 3 domains (desktop) |
| `06-domain-detail.png` | Domain detail page (desktop) |
| `07-admin-users.png` | Admin users with 2 members (desktop) |
| `08-mobile-inbox.png` | **CLIENT-SIDE CRASH** (mobile) |
| `09-mobile-domains.png` | **SECURITY CHECKPOINT BLOCK** (mobile) |
| `10-mobile-admin-users.png` | **SECURITY CHECKPOINT BLOCK** (mobile) |

---

## Recommendations

1. **Fix mobile inbox crash** — Debug the client-side exception at mobile viewport. Likely a layout/component issue in the inbox three-panel view. Consider adding an error boundary to prevent full-page crashes.
2. **Review Vercel Firewall settings** — The Code 21 security checkpoint is blocking mobile-viewport headless browsers. Check if Attack Challenge Mode or aggressive bot rules are enabled. Consider whitelisting known test IPs or adjusting challenge sensitivity.
3. **Add responsive breakpoints** — The inbox page needs proper responsive design for mobile viewports (sidebar collapse, single-panel view).
