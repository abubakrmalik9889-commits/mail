# MailFlow — Email Automation SaaS

Full-stack email automation: React + Node.js + Express + Nodemailer.

## Quick Start

```bash
# Terminal 1 — Backend
cd backend
npm install
cp .env.example .env   # edit with your SMTP creds or leave DEMO_MODE=true
npm run dev            # → http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev            # → http://localhost:3000
```

Open http://localhost:3000

## Features
- Upload CSV leads (drag & drop)
- Email templates with {{name}}, {{company}} variables
- Live email preview — rendered HTML / plain text / mobile view
- Launch campaigns — sends personalised emails to all leads
- Auto follow-ups — cron job sends follow-up after N days if no reply
- Analytics dashboard — sent / replies / leads / follow-ups
- SMTP or Gmail App Password support

## Gmail Setup
1. myaccount.google.com → Security → App passwords
2. Create one for "Mail"
3. Add to backend/.env: SMTP_USER=you@gmail.com, SMTP_PASS=16charcode, DEMO_MODE=false

## Upgrade to Real Database (Supabase)
Replace store.js exports with Supabase queries:
```js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
module.exports = {
  getCampaigns: async () => { const { data } = await supabase.from('campaigns').select('*'); return data; },
  // ...
};
```

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Server status |
| GET | /api/analytics | Dashboard stats |
| GET | /api/analytics/activity | 7-day chart data |
| GET | /api/campaigns | List campaigns |
| POST | /api/campaigns | Create + send campaign |
| GET | /api/templates | List templates |
| PUT | /api/templates/:id | Update template |
| POST | /api/templates/preview-raw | Preview with variables |
| GET | /api/leads | List leads |
| POST | /api/leads/upload | Parse CSV |
| PATCH | /api/leads/:id/reply | Mark replied |
