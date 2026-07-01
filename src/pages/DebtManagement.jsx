import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, X, RefreshCw, Bell, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  fetchDebtUsers, fetchDebtTransactions,
  recordPayment, setCreditLimit,
} from '../utils/debtStore';
import { ROLE_LABEL } from '../lib/roles';

const fmt  = (n) => (Number(n) || 0).toLocaleString('vi-VN');
const ts   = (ms) => ms ? new Date(ms).toLocaleString('vi-VN') : '—';
const dateLabel = (ms) => {
  if (!ms) return 'Chưa thanh toán';
  const days = Math.floor((Date.now() - ms) / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  return `${days} ngày trước`;
};

export default function DebtManagement() {
  const { user, role } = useAuth();
  const uid = user?.uid;

  const [users,   setUsers]   = useState([]);
  const [txs,     setTxs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Modal thanh toán
  const [payModal,  setPayModal]  = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote,   setPayNote]   = useState('');
  const [payErr,    setPayErr]    = useState('');
  const [paying,    setPaying]    = useState(false);

  // Lịch sử của 1 user
  const [histUser, setHistUser] = useState(null);

  // Tab chính
  const [tab, setTab] = useState('overview'); // 'overview' | 'ledger'

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [u, t] = await Promise.all([
        fetchDebtUsers(uid, role),
        fetchDebtTransactions(uid, role),
      ]);
      setUsers(u);
      setTxs(t);
    } catch (e) { setError(e.message || 'Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  }, [uid, role]);

  useEffect(() => { load(); }, [load]);

  // ── Tính toán tổng hợp ───────────────────────────────────────────────────
  const now        = Date.now();
  const todayStart = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
  const monthStart = (() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.getTime(); })();

  // aggregatedDebt: dùng cho tổng kho (bao gồm debt của đại lý cấp dưới), fallback về totalDebt
  const getDebt = (u) => u.aggregatedDebt ?? u.totalDebt ?? 0;

  const totalReceivable = users.reduce((s, u) => s + getDebt(u), 0);
  const overLimit       = users.filter(u => u.creditLimit > 0 && getDebt(u) >= u.creditLimit).length;

  const todayCollected = txs
    .filter(t => t.type === 'decrease' && t.createdAt >= todayStart)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const monthCollected = txs
    .filter(t => t.type === 'decrease' && t.createdAt >= monthStart)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const todayNewDebt = txs
    .filter(t => t.type === 'increase' && t.createdAt >= todayStart)
    .reduce((s, t) => s + (t.amount || 0), 0);

  // Lần thanh toán gần nhất mỗi user
  const lastPayMap = {};
  txs.filter(t => t.type === 'decrease').forEach(t => {
    if (!lastPayMap[t.uid] || t.createdAt > lastPayMap[t.uid]) lastPayMap[t.uid] = t.createdAt;
  });

  // Danh sách phải thu hằng ngày: user có nợ, sort theo nợ (aggregated) giảm dần
  const dailyReceivable = users
    .filter(u => getDebt(u) > 0)
    .map(u => ({
      ...u,
      lastPay: lastPayMap[u.uid] || null,
      daysSincePayment: lastPayMap[u.uid] ? Math.floor((now - lastPayMap[u.uid]) / 86400000) : null,
    }))
    .sort((a, b) => getDebt(b) - getDebt(a));

  const handleSetLimit = async (u, val) => {
    try { await setCreditLimit(u.uid, val); await load(); }
    catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handlePay = async () => {
    setPayErr('');
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { setPayErr('Nhập số tiền hợp lệ.'); return; }
    setPaying(true);
    try {
      await recordPayment(payModal.uid, {
        amount: amt,
        parentId: payModal.parentId || null,
        note: payNote || `Thanh toán bởi ${role}`,
      });
      setPayModal(null); setPayAmount(''); setPayNote('');
      await load();
    } catch (e) { setPayErr(e.message); }
    finally { setPaying(false); }
  };

  const inp = { padding: '7px 10px', border: '1px solid var(--border-color)', borderRadius: '5px', background: 'var(--input-bg,#11171e)', color: 'var(--text-main)', fontSize: '13px' };
  // Khi xem sổ cái của tổng kho: bao gồm cả giao dịch của đại lý cấp dưới
  const userTxs = histUser
    ? txs.filter(t => t.uid === histUser.uid || (histUser.role === 'tong_kho' && t.parentId === histUser.uid))
    : txs;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ CÔNG NỢ</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span><span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Quản lý công nợ</span>
        </div>
      </div>

      {/* ── Thẻ tổng hợp ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Tổng phải thu', value: `${fmt(totalReceivable)} ₫`, color: '#e74c3c',        icon: <TrendingUp  size={18} /> },
          { label: 'Đã thu hôm nay', value: `${fmt(todayCollected)} ₫`, color: '#4caf50',        icon: <CheckCircle size={18} /> },
          { label: 'Đã thu tháng này', value: `${fmt(monthCollected)} ₫`, color: 'var(--teal-primary)', icon: <CheckCircle size={18} /> },
          { label: 'Phát sinh hôm nay', value: `${fmt(todayNewDebt)} ₫`, color: '#e67e22',       icon: <TrendingDown size={18} /> },
          { label: 'Khách đang nợ', value: `${dailyReceivable.length} người`, color: 'var(--teal-primary)', icon: <DollarSign size={18} /> },
          { label: 'Vượt hạn mức', value: `${overLimit} người`, color: overLimit > 0 ? '#e74c3c' : 'var(--text-muted)', icon: <Bell size={18} /> },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</span>
              <span style={{ color: c.color, opacity: 0.7 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: c.color }}>{c.value}</div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={load} title="Làm mới" style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#e74c3c', marginBottom: '12px' }}>{error}</p>}

      {/* ── Thông báo khoản phải thu hằng ngày ── */}
      {dailyReceivable.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', border: '1px solid rgba(231,76,60,0.3)' }}>
          <div className="card-header" style={{ background: 'rgba(231,76,60,0.08)', borderBottom: '1px solid rgba(231,76,60,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={15} style={{ color: '#e74c3c' }} />
            <span style={{ fontWeight: 700, color: '#e74c3c' }}>
              Thông báo phải thu hôm nay — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{dailyReceivable.length} khoản</span>
          </div>
          <div className="card-body" style={{ overflowX: 'auto', padding: '0' }}>
            <table className="notices-table" style={{ minWidth: '620px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px' }}>Khách hàng</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Phải thu (VND)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Hạn mức (VND)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Lần trả cuối</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Mức độ</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {dailyReceivable.map(u => {
                  const debt  = getDebt(u);
                  const limit = u.creditLimit || 0;
                  const over  = limit > 0 && debt >= limit;
                  const days  = u.daysSincePayment;
                  // Mức độ: đỏ = vượt hạn/nợ lâu (>7 ngày), cam = 3-7, xanh = <3
                  const urgency = over || days === null || days > 7
                    ? { label: 'Khẩn cấp', bg: 'rgba(231,76,60,0.12)', color: '#e74c3c' }
                    : days > 2
                    ? { label: 'Cần theo dõi', bg: 'rgba(230,126,34,0.12)', color: '#e67e22' }
                    : { label: 'Bình thường', bg: 'rgba(76,175,80,0.12)', color: '#4caf50' };
                  return (
                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{u.displayName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#e74c3c', fontSize: '14px' }}>
                        {fmt(debt)}
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {limit > 0 ? fmt(limit) : '∞'}
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px' }}>
                        <div style={{ color: days === null ? '#e74c3c' : days > 7 ? '#e74c3c' : 'var(--text-muted)' }}>
                          {dateLabel(u.lastPay)}
                        </div>
                        {u.lastPay && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(u.lastPay).toLocaleDateString('vi-VN')}</div>}
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: urgency.bg, color: urgency.color }}>
                          {urgency.label}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button className="btn btn-teal" style={{ padding: '3px 10px', fontSize: '11px' }}
                          onClick={() => { setPayModal(u); setPayAmount(''); setPayNote(''); setPayErr(''); }}>
                          Thu nợ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tabs: Danh sách nợ / Sổ cái ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[
          { key: 'overview', label: 'Danh sách công nợ' },
          { key: 'ledger',   label: 'Sổ cái giao dịch'  },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '7px 18px', border: '1px solid var(--border-color)', borderRadius: '7px 7px 0 0',
            cursor: 'pointer', fontSize: '13px', fontWeight: tab === t.key ? 700 : 400,
            background: tab === t.key ? 'var(--teal-primary)' : 'var(--card-bg)',
            color: tab === t.key ? '#fff' : 'var(--text-muted)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Danh sách công nợ ── */}
      {tab === 'overview' && (
        <div className="card">
          <div className="card-body" style={{ overflowX: 'auto' }}>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Đang tải…</p> : (
              <table className="notices-table" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 12px' }}>Tên / Email</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Vai trò</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Hạn mức (VND)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Phải thu (VND)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Đã thu tháng</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Còn được nợ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={8} className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Chưa có dữ liệu công nợ.</td></tr>
                  )}
                  {users.map(u => {
                    const debt      = getDebt(u);
                    const limit     = u.creditLimit || 0;
                    const available = limit > 0 ? limit - debt : null;
                    const over      = limit > 0 && debt >= limit;
                    const paidMonth = txs
                      .filter(t => t.type === 'decrease' && t.uid === u.uid && t.createdAt >= monthStart)
                      .reduce((s, t) => s + (t.amount || 0), 0);
                    return (
                      <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td className="notice-cell" style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{u.displayName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                          {u.role === 'tong_kho' && u.subCount > 0 && (
                            <div style={{ fontSize: '10px', color: 'var(--teal-primary)', marginTop: '2px' }}>
                              gồm {u.subCount} đại lý cấp dưới
                            </div>
                          )}
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                            background: u.role === 'tong_kho' ? 'rgba(76,175,80,0.12)' : 'rgba(230,126,34,0.12)',
                            color:      u.role === 'tong_kho' ? '#4caf50'              : '#e67e22' }}>
                            {ROLE_LABEL[u.role] || u.role}
                          </span>
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <input type="number" min="0" defaultValue={limit}
                            onBlur={e => handleSetLimit(u, e.target.value)}
                            style={{ ...inp, width: '100px', textAlign: 'right' }} />
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: debt > 0 ? '#e74c3c' : 'var(--text-muted)' }}>
                          {fmt(debt)}
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'right', color: '#4caf50', fontSize: '13px' }}>
                          {paidMonth > 0 ? fmt(paidMonth) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'right', color: over ? '#e74c3c' : '#4caf50' }}>
                          {available === null ? '∞' : fmt(available)}
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                            background: over ? 'rgba(231,76,60,0.12)' : debt > 0 ? 'rgba(230,126,34,0.12)' : 'rgba(76,175,80,0.12)',
                            color:      over ? '#e74c3c'              : debt > 0 ? '#e67e22'              : '#4caf50' }}>
                            {over ? 'Vượt hạn mức' : debt > 0 ? 'Đang nợ' : 'Sạch nợ'}
                          </span>
                        </td>
                        <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button className="btn btn-teal" style={{ padding: '3px 10px', fontSize: '11px' }}
                              onClick={() => { setPayModal(u); setPayAmount(''); setPayNote(''); setPayErr(''); }}>
                              Thu nợ
                            </button>
                            <button style={{ padding: '3px 10px', fontSize: '11px', background: 'none', border: '1px solid var(--border-color)', borderRadius: '5px', color: 'var(--text-muted)', cursor: 'pointer' }}
                              onClick={() => { setHistUser(histUser?.uid === u.uid ? null : u); setTab('ledger'); }}>
                              Sổ cái
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Sổ cái giao dịch ── */}
      {tab === 'ledger' && (
        <div className="card">
          <div className="card-header card-header-teal" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Sổ cái giao dịch công nợ {histUser ? `— ${histUser.displayName}` : '(tất cả)'}</span>
            {histUser && (
              <button onClick={() => setHistUser(null)} style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="card-body" style={{ overflowX: 'auto' }}>
            <table className="notices-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px' }}>Thời gian</th>
                  <th style={{ padding: '10px 12px' }}>Khách hàng</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Loại</th>
                   <th style={{ padding: '10px 12px', textAlign: 'right' }}>Số tiền (VND)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dư nợ sau (VND)</th>
                  <th style={{ padding: '10px 12px' }}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {userTxs.length === 0 && (
                  <tr><td colSpan={6} className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Chưa có giao dịch.</td></tr>
                )}
                {userTxs.map(t => {
                  const isIncrease = t.type === 'increase';
                  const owner = users.find(u => u.uid === t.uid);
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{ts(t.createdAt)}</td>
                      <td className="notice-cell" style={{ padding: '10px 12px', fontSize: '12px' }}>{owner?.displayName || t.uid?.slice(0,8)}</td>
                      <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                          background: isIncrease ? 'rgba(231,76,60,0.12)' : 'rgba(76,175,80,0.12)',
                          color:      isIncrease ? '#e74c3c'              : '#4caf50' }}>
                          {isIncrease ? '▲ Phát sinh nợ' : '▼ Thanh toán'}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: isIncrease ? '#e74c3c' : '#4caf50' }}>
                        {isIncrease ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px' }}>{fmt(t.balanceAfter)}</td>
                      <td className="notice-cell" style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{t.note || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal thu nợ ── */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card-bg,#161b22)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', width: '400px', maxWidth: '95vw' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Thu nợ — {payModal.displayName}</div>
            <div style={{ fontSize: '13px', marginBottom: '14px', color: 'var(--text-muted)', display: 'flex', gap: '20px' }}>
              <span>Phải thu: <strong style={{ color: '#e74c3c' }}>{fmt(payModal.totalDebt)} ₫</strong></span>
              {payModal.creditLimit > 0 && <span>Hạn mức: <strong style={{ color: 'var(--teal-primary)' }}>{fmt(payModal.creditLimit)} ₫</strong></span>}
            </div>
            {/* Nút thu đủ */}
            {payModal.totalDebt > 0 && (
              <button style={{ width: '100%', marginBottom: '12px', padding: '8px', border: '1px dashed var(--teal-primary)', borderRadius: '6px', background: 'rgba(88,217,200,0.06)', color: 'var(--teal-primary)', cursor: 'pointer', fontSize: '13px' }}
                onClick={() => setPayAmount(String(payModal.totalDebt))}>
                Thu đủ toàn bộ ({fmt(payModal.totalDebt)} ₫)
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Số tiền thu (VND) *</label>
                <input type="number" min="1" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  style={{ ...inp, width: '100%' }} placeholder="Nhập số tiền..." />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ghi chú</label>
                <input type="text" value={payNote} onChange={e => setPayNote(e.target.value)}
                  style={{ ...inp, width: '100%' }} placeholder="Chuyển khoản MB Bank..." />
              </div>
              {payErr && <p style={{ color: '#e74c3c', fontSize: '12px', margin: 0 }}>{payErr}</p>}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPayModal(null)} style={{ padding: '8px 18px', background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handlePay} disabled={paying} className="btn btn-teal" style={{ padding: '8px 22px', fontWeight: 700 }}>
                {paying ? 'Đang xử lý…' : 'Xác nhận thu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
