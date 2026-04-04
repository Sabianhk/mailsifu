# MailSifu — Fixes Checklist

Generated: 2026-03-30
Status: Pending — no changes made yet

---

## Critical — Mobile Responsiveness

### FIX-01: Sidebar has no mobile hamburger / is always visible

**Priority:** Critical
**File:** `src/components/Sidebar.tsx` (line 21)

**Current code:**
```tsx
<aside
  className="w-64 h-full flex flex-col py-8 px-4 flex-shrink-0 z-50"
  style={{ background: '#FFF0E8' }}
>
```

**What to change:**
- Add a hamburger button in `TopBar.tsx` that toggles sidebar open/closed state (lifted to a shared layout context or via a `SidebarProvider`)
- Change `aside` classes to `hidden md:flex` by default, with an `open` state that shows `flex` on mobile as a fixed overlay
- Add a backdrop overlay (dark semi-transparent) that closes the sidebar when tapped
- On mobile the sidebar should be full-height fixed, overlaying content, not pushing it

---

### FIX-02: Inbox list pane hardcoded at w-[380px]

**Priority:** Critical
**File:** `src/app/app/inbox/page.tsx` (line 69)

**Current code:**
```tsx
<section
  className="w-[380px] flex flex-col overflow-hidden flex-shrink-0"
  style={{ background: '#f6f3f0' }}
>
```

**What to change:**
- Change to `w-full md:w-[380px]` so it fills the full width on mobile
- On mobile, only show the list OR the detail pane, not both — see FIX-03

---

### FIX-03: No mobile detail view toggle in inbox

**Priority:** Critical
**File:** `src/app/app/inbox/page.tsx` (lines 162–163)

**Current code:**
```tsx
{activeMessage ? (
  <section className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
```

**What to change:**
- Track `mobileView: 'list' | 'detail'` state (default `'list'`)
- On mobile: show only the list pane when `mobileView === 'list'`, show only the detail pane when `mobileView === 'detail'`
- When a message is selected from the list, set `mobileView = 'detail'`
- Add a back-arrow button (`←`) in the detail pane header on mobile to return to list
- Use `hidden md:flex` / `flex md:hidden` pattern to toggle panels per breakpoint
- On desktop (md+): keep the existing side-by-side layout

---

### FIX-04: Oversized headlines overflow on mobile

**Priority:** Critical
**Files:**
- `src/app/app/domains/[id]/page.tsx` (lines 169–179)
- `src/app/app/domains/page.tsx` (lines 52–62)

**Current code (domain detail):**
```tsx
<h1
  style={{
    fontFamily: 'var(--font-newsreader)',
    fontSize: '3.5rem',
    color: '#1c1c1a',
    fontWeight: 600,
    lineHeight: 1.1,
  }}
>
  {domain.domain}
</h1>
```

**Current code (domains list):**
```tsx
<h1
  style={{
    fontFamily: 'var(--font-newsreader)',
    fontSize: '3rem',
    color: '#1c1c1a',
    fontWeight: 600,
    lineHeight: 1.1,
    marginBottom: '0.75rem',
  }}
>
  Receiving Domains
</h1>
```

**What to change:**
- Replace inline `fontSize` with a responsive Tailwind class: `text-3xl md:text-5xl` (domain detail) and `text-2xl md:text-4xl` (domains list)
- Remove the inline `fontSize` style property; keep all other inline styles (font-family, color, weight, line-height)
- For domain detail, the domain name (e.g. `rx.mailsifu.com`) is long — add `break-all` or `word-break: break-word` to prevent overflow

---

### FIX-05: Aggressive horizontal padding (px-12 / px-10) on mobile

**Priority:** Critical
**Files:**
- `src/app/app/inbox/page.tsx` (line 183)
- `src/app/app/domains/[id]/page.tsx` (line 153)
- `src/app/app/domains/page.tsx` (line 48)

**Current code:**
```tsx
{/* inbox/page.tsx */}
<div className="max-w-3xl mx-auto px-12 py-12">

{/* domains/[id]/page.tsx */}
<section className="flex-1 overflow-y-auto px-12 py-12">

{/* domains/page.tsx */}
<section className="flex-1 overflow-y-auto px-10 py-12">
```

**What to change:**
- Replace `px-12` → `px-4 md:px-12`
- Replace `px-10` → `px-4 md:px-10`
- Replace `py-12` → `py-6 md:py-12`
- On a 375px screen, `px-4` (16px each side) leaves 343px of content width — workable

---

### FIX-06: DNS records grid-cols-4 too narrow on mobile

**Priority:** Critical
**File:** `src/app/app/domains/[id]/page.tsx` (lines 67, 299–300)

