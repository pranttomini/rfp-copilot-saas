# 7-Day Prioritized Backlog (Execution-Ready)

## Goal for the week
Ship a stable MVP to a public domain with basic ops hygiene and a demo-ready flow.

## P0 (must ship)

### Day 1 — Production baseline
- [ ] Provision server (Ubuntu), create non-root deploy user, setup SSH key auth
- [ ] Install Node 22 LTS + npm, nginx, certbot
- [ ] Clone repo + install deps (`npm ci`)
- [ ] Create production `.env` and set secure `SESSION_SECRET`
- [ ] Run `npm run build` successfully

**Definition of done:** app builds on server with production env.

### Day 2 — Database + process reliability
- [ ] Decide DB path (`/var/lib/rfp-copilot/prod.db`) and backup folder
- [ ] Update `DATABASE_URL` to absolute sqlite file path
- [ ] Run `npm run db:push` and `npm run db:seed`
- [ ] Add process manager (systemd or PM2) for `npm run start`
- [ ] Configure restart on reboot + failure

**Definition of done:** app survives restart and serves seeded demo account.

### Day 3 — Domain, HTTPS, reverse proxy
- [ ] Point A record to server IP
- [ ] Configure nginx upstream to `localhost:3000`
- [ ] Issue TLS cert with certbot
- [ ] Force HTTP→HTTPS, verify renewal timer

**Definition of done:** app reachable via `https://<domain>` with valid cert.

### Day 4 — Smoke + bugfix pass
- [ ] Run full smoke test from README on production URL
- [ ] Verify auth cookie behavior on HTTPS
- [ ] Fix any blockers (upload, draft generation, answer library CRUD)
- [ ] Add basic server firewall rules (22/80/443 only)

**Definition of done:** all smoke checks pass end-to-end.

## P1 (important this week)

### Day 5 — Monitoring + backups
- [ ] Add daily sqlite backup cron (timestamped, keep last 7)
- [ ] Add app + nginx log paths to runbook
- [ ] Add uptime check (external ping or simple script)

**Definition of done:** restore path and health signal are documented and tested once.

### Day 6 — Hardening + performance basics
- [ ] Disable password SSH, root SSH login
- [ ] Set nginx body size limit aligned with upload needs
- [ ] Add simple rate limiting for login route

**Definition of done:** baseline security controls active without breaking UX.

### Day 7 — Release prep
- [ ] Final demo pass with seeded account
- [ ] Prepare known-issues list + next sprint backlog
- [ ] Tag release in git (`v0.1.0-mvp-live`)

**Definition of done:** ready for stakeholder demo and controlled pilot.

## Weekly risks to watch
- SQLite on single node (acceptable for MVP; monitor growth)
- File upload edge cases (PDF/DOCX parse failures)
- Session secret rotation policy not yet implemented
