# OpenClaw Bot Setup Plan — SifuBot

> Food supply pre-orders + electricity meter tracking via Telegram forum topics + Google Sheets.
> Created: 2026-04-07. Work on this when ready.

---

## Overview

A Telegram bot (SifuBot) running on your VPS via OpenClaw. It lives in a Telegram supergroup with forum topics enabled:

- **Topic 1: Food Supply Pre-Orders** — Staff post orders → bot summarizes → HQ approves/rejects → approved orders written to Google Sheets
- **Topic 2: Electricity Meter Reporting** — Staff post daily meter readings → bot calculates consumption (today - yesterday) → reports back → writes to Google Sheets

---

## Prerequisites

### 1. OpenClaw Installation (on VPS)
```bash
curl -fsSL https://get.openclaw.ai | bash
# OR via Docker — check https://github.com/openclaw/openclaw
openclaw status  # verify it runs
```

### 2. Telegram Bot
1. Message `@BotFather` on Telegram → `/newbot` → save the token
2. `/setprivacy` → **Disabled** (bot needs to read all messages in group)
3. Create a **supergroup** with forum topics enabled
4. Add the bot to the group and **make it admin**
5. Create two forum topics: "Food Supply Pre-Orders" and "Electricity Meter"
6. Get IDs:
   - **Supergroup chat ID**: add `@getmyid_bot` to the group, or check bot API updates
   - **Thread IDs**: each forum topic has a numeric `message_thread_id` — get from Telegram URL or bot updates

### 3. Google Cloud + Sheets
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project (e.g., "sifu-ops-bot")
3. Enable **Google Sheets API**
4. Create a **Service Account** (IAM → Service Accounts → Create)
5. Download the JSON key file → place on VPS at `~/.openclaw/credentials/google-service-account.json`
6. Create two Google Sheets (see structure below)
7. **Share both sheets** with the service account email (e.g., `openclaw-bot@your-project.iam.gserviceaccount.com`) as **Editor**

### 4. Install OpenClaw Skills
```bash
openclaw skill install google-sheets
openclaw skill install lobster
```

---

## Google Sheets Structure

### Sheet 1: Food Supply Orders
Spreadsheet name: `Food Supply Orders` | Tab: `Orders`

| Column | Header           | Format     | Notes                              |
|--------|------------------|------------|------------------------------------|
| A      | Date             | YYYY-MM-DD | Auto-filled by bot                 |
| B      | Time             | HH:MM      | Auto-filled by bot                 |
| C      | Staff Name       | Text       | Telegram display name              |
| D      | Item             | Text       | One row per item                   |
| E      | Quantity         | Number     | Numeric only                       |
| F      | Unit             | Text       | kg, pcs, box, etc.                 |
| G      | Status           | Text       | "Approved" or "Rejected"           |
| H      | Approved By      | Text       | HQ person's name                   |
| I      | Order Batch ID   | Text       | Groups items from the same order   |

### Sheet 2: Electricity Meter Log
Spreadsheet name: `Electricity Meter Log` | Tab: `Readings`

| Column | Header            | Format     | Notes                                        |
|--------|-------------------|------------|----------------------------------------------|
| A      | Date              | YYYY-MM-DD | Auto-filled by bot                           |
| B      | Time              | HH:MM      | Auto-filled by bot                           |
| C      | Reading           | Number     | Raw meter value                              |
| D      | Previous Reading  | Number     | From previous row                            |
| E      | Consumption (kWh) | Number     | today - yesterday, or "N/A" for first entry  |
| F      | Reported By       | Text       | Staff name                                   |
| G      | Notes             | Text       | "Baseline", "Abnormally high", "Meter reset" |

---

## Config Files to Deploy

Copy the entire `openclaw-sifu/` folder contents to `~/.openclaw/` on your VPS, then fill in the placeholders.

### Files included in this folder:
- `SOUL.md` — personality + workflow logic (the brain)
- `IDENTITY.md` — bot name/role
- `USER.md` — operator context
- `TOOLS.md` — available integrations
- `openclaw.json` — main config (Telegram, skills, topics)

---

## Placeholders to Fill

After copying files to VPS, replace these in `openclaw.json`:

| Placeholder                  | Where to get it                              |
|------------------------------|----------------------------------------------|
| `YOUR_TELEGRAM_BOT_TOKEN`    | From @BotFather                              |
| `YOUR_SUPERGROUP_CHAT_ID`    | From @getmyid_bot in the group               |
| `THREAD_ID_ORDERS`           | Forum topic ID for Food Supply Pre-Orders    |
| `THREAD_ID_ELECTRICITY`      | Forum topic ID for Electricity Meter         |
| `SPREADSHEET_ID_ORDERS`      | From Google Sheets URL (the long alphanumeric string) |
| `SPREADSHEET_ID_ELECTRICITY` | From Google Sheets URL                       |
| `hq_username`                | Telegram username of the person who approves |
| `staff1`, `staff2`, etc.     | Telegram usernames of staff members          |
| `stanley_tg_username`        | Your Telegram username                       |

---

## Testing Checklist

1. [ ] Start OpenClaw: `openclaw restart`
2. [ ] Post in Food Supply topic: "chicken breast 50kg, fish fillet 30kg"
3. [ ] Verify bot summarizes order in a table and pings HQ
4. [ ] Reply "approved" from HQ account
5. [ ] Check Google Sheets — order rows should appear
6. [ ] Reply "rejected" to another test order — verify it's NOT written to sheets
7. [ ] Post in Electricity topic: "45231"
8. [ ] Verify bot reports "Baseline" (first reading) and writes to sheet
9. [ ] Post another reading: "45298"
10. [ ] Verify bot calculates consumption (67 kWh) and writes to sheet
11. [ ] Post a suspiciously high reading — verify bot flags it
12. [ ] Post a lower reading than previous — verify bot asks to confirm

---

## Troubleshooting

- **Bot not responding in topics**: Make sure bot is admin + privacy mode is disabled
- **Google Sheets 403**: Sheet not shared with service account email
- **Google Sheets 404**: Wrong spreadsheet ID or sheet tab name
- **Unknown key error on startup**: openclaw.json has a typo — run `openclaw doctor --fix`
- **Bot responds in wrong topic**: Check thread IDs in config match actual topic IDs
