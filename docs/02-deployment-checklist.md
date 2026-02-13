# Deployment Checklist (Server + Domain + Env)

## 1) Server
- [ ] Ubuntu server provisioned, static public IP
- [ ] Non-root deploy user created (`sudo` enabled)
- [ ] SSH key auth works; password login disabled
- [ ] Node 22 LTS + npm installed
- [ ] nginx + certbot installed
- [ ] Repo cloned to `/opt/rfp-copilot-saas`
- [ ] `npm ci` completed
- [ ] `npm run build` passes
- [ ] Process manager configured (`systemd` or `pm2`)
- [ ] App starts on boot and restarts on crash

## 2) Domain + HTTPS
- [ ] Domain A record points to server IP
- [ ] nginx site config proxies to `127.0.0.1:3000`
- [ ] TLS cert issued (`certbot --nginx`)
- [ ] HTTP redirects to HTTPS
- [ ] Cert auto-renew tested (`certbot renew --dry-run`)

## 3) Environment variables
Required:
- [ ] `DATABASE_URL` (absolute prod sqlite path, e.g. `file:/var/lib/rfp-copilot/prod.db`)
- [ ] `APP_URL` (public HTTPS URL)
- [ ] `SESSION_SECRET` (long random secret, 32+ chars)

Validation:
- [ ] `npm run db:push`
- [ ] `npm run db:seed`
- [ ] Login works with demo account
- [ ] Session persists after refresh

## 4) Go-live sanity checks
- [ ] README smoke tests pass on production URL
- [ ] Firewall allows only 22, 80, 443
- [ ] Daily DB backups scheduled and tested restore
- [ ] Basic logs reviewed (`journalctl` / nginx access+error)
