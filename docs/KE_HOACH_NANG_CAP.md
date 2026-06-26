# KẾ HOẠCH NÂNG CẤP SIMADMIN → HỆ THỐNG SIMDULICH ĐẦY ĐỦ

> Mục tiêu: Giữ **toàn bộ frontend SimAdmin** hiện tại, **ghép backend mới** (theo kiến trúc trong `SIMDULICH_TECHNICAL_DOC.md`), rồi triển khai đầy đủ **Phase 1 + 2 + 3 + roadmap dài hạn**.
>
> Cơ sở tham chiếu: repo `Simdulich_distri` (`sim-27-5-test5`) đã có sẵn backend Express + auth + RBAC + signatures + orders + webhooks + SSE → **tái sử dụng/chuyển thể** thay vì viết từ đầu.

---

## A. PHÂN TÍCH HIỆN TRẠNG vs MỤC TIÊU (GAP)

| Hạng mục | SimAdmin hiện tại | Doc mục tiêu | Gap |
|---|---|---|---|
| Kiến trúc | Frontend thuần (Vite + React JSX) | Frontend + Backend Express phân tầng | **Thiếu toàn bộ backend** |
| Gọi WorldMove | **Trực tiếp từ browser** (utils/api.js, SHA1 client-side) | Qua backend proxy (token không lộ ra browser) | **Phải đảo chiều** |
| Token WorldMove | `.env` của Vite → vẫn nhúng vào bundle frontend | Lưu server, mã hoá at-rest | **Rủi ro lộ token** |
| Đăng nhập | Không có | bcrypt login + session token | **Thiếu auth** |
| Phân quyền (RBAC) | Không có | admin / tong_kho / dai_ly + cây phân cấp | **Thiếu RBAC** |
| Giá | Cố định theo môi trường | 4 tầng resolve (rate + markup) | **Thiếu pricing engine** |
| Lưu đơn | localStorage trình duyệt | Server JSON/SQL + visibility tree | **Thiếu persistence server** |
| Đối soát công nợ | Không có | Batch + paymentStatus | **Thiếu** |
| Webhook WorldMove | Không có (chỉ giả lập client) | 4 webhook inbound + verify encStr | **Thiếu** |
| Realtime | Không có | SSE (pricing-updated…) | **Thiếu** |
| Bảo mật/hardening | Gần như chưa có | Phase 1/2/3 (R1–R20) | **Thiếu toàn bộ** |
| Test | Không | unit/integration/e2e ≥80% | **Thiếu** |

**Kết luận:** ~80% công việc backend đã có nguyên mẫu trong `Simdulich_distri`. Trọng tâm thực tế là: (1) chuyển thể backend đó, (2) đấu nối lại frontend SimAdmin để gọi backend thay vì gọi thẳng WorldMove, (3) thêm auth/RBAC vào UI SimAdmin, rồi (4) chạy lộ trình hardening + roadmap.

---

## B. QUYẾT ĐỊNH KIẾN TRÚC THEN CHỐT (cần chốt trước khi code)

1. **Tái sử dụng backend reference** thay vì viết mới — copy `Simdulich_distri/backend` làm điểm khởi đầu, chỉnh theo nhu cầu SimAdmin. (Giảm ~70% effort Phase 0.)
2. **Đảo chiều tích hợp WorldMove**: frontend KHÔNG gọi WorldMove trực tiếp nữa. `utils/api.js` được viết lại thành `apiGet/apiPost` trỏ tới backend (`/api/*`). SHA1 + token chuyển hết về backend. → Đây là thay đổi lớn nhất, đụng mọi trang dùng `utils/api.js` (MyShip, MyDeposit, MyQuote, SettingsPage, InquiryService, ApiConsole...).
3. **Monorepo**: tách thành `frontend/` (SimAdmin hiện tại) + `backend/` + root `package.json` chạy đồng thời (concurrently), giống reference.
4. **Ngôn ngữ**: giữ frontend **JSX** như hiện tại (không bắt buộc migrate sang TS ngay — đưa vào Phase 3). Backend dùng **TypeScript** (theo reference).
5. **Persistence**: bắt đầu bằng **JSON store** (như reference), migrate **SQLite** ở Phase Roadmap khi đạt ngưỡng đơn.
6. **Lưu đơn**: bỏ localStorage ở MyShip/MyDeposit, chuyển sang `POST/GET /api/orders` của backend (giữ localStorage làm cache offline tuỳ chọn).

