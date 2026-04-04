# UX Fixes — 2026-04-01

Based on HUMAN_TEST.md smoke test report.

## 1. Sign-in button spinner (HIGHEST PRIORITY)
- **File:** `src/app/auth/signin/page.tsx`
- **Issue:** Button already had loading state (disabled + "Signing in..." text) but no visual spinner
- **Fix:** Added animated SVG spinner next to "Signing in..." text for immediate visual feedback
- **Note:** The ~10s delay is caused by NextAuth credential verification + session creation + server-side redirect, not a frontend issue. The spinner ensures users know something is happening.

## 2. Domain detail page "washed out" rendering (CRITICAL)
- **Files:** `src/app/globals.css`, `src/app/app/domains/[id]/page.tsx`
- **Issue:** `glass-panel` CSS class used `rgba(252,249,246,0.8)` — nearly-invisible cream-on-cream. Record rows used `rgba(252,249,246,0.5)` — 50% opacity cream on cream background. DNS panel outline was `0.5px solid rgba(222,192,183,0.2)` — barely visible.
- **Fix:**
  - `glass-panel` background changed to `rgba(255,255,255,0.88)` — white-based, more visible
  - Record row backgrounds changed to `rgba(255,255,255,0.7)` — distinct from surface
  - DNS panel outline changed to `1px solid rgba(222,192,183,0.35)` — thicker and more visible

## 3. Empty state icon contrast
- **File:** `src/app/app/inbox/InboxView.tsx`
- **Issue:** Empty state icons used `color: #8b726a` (outline gray) on `background: #f0edea` — too faint
- **Fix:** Changed to `color: #57423b` (on-surface-variant) on `background: #e5e2da` (secondary-container) for both the message list empty state and the right panel empty state

## 4. Loading skeleton contrast
- **Files:** All `loading.tsx` files under `src/app/app/`
- **Issue:** Skeleton elements used very low opacity values (5-15%), making them nearly invisible and indistinguishable from the background. The smoke test detected "0 skeletons" even though the components existed.
- **Fix:** Increased opacity values across all skeleton loaders:
  - Sidebar brand skeletons: 15% → 22%, 8% → 12%
  - TopBar breadcrumb skeletons: 20% → 30%
  - Content skeletons: 7-10% → 12-18%
  - Admin users skeletons: `#e5e2da` → `#dcdad7` (surface-dim for better visibility)
  - Inbox search bar skeleton: `#f0edea` → `#e5e2da` (more visible)

## Performance note
- Auth page slowness (5-9s) is primarily caused by Supabase/Prisma cold starts and sequential DB queries
- Pages already have `revalidate` set (10s for inbox, 30s for domains) which helps with cached responses
- The `getSession()` and `getMembership()` helpers use React `cache()` to deduplicate within a request
- Further optimization would require connection pooling config changes in the database URL or migrating to a pooler endpoint
