# UX Spec: Shop Order Fulfillment

> **Status**: In Design
> **Author**: user + ux-designer
> **Last Updated**: 2026-10-16
> **Journey Phase(s)**: unknown — no journey map
> **Template**: UX Spec

---

## Purpose & Player Need

Người chơi vào Shop muốn **đặt trước vé/dịch vụ LARP và chắc chắn nhận được vé QR khi admin xác nhận**, để tới sự kiện chỉ cần mở túi cho manager quét là vào được.

Nếu flow này khó dùng hoặc không rõ trạng thái, người chơi sẽ hoang mang (đã trả tiền chưa? vé ở đâu?), admin sẽ quá tải inbox SĐT/Zalo thủ công, manager sẽ kẹt ở cổng vì vé giả/không xác minh được.

Người chơi tới flow này với mong muốn: *"Tôi chọn gói ___ và muốn biết khi nào vé về túi."*

Admin cần 1 nút duy nhất trên Telegram để đóng đơn sau khi xác minh offline. Manager cần quét QR 1 lần là hết để chống dùng lại.

---

## Player Context on Arrival

**Khi nào gặp:** sau khi mở panel Shop từ dock, trong giai đoạn chuẩn bị đi LARP (ở nhà, calm, tự nguyện mở Shop — không bị game ép).

**Vừa làm gì trước đó:** lướt `shopItemsContainer` (9 card 2 cột), bấm 1 card → mở `shopDetailModal` đọc `desc + giá TT/VND`.

**Cảm xúc giả định:** tò mò + đắn đo giá (150k-450k), cần trấn an: chọn nhầm có bỏ được không? đặt xong có mất tiền ngay không?

**Mang theo context gì:** `selectedShopIds (Set)`, `currentUser.id`, SĐT/Zalo nhập ở `prompt`.

---

## Navigation Position

`root (game) → bottom-dock → Shop panel (overlay) → shopDetailModal → checkout-bar`. Không phải top-level luôn reachable, chỉ mở khi user chủ động vào Shop. Vé sau khi duyệt nằm ở `Inventory (túi 5x5) → itemModal (QR)`.

---

## Entry & Exit Points

| Entry Source | Trigger | Player carries this context |
|---|---|---|
| Shop card | tap `shop-2col-card` | `viewingShopItem` |
| Checkout bar | tap `btnCheckoutShop` | `selectedShopIds + phone` |
| Bot Telegram | tin nhắn đơn mới | `orderId + package_type` |
| Túi đồ | tap ô inventory | `qr_token` |
| Manager Miniapp | quét/nhập `qr_token` | `verify-qr` |

| Exit Destination | Trigger | Notes |
|---|---|---|
| Đóng modal Shop | `closeShopDetailModal` | giữ giỏ, chưa submit |
| Submit xong | `POST /api/shop-order` success | clear `Set`, toast tiếp nhận |
| Telegram Done | bấm `CONFIRM_SHOP:{id}` | grant vé, edit tin nhắn, không quay lại |
| Manager burn | `confirmBurn` | `is_used=1`, one-way |

---

## Layout Specification

### Information Hierarchy

1. Tên gói + giá `💎 TT (~VND)` — quyết định chọn/không.
2. Trạng thái chọn (`.selected` viền sáng) + giỏ `Đã chọn N mục / Tổng`.
3. Mô tả `desc` trong modal — đọc trước khi chốt.
4. Sau submit: trạng thái chờ (toast) → vé trong túi (badge `MỚI`).
5. Phía admin: `Tên + AW + SĐT + Gói + Tổng` + nút Done.

Quyết định: giữ 1 nút toggle duy nhất trong modal (`THÊM VÀO GIỎ / BỎ CHỌN`), không tách 2 nút.

### Layout Zones

Giữ nguyên 3 vùng hiện tại, không đập layout:
- `shopItemsContainer` grid 2 cột (không thêm nút Mua từng card — tránh mis-tap).
- `shopDetailModal` giữa màn: icon/title/price/desc + 1 CTA duy nhất.
- `shop-checkout-bar` đáy: summary trái + `btnCheckoutShop` phải.

### Component Inventory

- Card: `rpg-ico + title + tag TT` (tap mở modal).
- Modal CTA toggle màu tím/đỏ + label đã chốt.
- Checkout CTA `btn-magical` full-width trên mobile.
- Telegram: text HTML + 1 inline button `✅ Đã hoàn thành offline`.
- Inventory vé mới: ô 5x5 + dot `MỚI`, modal hiện QR 120px + `MÃ: QR_xxx` + note thực địa.

### ASCII Wireframe

```
[Shop Panel]
+------------------+------------------+
| [ico] PKG_1      | [ico] PKG_2 *sel*|
| 💎14             | 💎8              |
+------------------+------------------+
| Đã chọn: 2 | Tổng: 22💎(~550k)  |
| [      ĐẶT TRƯỚC VÉ        ]  |
+-------------------------------+
```

---

## States & Variants

| State / Variant | Trigger | What Changes |
|---|---|---|
| Default | mở Shop | grid 9 card, giỏ 0 |
| Loading Shop | mở panel, đang `GET shop-products` | skeleton 6-9 card xám + disable `btnCheckoutShop` |
| Selected | toggle trong modal | card `.selected`, giỏ +1 |
| Submitting | sau khi nhập SĐT, đang `POST` | `btnCheckoutShop` disabled + text `Đang gửi...`, chặn double-tap |
| Pending | `POST /api/shop-order` ok | clear giỏ, toast `ĐÃ TIẾP NHẬN — chờ duyệt` |
| Granted | admin bấm Done | vé mới trong túi + dot `MỚI` |
| Burned | manager `confirmBurn` | vé `is_used=1`, quét lại → `ĐÃ DÙNG` |
| Error/Empty | giỏ rỗng bấm checkout / fetch fail | toast warning + fallback `data.js` |
| Out of stock | `PKG_3` hết 2 suất (tương lai) | disable card + nhãn `HẾT` |