> ⚠️ Điểm cần bàn: cấu trúc UI SimAdmin (sidebar nhiều trang: DailyNotice, MyBill, ReturnOrders, OrderMatching…) **phong phú hơn** tab-matrix của reference. Cần map từng trang SimAdmin vào quyền theo role (admin/tong_kho/dai_ly) — xem bước 0.6.

---

## C. KẾ HOẠCH TỪNG BƯỚC

### PHASE 0 — NỀN TẢNG: dựng backend & ghép frontend (tiên quyết)

> Đây là phần "ghép backend mới" — chưa có trong Phase doc nhưng bắt buộc vì SimAdmin chưa có backend.

- **0.1 Tạo monorepo.** Đưa SimAdmin hiện tại vào `frontend/`. Tạo `backend/` từ bản chuyển thể `Simdulich_distri/backend`. Root `package.json` + `concurrently` chạy cả hai. Cập nhật `.gitignore` (data/, .env, node_modules).
- **0.2 Backend baseline.** Copy backend reference: `auth/`, `routes/`, `services/`, `store/`, `worldmove/`, `validators.ts`, `credentials.ts`, `index.ts`. Chạy `npm run typecheck` xanh. `.env` backend: `WORLDMOVE_MERCHANT_ID/DEPT_ID/TOKEN`, `PORT=4000`.
- **0.3 Đối chiếu WorldMove API.** So khớp 15 hàm `signatures.ts` + 13 endpoint proxy của reference với những hàm SimAdmin đang dùng (`createEsimOrder` 2.1, `createSimOrder` 4, `topupSim` 5.1, `searchMyQuotations`, `verifySimCard`, `queryUsage`...). Bổ sung endpoint còn thiếu vào `routes/api.ts`.
- **0.4 Viết lại `frontend/src/utils/api.js`.** Thay mọi hàm gọi thẳng WorldMove bằng `apiPost('/esim/order', …)`, `apiPost('/deposit', …)`, `apiGet('/catalog')`… trỏ về backend. Bỏ SHA1 + token + ENV_PRESETS khỏi frontend. Giữ nguyên **chữ ký hàm export** (createEsimOrder, topupSim…) để các trang không phải sửa nhiều.
- **0.5 Vite proxy.** `vite.config.js`: proxy `/api` và `/webhooks` → `http://localhost:4000` (thay cho `/api-test`, `/api-prod` hiện tại). Bỏ `insecureAgent` (TLS verify để backend lo).
- **0.6 Auth + RBAC trên frontend.** Thêm `LoginPage` + `AppRoot` (gate token, gọi `/api/auth/me`). Map sidebar SimAdmin theo role:
  - `admin`: tất cả trang.
  - `tong_kho`: MyShip(Add), MyDeposit, MyQuote, tab Quản lý đại lý (mới), Tổng hợp.
  - `dai_ly`: MyShip(Add), MyDeposit, Tổng hợp (chỉ đơn của mình).
  - Ẩn SettingsPage (Worldmove creds) khỏi non-admin.
- **0.7 Pricing engine.** Đưa `resolveRate/resolveMarkupVnd/applyDisplayMarkup` vào backend; `/api/catalog` trả giá đã markup theo user. Frontend hiển thị giá VND theo role (bỏ logic giá cố định hiện tại).
- **0.8 Lưu đơn server.** MyShip & MyDeposit: sau khi đặt thành công gọi `POST /api/orders`; danh sách đọc từ `GET /api/orders` (visibility tree). Bỏ/ý nghĩa lại localStorage (chỉ cache). Modal chi tiết đơn (đã làm) đọc từ dữ liệu server.
- **0.9 Quản lý đại lý + đối soát.** Thêm trang `Quản lý đại lý` (tong_kho tạo dai_ly) và tab `Tổng hợp` (orders + batch + paymentStatus) từ reference (`AdminPanel`, `OrdersReport`, `manage.ts`, `orders.ts`).
- **0.10 Webhook + SSE.** Bật `routes/webhooks.ts` (4 callback, verify encStr, ack "1"). Bật `/api/events` SSE; frontend nghe `pricing-updated` refetch giá.
- **0.11 Nghiệm thu Phase 0.** Login 3 role; đặt 1 eSIM + 1 top-up thật (sandbox) → đơn lên server, hiện ở Tổng hợp; webhook log nhận event; giá đổi realtime.

