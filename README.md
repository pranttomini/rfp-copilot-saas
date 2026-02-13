# RFP Copilot SaaS (MVP)

Production-minded prototype for managing RFP responses with fast drafting support.

## Stack

- **Next.js 15** (App Router + Server Actions)
- **Prisma + SQLite** (easy local dev; swap to Postgres for production)
- **Local auth** (email/password + signed httpOnly session cookie)
- Plain clean CSS UI

## Features implemented

- User auth (register/login/logout)
- Dashboard with project creation and summary stats
- Project detail page with RFP upload (`.txt`, `.md`)
- Heuristic parser for extracting requirements + potential deadlines
- Answer Library CRUD (create/delete snippets)
- Generate first draft answer per requirement using template + snippet matching
- Requirement status tracking (`TODO`, `DRAFTED`, `REVIEWED`, `SUBMITTED`)
- Seeded demo account + demo project

## Quick start

```bash
cd rfp-copilot-saas
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open: http://localhost:3000

## Demo account

- **Email:** `demo@rfpcopilot.local`
- **Password:** `demo1234`

## Environment

See `.env.example`:

- `DATABASE_URL` - Prisma database URL
- `APP_URL` - app URL for env parity
- `SESSION_SECRET` - strong random secret in production

## Notes for production hardening (next)

1. Replace SQLite with Postgres + Prisma migrations
2. Add CSRF protection + secure cookie flags + session expiry/rotation
3. Add file type scanning and DOCX/PDF text extraction pipeline
4. Add richer parser (NER + classifier) and confidence scores
5. Add versioning/workflow approvals and audit logs
6. Add tests (unit + integration + e2e)
