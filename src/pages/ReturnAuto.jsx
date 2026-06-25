import React, { useState } from 'react';
import { Search, Trash2, Zap } from 'lucide-react';

const ReturnAuto = () => {
  const [iccid, setIccid] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [cid, setCid] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!iccid && !redeemCode && !cid) {
      alert('Vui lòng nhập ít nhất một tiêu chí tìm kiếm!');
      return;
    }
    alert(`Đang truy vấn quy trình trả tự động cho: ICCID: ${iccid}, Mã Redeem: ${redeemCode}, CID: ${cid}`);
  };

  const handleReset = () => {
    setIccid('');
    setRedeemCode('');
    setCid('');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">TỰ ĐỘNG TRẢ HÀNG</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Tự động trả hàng</span>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header card-header-orange">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} />
            <span>Đơn trả hàng tự động</span>
          </div>
        </div>

        <div className="card-body">
          {/* Controls */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Mã ICCID của thẻ</label>
              <input 
                type="text" 
                className="search-input" 
                style={{ width: '100%', height: '30px' }}
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
                style={{ width: '100%', height: '30px' }}
                placeholder="Nhập mã đổi eSIM..." 
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
              />
            </div>

            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Mã nhận diện khách hàng (CID)</label>
              <input 
                type="text" 
                className="search-input" 
                style={{ width: '100%', height: '30px' }}
                placeholder="Nhập mã CID..." 
                value={cid}
                onChange={(e) => setCid(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-search btn-orange">
                <Search size={14} />
                <span>Gửi yêu cầu</span>
              </button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleReset} title="Làm mới">
                <Trash2 size={14} />
              </button>
            </div>
          </form>

          {/* Prompt/Info box */}
          <div style={{ backgroundColor: 'rgba(255, 82, 82, 0.08)', border: '1px solid rgba(255, 82, 82, 0.2)', padding: '20px', borderRadius: '8px', color: '#ff7675', fontSize: '13px', lineHeight: '1.6' }}>
            <h4 style={{ marginBottom: '8px', fontWeight: 'bold' }}>Hướng dẫn quy trình trả hàng tự động:</h4>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Vui lòng điền đúng mã ICCID, mã đổi eSIM hoặc mã khách hàng CID.</li>
              <li>Sau khi gửi yêu cầu, hệ thống sẽ tự động kiểm tra lưu lượng thực tế qua cổng API nhà mạng gốc.</li>
              <li>Nếu xác nhận chưa phát sinh bất kỳ lưu lượng dữ liệu nào, hệ thống sẽ tự động phê duyệt hoàn trả và trừ phí dịch vụ tương ứng.</li>
              <li>Nếu có vấn đề về tích hợp API, xin liên hệ bộ phận hỗ trợ kỹ thuật.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReturnAuto;