### PHASE 1 — HARDENING CẤP BÁCH (trước go-live) — R1,R2,R3,R4,R5,R6,R7,R8,R16,R17

- **1.1 (R1)** Bỏ `NODE_TLS_REJECT_UNAUTHORIZED=0`; nếu cert WorldMove lỗi → yêu cầu họ cấp cert chuẩn.
- **1.2 (R2)** `store/secrets.ts` AES-256-GCM; mã hoá token WorldMove khi ghi `system.json`, giải mã khi load. `SECRETS_KEY` trong `.env` (chmod 600).
- **1.3 (R3)** Bỏ password mặc định; seed random + in 1 lần ra console; `mustChangePassword=true`; chặn thao tác tới khi đổi mật khẩu.
- **1.4 (R4)** `proper-lockfile` + atomic write (ghi `.tmp` rồi rename) cho mọi `writeJson`.
- **1.5 (R5)** `express-rate-limit` cho `/api/auth/login` (5 lần/15 phút/IP+username) + account lockout sau 10 lần sai.
- **1.6 (R6)** CORS whitelist từ `CORS_ORIGINS` (bỏ `*`).
- **1.7 (R7+R8)** Chuyển token sang **cookie httpOnly + secure + sameSite=strict**; middleware đọc cookie (fallback Bearer); frontend `fetch(credentials:'include')`; SSE `withCredentials`. Bỏ token khỏi localStorage & query string.
- **1.8 (R16)** Script backup mã hoá hằng đêm (cron 2h) + retention 30 ngày.
- **1.9 (R17)** Webhook verify dùng `getSystemConfigSync()` (không dùng `config.ts` env cũ).
- **1.10** Audit login (chuẩn bị cho R11) + force-change-password UI.

### PHASE 2 — CHUẨN ENTERPRISE (tháng 1–3) — R9,R10,R11,R12,R13,R15,R18,R19

- **2.1 (R9)** Webhook idempotency (`webhookIdempotency.ts`, track orderId 24h).
- **2.2 (R10)** Persist webhook events ra file rotate ngày + retention 30 ngày (UI vẫn đọc 200 record RAM).
- **2.3 (R11)** `auditLog.ts` append-only cho: login, user CRUD, system.config (đổi token), pricing.update, order.payment, batch.create/close.
- **2.4 (R12)** 2FA TOTP (`speakeasy`+`qrcode`); bắt buộc role `admin`, tuỳ chọn `tong_kho`; thêm `totpSecret/totpEnabled/backupCodes` vào UserRecord; tab "Bảo mật".
- **2.5 (R18)** Validate parentId khi tạo/đổi user (chống cycle, cross-tree).
- **2.6 (R19)** Sanitize `displayName`, `paymentNote`… (chống XSS tab Tổng hợp).
- **2.7 (R15)** Test suite: `signatures.test.ts` **100%** (golden vector PDF), `userStore` (resolveRate/markup), `orderStore` (visibility tree), integration auth/manage/orders, e2e happy-path; coverage service ≥80%.
- **2.8 (R13)** Monitoring: `prom-client` + Prometheus/Grafana + Loki + Alertmanager→Slack/Telegram; alert backend down, WorldMove error >5%, webhook sig invalid, disk >80%.
- **2.9** Thay manual validate bằng **zod schemas** (`schemas/esim|sim|deposit.ts`).

### PHASE 3 — NÂNG CAO (tháng 3–6) — R14, R20

- **3.1 (R14)** Refactor: tách trang lớn (MyShip Add modal) thành component nhỏ (<300 dòng/file) + hooks (`useEsimOrder`, `useQuotes`). (Tương đương tách `App.tsx` của reference.)
- **3.2 (R20)** Schema versioning: thêm `_version` cho mọi JSON + `store/migrations.ts` chạy lúc khởi tạo store.
- **3.3** (Tuỳ chọn) Migrate frontend SimAdmin JSX → TSX dần (an toàn kiểu).

### ROADMAP DÀI HẠN (Q3–Q4 và Year 2)

