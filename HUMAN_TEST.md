# MailSifu Human-Like Smoke Test Report

**Date:** 2026-04-01T17:55:00Z
**URL:** https://mailsifu.com
**Test Viewports:** Desktop (1280x720) + Mobile (375x812)
**Tester:** Automated Playwright (headed Chromium via xvfb)
**Auth:** stanley@lumislinks.com (Admin)

---

## 0. Landing Page

| Metric | Value |
|--------|-------|
| Full load (networkidle) | ~1,862ms |
| Title | MailSifu |
| Hero | "OTP inbox, crystal clear." |

**Findings:**
- Landing page loads fast (~1.8s including all assets). Good.
- Clean, warm design with consistent #E8623A orange branding.
- Three feature cards (OTP Inbox, Domain Management, Team Access) render correctly.
- "Sign in" button in top-right and "Open workspace" CTA both link to `/auth/signin`.
- Footer renders with branding and tagline.
- No FOUC observed. Fonts (Manrope, mono) loaded cleanly.
- No console errors on this page.

**Issues:**
- Large vertical gap between hero section and feature cards (~200px empty space). Feels sparse on desktop.
- Feature cards could be visually closer to the hero CTA for a tighter flow.

---

## 1. Login Flow

| Metric | Value |
|--------|-------|
| Signin page load | ~818ms |
| Login + redirect | ~9,624ms |
| Post-login URL | /app/inbox |

**Findings:**
- Signin page loads fast (<1s). Clean centered card design.
- "MailSifu" italic heading with "Internal workspace access" subtitle -- looks good.
- EMAIL and PASSWORD labels are uppercase, form fields are visible.
- Sign in button is gradient orange, full-width. Looks correct.
- Footer says "MailSifu - Internal access only" -- nice touch.

**Issues:**
- **Login redirect is SLOW (~9.6 seconds).** This is the biggest UX problem. After clicking "Sign in", the user stares at nothing. No loading spinner, no progress indicator.
- No loading state on the sign-in button (no spinner, no "Signing in..." text, no disabled state).
- After login, the initial inbox render shows skeleton-like gray blocks briefly (screenshot 04 shows this transition state where all content is placeholder blocks). This is actually good -- it means there IS a loading state, but it flashes by.
- No "Remember me" checkbox.
- No "Forgot password" link (acceptable for internal tool, but worth noting).

---

## 2. Inbox Page

| Metric | Value |
|--------|-------|
| Page load | ~7,621ms |
| URL | /app/inbox |

**Findings:**
- Three-column layout: Sidebar | Message list | Message preview.
- Sidebar shows: MailSifu brand, "OTP Curator" subtitle, Inbox/Domains/Users nav, "+ New Domain" CTA, user info, sign out.
- Search bar with placeholder "Search messages... (coming soon)" is present.
- "All Messages" tab/filter is visible.
- Empty state shows: "No messages yet" with helpful copy "Messages from your configured domains will appear here once email receiving is set up."
- Right panel shows: "Your inbox is empty -- Set up a domain to start receiving OTP emails."
- User avatar "S" with name "Stanley" and email displayed at bottom of sidebar.

**Issues:**
- **Page load is SLOW (~7.6s).** For an empty inbox, this is way too long.
- The "coming soon" text on the search placeholder is honest but feels unpolished for production.
- Empty state icons are very faint/low contrast -- barely visible.
- No skeleton/shimmer loading animation detected (skeletons count: 0). Content just pops in.
- The "+ New Domain" button in the sidebar feels misplaced -- it's at the bottom, far from where users would naturally look. Consider moving domain management actions to the Domains page.

---

## 3. Domains Page

| Metric | Value |
|--------|-------|
| Page load | ~5,821ms |
| Domain detail navigation | ~3,079ms |

**Findings:**
- Breadcrumb: "Workspace > Domains" -- good navigation pattern.
- Search bar "Search domains..." in top-right -- good.
- Two domain cards displayed:
  - **rx.lumislinks.com** -- 0 aliases, 0 messages, "Verified" badge (green dot), "Verified 4d ago"
  - **mailsifu.com** -- 3 aliases, 0 messages, "Pending DNS" badge (amber dot)
- "Add Domain" card with inline form (placeholder: "mail.example.com") -- nice pattern, no modal needed.
- Statistics section: "TOTAL DOMAINS: 02, VERIFIED: 01" -- clean.

**Issues:**
- **Page load ~5.8s.** For 2 domain cards, this is slow.
- **Domain detail page (screenshot 07) renders as a washed-out/faded skeleton.** The content appears as very low-contrast gray shapes. This suggests:
  - Either the domain detail page data fetch is failing silently
  - Or the skeleton/loading state is persisting indefinitely
  - Or there's a rendering issue with low opacity/color values
- This is a **critical bug** -- clicking a domain doesn't show actual domain details.
- The "Add Domain" card uses a dashed border, which is good UX convention for "add new" actions.

---

## 4. Admin Users Page

| Metric | Value |
|--------|-------|
| Page load | ~6,192ms |

**Findings:**
- Breadcrumb: "Admin > Users" -- good.
- "User Management" heading with "Manage workspace members and their roles."
- Members (2) listed:
  - **Admin** (admin@lumislinks.com) -- Admin role, 3/27/2026
  - **Stanley** (stanley@lumislinks.com) -- Admin role, 3/27/2026
- User avatars with initials (A, S) in brown circles -- consistent.
- "Add New User" form with fields: Email*, Name, Password*, Role* (dropdown: Member) -- all present.

**Issues:**
- **Page load ~6.2s.** Pattern continues -- all authenticated pages are slow.
- User list and add form are on the same page -- good for small teams, but might not scale.
- No delete/edit user capability visible (may need scroll).

