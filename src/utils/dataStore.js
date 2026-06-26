// Lớp dữ liệu: Firestore khi đã cấu hình + đăng nhập, ngược lại fallback localStorage.
// Mỗi đơn = 1 document trong collection 'orders' / 'topups', gắn field uid.
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

/** Trả mảng bản ghi. Firestore (uid) → docs; ngược lại localStorage; null nếu chưa có gì. */
export async function fetchRecords(name, uid) {
  if (firebaseEnabled && uid) {
    const q = query(collection(db, name), where('uid', '==', uid));
    const snap = await getDocs(q);
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return rows;
  }
  return lsLoad(name); // null → caller dùng mock seed
}

/** Thêm 1 bản ghi. Firestore → addDoc trả {id,...}; ngược lại trả null (caller tự lưu localStorage). */
export async function addRecord(name, uid, record) {
  if (firebaseEnabled && uid) {
    const payload = { ...record, uid, createdAt: Date.now() };
    const ref = await addDoc(collection(db, name), payload);
    return { ...payload, id: ref.id };
  }
  return null;
}
