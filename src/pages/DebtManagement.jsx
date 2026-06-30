import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  fetchDebtUsers, fetchDebtTransactions,
  recordPayment, setCreditLimit,
} from '../utils/debtStore';
import { ROLE_LABEL } from '../lib/roles';

const fmt = (n) => (Number(n) || 0).toLocaleString();
const ts  = (ms) => ms ? new Date(ms).toLocaleString('vi-VN') : '—';

export default function DebtManagement() {
  const { user, role } = useAuth();
  const uid = user?.uid;

  const [users,    setUsers]    = useState([]);
  const [txs,      setTxs]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Modal thanh toán
  const [payModal,  setPayModal]  = useState(null); // { uid, displayName, totalDebt }
  const [payAmount, setPayAmount] = useState('');
  const [payNote,   setPayNote]   = useState('');
  const [payErr,    setPayErr]    = useState('');
  const [paying,    setPaying]    = useState(false);

  // Xem lịch sử của 1 user
  const [histUser, setHistUser] = useState(null);

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
  const totalDebtAll = users.reduce((s, u) => s + (u.totalDebt || 0), 0);
  const overLimit    = users.filter(u => u.creditLimit > 0 && (u.totalDebt || 0) >= u.creditLimit).length;

  const userTxs = histUser ? txs.filter(t => t.uid === histUser.uid) : txs;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">QUẢN LÝ CÔNG NỢ</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span><span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Quản lý công nợ</span>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng dư nợ', value: `NT$ ${fmt(totalDebtAll)}`, color: '#e74c3c' },
          { label: 'Số khách nợ', value: users.length, color: 'var(--teal-primary)' },
          { label: 'Vượt hạn mức', value: overLimit, color: '#e67e22' },
        ].map(c => (
          <div key={c.label} style={{ flex: '1 1 160px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 18px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: c.color, marginTop: '4px' }}>{c.value}</div>
          </div>
        ))}
        <button onClick={load} style={{ alignSelf: 'center', background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <p style={{ color: '#e74c3c', marginBottom: '12px' }}>{error}</p>}

      {/* Bảng danh sách công nợ */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={15} /><span>Danh sách công nợ khách hàng</span></div>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          {loading ? <p style={{ color: 'var(--text-muted)' }}>Đang tải…</p> : (
            <table className="notices-table" style={{ minWidth: '760px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px' }}>Tên / Email</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Vai trò</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Hạn mức (NT$)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dư nợ (NT$)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Còn được nợ</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={7} className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>Chưa có dữ liệu công nợ.</td></tr>
                )}
                {users.map(u => {
                  const debt      = u.totalDebt    || 0;
                  const limit     = u.creditLimit  || 0;
                  const available = limit > 0 ? limit - debt : null;
                  const over      = limit > 0 && debt >= limit;
                  return (
                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{u.displayName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
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
                            onClick={() => setHistUser(histUser?.uid === u.uid ? null : u)}>
                            {histUser?.uid === u.uid ? 'Ẩn' : 'Lịch sử'}
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

      {/* Lịch sử giao dịch */}
      <div className="card">
        <div className="card-header card-header-teal">
          <span>Sổ cái giao dịch công nợ {histUser ? `— ${histUser.displayName}` : '(tất cả)'}</span>
          {histUser && <button onClick={() => setHistUser(null)} style={{ marginLeft: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>}
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table className="notices-table" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px' }}>Thời gian</th>
                <th style={{ padding: '10px 12px' }}>Khách hàng</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Loại</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Số tiền (NT$)</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dư nợ sau (NT$)</th>
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

      {/* Modal thu nợ */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card-bg,#161b22)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', width: '380px', maxWidth: '95vw' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
              Thu nợ — {payModal.displayName}
            </div>
            <div style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Dư nợ hiện tại: <strong style={{ color: '#e74c3c' }}>NT$ {fmt(payModal.totalDebt)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Số tiền thu (NT$) *</label>
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