**Current code:**
```tsx
{/* Record row */}
<div
  className="grid grid-cols-4 items-center px-4 py-5 rounded-xl transition-all group"
  style={{ background: 'rgba(252,249,246,0.5)', cursor: 'default' }}
>

{/* Table header */}
<div
  className="grid grid-cols-4 px-4 py-3 uppercase tracking-widest"
```

**What to change:**
- Mobile: stack each DNS record as a vertical card (`grid-cols-1`) with label + value pairs
- Desktop (md+): keep the existing 4-column table layout
- Change row classes to `grid grid-cols-1 md:grid-cols-4`
- On mobile, hide the column header row entirely (`hidden md:grid`)
- Each cell should show its column label inline on mobile (e.g. `<span class="text-xs text-muted md:hidden">Type</span>`)

---

### FIX-07: Domain detail header grid-cols-12 breaks on mobile

**Priority:** Critical
**File:** `src/app/app/domains/[id]/page.tsx` (line 166)

**Current code:**
```tsx
<div className="grid grid-cols-12 items-start gap-8">
  {/* Heading — left */}
  <div className="col-span-7">
    ...
  </div>
  {/* Description — offset right */}
  <div className="col-span-5 pt-10">
    ...
  </div>
</div>
```

**What to change:**
- Change to `grid grid-cols-1 md:grid-cols-12`
- Change heading div: `col-span-12 md:col-span-7`
- Change description div: `col-span-12 md:col-span-5 md:pt-10` (remove `pt-10` on mobile)

---

### FIX-08: Small touch targets in sidebar footer

**Priority:** Critical
**File:** `src/components/Sidebar.tsx` (lines 104–133)

**Current code:**
```tsx
{/* Avatar — 28px */}
<div
  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
  style={{ background: 'linear-gradient(135deg, #832800 0%, #a43e15 100%)' }}
>
  {initials}
</div>

{/* Sign out button — py-2 only */}
<button
  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
  className="w-full flex items-center gap-3 px-4 py-2 transition-colors duration-200 rounded-lg hover:bg-[#fcf9f6]/50"
  style={{ fontFamily: 'var(--font-manrope)', fontSize: '0.875rem', color: '#5f5e58' }}
>
  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
  <span>Sign out</span>
</button>
```

**What to change:**
- Avatar: change `w-7 h-7` → `w-9 h-9` (36px, closer to 44px minimum)
- Sign out button: change `py-2` → `py-3` to increase tap height
- Icon size: increase `fontSize: '18px'` → `fontSize: '20px'`

---

## Medium — UI Polish

### FIX-09: TopBar search has no mobile fallback

**Priority:** Medium
**File:** `src/components/TopBar.tsx` (lines 32–50)

**Current code:**
```tsx
{showSearch && (
  <div className="relative hidden md:flex items-center">
    <span
      className="material-symbols-outlined absolute left-3 pointer-events-none"
      style={{ fontSize: '16px', color: '#8b726a' }}
    >
      search
    </span>
    <input
      className="pl-9 pr-4 py-2 rounded-lg text-sm w-56 focus:outline-none"
      ...
      placeholder={searchPlaceholder ?? 'Search…'}
    />
  </div>
)}
```

**What to change:**
- Add a search icon button visible only on mobile (`flex md:hidden`) that expands into a full-width search bar overlay or replaces the TopBar title row
- The existing input is already `hidden md:flex` so desktop is fine — just needs mobile affordance
- Simple approach: a search icon button on mobile that toggles a `<input className="w-full ...">` replacing the page title row

---

### FIX-10: Copy buttons need larger touch targets

**Priority:** Medium
**File:** `src/app/app/domains/[id]/page.tsx` (lines 51–58, 97–104)

**Current code:**
```tsx
{/* CopyField copy button */}
<button
  type="button"
  data-copy={value}
  className="copy-btn flex-shrink-0 transition-colors"
  style={{ color: '#8b726a' }}
>
  <span className="material-symbols-outlined hover:text-primary" style={{ fontSize: '16px' }}>content_copy</span>
</button>

{/* RecordRow copy button */}
<button
  type="button"
  data-copy={rec.value}
  className="copy-btn"
  style={{ color: '#8b726a' }}
>
  <span className="material-symbols-outlined hover:text-[#832800]" style={{ fontSize: '16px' }}>content_copy</span>
</button>
```

**What to change:**
- Add `p-2` to both buttons: `className="copy-btn flex-shrink-0 transition-colors p-2"`
- Increase icon size from `16px` → `18px`
- This gives an effective tap area of ~36px+ (icon + padding), closer to the 44px minimum

