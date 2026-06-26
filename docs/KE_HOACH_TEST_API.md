# KẾ HOẠCH TEST API — SIMADMIN ↔ WORLDMOVE

> Phạm vi: các API đã ghép vào SimAdmin (gọi trực tiếp WorldMove qua `src/utils/api.js`).
> Mục tiêu: xác nhận từng API trả đúng, UI dùng đúng `wmproductId/productId` thật, và các case lỗi được xử lý.

---

## 1. PHẠM VI API & NƠI DÙNG

| # | Hàm (`utils/api.js`) | WorldMove endpoint | UI dùng | Ưu tiên |
|---|---|---|---|---|
| 1 | `searchMyQuotations()` | `/Api/QuoteMg/myQueryAll` | MyShip, MyDeposit, MyQuote, SettingsPage | **Cao** |
| 2 | `createEsimOrder(email, prodList, systemMail)` | `/Api/SOrder/mybuyesim` | MyShip — tab eSIM | **Cao** |
| 3 | `createSimOrder(invoiceType, taxId, name, tel, add, note, prodList)` | `/Api/SOrder/mybuysim` | MyShip — tab SIM | **Cao** |
| 4 | `topupSim(prodList)` | `/Api/SOrder/mydeposit` | MyShip — tab Top-up, MyDeposit | **Cao** |
| 5 | `verifySimCard(simNum)` | `/Api/SimQuery/simExists` | MyDeposit — nút Check | Trung |
| 6 | `remoteActivation(simNum, orderId, mcc)` | `/Api/SimOperate/simRemoteActiv` | MyDeposit — Activate | Trung |
| 7 | `trafficReset(simNum, orderId)` | `/Api/SimOperate/simTrafficReset` | MyDeposit — Reset | Trung |
| 8 | `createEsimOrderAndRedeem(qrcodeType, prodList)` | `/Api/SOrder/mybuyesimRedemption` | OrderMatching | Thấp |
| 9 | `redeemRedemptionCode(rcode, qrcodeType)` | `/Api/OrderRedemption/redemption` | ReturnOrders | Thấp |
| 10 | `queryUsage / queryBasicInfo / queryEsimProgresses` | `/Api/UseageDetail/*` | InquiryService | Thấp |

> Trọng tâm phiên này: **#1–#5** (Add SIM eSIM/SIM/Top-up + catalog + verify).

---

## 2. MÔI TRƯỜNG TEST

| Thông số | Test (SDL) |
|---|---|
| baseUrl | `https://tfmshippingsys.fastmove.com.tw` |
| merchantId | `b0000a2` |
| deptId | `0000b8` |
| token | `93d9be2d42b3d0eca46417f37c7db86c` (lưu trong `.env`) |

**2 chế độ test (Cấu hình hệ thống):**
- **Simulator** (`api_simulator=true`): mọi API trả `code:0` giả lập — test UI nhanh, không tốn dữ liệu thật.
- **Live API** (mặc định): gọi WorldMove thật — test tích hợp thật.

**Sản phẩm thật trong catalog test (đã xác minh):** 48 gói.
- eSIM (`productType=0`): WM_000003, WM_000004… (31 gói)
- SIM vật lý (`productType=1`): Black/Blue/White Card… (4 gói)
- Top-up (`productType=2`): WM_000005, WM_000006, WM_000007… (13 gói)

### 2.1 Helper tính encStr (chạy bằng bash + openssl)

```bash
# encStr = SHA1(chuỗi nối).UPPERCASE
enc() { printf "%s" "$1" | openssl dgst -sha1 | awk '{print toupper($2)}'; }
MID=b0000a2; DID=0000b8; TOKEN=93d9be2d42b3d0eca46417f37c7db86c
BASE=https://tfmshippingsys.fastmove.com.tw
```

---

## 3. MA TRẬN TEST CASE

