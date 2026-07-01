/**
 * Quản lý công nợ — tất cả thao tác tăng/giảm nợ dùng Firestore runTransaction
 * để đảm bảo ACID (cập nhật totalDebt + ghi debt_transactions cùng 1 lần).
 * Firestore tự xử lý Optimistic Locking: nếu 2 request cùng lúc, 1 sẽ retry.
 */
import { db, firebaseEnabled } from '../firebase';
import {
  collection, doc, runTransaction, getDocs,
  query, where, updateDoc, getDoc,
} from 'firebase/firestore';

// ── Ghi nợ khi đặt đơn (increase) ──────────────────────────────────────────
export async function recordDebt(uid, { orderId = null, amount, parentId = null, note = '' }) {
  if (!firebaseEnabled) return null;
  return runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', uid);
    const snap    = await tx.get(userRef);
    if (!snap.exists()) throw new Error('Không tìm thấy tài khoản.');

    const data        = snap.data();
    const current     = data.totalDebt    || 0;
    const limit       = data.creditLimit  || 0;

    if (limit > 0 && current + amount > limit)
      throw new Error(`Vượt hạn mức nợ. Còn được nợ: ${(limit - current).toLocaleString('vi-VN')} ₫`);

    const balanceAfter = current + amount;
    tx.update(userRef, { totalDebt: balanceAfter });

    const txRef = doc(collection(db, 'debt_transactions'));
    tx.set(txRef, {
      uid, parentId, orderId,
      type: 'increase', amount, balanceAfter, note,
      createdAt: Date.now(),
    });
    return { balanceAfter, txId: txRef.id };
  });
}

// ── Ghi thanh toán / giảm nợ ────────────────────────────────────────────────
export async function recordPayment(uid, { orderId = null, amount, parentId = null, note = '' }) {
  if (!firebaseEnabled) return null;
  return runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', uid);
    const snap    = await tx.get(userRef);
    if (!snap.exists()) throw new Error('Không tìm thấy tài khoản.');

    const current      = snap.data().totalDebt || 0;
    const balanceAfter = Math.max(0, current - amount);
    tx.update(userRef, { totalDebt: balanceAfter });

    const txRef = doc(collection(db, 'debt_transactions'));
    tx.set(txRef, {
      uid, parentId, orderId,
      type: 'decrease', amount, balanceAfter, note,
      createdAt: Date.now(),
    });

    // Nếu chỉ định đơn hàng → cập nhật paid_amount + payment_status (FIFO 1 đơn)
    if (orderId) {
      const orderRef  = doc(db, 'orders', orderId);
      const orderSnap = await tx.get(orderRef);
      if (orderSnap.exists()) {
        const o          = orderSnap.data();
        const totalAmt   = (o.items || []).reduce((s, i) => s + (i.amount ?? (i.price || 0) * (i.qty || 1)), 0);
        const paid       = (o.paidAmount || 0) + amount;
        const status     = paid >= totalAmt ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
        tx.update(orderRef, { paidAmount: paid, paymentStatus: status });
      }
    }
    return { balanceAfter, txId: txRef.id };
  });
}

// ── Cập nhật hạn mức tín dụng ───────────────────────────────────────────────
export async function setCreditLimit(uid, limitAmount) {
  if (!firebaseEnabled) return;
  await updateDoc(doc(db, 'users', uid), { creditLimit: Number(limitAmount) || 0 });
}

// ── Lấy danh sách users với thông tin công nợ (theo hierarchy) ─────────────
// Admin: chỉ thấy con trực tiếp (parentId==uid). Tổng kho được gộp debt của tất cả đại lý cấp dưới.
// Tong_kho: chỉ thấy đại lý do mình tạo.
export async function fetchDebtUsers(uid, role) {
  if (!firebaseEnabled) return [];
  const col = collection(db, 'users');

  if (role === 'admin') {
    // Chỉ lấy con trực tiếp của admin
    const snap = await getDocs(query(col, where('parentId', '==', uid)));
    const children = snap.docs.map(d => d.data());

    // Với mỗi tong_kho, tính aggregatedDebt = totalDebt riêng + tổng totalDebt của đại lý cấp dưới
    return Promise.all(children.map(async (u) => {
      if (u.role !== 'tong_kho') return u;
      try {
        const subSnap = await getDocs(query(col, where('parentId', '==', u.uid)));
        const subDebt  = subSnap.docs.reduce((s, d) => s + (d.data().totalDebt || 0), 0);
        const subCount = subSnap.size;
        return { ...u, aggregatedDebt: (u.totalDebt || 0) + subDebt, subCount };
      } catch { return u; }
    }));
  }

  if (role === 'tong_kho') {
    const snap = await getDocs(query(col, where('parentId', '==', uid)));
    return snap.docs.map(d => d.data());
  }
  return [];
}

// ── Lấy lịch sử giao dịch công nợ ──────────────────────────────────────────
// Admin: lấy toàn bộ giao dịch trong cây (trực tiếp + cháu qua tong_kho).
// Tong_kho: giao dịch của mình + đại lý cấp dưới.
export async function fetchDebtTransactions(uid, role) {
  if (!firebaseEnabled) return [];
  const col = collection(db, 'debt_transactions');

  if (role === 'admin') {
    // Tìm tong_kho con trực tiếp để lấy thêm giao dịch của cháu (dai_ly dưới tong_kho)
    let tongKhoUids = [];
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('parentId', '==', uid)));
      tongKhoUids = usersSnap.docs.map(d => d.data()).filter(u => u.role === 'tong_kho').map(u => u.uid);
    } catch { /* tiếp tục với mảng rỗng */ }

    // parentId == admin.uid: giao dịch của tất cả con trực tiếp
    // parentId == mỗi tong_kho.uid: giao dịch của đại lý cháu
    const parentIds = [uid, ...tongKhoUids];
    const snaps = await Promise.all(parentIds.map(pid =>
      getDocs(query(col, where('parentId', '==', pid)))
    ));
    const map = new Map();
    snaps.forEach(s => s.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() })));
    return [...map.values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  if (role === 'tong_kho') {
    const [own, children] = await Promise.all([
      getDocs(query(col, where('uid', '==', uid))),
      getDocs(query(col, where('parentId', '==', uid))).catch(() => ({ docs: [] })),
    ]);
    const map = new Map();
    [...own.docs, ...children.docs].forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
    return [...map.values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  // dai_ly — chỉ xem của mình
  const snap = await getDocs(query(col, where('uid', '==', uid)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// ── Lấy profile 1 user (dùng để hiện tên trong DebtManagement) ─────────────
export async function fetchUserProfile(uid) {
  if (!firebaseEnabled) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}