---

## Interaction Map

- Tap card → `openShopDetail` + `sfxBlanket` → modal.
- Tap CTA modal → toggle `Set` → `renderShop + updateShopCheckout` → đóng modal.
- Tap checkout → nếu rỗng toast, nếu có `prompt SĐT` → `sfxCoin + POST` → toast.
- Telegram tap Done → `answerCallbackQuery` → grant từng `item_code` → `editMessageText`.
- Tap vé trong túi → `openItemModal` hiện QR → manager quét → `verify-qr` → `burn`.
- Khi grant vé xong: `currentUser.inventory` thêm N vé + dock túi hiện dot đỏ `MỚI`, persist tới khi user mở vé lần đầu (`seenTicketIds` trong localStorage).

Mapping cho Touch (primary) + Mouse; gamepad đi qua focus order card → modal CTA → checkout. `Esc` đóng modal, `Enter/Space` kích hoạt card/CTA, focus trap trong modal.

---

## Events Fired

| Player Action | Event Fired | Payload / Data |
|---|---|---|
| Toggle giỏ | `shop_toggle` (local only) | `item_id, selected_bool` |
| Submit đơn | `POST /api/shop-order` | `userId, packageName, tt, vnd, phone` |
| Admin Done | `CONFIRM_SHOP:{orderId}` callback | `orderId, adminTelegramId` |
| Grant vé | `user_inventory INSERT` | `user_id, item_code, qr_token` (tách N vé/đơn) |
| Manager burn | `POST /api/manager/burn` | `qrToken` |

Quyết định đã chốt: 1 đơn nhiều món → **tách thành N vé riêng**, mỗi `item_code` 1 row `qr_token` riêng.

---

## Transitions & Animations

- Modal fade/scale vào, đóng fade-out.
- Toast slide-up 3.8s.
- Card `.selected` viền sáng instant (không animation dài để quét nhanh).
- QR polling 3s/lần khi `itemModal` mở; tôn trọng reduced-motion: tắt hiệu ứng nếu user bật.

---

## Data Requirements

| Data | Source System | Read / Write | Notes |
|---|---|---|---|
| SHOP_ITEMS / shop_products | D1 `shop_products` + fallback `data.js` | Read | cache 5p, 9-20 rows/read — dư quota 5M/ngày |
| shop_orders | D1 | Write | `Pending → Done`, idempotency chống double-click |
| user_inventory vé | D1 | Write | `qr_token unique, category='shop_ticket'`, tách N vé/đơn |
| CAMP 2 người | offline | — | 1 người đại diện mua 1 item, không cần logic 2 token |
| PKG_3 stock | D1 `shop_products.stock` | Read/Write | chỉ 2 phòng, cần trừ tồn + nhãn HẾT để theo dõi |
| verify/burn | D1 `user_inventory.is_used` | R/W | cần audit Telegram ID |

---

## Accessibility

- Tab tới mọi card/CTA theo thứ tự card → modal CTA → checkout, focus ring rõ.
- Không dùng màu làm tín hiệu duy nhất (chữ `ĐÃ DÙNG / HỢP LỆ` kèm icon).
- Text ≥12px, tương phản đạt.
- QR kèm mã chữ `QR_xxx` để nhập tay khi camera lỗi.
- Không flash, toast đủ thời gian đọc (3.8s).

---

## Localization Considerations

- Giá `toLocaleString('vi-VN')`, tiền tệ `đ`.
- Không hardcode tiếng Việt trong QR payload (ASCII JSON `{token,code,item}`).
- Label nút Telegram + toast cần i18n nếu mở rộng EN.

---

## Acceptance Criteria

- [ ] Mở Shop <800ms, 9 card hiện đủ giá TT/VND
- [ ] Toggle 1 nút đổi label/màu đúng, giỏ cộng đúng TT+VND
- [ ] Checkout rỗng → warning, có SĐT → toast tiếp nhận + clear giỏ
- [ ] Telegram nhận 1 tin + 1 nút Done, bấm 2 lần chỉ grant 1 lần (N vé tách riêng)
- [ ] CAMP 2 người: 1 vé đại diện vẫn verify/burn bình thường
- [ ] PKG_3 hết stock (2/2) → card disable + nhãn HẾT, không cho submit
- [ ] Vé về túi có QR quét được, manager burn xong quét lại báo ĐÃ DÙNG
- [ ] Vé mới về → dot MỚI hiện trên dock kể cả khi toast đã tắt, mở vé lần đầu thì hết dot
- [ ] Keyboard tab hết card → modal → checkout không kẹt

---

## Open Questions

- [x] 1 đơn nhiều món: đã chốt **tách N vé**.
- [x] CAMP 2 người: đã chốt **1 vé đại diện**, xác minh offline.
- [x] PKG_3: đã chốt **có stock (2 phòng)**.
- Còn lại: có cần thông báo cho user khi vé về túi (hiện chỉ toast + tự mở túi xem) hay giữ nguyên theo lựa chọn?
