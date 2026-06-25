import React, { useState, useEffect } from 'react';
import { Search, Trash2, Send, Shuffle, Plus, X, QrCode, Shield, CheckCircle } from 'lucide-react';
import { createEsimOrderAndRedeem } from '../utils/api';

const MOCK_MATCHING_ORDERS = [
  { id: 1, serial: 1, code: 'b0002red260623011', time: '2026/06/23 15:30:00', status: 'Đã gửi', email: 'customer1@gmail.com', qrcode: 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=LPA%3A1%24rsp.worldmove.com%24MOCKQR1', qrcodeContent: 'LPA:1$rsp.worldmove.com$MOCKQR1' },
  { id: 2, serial: 2, code: 'b0002red260623009', time: '2026/06/23 11:03:00', status: 'Đã gửi', email: '', qrcode: 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=LPA%3A1%24rsp.worldmove.com%24MOCKQR2', qrcodeContent: 'LPA:1$rsp.worldmove.com$MOCKQR2' },
  { id: 3, serial: 3, code: 'b0002red260618002', time: '2026/06/18 09:30:00', status: 'Chờ xử lý', email: '', qrcode: null, qrcodeContent: null }
];

const OrderMatching = () => {
  const [orderCode, setOrderCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [activeFilters, setActiveFilters] = useState({
    code: '',
    tableSearch: ''
  });

  const [orders, setOrders] = useState(MOCK_MATCHING_ORDERS);
  
  // Modal states
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [productId, setProductId] = useState('WM_000001');
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Matched QR detail overlay state
  const [activeEsimDetail, setActiveEsimDetail] = useState(null);

  useEffect(() => {
    const handleCallback = (e) => {
      if (e.detail.callbackType === 'orderRedeem') {
        const { orderId, itemList } = e.detail.payload;
        setOrders(prev => prev.map(o => {
          if (o.code === orderId) {
            const esim = itemList[0];
            return {
              ...o,
              status: 'Đã nhận QR',
              qrcode: esim.qrcode,
              qrcodeContent: esim.qrcodeContent,
              apnExplain: esim.apnExplain,
              pin1: esim.pin1,
              puk1: esim.puk1,
              cfCode: esim.cfCode
            };
          }
          return o;
        }));
        
        // Show success detail overlay
        const esimInfo = itemList[0];
        setActiveEsimDetail({
          orderId,
          ...esimInfo
        });
      }
    };

    window.addEventListener('api-callback-received', handleCallback);
    return () => window.removeEventListener('api-callback-received', handleCallback);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({
      code: orderCode,
      tableSearch: tableSearch
    });
  };

  const handleClear = () => {
    setOrderCode('');
    setStartDate('');
    setEndDate('');
    setTableSearch('');
    setActiveFilters({
      code: '',
      tableSearch: ''
    });
  };

  const handleEmailChange = (id, val) => {
    setOrders(orders.map(o => o.id === id ? { ...o, email: val } : o));
  };

  const handleSend = (id) => {
    const order = orders.find(o => o.id === id);
    if (!order.email) {
      alert('Vui lòng nhập Email trước khi gửi!');
      return;
    }
    alert(`Đang gửi thông tin QR Code cài đặt của đơn hàng ${order.code} tới địa chỉ ${order.email}...`);
    
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Đã gửi' } : o));
  };

  const handleInstantSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createEsimOrderAndRedeem(2, [{ wmproductId: productId, qty: Number(qty) }]);
      if (res.code === 0 && res.orderId) {
        const newOrder = {
          id: Date.now(),
          serial: orders.length + 1,
          code: res.orderId,
          time: new Date().toISOString().replace('T', ' ').substr(0, 19),
          status: 'Đang tạo eSIM',
          email: '',
          qrcode: null,
          qrcodeContent: null
        };
        setOrders([newOrder, ...orders]);
        setShowInstantModal(false);
        alert(`Đơn đặt mua và đổi eSIM siêu tốc đã được gửi! Mã giao dịch: ${res.orderId}. Vui lòng đợi Webhook callback trả về mã QR.`);
      } else {
        alert('Tạo đơn thất bại: ' + res.msg);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối API!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(item => {
    const matchCode = item.code.toLowerCase().includes(activeFilters.code.toLowerCase());
    const matchTable = activeFilters.tableSearch === '' || 
      item.code.toLowerCase().includes(activeFilters.tableSearch.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(activeFilters.tableSearch.toLowerCase()));
    return matchCode && matchTable;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">KHỚP ĐƠN HÀNG</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Khớp đơn hàng</span>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shuffle size={16} />
              <span>Khớp đơn hàng phân phối email</span>
            </div>
            <button 
              className="btn btn-teal" 
              style={{ height: '26px', fontSize: '11px', gap: '4px', padding: '0 10px' }}
              onClick={() => setShowInstantModal(true)}
            >
              <Plus size={12} />
              <span>Đặt mua & Đổi eSIM siêu tốc</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Main search panel */}
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã đơn hàng (Code)</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã đơn hàng..." 
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Ngày bắt đầu</label>
                <input 
                  type="date" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="submit" className="btn btn-search btn-teal">
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleClear} title="Xóa bộ lọc">
                <Trash2 size={14} />
              </button>
            </div>
          </form>

          {/* Table-level quick search */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Tra cứu nhanh:</span>
            <input 
              type="text" 
              className="search-input" 
              style={{ width: '180px', height: '28px' }}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
            <button className="btn btn-teal" style={{ width: '28px', height: '28px', padding: 0 }} onClick={handleSearch}>
              <Search size={12} />
            </button>
            <button className="btn btn-red" style={{ width: '28px', height: '28px', padding: 0 }} onClick={() => setTableSearch('')}>
              <Trash2 size={12} />
            </button>
          </div>

          {/* Order Matching Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>STT</th>
                  <th style={{ width: '25%' }}>Mã đơn hàng</th>
                  <th style={{ width: '20%' }}>Thời gian tạo</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ width: '25%' }}>Email khách nhận mã</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>{row.serial}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '500', fontFamily: 'monospace', color: 'var(--teal-primary)' }}>
                        <span 
                          onClick={() => row.qrcode && setActiveEsimDetail({ orderId: row.code, qrcode: row.qrcode, qrcodeContent: row.qrcodeContent, pin1: row.pin1 || '1111', puk1: row.puk1 || '33334444', cfCode: row.cfCode || '849372', apnExplain: row.apnExplain || 'worldmove.com' })}
                          style={{ cursor: row.qrcode ? 'pointer' : 'default', textDecoration: row.qrcode ? 'underline' : 'none' }}
                        >
                          {row.code}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)' }}>{row.time}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: row.status === 'Đã gửi' || row.status === 'Đã nhận QR' ? 'rgba(32, 158, 145, 0.15)' : 'rgba(240, 173, 78, 0.15)', 
                          color: row.status === 'Đã gửi' || row.status === 'Đã nhận QR' ? 'var(--teal-primary)' : 'var(--orange-primary)', 
                          border: row.status === 'Đã gửi' || row.status === 'Đã nhận QR' ? '1px solid rgba(32, 158, 145, 0.25)' : '1px solid rgba(240, 173, 78, 0.25)',
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '11px',
                          fontWeight: 'bold' 
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>
                        <input 
                          type="email" 
                          className="search-input" 
                          style={{ width: '100%', height: '26px', fontSize: '12px', backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-color)' }}
                          placeholder="Nhập email khách nhận eSIM..." 
                          value={row.email || ''}
                          onChange={(e) => handleEmailChange(row.id, e.target.value)}
                        />
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <button 
                          className="btn btn-teal" 
                          style={{ height: '26px', padding: '0 10px', fontSize: '11px', gap: '3px' }}
                          onClick={() => handleSend(row.id)}
                          disabled={row.status === 'Đang tạo eSIM'}
                        >
                          <Send size={10} />
                          <span>Gửi đi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không tìm thấy đơn hàng cần khớp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Instant eSIM Order Modal */}
      {showInstantModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: '#1b222a',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            width: '450px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--teal-primary)', fontWeight: 'bold', fontSize: '15px' }}>ĐẶT MUA & ĐỔI ESIM SIÊU TỐC</h3>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowInstantModal(false)} />
            </div>

            <form onSubmit={handleInstantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Sản phẩm eSIM (wmproductId)</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                >
                  <option value="WM_000001">Japan eSIM 3 Days 1GB/day (WM_000001)</option>
                  <option value="WM_000003">Global eSIM 30 Days Unlimited (WM_000003)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Số lượng đặt mua</label>
                <input 
                  type="number" 
                  min="1" 
                  className="search-input"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button type="button" className="btn btn-reset btn-red" onClick={() => setShowInstantModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-teal" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : 'Tạo và Lấy QR kích hoạt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* eSIM QR Code Detail Overlay */}
      {activeEsimDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            backgroundColor: '#1b222a',
            border: '2px solid var(--teal-primary)',
            borderRadius: '12px',
            width: '500px',
            padding: '25px',
            boxShadow: '0 15px 30px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            position: 'relative'
          }}>
            <X 
              size={20} 
              style={{ position: 'absolute', right: '15px', top: '15px', cursor: 'pointer', color: '#9ca3af' }} 
              onClick={() => setActiveEsimDetail(null)} 
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-primary)' }}>
              <CheckCircle size={22} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>ESIM CỦA BẠN ĐÃ SẴN SÀNG!</h3>
            </div>
            
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã đơn: {activeEsimDetail.orderId}</span>

            {/* QR Image */}
            {activeEsimDetail.qrcode ? (
              <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '8px', marginTop: '10px', boxShadow: '0 0 10px rgba(32, 158, 145, 0.4)' }}>
                <img 
                  src={activeEsimDetail.qrcode} 
                  alt="eSIM QR Code" 
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              </div>
            ) : (
              <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#11151b', color: '#9ca3af', borderRadius: '8px' }}>
                <QrCode size={40} />
              </div>
            )}

            {/* LPA String */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mã cài đặt thủ công (LPA String)</label>
              <div style={{ 
                backgroundColor: '#11151b', 
                border: '1px solid var(--border-color)', 
                borderRadius: '5px', 
                padding: '8px 12px', 
                fontFamily: 'monospace', 
                fontSize: '11px', 
                color: 'var(--teal-primary)', 
                wordBreak: 'break-all',
                textAlign: 'center'
              }}>
                {activeEsimDetail.qrcodeContent || 'N/A'}
              </div>
            </div>

            {/* Config details */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', backgroundColor: '#11151b', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Mã PIN1:</span> <strong style={{ color: '#fff' }}>{activeEsimDetail.pin1 || '1111'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Mã PUK1:</span> <strong style={{ color: '#fff' }}>{activeEsimDetail.puk1 || '33334444'}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cấu hình APN:</span> <strong style={{ color: 'var(--orange-primary)' }}>{activeEsimDetail.apnExplain || 'worldmove.com'}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mã xác nhận (Confirmation Code):</span> <strong style={{ color: '#fff' }}>{activeEsimDetail.cfCode || '849372'}</strong>
              </div>
            </div>

            <button 
              className="btn btn-teal" 
              style={{ marginTop: '10px', width: '100%', justifyContent: 'center', height: '32px' }}
              onClick={() => setActiveEsimDetail(null)}
            >
              Hoàn thành
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderMatching;