| ID | API | Loại | Input | Kỳ vọng |
|---|---|---|---|---|
| TC-CAT-01 | catalog | + | creds đúng | `code:0`, `prodList.length>0` |
| TC-CAT-02 | catalog | − | token sai | `code≠0` (lỗi auth) |
| TC-ESIM-01 | mybuyesim | + | 1 gói eSIM thật, qty=1, email hợp lệ | `code:0`, có `orderId` |
| TC-ESIM-02 | mybuyesim | − | wmproductId giả | `code:402 商品清單取得失敗` |
| TC-ESIM-03 | mybuyesim | − | qty>20 (chặn ở UI) | UI báo lỗi, không gọi API |
| TC-ESIM-04 | mybuyesim | − | thiếu email | UI báo "nhập email" |
| TC-SIM-01 | mybuysim | + | 1 thẻ SIM thật (type 1), đủ field nhận | `code:0`, có `orderId` |
| TC-SIM-02 | mybuysim | − | thiếu name/tel/add | UI báo lỗi |
| TC-TOPUP-01 | mydeposit | + | WM_000005, day=1, SN hợp lệ | `code:0`, có `orderId` ✅ (đã xác minh) |
| TC-TOPUP-02 | mydeposit | − | wmproductId giả | `code:402` |
| TC-TOPUP-03 | mydeposit | − | day>30 | UI chặn (1–30) |
| TC-TOPUP-04 | mydeposit | − | SN rỗng | UI báo "nhập SN" |
| TC-VERIFY-01 | simExists | + | SN tồn tại | `code:0` |
| TC-VERIFY-02 | simExists | − | SN sai (`81234567891234567891`) | `code:411` |
| TC-COMPANY-01 | UI | − | không chọn Company | UI báo "Vui lòng chọn Công ty" |

---

## 4. CHI TIẾT TEST (curl trực tiếp Live)

### TC-CAT-01 — Catalog
```bash
ENC=$(enc "${MID}${TOKEN}")
curl -sk -X POST "$BASE/Api/QuoteMg/myQueryAll" -H "Content-Type: application/json" \
  -d "{\"merchantId\":\"$MID\",\"encStr\":\"$ENC\"}" | head -c 300
# Kỳ vọng: {"code":0,...,"prodList":[...]}
```

### TC-ESIM-01 — Đặt eSIM (qty=1, gói thật)
```bash
WM=WM_000003; QTY=1; EMAIL=test@simdulich.vn
ENC=$(enc "${MID}${DID}${EMAIL}${WM}${QTY}${TOKEN}")
curl -sk -X POST "$BASE/Api/SOrder/mybuyesim" -H "Content-Type: application/json" \
  -d "{\"merchantId\":\"$MID\",\"deptId\":\"$DID\",\"email\":\"$EMAIL\",\"systemMail\":true,\"prodList\":[{\"wmproductId\":\"$WM\",\"qty\":$QTY}],\"encStr\":\"$ENC\"}"
# Kỳ vọng: {"code":0,"orderId":"b..."}
```
> ⚠️ Đặt đơn thật trên test env. Dùng qty=1.

### TC-TOPUP-01 — Top-up (đã xác minh chạy)
```bash
WM=WM_000005; DAY=1; SN=8985955770000038884
ENC=$(enc "${MID}${DID}${WM}${DAY}${SN}${TOKEN}")
curl -sk -X POST "$BASE/Api/SOrder/mydeposit" -H "Content-Type: application/json" \
  -d "{\"merchantId\":\"$MID\",\"deptId\":\"$DID\",\"prodList\":[{\"wmproductId\":\"$WM\",\"day\":$DAY,\"simNum\":\"$SN\"}],\"encStr\":\"$ENC\"}"
# Kỳ vọng: {"code":0,"orderId":"b..."}
```

### TC-VERIFY-02 — SN sai
```bash
SN=81234567891234567891
ENC=$(enc "${MID}${SN}${TOKEN}")
curl -sk -X POST "$BASE/Api/SimQuery/simExists" -H "Content-Type: application/json" \
  -d "{\"merchantId\":\"$MID\",\"simNum\":\"$SN\",\"encStr\":\"$ENC\"}"
# Kỳ vọng: {"code":411,"msg":"SIM card number does not exist."}
```

> Quy tắc encStr theo từng API (đã đối chiếu `utils/api.js`):
> - catalog: `MID+TOKEN`
> - mybuyesim: `MID+DID+email+(wmproductId+qty)…+TOKEN`
> - mybuysim: `MID+DID+invoiceType+taxId+name+tel+add+note+(productId+productName+qty)…+TOKEN`
> - mydeposit: `MID+DID+(wmproductId+day+simNum)…+TOKEN`
> - simExists: `MID+simNum+TOKEN`

