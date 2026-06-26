import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';
import { useAuth } from '../auth/AuthContext';
import { ROLE_LABEL, creatableRoles } from '../lib/roles';

// Tạo tài khoản Auth bằng app phụ → không làm đăng xuất admin hiện tại.
async function createAuthUser(email, password) {
  const secondary = initializeApp(firebaseConfig, 'secondary-' + Date.now());
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(secondary), email, password);
    return cred.user.uid;
  } finally {
    await deleteApp(secondary);
  }
}

export default function ManageAgents() {
  const { role, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roleOptions = creatableRoles(role);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: roleOptions[0] || 'dai_ly', markupVnd: 0 });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      let rows = [];
      if (role === 'admin') {
        const snap = await getDocs(collection(db, 'users'));
        rows = snap.docs.map(d => d.data());
      } else if (role === 'tong_kho') {
        const snap = await getDocs(query(collection(db, 'users'), where('parentId', '==', user.uid)));
        rows = snap.docs.map(d => d.data());
      }
      rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUsers(rows);
    } catch (e) {
      setError('Lỗi tải danh sách: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.email.trim() || form.password.length < 6) {
      setMsg('Nhập email và mật khẩu ≥ 6 ký tự.'); return;
    }
    setCreating(true);
    try {
      const uid = await createAuthUser(form.email.trim(), form.password);
      const parentId = role === 'admin' && form.role === 'tong_kho' ? user.uid : user.uid;
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: form.email.trim(),
        role: form.role,
        displayName: form.displayName.trim() || form.email.trim(),
        parentId,
        markupVnd: Number(form.markupVnd) || 0,
        active: true,
        createdAt: Date.now(),
      });
      setMsg('✓ Tạo tài khoản thành công.');
      setForm({ email: '', password: '', displayName: '', role: roleOptions[0] || 'dai_ly', markupVnd: 0 });
      await load();
    } catch (e) {
      const code = e.code || '';
      setMsg(code === 'auth/email-already-in-use' ? 'Email đã được dùng.'
        : code === 'auth/weak-password' ? 'Mật khẩu quá yếu (≥6 ký tự).'
        : 'Lỗi tạo tài khoản: ' + (e.message || code));
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (u) => {
    try { await updateDoc(doc(db, 'users', u.uid), { active: !u.active }); await load(); }
    catch (e) { alert('Lỗi: ' + (e.message || e)); }
  };

  const changeMarkup = async (u, value) => {
    try { await updateDoc(doc(db, 'users', u.uid), { markupVnd: Number(value) || 0 }); }
    catch (e) { alert('Lỗi: ' + (e.message || e)); }
  };

  const inp = { padding: '8px 10px', border: '1px solid var(--border-color)', borderRadius: '5px', background: 'var(--input-bg, #11171e)', color: 'var(--text-main)', fontSize: '13px' };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ ĐẠI LÝ</h1>
        <div className="breadcrumbs">
          <span>Home</span><span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Quản lý đại lý</span>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Vai trò của bạn: <strong style={{ color: 'var(--teal-primary)' }}>{ROLE_LABEL[role] || role || '(chưa xác định)'}</strong>
      </div>

      {roleOptions.length === 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-body" style={{ color: '#e74c3c', fontSize: '13px' }}>
            Tài khoản hiện tại không có quyền tạo cấp dưới (role chưa phải admin/tong_kho).
            Hãy đảm bảo đã <strong>Publish Firestore Rules</strong> và đăng nhập bằng email admin (trong VITE_ADMIN_EMAILS), rồi tải lại trang.
          </div>
        </div>
      )}

      {/* Tạo tài khoản */}
      <div className="card" style={{ marginBottom: '16px', display: roleOptions.length === 0 ? 'none' : 'block' }}>
        <div className="card-header card-header-teal"><span>Tạo tài khoản cấp dưới</span></div>
        <div className="card-body">
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email *</label>
              <input style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mật khẩu * (≥6)</label>
              <input style={inp} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tên hiển thị</label>
              <input style={inp} value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} placeholder="(mặc định = email)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vai trò</label>
              <select style={inp} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {roleOptions.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Markup (VND)</label>
              <input style={{ ...inp, width: '110px' }} type="number" min="0" value={form.markupVnd} onChange={e => setForm({ ...form, markupVnd: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-teal" style={{ padding: '8px 20px', fontWeight: 'bold' }} disabled={creating}>
              {creating ? 'Đang tạo…' : 'Tạo'}
            </button>
          </form>
          {msg && <div style={{ marginTop: '10px', fontSize: '13px', color: msg.startsWith('✓') ? '#4caf50' : '#e74c3c' }}>{msg}</div>}
        </div>
      </div>

      {/* Danh sách */}
      <div className="card">
        <div className="card-body">
          {loading ? <p style={{ color: 'var(--text-muted)' }}>Đang tải…</p>
            : error ? <p style={{ color: '#e74c3c' }}>{error}</p>
            : (
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px' }}>Email</th>
                  <th style={{ padding: '10px 14px' }}>Tên hiển thị</th>
                  <th style={{ padding: '10px 14px' }}>Vai trò</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Markup (VND)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="notice-cell" style={{ padding: '10px 14px' }}>{u.email}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px' }}>{u.displayName}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px' }}>{ROLE_LABEL[u.role] || u.role}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <input type="number" min="0" defaultValue={u.markupVnd || 0} onBlur={e => changeMarkup(u, e.target.value)}
                        style={{ ...inp, width: '90px', textAlign: 'center' }} />
                    </td>
                    <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button onClick={() => toggleActive(u)} className={`btn ${u.active ? 'btn-red' : 'btn-teal'}`} style={{ padding: '3px 10px', fontSize: '11px' }}>
                        {u.active ? 'Khoá' : 'Mở khoá'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Chưa có tài khoản cấp dưới.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