- **R-1 Repository abstraction + SQLite** (Q2–Q3): `UserRepository/OrderRepository` interface; `Json*` (hiện tại) ↔ `Sqlite*` (`better-sqlite3`); schema SQL theo doc Phần 7.1.4. Trigger migrate: >500 đơn/ngày → SQLite; >5000 hoặc >50 đại lý → PostgreSQL.
- **R-2 Multi-provider** (Q3): `providers/types.ts` (interface SimProvider) + `registry.ts`; đổi `worldmove/` → `providers/worldmove/`; UI thêm dropdown Provider; `OrderRecord.provider`, `PricingConfig` per-provider.
- **R-3 Modular tab system** (Q3): `tabs/registry.ts` + `React.lazy` để mỗi role chỉ tải code cần (đại lý không tải AdminPanel).
- **R-4 Multi-tenant / white-label** (Q4): bảng `tenants`, thêm `tenant_id` mọi bảng, middleware `attachTenant` theo host. Chuẩn bị: đặt sẵn `tenantId='default'` trong mọi model.
- **R-5 Message queue / event sourcing** (Q4): tách `webhookProcessor.ts`; khi >5000 đơn/ngày chuyển sang BullMQ+Redis.
- **R-6 SSE per-user + events mới** (Q4): `order-created`, `order-paid`, `webhook-received`, `user-locked` (force logout).
- **R-7 PWA → React Native** (Year 2): manifest + service worker + Web Push; sau đó monorepo `packages/core|web|mobile|backend`.
- **R-8 i18n** (Year 2): `react-i18next`, tách `locales/vi|en|zh-TW.json`.

---

## D. THỨ TỰ ƯU TIÊN, PHỤ THUỘC & TIMELINE

| Giai đoạn | Nội dung | Phụ thuộc | Ước lượng |
|---|---|---|---|
| **Phase 0** | Dựng backend + ghép frontend + auth/RBAC + lưu đơn server | — | 2–4 tuần |
| **Phase 1** | Hardening cấp bách (R1–R8,R16,R17) | Phase 0 | 1–2 tuần |
| **Go-live** | Deploy Nginx + PM2 + HTTPS + webhook public (Phần 5 doc) | Phase 1 | vài ngày |
| **Phase 2** | Audit/2FA/test/monitoring/idempotency | Go-live | 1–3 tháng |
| **Phase 3** | Refactor + schema migration | Phase 2 | 1–2 tháng |
| **Roadmap** | SQLite→PG, multi-provider, multi-tenant, queue, PWA, i18n | Phase 3 | Q3–Year 2 |

**Đường găng (critical path):** 0.2 backend baseline → 0.4 viết lại api.js → 0.6 auth/RBAC → 0.8 lưu đơn server → 1.7 cookie httpOnly → go-live.

---

## E. RỦI RO KHI GHÉP & GIẢM THIỂU

| Rủi ro khi ghép | Giảm thiểu |
|---|---|
| Đảo chiều WorldMove làm vỡ các trang đang chạy | Giữ nguyên chữ ký hàm trong `utils/api.js`; bật cờ "simulator" để test UI không cần backend |
| Mất dữ liệu đơn trong localStorage hiện có | Viết script import localStorage → `POST /api/orders` một lần khi go-live |
| Khác biệt JSX (SimAdmin) vs TSX (reference) ở frontend | Backend TS độc lập; frontend giữ JSX, chỉ đổi lớp gọi API |
| Tab-matrix SimAdmin phong phú hơn reference | Lập bảng map trang→role rõ ràng ở bước 0.6 trước khi code |
| Token đang nằm trong `.env` Vite (vẫn vào bundle) | Phase 0 chuyển token về backend là **bắt buộc**, không để ở frontend |

---

## F. BƯỚC KẾ TIẾP ĐỀ XUẤT

1. Chốt mục B (đặc biệt: tái dùng backend reference? cấu trúc monorepo? map trang→role).
2. Bắt đầu **Phase 0.1–0.2** (dựng monorepo + backend baseline) — tôi có thể làm ngay khi bạn duyệt.
3. Sau mỗi bước có nghiệm thu (mục 0.11, 1.x...) trước khi sang bước sau.

> Ghi chú: file này là kế hoạch sống — cập nhật khi phạm vi thay đổi.
