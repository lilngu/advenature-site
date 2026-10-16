# Workflow mới — Wrangler (Worker + D1 + KV + Pages)

> **Status**: Active từ 2026-10-16 (ADR-002)
> **Scope**: `advenature-api` Worker + D1 `advenature-db` + KV `QUIZ_KV` + Pages static
> **Nguyên tắc**: prod-only, 1 repo, không paste tay Dashboard nữa.

## 1. Cài đặt 1 lần

```bash
npm install
wrangler login
copy .dev.vars.example .dev.vars   # Windows: copy, sửa token dev
```

`wrangler.toml` ở root quản Worker. Pages vẫn auto-deploy từ GitHub như cũ.

## 2. Lệnh hàng ngày

```bash
# Dev local (D1/KV mock local)
npm run dev
# hoặc: npx wrangler dev --config wrangler.toml

# Check config không deploy thật
npm run deploy:dry

# Deploy prod
npm run deploy

# D1 local / remote
npm run d1:migrate:local
npm run d1:migrate:remote

# Secret prod (KHÔNG commit)
wrangler secret put TELEGRAM_BOT_TOKEN --config wrangler.toml
wrangler secret put TELEGRAM_ADMIN_CHAT_ID --config wrangler.toml
wrangler secret put ADMIN_SECRET_KEY --config wrangler.toml
# optional: ADMIN_VIEW_KEY, MANAGER_IDS (hiện MANAGER_IDS để ở [vars])

# Xem secret / migrations
wrangler secret list --config wrangler.toml
npx wrangler d1 migrations list advenature-db --remote --config wrangler.toml

# Pages tay khi cần (mặc định auto từ GitHub)
npm run pages:deploy
```

## 3. Thêm tính năng DB (migration)

1. Tạo file mới `.worker/migrations/004_ten_moi.sql` — chỉ dùng `IF NOT EXISTS / OR IGNORE`.
2. Test local trước:
```bash
npm run d1:migrate:local
```
3. Lên remote:
```bash
npm run d1:migrate:remote
```
> D1 không hỗ trợ `ADD COLUMN IF NOT EXISTS`. Nếu prod đã có cột từ đợt paste tay, phải baseline: tạo index tay + `INSERT INTO d1_migrations (name, applied_at)` rồi mới chạy tiếp (xem mục 5).

## 4. Thêm Durable Objects sau này

1. Tạo class trong `.worker/do/*.js`.
2. Mở comment DO trong `wrangler.toml`, thêm binding + `[[migrations]] new_classes`.
3. `npm run deploy` — không sửa pipeline.

## 5. Sự cố đã gặp + cách fix (đừng lặp lại)

### a) `Binding name already in use` khi `secret put`
- Nguyên nhân: Dashboard cũ còn Variable text trùng tên secret.
- Fix: Dashboard → Worker → Settings → Variables and Secrets → xóa Variable trùng → `secret put` lại.

### b) `latest version isn't currently deployed` khi `secret put`
- Nguyên nhân: Worker deploy tay Dashboard nên wrangler chưa có version.
- Fix: `npm run deploy` 1 lần để đồng bộ version, rồi `secret put`, rồi deploy lại.
- Hoặc: `wrangler versions secret put ...`

### c) Warning local khác remote khi deploy (mất vars)
- Lần đầu deploy đè đã mất `MANAGER_IDS=1994636084`. Đã khôi phục vào `[vars]`.
- Quy tắc: trước khi bấm Yes, đọc diff. Nếu remote có var mình chưa có → thêm vào `wrangler.toml` trước.

### d) `duplicate column name` khi migrate
- Nguyên nhân: prod paste tay đã có cột, migration `ALTER TABLE ADD COLUMN` không idempotent.
- Fix đã làm 2026-10-16:
```sql
CREATE INDEX IF NOT EXISTS idx_users_avatar_bonus ON users(has_received_avatar_bonus);
INSERT INTO d1_migrations (name, applied_at) VALUES ('002_add_avatar_bonus.sql', datetime('now'));
npm run d1:migrate:remote  -- chạy tiếp 003
```
- Bài học: migration mới luôn viết idempotent, test local trước.

### e) `Unexpected else` trong `worker.js`
- Do lần thêm `CONFIRM_SHOP` thiếu 1 `}`. Đã sửa + `deploy --dry-run` pass (105 KiB).
- Quy tắc: mọi sửa worker đều `npm run deploy:dry` trước khi deploy thật.

## 6. Checklist deploy prod

- [ ] `npm run deploy:dry` pass
- [ ] `migrations list` xem còn gì pending
- [ ] `npm run d1:migrate:remote` (Y)
- [ ] `npm run deploy`, ghi lại Version ID
- [ ] Smoke: mở Shop → đặt thử → Telegram có tin → bấm Done → vé về túi → manager quét burn
- [ ] Quota: Shop `SELECT *` ~9-20 rows/read, <1% limit 5M/ngày

## 7. File liên quan

- `wrangler.toml`, `package.json`, `.dev.vars.example`
- `.worker/worker.js`, `.worker/utils/*`, `.worker/schema.sql`, `.worker/migrations/*`
- `docs/adr/002-wrangler-pipeline.md`, `design/ux/shop-order-fulfillment.md`
