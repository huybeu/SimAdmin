import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// Map mã lỗi Firebase Auth → tiếng Việt
function authErrorMsg(code) {
  const m = {
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/missing-password': 'Vui lòng nhập mật khẩu.',
    'auth/invalid-credential': 'Sai email hoặc mật khẩu.',
    'auth/user-not-found': 'Sai email hoặc mật khẩu.',
    'auth/wrong-password': 'Sai email hoặc mật khẩu.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/weak-password': 'Mật khẩu phải từ 6 ký tự trở lên.',
    'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng đợi rồi thử lại.',
    'auth/operation-not-allowed': 'Email/Password chưa được bật trong Firebase Console.',
  };
  return m[code] || ('Lỗi: ' + code);
}

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), pw);
      else await signup(email.trim(), pw);
    } catch (ex) {
      setErr(authErrorMsg(ex.code || ex.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main, #0f141a)' }}>
      <form onSubmit={submit} style={{ width: '360px', maxWidth: '90vw', background: 'var(--card-bg, #1b222a)', border: '1px solid var(--border-color, #2a3441)', borderRadius: '10px', padding: '28px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--teal-primary, #209e91)' }}>WorldMove SimAdmin</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted, #8a97a8)', marginTop: '4px' }}>
            {mode === 'login' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản mới'}
          </div>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-muted, #8a97a8)', display: 'block', marginBottom: '4px' }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@simdulich.vn" required
          style={{ width: '100%', padding: '9px 11px', marginBottom: '14px', borderRadius: '6px', border: '1px solid var(--border-color, #2a3441)', background: 'var(--input-bg, #11171e)', color: 'var(--text-main, #e6edf3)', fontSize: '14px', boxSizing: 'border-box' }} />

        <label style={{ fontSize: '12px', color: 'var(--text-muted, #8a97a8)', display: 'block', marginBottom: '4px' }}>Mật khẩu</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required
          style={{ width: '100%', padding: '9px 11px', marginBottom: '18px', borderRadius: '6px', border: '1px solid var(--border-color, #2a3441)', background: 'var(--input-bg, #11171e)', color: 'var(--text-main, #e6edf3)', fontSize: '14px', boxSizing: 'border-box' }} />

        {err && <div style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.4)', color: '#e74c3c', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>{err}</div>}

        <button type="submit" disabled={busy}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: 'var(--teal-primary, #209e91)', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
          {busy ? 'Đang xử lý…' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted, #8a97a8)' }}>
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <span onClick={() => { setErr(''); setMode(mode === 'login' ? 'signup' : 'login'); }}
            style={{ color: 'var(--teal-primary, #209e91)', cursor: 'pointer', fontWeight: 'bold' }}>
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </span>
        </div>
      </form>
    </div>
  );
}