---

## 5. TEST LUỒNG UI (E2E)

> Mở app, **Cấu hình → Kiểm tra kết nối** phải báo "nhận được N gói" trước khi test Live.

### 5.1 Add SIM — tab eSIM
1. Menu **Hệ thống Giao hàng → Nhập eSIM** (modal tự mở, tab eSIM).
2. Panel trái hiển thị **gói thật** (không phải mock "Mainland China NT18").
3. Thêm 1 gói → cột **Amount** = Price × Quantity; dòng **Total amount** đúng.
4. Bỏ trống Company → bấm Add → báo "Vui lòng chọn Công ty" (TC-COMPANY-01).
5. Chọn Company + nhập Email → Add → alert `orderId`; đơn lên đầu bảng MY ORDER, type `eSIM`.
6. Bấm mã đơn → modal chi tiết: tab Order Info có Order List (Quantity/Amount), tab Order History.

### 5.2 Add SIM — tab SIM
1. Tab SIM → panel trái là **thẻ trắng** (Black/Blue/White Card).
2. Thêm gói, nhập đủ name/tel/address → Add → `orderId`, type `SIM`.
3. Thiếu field nhận → báo lỗi (TC-SIM-02).

### 5.3 Add SIM — tab SIM Top-up & trang MY TOP-UP
1. Tab Top-up: panel trái là **gói type-2 thật**. Mỗi dòng có Days(1–30) + SN + Amount.
2. SN rỗng → Add báo lỗi; chọn Company + nhập SN → Add → `orderId`.
3. Trang **MY TOP-UP**: nút **Check** SN → hiển thị hợp lệ/không (TC-VERIFY). Bấm mã đơn → modal chi tiết (Days/SN/Top-Up Status + Total).

### 5.4 Kiểm tra lưu trữ
- Đặt đơn xong → **reload (Ctrl+Shift+R)** → đơn vẫn còn (localStorage `simadmin_my_orders` / `simadmin_my_topups`).

---

## 6. CASE LỖI & BIÊN

| Case | Cách tạo | Kỳ vọng |
|---|---|---|
| Mã gói không tồn tại | (regression cũ) dùng mã mock | `402 商品清單取得失敗` — KHÔNG còn xảy ra sau khi nạp catalog thật |
| Mất mạng / WorldMove timeout | tắt mạng | `code:999` + UI "API connection error!" |
| qty eSIM > 20 | nhập qty=25 | (cần thêm) hiện UI chưa chặn — **đề xuất thêm validate qty≤20** |
| day top-up > 30 | UI giới hạn select 1–30 | không vượt được |
| Simulator on | Cấu hình → Simulator | mọi API trả `code:0`, có callback giả lập |

---

## 7. CHECKLIST REGRESSION (sau mỗi thay đổi `utils/api.js`)

```
□ Catalog nạp được (3 trang: MyShip, MyDeposit, MyQuote)
□ Plan list hiển thị gói thật theo đúng productType (0/1/2)
□ Đặt eSIM qty=1 thành công
□ Đặt SIM (thẻ trắng) thành công
□ Top-up SN thật thành công
□ Verify SN: hợp lệ + không hợp lệ
□ Company bắt buộc chặn đúng
□ Modal chi tiết hiển thị đúng cột theo loại đơn
□ Reload không mất đơn
□ Lint sạch (oxlint) + HMR không lỗi
```

---

## 8. TIÊU CHÍ PASS

- 100% test **Cao** (TC-CAT, TC-ESIM-01, TC-SIM-01, TC-TOPUP-01) pass trên **Live**.
- Tất cả case lỗi trả message tiếng Việt rõ ràng, không màn hình trắng / 500.
- Không còn `商品清單取得失敗` khi dùng gói thật.

---

## 9. GHI CHÚ CHUYỂN TIẾP (khi ghép backend — xem KE_HOACH_NANG_CAP.md)

Sau khi backend mới hoàn tất (Phase 0), các test curl ở mục 4 sẽ đổi target từ `tfmshippingsys.fastmove.com.tw` (trực tiếp) sang `/api/*` của backend, và **encStr + token chuyển về backend** (không test từ client nữa). Bộ test UI (mục 5) giữ nguyên giá trị.
