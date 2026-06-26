import React, { useState, useEffect } from 'react';
import { Search, Trash2, Download, CreditCard } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { fetchRecordsForRole } from '../utils/dataStore';

function calcPrice(rec) {
  if (!rec.items || !rec.items.length) return 0;
  return rec.items.reduce((s, i) => s + (i.amount != null ? i.amount : (i.price || 0) * (i.qty || 1)), 0);
}

const MyBill = () => {
  const { user, role } = useAuth();
  const uid = user?.uid;

  const [bills, setBills]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadErr, setLoadErr]   = useState('');

  const [billId,       setBillId]       = useState('');
  const [history,      setHistory]      = useState('');
  const [collectType,  setCollectType]  = useState('');
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');
  const [activeFilters, setActiveFilters] = useState({ billId: '', history: '', collectType: '', startDate: '', endDate: '' });

  const showOwner = role === 'admin' || role === 'tong_kho';

  // Load orders + topups theo cây phân cấp vai trò
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setLoadErr('');
      try {
        const [orders, topups] = await Promise.all([
          fetchRecordsForRole('orders', { uid, role }),
          fetchRecordsForRole('topups', { uid, role }),
        ]);
        if (cancelled) return;
        const combined = [
          ...(orders  || []).map(o => ({ ...o, _source: 'order' })),
          ...(topups  || []).map(t => ({ ...t, _source: 'topup' })),
        ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBills(combined);
      } catch (e) {
        if (!cancelled) setLoadErr('Lỗi tải dữ liệu: ' + (e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uid, role]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({ billId, history, collectType, startDate, endDate });
  };

  const handleClear = () => {
    setBillId(''); setHistory(''); setCollectType(''); setStartDate(''); setEndDate('');
    setActiveFilters({ billId: '', history: '', collectType: '', startDate: '', endDate: '' });
  };

  const filteredBills = bills.filter(item => {
    const id = (item.orderId || item.billId || '').toLowerCase();
    if (activeFilters.billId && !id.includes(activeFilters.billId.toLowerCase())) return false;
    if (activeFilters.history && !(item.history || '').includes(activeFilters.history)) return false;
    if (activeFilters.startDate && (item.date || '') < activeFilters.startDate) return false;
    if (activeFilters.endDate  && (item.date || '') > activeFilters.endDate + ' 99') return false;
    return true;
  });

  const totalPaid = filteredBills.reduce((s, b) => s + calcPrice(b), 0);

  const typeColor = (t) => {
    if (!t) return 'var(--teal-primary)';
    if (t.toLowerCase().includes('esim') || t.toLowerCase().includes('esim')) return '#27ae60';
    if (t.toLowerCase().includes('top')) return '#e67e22';
    return 'var(--teal-primary)';
  };

  const colSpan = showOwner ? 7 : 6;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">HÓA ĐƠN CỦA TÔI</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Hóa đơn của tôi</span>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px 20px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase' }}>Tổng giá trị</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--teal-primary)', marginTop: '5px' }}>NT$ {totalPaid.toLocaleString()}</div>
        </div>
        <div style={{ flex: '1 1 200px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px 20px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase' }}>Số hóa đơn</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '5px' }}>{filteredBills.length}</div>
        </div>
        {showOwner && (
          <div style={{ flex: '1 1 200px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px 20px', boxShadow: 'var(--shadow-premium)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase' }}>Tài khoản đặt hàng</div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#e67e22', marginTop: '5px' }}>
              {new Set(bills.map(b => b.uid)).size}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} />
            <span>Bộ lọc tìm kiếm hóa đơn</span>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã hóa đơn / đơn hàng</label>
                <input type="text" className="search-input" style={{ width: '100%' }}
                  placeholder="Nhập mã đơn hàng..." value={billId} onChange={e => setBillId(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Trạng thái giao hàng</label>
                <select className="entries-select" style={{ width: '100%', height: '30px' }}
                  value={history} onChange={e => setHistory(e.target.value)}>
                  <option value="">Tất cả...</option>
                  <option value="Shipped">Đã gửi hàng</option>
                  <option value="Success">Thành công</option>
                </select>
              </div>
              <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Từ ngày</label>
                <input type="date" className="search-input" style={{ width: '100%' }}
                  value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Đến ngày</label>
                <input type="date" className="search-input" style={{ width: '100%' }}
                  value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="submit" className="btn btn-search btn-teal"><Search size={14} /><span>Tìm kiếm</span></button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleClear} title="Xóa bộ lọc"><Trash2 size={14} /></button>
              <button type="button" className="btn btn-orange" onClick={() => alert('Đang xuất hóa đơn...')}><Download size={14} /><span>Xuất</span></button>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Đang tải dữ liệu…</p>
          ) : loadErr ? (
            <p style={{ color: '#e74c3c', padding: '20px' }}>{loadErr}</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="notices-table" style={{ minWidth: showOwner ? '1050px' : '900px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 15px' }}>Mã đơn hàng</th>
                    <th style={{ padding: '12px 15px' }}>Ngày tạo</th>
                    <th style={{ padding: '12px 15px', textAlign: 'right' }}>Tổng giá (NT$)</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center' }}>Loại</th>
                    <th style={{ padding: '12px 15px', textAlign: 'center' }}>SL</th>
                    {showOwner && <th style={{ padding: '12px 15px' }}>Tài khoản</th>}
                    <th style={{ padding: '12px 15px', textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length > 0 ? filteredBills.map((row) => {
                    const price = calcPrice(row);
                    const type  = row.type || row.productType || 'eSIM';
                    const status = row.status || 'Success';
                    const orderId = row.orderId || row.billId || row.id;
                    return (
                      <tr key={row.id || orderId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '500', color: 'var(--teal-primary)', fontFamily: 'monospace', fontSize: '12px' }}>
                          {orderId}
                        </td>
                        <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)', fontSize: '12px' }}>{row.date}</td>
                        <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                          {price > 0 ? price.toLocaleString() : '—'}
                        </td>
                        <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                          <span style={{ background: 'rgba(32,158,145,0.12)', color: typeColor(type), border: '1px solid rgba(32,158,145,0.25)', padding: '2px 7px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                            {type}
                          </span>
                        </td>
                        <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {row.quantity || (row.items?.length) || '—'}
                        </td>
                        {showOwner && (
                          <td className="notice-cell" style={{ padding: '12px 15px', fontSize: '12px', color: '#e67e22' }}>
                            {row.ownerName || row.company || row.uid?.slice(0, 8) || '—'}
                          </td>
                        )}
                        <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                          <span style={{ background: status === 'Success' ? 'rgba(39,174,96,0.12)' : 'rgba(231,76,60,0.12)', color: status === 'Success' ? '#27ae60' : '#e74c3c', border: `1px solid ${status === 'Success' ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`, padding: '2px 7px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={colSpan} className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                        Chưa có hóa đơn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBill;
