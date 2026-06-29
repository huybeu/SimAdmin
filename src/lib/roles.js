// RBAC: vai trò + quyền truy cập trang theo ma trận tài liệu.

export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export const ROLES = ['admin', 'tong_kho', 'dai_ly'];

export const ROLE_LABEL = {
  admin: 'Quản trị viên',
  tong_kho: 'Tổng kho',
  dai_ly: 'Đại lý',
};

// Trang đặt hàng dùng chung
const ORDER_PAGES = ['my-order-new', 'my-order', 'my-topup'];

// null = thấy tất cả (admin). Mảng = danh sách key trang được phép.
export const ROLE_PAGES = {
  admin: null,
  tong_kho: [
    ...ORDER_PAGES,
    'manage-agents',
    'daily-notice', 'important-notice',
    'my-quote',
    'my-bill',
    'refund-order', 'refund-auto',
    'inquiry-service',
  ],
  dai_ly: [...ORDER_PAGES],
};

export function isPageAllowed(role, key) {
  if (role === 'admin') return true; // admin thấy hết
  const allow = ROLE_PAGES[role];
  if (!allow) return false;          // role null/lạ → cấm
  return allow.includes(key);
}

export function defaultPageForRole(role) {
  return role === 'admin' ? 'daily-notice' : 'my-order';
}

// Vai trò mà 1 người tạo ra được (admin → tong_kho, tong_kho → dai_ly)
export function creatableRoles(role) {
  if (role === 'admin') return ['tong_kho', 'dai_ly'];
  if (role === 'tong_kho') return ['dai_ly'];
  return [];
}
