# Personal Ops Agent

A free, serverless AI agent that:

- Reads my Google Calendar and a Sheets-based activity log (bills, workouts, etc.)
- Summarizes the day using Gemini (Google AI Studio)
- Sends me a morning briefing via Telegram
- Can be triggered manually from iPhone Shortcuts

## Architecture

- **Frontend / API**: Next.js (App Router) on Vercel (free tier)
- **Scheduler**: Vercel Cron (daily at 7 AM IST)
- **Data**:
  - Google Calendar API (events)
  - Google Sheets (bills & activities)
- **LLM**: Gemini via Google AI Studio (free tier)
- **Notifications**: Telegram Bot API (free)
- **iPhone integration**: Apple Shortcuts (log bills/activities, trigger briefs)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in:
   - Google service account (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`)
   - Google Calendar ID (`GOOGLE_CALENDAR_ID`)
   - Google Sheets ID & tab (`GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_TAB`)
   - Gemini API key (`GEMINI_API_KEY`)
   - Telegram bot token & chat ID (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)
   - Cron secret (`CRON_SECRET`)
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Test:
   ```bash
   curl "http://localhost:3000/api/cron/daily-brief?secret=YOUR_CRON_SECRET"
   ```

## Deployment

1. Push to GitHub.
2. Import repo in Vercel.
3. Add all environment variables in Vercel settings.
4. Enable cron (configured in `vercel.json`).
5. Test deployed endpoint:
   ```bash
   curl "https://your-app.vercel.app/api/cron/daily-brief?secret=YOUR_CRON_SECRET"
   ```

## iOS Shortcuts

- **Log Bill**: POST to `/api/log-activity` with `type=bill`, `amount`, `category`, `notes`.
- **Log Activity**: POST to `/api/log-activity` with `type=activity`.
- **Send My Briefing Now**: GET `/api/cron/daily-brief?secret=...` and show notification.

## Resume blurb

> **Personal Ops Agent (iOS + Telegram)** – Built a $0 agentic system that aggregates Google Calendar and a Sheets-based activity log, summarizes the day using Gemini Flash, and delivers a morning briefing via Telegram. Implemented with Next.js on Vercel (cron), Google APIs, Telegram Bot API, and iOS Shortcuts.