---

### FIX-11: Status badges may be too small on mobile

**Priority:** Medium
**Files:**
- `src/app/app/domains/page.tsx` (lines 96–102)
- `src/app/app/domains/[id]/page.tsx` (lines 20–26)

**Current code:**
```tsx
{/* Domain card badge */}
<span
  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
  style={{ background: badge.bg, color: badge.color }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
  {badge.label}
</span>

{/* Domain detail StatusBadge */}
<span
  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
  style={{ background: badge.bg, color: badge.color }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />
  {badge.label}
</span>
```

**What to change:**
- Change `py-1` → `py-1.5` for slightly taller tap zone
- Change `text-xs` → `text-xs md:text-sm` on domain cards to improve readability on larger mobile screens
- Low-risk change — badges are display-only, not interactive, so this is a polish fix

---

### FIX-12: Domain cards need proper mobile layout

**Priority:** Medium
**File:** `src/app/app/domains/page.tsx` (lines 74–112)

**Current code:**
```tsx
<Link
  key={domain.id}
  href={`/app/domains/${domain.id}`}
  className="group relative rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 soft-elevation hover:translate-y-[-2px]"
  style={{ background: '#ffffff', textDecoration: 'none' }}
>
  ...
  <h3
    className="font-bold text-lg mb-1"
    style={{ fontFamily: 'var(--font-manrope)', color: '#1c1c1a' }}
  >
    {domain.domain}
  </h3>
```

**What to change:**
- Change card padding: `p-6` → `p-4 md:p-6`
- Change heading size: `text-lg` → `text-base md:text-lg`
- Add `truncate` or `break-all` to the domain name `<h3>` to prevent long domains overflowing the card
- Disable hover translate on touch devices: `hover:translate-y-[-2px] md:hover:translate-y-[-2px]` (remove on mobile — it can feel glitchy)

---

## Low — Backend / Flow

### FIX-13: Resend webhook URL needs updating

**Priority:** Low
**File:** Resend dashboard configuration (external — not in codebase)

**Issue:**
Resend inbound webhook is currently pointed at `mailsifu.vercel.app` or an old staging URL. It needs to point to the production domain.

**What to change:**
- Log into Resend dashboard → Inbound → Webhook URL
- Update to: `https://mailsifu.com/api/webhooks/resend` (or the correct production URL)
- Verify the `RESEND_WEBHOOK_SECRET` env var matches what's set in Resend
- No code change needed — this is a dashboard config change

---

### FIX-14: Delete old test domains that returned 422

**Priority:** Low
**File:** Database (Supabase) — no code change needed

**Issue:**
Old test domain records in the DB were created when the Resend API returned 422 errors. These are ghost/invalid domains that clutter the domains list.

**What to change:**
- Connect to Supabase and run:
  ```sql
  -- First: inspect which domains failed
  SELECT id, domain, status, "createdAt" FROM "Domain"
  WHERE status = 'failed' OR domain LIKE 'test%';

  -- Then delete (confirm list first):
  DELETE FROM "Domain" WHERE id IN ('<id1>', '<id2>');
  ```
- Alternatively: add a "Delete domain" button to the domain detail UI (scope this as a separate feature task)

---

## Fix Priority Summary

| # | Fix | File | Priority |
|---|-----|------|----------|
| 01 | Sidebar hamburger / mobile overlay | `Sidebar.tsx`, `TopBar.tsx` | Critical |
| 02 | Inbox list pane w-[380px] | `inbox/page.tsx` | Critical |
| 03 | Inbox mobile detail toggle | `inbox/page.tsx` | Critical |
| 04 | Oversized headlines | `domains/page.tsx`, `domains/[id]/page.tsx` | Critical |
| 05 | Aggressive padding px-12/px-10 | Multiple | Critical |
| 06 | DNS grid-cols-4 | `domains/[id]/page.tsx` | Critical |
| 07 | Domain header grid-cols-12 | `domains/[id]/page.tsx` | Critical |
| 08 | Small touch targets in sidebar footer | `Sidebar.tsx` | Critical |
| 09 | TopBar search mobile fallback | `TopBar.tsx` | Medium |
| 10 | Copy buttons touch targets | `domains/[id]/page.tsx` | Medium |
| 11 | Status badge sizing | `domains/page.tsx`, `domains/[id]/page.tsx` | Medium |
| 12 | Domain card mobile layout | `domains/page.tsx` | Medium |
| 13 | Resend webhook URL | Resend dashboard | Low |
| 14 | Delete failed test domains | Supabase DB | Low |

---

*No code has been changed. This document is a planning reference only.*
