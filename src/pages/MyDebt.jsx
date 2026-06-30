import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { fetchDebtTransactions } from '../utils/debtStore';

const fmt = (n) => (Number(n) || 0).toLocaleString();
const ts  = (ms) => ms ? new Date(ms).toLocaleString('vi-VN') : '—';

export default function MyDebt() {
  const { user, profile } = useAuth();
  const uid = user?.uid;

  const [txs,     setTxs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const totalDebt  = profile?.totalDebt   || 0;
  const creditLimit = profile?.creditLimit || 0;
  const available  = creditLimit > 0 ? creditLimit - totalDebt : null;
  const over       = creditLimit > 0 && totalDebt >= creditLimit;

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true); setError('');
    try {
      const data = await fetchDebtTransactions(uid, 'dai_ly');
      setTxs(data);
    } catch (e) { setError(e.message || 'Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">CÔNG NỢ CỦA TÔI</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span><span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Công nợ của tôi</span>
        </div>
      </div>

      {/* Thông tin công nợ */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Dư nợ hiện tại', value: `NT$ ${fmt(totalDebt)}`, color: totalDebt > 0 ? '#e74c3c' : '#4caf50' },
          { label: 'Hạn mức tín dụng', value: creditLimit > 0 ? `NT$ ${fmt(creditLimit)}` : 'Không giới hạn', color: 'var(--teal-primary)' },
          { label: 'Còn được nợ', value: available === null ? '∞' : `NT$ ${fmt(available)}`, color: over ? '#e74c3c' : '#4caf50' },
        ].map(c => (
          <div key={c.label} style={{ flex: '1 1 160px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 18px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: c.color, marginTop: '4px' }}>{c.value}</div>
          </div>
        ))}
        {over && (
          <div style={{ flex: '1 1 100%', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '10px', padding: '12px 18px', color: '#e74c3c', fontSize: '13px' }}>
            ⚠ Tài khoản đã vượt hạn mức tín dụng. Vui lòng liên hệ tổng kho để thanh toán.
          </div>
        )}
      </div>

      {/* Lịch sử giao dịch */}
      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={15} /><span>Lịch sử giao dịch công nợ</span>
            </div>
            <button onClick={load} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <RefreshCw size={12} /> Làm mới
            </button>
          </div>
        </div>
        <div className="card-body" style={{ overflowX: 'auto' }}>
          {error && <p style={{ color: '#e74c3c', marginBottom: '10px' }}>{error}</p>}
          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px' }}>Đang tải…</p>
          ) : (
            <table className="notices-table" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px' }}>Thời gian</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Loại</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Số tiền (NT$)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dư nợ sau (NT$)</th>
                  <th style={{ padding: '10px 12px' }}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 && (
                  <tr><td colSpan={5} className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Chưa có giao dịch công nợ nào.
                  </td></tr>
                )}
                {txs.map(t => {
                  const isIncrease = t.type === 'increase';
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>{ts(t.createdAt)}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
