# RFP Copilot SaaS (MVP)

Production-minded prototype for managing RFP responses with fast drafting support.

## Stack

- **Next.js 15** (App Router + Server Actions)
- **Prisma + SQLite**
- **Local auth** (email/password + signed httpOnly session cookie)

## Features

- User auth (register/login/logout)
- Dashboard with project creation and KPIs
- Project detail with RFP upload (`.txt`, `.md`, `.docx`, `.pdf`), requirement extraction, draft generation
- Answer Library CRUD (create/delete snippets + search)
- Requirement status tracking (`TODO`, `DRAFTED`, `REVIEWED`, `SUBMITTED`)
- Demo seed account

## Local setup

```bash
cd rfp-copilot-saas
cp .env.example .env
npm install
npm run db:push
npm run db:seed
```

## Start app

### Development

```bash
npm run dev
```

Open: http://localhost:3000

### Production-like run

```bash
npm run build
npm run start
```

## Demo login

- **Email:** `demo@rfpcopilot.local`
- **Password:** `demo1234`

## Smoke test checklist

1. Login with demo account
2. Create a new project from dashboard
3. Open project and upload a `.txt` or `.md` RFP file
4. Generate drafts
5. Open Answer Library and add new entry
6. Delete the entry again

## Environment

- `DATABASE_URL` - Prisma database URL
- `APP_URL` - app URL
- `SESSION_SECRET` - strong random secret in production
