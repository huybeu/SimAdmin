import React, { useState, useEffect } from 'react';
import { Search, Trash2, Download, RotateCcw, Plus, X, CheckCircle, QrCode } from 'lucide-react';
import { redeemRedemptionCode } from '../utils/api';

const MOCK_REFUNDS = [
  { id: 1, refundId: 'rb0002042606110001', date: '2026-06-11 12:03:06', price: 88, branch: 'SimDuLich.VN', status: 'Đã phê duyệt' },
  { id: 2, refundId: 'rb0002042606080002', date: '2026-06-08 12:27:17', price: 88, branch: 'SimDuLich.VN', status: 'Đã phê duyệt' },
  { id: 3, refundId: 'rb0002042606080001', date: '2026-06-08 11:47:07', price: null, branch: 'SimDuLich.VN', status: 'Từ chối hoàn tiền' }
];

const ReturnOrders = () => {
  const [iccid, setIccid] = useState('');
  const [rcode, setRcode] = useState('');
  const [originalOrderId, setOriginalOrderId] = useState('');
  const [refundId, setRefundId] = useState('');
  const [refundStatus, setRefundStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [activeFilters, setActiveFilters] = useState({
    refundId: '',
    status: ''
  });

  const [refunds, setRefunds] = useState(MOCK_REFUNDS);
  
  // Redeem modal states
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemRcode, setRedeemRcode] = useState('');
  const [qrcodeType, setQrcodeType] = useState(2); // default 2
  const [submitting, setSubmitting] = useState(false);
  
  // eSIM details overlay state
  const [activeEsimDetail, setActiveEsimDetail] = useState(null);

  useEffect(() => {
    const handleCallback = (e) => {
      if (e.detail.callbackType === 'redeem') {
        const payload = e.detail.payload;
        // Display matched QR Code modal
        setActiveEsimDetail(payload);
        
        // Append to refund/redeem orders list as a successful mock transaction
        const newRefund = {
          id: Date.now(),
          refundId: 'red_' + payload.rcode.substr(0, 10),
          date: new Date().toISOString().replace('T', ' ').substr(0, 19),
          price: 90,
          branch: 'SimDuLich.VN',
          status: 'Đã phê duyệt'
        };
        setRefunds(prev => [newRefund, ...prev]);
      }
    };

    window.addEventListener('api-callback-received', handleCallback);
    return () => window.removeEventListener('api-callback-received', handleCallback);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({
      refundId,
      status: refundStatus
    });
  };

  const handleClear = () => {
    setIccid('');
    setRcode('');
    setOriginalOrderId('');
    setRefundId('');
    setRefundStatus('');
    setStartDate('');
    setEndDate('');
    setActiveFilters({
      refundId: '',
      status: ''
    });
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!redeemRcode) {
      alert('Vui lòng nhập Mã đổi eSIM (Redemption Code)!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await redeemRedemptionCode(redeemRcode, Number(qrcodeType));
      if (res.code === 0) {
        setShowRedeemModal(false);
        setRedeemRcode('');
        alert('Mã đổi eSIM hợp lệ và đã gửi đi! Vui lòng đợi Webhook callback trả về mã QR Code kích hoạt trong vài giây.');
      } else {
        alert('Đổi mã thất bại: ' + res.msg);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối API đổi mã!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRefunds = refunds.filter(item => {
    const matchId = item.refundId.toLowerCase().includes(activeFilters.refundId.toLowerCase());
    const matchStatus = activeFilters.status === '' || item.status === activeFilters.status;
    return matchId && matchStatus;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">ĐƠN HÀNG TRẢ LẠI</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Đơn hàng trả lại</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={16} />
              <span>Bộ lọc tra cứu đơn hàng trả lại</span>
            </div>
            <button 
              className="btn btn-teal" 
              style={{ height: '26px', fontSize: '11px', gap: '4px', padding: '0 10px' }}
              onClick={() => setShowRedeemModal(true)}
            >
              <Plus size={12} />
              <span>Đổi mã Redeem Code</span>
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Advanced filter form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
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
                <label>Mã đổi eSIM (Redeem Code)</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã đổi eSIM..." 
                  value={rcode}
                  onChange={(e) => setRcode(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã đơn đặt mua gốc</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã đơn hàng gốc..." 
                  value={originalOrderId}
                  onChange={(e) => setOriginalOrderId(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Mã đơn hàng trả lại</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập mã đơn trả..." 
                  value={refundId}
                  onChange={(e) => setRefundId(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Trạng thái duyệt đơn</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={refundStatus}
                  onChange={(e) => setRefundStatus(e.target.value)}
                >
                  <option value="">Chọn trạng thái...</option>
                  <option value="Đã phê duyệt">Đã phê duyệt</option>
                  <option value="Từ chối hoàn tiền">Từ chối hoàn tiền</option>
                  <option value="Đang kiểm tra">Đang kiểm tra</option>
                </select>
              </div>

              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Từ ngày trả hàng</label>
                <input 
                  type="date" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Đến ngày trả hàng</label>
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
              <button type="submit" className="btn btn-search btn-orange">
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleClear} title="Xóa bộ lọc">
                <Trash2 size={14} />
              </button>
              <button type="button" className="btn btn-blue" onClick={() => alert('Đang xuất bảng kê đơn hàng trả hàng...')}>
                <Download size={14} />
                <span>Xuất hóa đơn</span>
              </button>
            </div>
          </form>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ padding: '12px 15px' }}>Mã đơn trả hàng</th>
                  <th style={{ padding: '12px 15px' }}>Ngày yêu cầu</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right' }}>Tổng giá trả</th>
                  <th style={{ padding: '12px 15px' }}>Đại lý / Chi nhánh</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.length > 0 ? (
                  filteredRefunds.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '500', color: 'var(--teal-primary)', fontFamily: 'monospace' }}>{row.refundId}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)' }}>{row.date}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                        {row.price !== null ? `${row.price.toLocaleString('vi-VN')} ₫` : '-'}
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>{row.branch}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: row.status === 'Đã phê duyệt' ? 'rgba(32, 158, 145, 0.15)' : 'rgba(255, 82, 82, 0.15)', 
                          color: row.status === 'Đã phê duyệt' ? 'var(--teal-primary)' : 'var(--red-primary)', 
                          border: row.status === 'Đã phê duyệt' ? '1px solid rgba(32, 158, 145, 0.25)' : '1px solid rgba(255, 82, 82, 0.25)',
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '11px',
                          fontWeight: 'bold' 
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không tìm thấy bản ghi đơn hàng trả lại phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Redeem Modal Dialog */}
      {showRedeemModal && (
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
              <h3 style={{ margin: 0, color: 'var(--teal-primary)', fontWeight: 'bold', fontSize: '15px' }}>ĐỔI MÃ REDEEM CODE</h3>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setShowRedeemModal(false)} />
            </div>

            <form onSubmit={handleRedeemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Mã đổi eSIM (Redemption Code) *</label>
                <input 
                  type="text" 
                  className="search-input" 
                  value={redeemRcode}
                  placeholder="Nhập mã đổi eSIM..."
                  onChange={(e) => setRedeemRcode(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Định dạng đầu ra QR</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={qrcodeType}
                  onChange={(e) => setQrcodeType(e.target.value)}
                >
                  <option value={2}>Hình ảnh & Văn bản LPA (Image & Text)</option>
                  <option value={0}>Chỉ hình ảnh QR (Image URL)</option>
                  <option value={1}>Chỉ văn bản (LPA String text)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button type="button" className="btn btn-reset btn-red" onClick={() => setShowRedeemModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-teal" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Xác nhận Đổi mã'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR Code Detail Overlay */}
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>QUY ĐỔI MÃ REDEEM THÀNH CÔNG!</h3>
            </div>
            
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mã số eSIM (ICCID): {activeEsimDetail.iccid}</span>

            {/* QR Image */}
            {activeEsimDetail.qrcode && activeEsimDetail.qrcodeType != 1 ? (
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
              Đóng hộp thoại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnOrders;
