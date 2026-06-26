// Lớp dữ liệu: Firestore khi đã cấu hình + đăng nhập, ngược lại fallback localStorage.
import { db, firebaseEnabled } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const LS_KEY = { orders: 'simadmin_my_orders', topups: 'simadmin_my_topups' };

function lsLoad(name) {
  try {
    const s = localStorage.getItem(LS_KEY[name]);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function lsSaveAll(name, arr) {
  try { localStorage.setItem(LS_KEY[name], JSON.stringify(arr)); } catch { /* ignore */ }
}

export function useFirestore(uid) {
  return Boolean(firebaseEnabled && uid);
}

/** Trả mảng bản ghi của chính uid (dai_ly / fallback). */
export async function fetchRecords(name, uid) {
  if (firebaseEnabled && uid) {
    const snap = await getDocs(query(collection(db, name), where('uid', '==', uid)));
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return rows;
  }
  return lsLoad(name);
}

/**
 * Trả bản ghi theo cây phân cấp vai trò:
 *  - admin   → toàn bộ collection
 *  - tong_kho → bản ghi của mình + bản ghi có parentId == uid (đại lý con)
 *  - dai_ly  → bản ghi của mình
 */
export async function fetchRecordsForRole(name, { uid, role }) {
  if (!firebaseEnabled || !uid) return lsLoad(name);

  const col = collection(db, name);

  if (role === 'admin') {
    const snap = await getDocs(col);
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return rows;
  }

  if (role === 'tong_kho') {
    const [snapOwn, snapChildren] = await Promise.all([
      getDocs(query(col, where('uid', '==', uid))),
      getDocs(query(col, where('parentId', '==', uid))),
    ]);
    const map = new Map();
    [...snapOwn.docs, ...snapChildren.docs].forEach(d =>
      map.set(d.id, { id: d.id, ...d.data() })
    );
    const rows = [...map.values()];
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return rows;
  }

  return fetchRecords(name, uid);
}

/**
 * Thêm 1 bản ghi.
 * parentId: uid của cấp cha (profile.parentId) — dùng để tong_kho/admin truy vấn đơn của cấp con.
 */
export async function addRecord(name, uid, record, parentId = null) {
  if (firebaseEnabled && uid) {
    const payload = { ...record, uid, parentId: parentId || null, createdAt: Date.now() };
    const ref = await addDoc(collection(db, name), payload);
    return { ...payload, id: ref.id };
  }
  return null;
}
