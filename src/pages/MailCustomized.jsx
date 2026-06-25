import React, { useState } from 'react';
import { Mail, Eye, Save, Settings } from 'lucide-react';

const MailCustomized = () => {
  const [subject, setSubject] = useState('【Worldmove】Mã eSIM WorldMove của bạn đã được xuất kho');
  const [sender, setSender] = useState('WorldMove Shipping System <no-reply@fastmove.com.tw>');
  const [foreword, setForeword] = useState('Cảm ơn bạn đã mua thẻ Internet WorldMove! Dưới đây là thông tin nhận và cài đặt eSIM của bạn.');
  const [precautions, setPrecautions] = useState('1. Vui lòng kết nối mạng Wi-Fi ổn định trước khi quét mã cài đặt eSIM.\n2. Mỗi mã QR chỉ có thể quét một lần duy nhất, tuyệt đối KHÔNG xóa hồ sơ eSIM sau khi đã cài đặt.');
  const [installSteps, setInstallSteps] = useState('Bước 1: Vào mục "Cài đặt" trên điện thoại > Chọn "Di động / Mạng di động"\nBước 2: Chọn "Thêm gói cước di động / Thêm eSIM"\nBước 3: Quét mã QR Code hiển thị bên dưới để bắt đầu tải cấu hình mạng.');
  
  const [liveService, setLiveService] = useState(true);
  const [liveServiceText, setLiveServiceText] = useState('https://line.me/R/ti/p/@worldmove');
  const [liveServiceLang, setLiveServiceLang] = useState('Vietnamese');

  const [receiptSys, setReceiptSys] = useState(true);
  const [receiptSysText, setReceiptSysText] = useState('https://invoice.fastmove.com.tw/apply');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Đang lưu cấu hình mẫu thư điện tử tùy chỉnh...');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">TÙY CHỈNH EMAIL GỬI ĐI</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Tùy chỉnh email gửi đi</span>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} />
            <span>Tùy biến nội dung Email gửi khách</span>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header Settings */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Tiêu đề Email</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%', height: '32px' }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Địa chỉ người gửi hiển thị</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%', height: '32px' }}
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                />
              </div>
            </div>

            {/* Simulated CKEditor for Foreword */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Khung soạn thảo Lời mở đầu</label>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)', padding: '6px 10px', display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  <span>B</span> <i>I</i> <u>U</u> <strike>S</strike> | Phông: Roboto | Cỡ: 13px | Căn lề | Chèn Link
                </div>
                <textarea 
                  style={{ width: '100%', height: '80px', padding: '10px', border: 'none', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '13px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-main)' }}
                  value={foreword}
                  onChange={(e) => setForeword(e.target.value)}
                />
              </div>
            </div>

            {/* Parameters Block */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--teal-primary)', marginBottom: '10px', fontWeight: '600' }}>
                Danh sách biến động động (Dynamic Parameters)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', fontSize: '12px' }}>
                <div><code>{"{{Mã đơn hàng}}"}</code> : Mã đơn hàng</div>
                <div><code>{"{{Ngày đặt mua}}"}</code> : Ngày đặt mua</div>
                <div><code>{"{{Số thứ tự}}"}</code> : Số thứ tự</div>
                <div><code>{"{{Mã ICCID}}"}</code> : Mã ICCID của SIM</div>
                <div><code>{"{{Tên sản phẩm}}"}</code> : Tên gói cước/sản phẩm</div>
                <div><code>{"{{Mã Redeem}}"}</code> : Mã Redeem đổi eSIM</div>
                <div><code>{"{{Đường dẫn eSIM}}"}</code> : Đường dẫn trang đổi eSIM</div>
                <div><code>{"{{Nút tải nhanh}}"}</code> : Nút bấm thao tác nhanh</div>
              </div>
            </div>

            {/* eSIM Precautions Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Lưu ý quan trọng khi dùng eSIM</label>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)', padding: '6px 10px', display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  <span>B</span> <i>I</i> <u>U</u> <strike>S</strike> | Phông: Roboto | Cỡ: 13px | Căn lề | Chèn Link
                </div>
                <textarea 
                  style={{ width: '100%', height: '100px', padding: '10px', border: 'none', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '13px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-main)' }}
                  value={precautions}
                  onChange={(e) => setPrecautions(e.target.value)}
                />
              </div>
            </div>

            {/* eSIM Install Steps Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Các bước cài đặt chi tiết</label>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-color)', padding: '6px 10px', display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                  <span>B</span> <i>I</i> <u>U</u> <strike>S</strike> | Phông: Roboto | Cỡ: 13px | Căn lề | Chèn Link
                </div>
                <textarea 
                  style={{ width: '100%', height: '100px', padding: '10px', border: 'none', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '13px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text-main)' }}
                  value={installSteps}
                  onChange={(e) => setInstallSteps(e.target.value)}
                />
              </div>
            </div>

            {/* Toggles Row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              
              {/* 24h Customer service */}
              <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Bật kết nối hỗ trợ Line 24/7</span>
                  <input 
                    type="checkbox" 
                    checked={liveService} 
                    onChange={(e) => setLiveService(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                {liveService && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <select 
                      className="entries-select" 
                      style={{ height: '30px' }}
                      value={liveServiceLang}
                      onChange={(e) => setLiveServiceLang(e.target.value)}
                    >
                      <option value="Vietnamese">Tiếng Việt (Vietnamese)</option>
                      <option value="English">Tiếng Anh (English)</option>
                      <option value="Mandarin">Tiếng Trung (Mandarin)</option>
                    </select>
                    <input 
                      type="text" 
                      className="search-input" 
                      style={{ flex: 1, height: '30px' }}
                      placeholder="Liên kết Line chăm sóc khách hàng..."
                      value={liveServiceText}
                      onChange={(e) => setLiveServiceText(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Electronic Receipt */}
              <div style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Hệ thống đăng ký Hóa đơn/Biên lai</span>
                  <input 
                    type="checkbox" 
                    checked={receiptSys} 
                    onChange={(e) => setReceiptSys(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
                {receiptSys && (
                  <input 
                    type="text" 
                    className="search-input" 
                    style={{ width: '100%', height: '30px' }}
                    placeholder="Liên kết đăng ký hóa đơn tài chính..."
                    value={receiptSysText}
                    onChange={(e) => setReceiptSysText(e.target.value)}
                  />
                )}
              </div>

            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn btn-blue" onClick={() => alert('Đang mở bản xem trước email...')}>
                <Eye size={14} />
                <span>Xem trước</span>
              </button>
              <button type="submit" className="btn btn-teal">
                <Save size={14} />
                <span>Lưu cấu hình</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default MailCustomized;
