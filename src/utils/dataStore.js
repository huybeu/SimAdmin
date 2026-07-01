// Lớp dữ liệu: Firestore khi đã cấu hình + đăng nhập, ngược lại fallback localStorage.
import { db, firebaseEnabled } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

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
  if (!firebaseEnabled || !uid || !role) return lsLoad(name);

  const col = collection(db, name);

  if (role === 'admin') {
    try {
      const snap = await getDocs(col);
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return rows;
    } catch {
      // Rules chưa cho phép admin đọc toàn bộ — fallback về đơn của mình.
      return fetchRecords(name, uid);
    }
  }

  if (role === 'tong_kho') {
    // Query 1: đơn của mình. Query 2: đơn của đại lý con (cần Firestore Rules có parentId).
    const snapOwn = await getDocs(query(col, where('uid', '==', uid)));
    let snapChildren = { docs: [] };
    try {
      snapChildren = await getDocs(query(col, where('parentId', '==', uid)));
    } catch {
      // Rules chưa cho phép parentId query — chỉ hiện đơn của mình tạm thời.
    }
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

// ── Cấu hình chung toàn hệ thống: 1 document cố định trong collection 'config' ──
// Khác orders/topups: không phải danh sách, không gắn uid (chung mọi admin).

/** Đọc 1 config doc. Firestore → data; ngược lại localStorage; null nếu chưa có (caller dùng mặc định). */
export async function fetchConfig(name) {
  if (firebaseEnabled) {
    const snap = await getDoc(doc(db, 'config', name));
    return snap.exists() ? snap.data() : null;
  }
  try {
    const s = localStorage.getItem(`config_${name}`);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

/** Ghi đè 1 config doc. Firestore → setDoc + updatedAt; ngược lại localStorage. */
export async function saveConfig(name, data) {
  if (firebaseEnabled) {
    await setDoc(doc(db, 'config', name), { ...data, updatedAt: Date.now() });
  } else {
    try { localStorage.setItem(`config_${name}`, JSON.stringify(data)); } catch { /* ignore */ }
  }
}

export function getVndPrice(importPrice, typeStr, config) {
  const cfg = config || { conversionRate: 1000, esimMarkup: 30000, physicalMarkup: 5000 };
  const rate = Number(cfg.conversionRate) ?? 1000;
  const esimMarkup = Number(cfg.esimMarkup) ?? 30000;
  const physicalMarkup = Number(cfg.physicalMarkup) ?? 5000;

  if (!importPrice) return 0;
  const isEsim = typeStr === 0 || 
                 typeStr === 'eSIM' || 
                 (typeof typeStr === 'string' && typeStr.toLowerCase().includes('esim'));

  if (isEsim) {
    return importPrice * rate + esimMarkup;
  }
  return importPrice * rate + physicalMarkup;
}
