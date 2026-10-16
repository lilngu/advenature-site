# ADR-002: Chuyen sang pipeline wrangler (Worker + D1 + KV)

> **Status**: Accepted
> **Date**: 2026-10-16
> **Deciders**: user + technical-director
> **Supersedes**: deploy tay qua Dashboard (copy-paste worker.js)

## Context

Hien tai deploy hoan toan thu cong:
- Worker/D1/KV: paste code qua Cloudflare Dashboard.
- Pages: commit GitHub tu deploy.
- `.gitignore` chan ca `.worker/` + `*.md` nen ha tang + spec khong versioned.
- `worker.js` ~2000 dong inline utils de paste Dashboard duoc, kho maintain.
- Sap scale them Durable Objects (DO) cho realtime/order.

Da co san: `wrangler 4.151.0`, `node 24`, `.worker/utils/*`, `migrations/003_shop_products.sql`, D1 `7e0f3e06-...`, KV `985abd...`.

## Decision

Chon **Full wrangler + refactor import + chi prod + mo gitignore co chon loc**:

1. `wrangler.toml` o root quan ly Worker `advenature-api` (D1 + KV + vars, secret qua `wrangler secret put`).
2. `package.json` scripts `dev/deploy/d1:migrate/pages:deploy`.
3. `.dev.vars.example` cho local, `.dev.vars` + `.worker/.env` van gitignore.
4. `.gitignore` bo blanket `.worker/`, un-ignore `worker.js/schema/migrations/utils`, mo `docs/**/*.md + design/**/*.md`.
5. Refactor `worker.js` ve `import` tu `utils/` theo 2 phase (phase 1 giu single-file chay duoc ngay, phase 2 tach import + align CORS/auth).
6. Giuth Pages auto-deploy GitHub nhu cu, wrangler chi them lenh `pages:deploy` khi can tay.
7. De san placeholder DO trong `wrangler.toml`.

## Consequences

**Positive:**
- 1 lenh deploy, rollback bang git, `d1 migrations` versioned.
- `wrangler dev + --local` test duoc truoc khi cham prod.
- Them DO sau chi them class + binding, khong sua pipeline.
- Spec/ADR duoc commit (mo `*.md` co chon loc).

**Negative / trade-off:**
- Ton 1 buoi setup + phai `secret put` lai tren may moi.
- Refactor import co rui ro lech CORS/auth cu (mitigate: `deploy --dry-run` + giu `worker-backup.js`).

## Performance Implications

- Khong doi runtime (cung code, cung D1/KV).
- Shop DB dong: ~9-20 rows/read/request, <1% quota 5M rows/ngay. Cache 5p + fallback `data.js`.

## Alternatives Considered

- **Minimal wrangler (chi local):** it rui ro nhat nhung khong giai quyet deploy tay + DO. Rejected.
- **Tach repo + IaC nang:** hop team >5 nguoi, overkill indie. Rejected.

## Validation

- `npm run deploy:dry` pass.
- `wrangler d1 migrations apply --local` pass, `--remote` len 003 OK.
- `wrangler dev` mo Shop khong trang, `POST /api/shop-order` luu D1 + ping Telegram.
- Them DO sau khong sua pipeline.

## Follow-up

- Phase 2: align `utils/cors.js` origins ve `rungtinhlinh.com + pages.dev + localhost` nhu `worker.js` hien tai, align `utils/auth.js` ve logic VIEW/WRITE + lockout, roi thay inline block bang import.
- Them `ADMIN_VIEW_KEY`, `MANAGER_IDS` vao secret prod.
