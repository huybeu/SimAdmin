import React, { useState } from 'react';
import { Search, Trash2, Download, CreditCard } from 'lucide-react';

const MOCK_BILLS = [
  { id: 1, billId: 'b0002042606230002', date: '2026/06/23 15:29:00', price: 290, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 2, billId: 'b0002042606230001', date: '2026/06/23 11:01:33', price: 120, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 3, billId: 'b0002042606180005', date: '2026/06/18 09:28:47', price: 920, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 4, billId: 'b0002042606180004', date: '2026/06/18 09:21:59', price: 158, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 5, billId: 'b0002042606180003', date: '2026/06/17 14:15:22', price: 340, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 6, billId: 'b0002042606180002', date: '2026/06/16 10:05:11', price: 500, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 7, billId: 'b0002042606180001', date: '2026/06/15 16:30:45', price: 210, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 8, billId: 'b0002042606170005', date: '2026/06/14 09:20:00', price: 890, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 9, billId: 'b0002042606170004', date: '2026/06/13 11:45:30', price: 150, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 10, billId: 'b0002042606170003', date: '2026/06/12 08:15:10', price: 275, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 11, billId: 'b0002042606170002', date: '2026/06/11 15:50:20', price: 420, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
  { id: 12, billId: 'b0002042606170001', date: '2026/06/10 13:20:05', price: 315, type: 'Đặt mua', collect: 'Phải thu', status: 'Thành công', history: 'Đã gửi hàng' },
];

const MyBill = () => {
  const [billId, setBillId] = useState('');
  const [iccid, setIccid] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [history, setHistory] = useState('');
  const [collectType, setCollectType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [activeFilters, setActiveFilters] = useState({
    billId: '',
    history: '',
    collectType: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({
      billId,
      history,
      collectType
    });
  };

  const handleClear = () => {
    setBillId('');
    setIccid('');
    setPromoCode('');
    setHistory('');
    setCollectType('');
    setStartDate('');
    setEndDate('');
    setActiveFilters({
      billId: '',
      history: '',
      collectType: ''
    });
  };

  const filteredBills = MOCK_BILLS.filter(item => {
    const matchId = item.billId.toLowerCase().includes(activeFilters.billId.toLowerCase());
    const matchHistory = activeFilters.history === '' || item.history === activeFilters.history;
    const matchCollect = activeFilters.collectType === '' || item.collect === activeFilters.collectType;
    return matchId && matchHistory && matchCollect;
  });

  // Financial summary numbers
  const totalPaid = 1488;
  const totalPayable = 0;
  const totalNet = 1488;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">HÓA ĐƠN CỦA TÔI</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Hóa đơn của tôi</span>
        </div>
      </div>

      {/* Summary blocks row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', background: 'var(--card-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px 20px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase' }}>Đã thanh toán</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--teal-primary)', marginTop: '5px' }}>NT$ {totalPaid.toLocaleString()}</div>
        </div>
        <div style={{ flex: '1 1 200px', background: 'var(--card-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px 20px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase' }}>Cần thanh toán</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--red-primary)', marginTop: '5px' }}>NT$ {totalPayable.toLocaleString()}</div>
        </div>
        <div style={{ flex: '1 1 200px', background: 'var(--card-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px 20px', boxShadow: 'var(--shadow-premium)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase' }}>Tổng cộng</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '5px' }}>NT$ {totalNet.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} />
            <span>Bộ lọc tìm kiếm hóa đơn</span>
          </div>
        </div>

        <div className="card-body">
          {/* Advanced filters form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã hóa đơn/đơn hàng</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã hóa đơn..." 
                  value={billId}
                  onChange={(e) => setBillId(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã ICCID thẻ</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã ICCID..." 
                  value={iccid}
                  onChange={(e) => setIccid(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã đổi thẻ (Redeem Code)</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã đổi thưởng..." 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Trạng thái giao hàng</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                >
                  <option value="">Chọn trạng thái...</option>
                  <option value="Đã gửi hàng">Đã gửi hàng</option>
                  <option value="Đã trả lại">Đã trả lại</option>
                </select>
              </div>

              <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Hình thức thu</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={collectType}
                  onChange={(e) => setCollectType(e.target.value)}
                >
                  <option value="">Chọn hình thức...</option>
                  <option value="Phải thu">Phải thu</option>
                  <option value="Đã thu">Đã thu</option>
                </select>
              </div>

              <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Ngày bắt đầu</label>
                <input 
                  type="date" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Ngày kết thúc</label>
                <input 
                  type="date" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '5px' }}>
              <button type="submit" className="btn btn-search btn-teal">
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleClear} title="Xóa bộ lọc">
                <Trash2 size={14} />
              </button>
              <button type="button" className="btn btn-orange" onClick={() => alert('Đang xuất hóa đơn...')}>
                <Download size={14} />
                <span>Xuất hóa đơn</span>
              </button>
              <button type="button" className="btn btn-blue" onClick={() => alert('Đang xuất hóa đơn eSIM...')}>
                <Download size={14} />
                <span>Xuất hóa đơn eSIM</span>
              </button>
            </div>
          </form>

          {/* Bills Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table" style={{ minWidth: '950px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 15px' }}>Mã hóa đơn</th>
                  <th style={{ padding: '12px 15px' }}>Ngày tạo</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right' }}>Tổng giá</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Loại đơn</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Thu tiền</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ padding: '12px 15px' }}>Lịch sử cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '500', color: 'var(--teal-primary)', fontFamily: 'monospace' }}>{row.billId}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)' }}>{row.date}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>NT$ {row.price}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(32, 158, 145, 0.15)', 
                          color: 'var(--teal-primary)', 
                          border: '1px solid rgba(32, 158, 145, 0.25)',
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '11px', 
                          fontWeight: 'bold' 
                        }}>
                          {row.type}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        {row.collect}
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(32, 158, 145, 0.15)', 
                          color: 'var(--teal-primary)', 
                          border: '1px solid rgba(32, 158, 145, 0.25)',
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '11px', 
                          fontWeight: 'bold' 
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)' }}>
                        {row.history}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không tìm thấy bản ghi hóa đơn phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyBill;