---

## 5. Visual Quality

### Desktop (1280x720)

**Positive:**
- Consistent warm color palette (#fdf8f5 background, #E8623A accent, #1C1410 text).
- Clean sidebar with proper hierarchy.
- Typography is readable -- Manrope for headings, system/sans for body.
- Material Symbols Outlined icons are consistent.
- User avatar with initial in brown circle -- polished.
- Gradient orange buttons are distinctive.

**Negative:**
- Domain detail page renders as washed-out skeleton (critical bug).
- Post-login transition shows raw skeleton blocks briefly before content loads (low-priority cosmetic).
- Empty state illustrations/icons are extremely low contrast.

### Mobile (375x812)

**Positive:**
- Landing page reflows perfectly -- single column, cards stack vertically.
- Mobile inbox has hamburger menu (3 lines) and collapses sidebar correctly.
- Mobile domains page shows cards stacked, breadcrumb condenses.
- "Add Domain" card goes full-width on mobile -- correct.
- No horizontal overflow detected.

**Negative:**
- Mobile landing page has enormous vertical white space between hero and feature cards (even more pronounced than desktop).
- The "Open workspace" button on mobile could be larger for touch targets.

---

## 6. Responsiveness

| Check | Result |
|-------|--------|
| Sidebar collapse on mobile | YES -- collapses, hamburger appears |
| Hamburger menu | YES -- visible at 375px |
| Horizontal overflow | NO -- clean |
| Content reflow | YES -- cards stack, layout adapts |
| Touch targets | Adequate but could be larger |

**Findings:**
- The sidebar collapses behind a hamburger menu on mobile (breakpoint appears to be `lg:` / 1024px).
- The hamburger button was already showing "Close menu" when tested, suggesting the sidebar may auto-open on navigation -- this might be a minor bug.

---

## 7. Performance & Console Errors

### Console Errors
- **10 x 404 resource errors** -- multiple resources returning 404. Likely `_next/data` JSON prefetch failures or missing static assets.

### Performance (Landing Page)
| Metric | Value |
|--------|-------|
| TTFB | 3ms (Vercel edge cache HIT) |
| x-vercel-cache | HIT |

The landing page is cached at the edge so it loads extremely fast. The authenticated pages are the problem.

### Overall Performance Assessment

| Page | Load Time | Rating |
|------|-----------|--------|
| Landing (/) | ~1.8s | GOOD |
| Sign in (/auth/signin) | ~0.8s | GOOD |
| Login redirect | ~9.6s | CRITICAL |
| Inbox (/app/inbox) | ~7.6s | POOR |
| Domains (/app/domains) | ~5.8s | POOR |
| Domain detail | ~3.1s | OK (but renders broken) |
| Admin users | ~6.2s | POOR |

**Root cause hypothesis:** All authenticated pages are slow (5-9s). This suggests:
1. Server-side data fetching is the bottleneck (Prisma + Neon Postgres cold starts?)
2. No data caching on authenticated routes
3. Possibly re-authenticating/re-fetching session on every navigation

---

## Summary: Top Issues by Priority

### Critical
1. **Login redirect takes ~10 seconds with no loading indicator.** Users will think the app is broken.
2. **Domain detail page renders as washed-out skeleton** -- content never fully loads. Users can't see DNS records or aliases.
3. **All authenticated pages load in 5-9 seconds.** Unacceptable for a simple CRUD app with minimal data.

### High
4. **No loading state on sign-in button.** Add spinner/disabled state while authenticating.
5. **10 x 404 console errors** on page loads. Investigate missing resources.
6. **No loading skeletons on authenticated pages** -- content pops in with no transition.

### Medium
7. **Large vertical gap** between hero and feature cards on landing page.
8. **Empty state icons are very low contrast** -- barely visible.
9. **"Search messages... (coming soon)"** -- either implement or remove the placeholder.
10. **"+ New Domain" button in sidebar** is disconnected from the Domains page.

### Low / Polish
11. No "Remember me" on login form.
12. No "Forgot password" link.
13. Mobile touch targets could be larger for CTA buttons.
14. Consider adding page transition animations between routes.

---

## Recommendations

1. **Add loading states everywhere:**
   - Spinner on sign-in button while authenticating
   - Skeleton screens for inbox, domains, users pages
   - Progress bar or loading indicator during route transitions (e.g. NProgress bar)

2. **Investigate the slow authenticated routes:**
   - Profile the server-side data fetching (Prisma queries)
   - Check for Neon Postgres cold starts (first query after idle)
   - Add connection pooling if not already configured
   - Consider prefetching data on the client side

3. **Fix domain detail page rendering** -- the page loads but content appears washed out/broken.

4. **Fix 404 errors** -- check what static resources are missing.

5. **Tighten the landing page layout** -- reduce gap between hero and feature cards.

---

## Screenshots Index

| # | Name | Description |
|---|------|-------------|
| 01 | landing-desktop.png | Landing page at 1280x720 |
| 02 | signin-page.png | Sign-in form |
| 03 | signin-filled.png | Sign-in with credentials |
| 04 | post-login.png | Immediately after login (skeleton state) |
| 05 | inbox-desktop.png | Inbox page (empty, fully loaded) |
| 06 | domains-desktop.png | Domains page with 2 domains |
| 07 | domain-detail.png | Domain detail (BROKEN -- washed out) |
| 08 | admin-users-desktop.png | Admin users page |
| 09 | mobile-landing.png | Landing at 375x812 |
| 10 | mobile-signin.png | Signin at mobile |
| 11 | mobile-inbox.png | Inbox at mobile |
| 12 | mobile-domains.png | Domains at mobile |

---
*Generated by Playwright smoke test on 2026-04-01*
