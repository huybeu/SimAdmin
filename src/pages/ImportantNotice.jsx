import React from 'react';
import { AlertCircle, FileText, Landmark } from 'lucide-react';

const ImportantNotice = () => {
  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">THÔNG BÁO QUAN TRỌNG</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Thông báo quan trọng</span>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header" style={{ backgroundColor: 'rgba(217, 83, 79, 0.15)', borderColor: 'rgba(217, 83, 79, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red-primary)' }}>
            <AlertCircle size={16} />
            <span>Thông báo hệ thống & Điều chỉnh chính sách quan trọng</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '25px', color: 'var(--text-main)' }}>
          
          {/* Policy Block 1 */}
          <div style={{ marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <h3 style={{ color: 'var(--red-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} />
              1. Điều chỉnh giá phôi thẻ vật lý (Hiệu lực từ 3/3/2025)
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '10px', color: 'var(--text-muted)' }}>
              Xin lưu ý rằng đơn giá cho phôi thẻ vật lý sẽ được điều chỉnh do chi phí sản xuất và logistics tăng cao:
            </p>
            <div style={{ backgroundColor: 'rgba(240, 173, 78, 0.1)', border: '1px solid rgba(240, 173, 78, 0.3)', padding: '12px 15px', borderRadius: '8px', color: 'var(--orange-primary)', fontSize: '13px' }}>
              <strong>Giá mới:</strong> NT$ 14 mỗi phôi thẻ vật lý (thân thẻ).
            </div>
          </div>

          {/* Policy Block 2 */}
          <div style={{ marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <h3 style={{ color: 'var(--red-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} />
              2. Quy định & Phí xử lý trả hàng (Hiệu lực từ 25/2/2026)
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Biểu phí dịch vụ sau đây áp dụng cho tất cả các yêu cầu trả hàng đối với eSIM và mã nạp thẻ vật lý:
            </p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Loại sản phẩm</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Trả hàng tự động (Hệ thống)</th>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)' }}>Trả hàng thủ công (Hỗ trợ viên)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px' }}><strong>eSIM (Thẻ ảo)</strong></td>
                  <td style={{ padding: '10px', color: 'var(--teal-primary)', fontWeight: '600' }}>TWD 8 / thẻ</td>
                  <td style={{ padding: '10px', color: 'var(--orange-primary)', fontWeight: '600' }}>TWD 9 / thẻ</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px' }}><strong>Thẻ vật lý nạp tiền</strong></td>
                  <td style={{ padding: '10px', color: 'var(--teal-primary)', fontWeight: '600' }}>TWD 8 / thẻ</td>
                  <td style={{ padding: '10px', color: 'var(--orange-primary)', fontWeight: '600' }}>TWD 10 / thẻ</td>
                </tr>
              </tbody>
            </table>
            
            <div style={{ backgroundColor: 'rgba(255, 82, 82, 0.08)', border: '1px solid rgba(255, 82, 82, 0.25)', padding: '12px 15px', borderRadius: '8px', color: 'var(--red-primary)', fontSize: '12px' }}>
              <strong>Chú ý:</strong> Chỉ chấp nhận trả hàng đối với các mã/thẻ chưa kích hoạt và chưa có dữ liệu tiêu hao. Khi quá trình gửi mã qua mạng hoàn tất và mã đã được sử dụng, yêu cầu trả hàng sẽ bị từ chối.
            </div>
          </div>

          {/* Policy Block 3 */}
          <div>
            <h3 style={{ color: 'var(--red-primary)', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} />
              3. Vận chuyển & Giao nhận cho đại lý tại Đài Loan
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
              Đối với tất cả các đại lý tại Đài Loan yêu cầu nhập phôi thẻ vật lý hoặc các đơn hàng thẻ số lượng lớn:
              <br />
              - Đối tác vận chuyển: <strong style={{ color: 'var(--text-main)' }}>SF Express (順豐速運)</strong>
              <br />
              - Hình thức thanh toán: <strong style={{ color: 'var(--text-main)' }}>Thanh toán khi nhận hàng (COD / 貨到付款)</strong>
              <br />
              - Lịch gửi hàng: Đơn đặt hàng được duyệt trước 14:00 PM sẽ được xuất kho và gửi đi trong cùng ngày làm việc.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ImportantNotice;
