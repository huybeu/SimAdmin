import React, { useState } from 'react';
import { Search, Trash2, HelpCircle, ShieldCheck, Wifi, Layers, Calendar, Cpu } from 'lucide-react';
import { queryUsage, queryBasicInfo, queryEsimProgresses } from '../utils/api';

const InquiryService = () => {
  const [iccid, setIccid] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);

  // API result states
  const [basicInfo, setBasicInfo] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [progressEvents, setProgressEvents] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!iccid && !redeemCode && !cid) {
      alert('Vui lòng nhập ít nhất một trường để tìm kiếm!');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const basicRes = await queryBasicInfo(redeemCode, iccid, cid);
      const usageRes = await queryUsage('', redeemCode, iccid, cid, '');
      const progressRes = await queryEsimProgresses(redeemCode, iccid, cid);

      if (basicRes.code === 0) setBasicInfo(basicRes);
      else setBasicInfo(null);

      if (usageRes.code === 0) setUsageData(usageRes);
      else setUsageData(null);

      if (progressRes.code === 0 && progressRes.esimProgresses) {
        setProgressEvents(progressRes.esimProgresses);
      } else {
        setProgressEvents([]);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tra cứu dữ liệu API!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIccid('');
    setRedeemCode('');
    setCid('');
    setBasicInfo(null);
    setUsageData(null);
    setProgressEvents([]);
    setSearched(false);
  };

  const getEsimStatusBadge = (status) => {
    switch (status) {
      case 1:
        return <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Active (Đang hoạt động)</span>;
      case 2:
        return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Invalid (Hết hạn/Vô hiệu)</span>;
      default:
        return <span style={{ backgroundColor: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Unknown (Không rõ)</span>;
    }
  };

  const getCouponStatusBadge = (status) => {
    const statuses = {
      0: 'Not enabled',
      1: 'Unused (Chưa dùng)',
      2: 'Used (Đã kích hoạt)',
      3: 'Occupied',
      4: 'Voided',
      5: 'Expired',
      6: 'Invalid'
    };
    const isUsed = status === 2;
    return (
      <span style={{ 
        backgroundColor: isUsed ? 'rgba(32, 158, 145, 0.15)' : 'rgba(240, 173, 78, 0.15)', 
        color: isUsed ? 'var(--teal-primary)' : 'var(--orange-primary)', 
        border: isUsed ? '1px solid rgba(32, 158, 145, 0.3)' : '1px solid rgba(240, 173, 78, 0.3)',
        padding: '2px 8px', 
        borderRadius: '4px', 
        fontSize: '11px', 
        fontWeight: 'bold' 
      }}>
        {statuses[status] || 'Unknown'}
      </span>
    );
  };

  const getNotificationPointText = (pointId) => {
    const points = {
      3: 'Tải cấu hình Profile (Profile download notice)',
      4: 'Cài đặt Profile (Profile install notice)',
      5: 'Xóa Profile (Delete notice)',
      6: 'Bật gói cước (Profile enable notice)',
      7: 'Tắt gói cước (Profile disable notice)',
      101: 'Thiết bị thuộc Blacklist (EID blacklist)',
      102: 'Mã TAC thuộc Blacklist (TAC blacklist)'
    };
    return points[pointId] || `Sự kiện khác (${pointId})`;
  };

  const formatBytes = (bytes) => {
    const b = Number(bytes);
    if (isNaN(b) || b === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(Number(timestamp));
    return date.toLocaleString();
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">DỊCH VỤ TRA CỨU</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Dịch vụ tra cứu</span>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={16} />
            <span>Tra cứu trạng thái & Dung lượng gói cước</span>
          </div>
        </div>

        <div className="card-body">
          {/* Controls */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label>Mã số ICCID thẻ</label>
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
              <button type="submit" className="btn btn-search btn-orange" disabled={loading}>
                <Search size={14} />
                <span>{loading ? 'Đang gọi API...' : 'Tra cứu'}</span>
              </button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleReset} title="Làm mới">
                <Trash2 size={14} />
              </button>
            </div>
          </form>

          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--teal-primary)' }}>
              Đang truy vấn dữ liệu từ cổng API WorldMove... Vui lòng đợi.
            </div>
          )}

          {!loading && searched && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '25px' }}>
              
              {/* Basic Info panel */}
              {basicInfo ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--teal-primary)', fontWeight: 'bold' }}>
                      <ShieldCheck size={16} />
                      <span>Thông tin thẻ eSIM</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mã số thẻ (CID):</span>
                        <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{basicInfo.cid}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Vòng đời thẻ (Lifecycle):</span>
                        {getEsimStatusBadge(basicInfo.status)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mã Coupon (CouponStatus):</span>
                        {getCouponStatusBadge(basicInfo.couponStatus)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Đơn vị cấp phát:</span>
                        <span>{basicInfo.firmName}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--orange-primary)', fontWeight: 'bold' }}>
                      <Cpu size={16} />
                      <span>Thiết bị cài đặt</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Dòng máy sử dụng:</span>
                        <span style={{ fontWeight: '500' }}>{basicInfo.device || 'Chưa thiết lập'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Mã thiết bị (EID):</span>
                        <span style={{ fontWeight: '500', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', maxWidth: '180px', textAlign: 'right' }}>
                          {basicInfo.eid || 'Chưa thiết lập'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ngày bắt đầu dùng:</span>
                        <span>{usageData ? formatDate(usageData.useSDate) : '-'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ngày kết thúc gói:</span>
                        <span>{usageData ? formatDate(usageData.useEDate) : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', backgroundColor: 'rgba(255,82,82,0.05)', border: '1px solid rgba(255,82,82,0.15)', borderRadius: '6px', color: 'var(--red-primary)', textAlign: 'center' }}>
                  Không tìm thấy thông tin eSIM tương ứng trên hệ thống WorldMove.
                </div>
              )}

              {/* Data Usage & Country Logs */}
              {usageData && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-primary)', fontWeight: 'bold' }}>
                      <Wifi size={16} />
                      <span>Nhật ký truyền tải dữ liệu & Chuyển vùng</span>
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      <span>Tổng lưu lượng tích lũy: </span>
                      <strong style={{ color: 'var(--orange-primary)' }}>{formatBytes(usageData.totalUsage)}</strong>
                    </div>
                  </div>

                  <table className="notices-table">
                    <thead>
                      <tr>
                        <th>Ngày sử dụng</th>
                        <th>Mã Quốc gia (MCC)</th>
                        <th>ISO Code</th>
                        <th>Khu vực (ZH)</th>
                        <th>Khu vực (EN)</th>
                        <th style={{ textAlign: 'right' }}>Lưu lượng tiêu thụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageData.itemList && usageData.itemList.length > 0 ? (
                        usageData.itemList.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td className="notice-cell" style={{ fontFamily: 'monospace' }}>
                              {item.usageDate.substr(0,4)}/{item.usageDate.substr(4,2)}/{item.usageDate.substr(6,2)}
                            </td>
                            <td className="notice-cell">{item.mcc}</td>
                            <td className="notice-cell" style={{ fontWeight: 'bold' }}>{item.code}</td>
                            <td className="notice-cell">{item.zhtw}</td>
                            <td className="notice-cell">{item.enus}</td>
                            <td className="notice-cell" style={{ textAlign: 'right', fontWeight: '500', color: 'var(--orange-primary)' }}>
                              {formatBytes(item.usage)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            Chưa có dữ liệu tiêu hao gói cước.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Progress Events Timeline */}
              {progressEvents.length > 0 && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--teal-primary)', fontWeight: 'bold' }}>
                    <Layers size={16} />
                    <span>Lịch sử tiến trình cài đặt & Trực quan hóa eSIM trên thiết bị</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '10px', borderLeft: '2px solid #2d3748', marginLeft: '5px' }}>
                    {progressEvents.map((evt, idx) => (
                      <div key={idx} style={{ position: 'relative', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        {/* Dot indicator */}
                        <div style={{ 
                          position: 'absolute', 
                          left: '-16px', 
                          top: '4px', 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--teal-primary)',
                          boxShadow: '0 0 8px var(--teal-primary)'
                        }} />
                        
                        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '5px' }}>
                            <strong style={{ color: '#fff', fontSize: '13px' }}>{getNotificationPointText(evt.notificationPointid)}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={10} />
                              {evt.progressDate}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Mã đầu ghi EID: <span style={{ fontFamily: 'monospace' }}>{evt.eid}</span></span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{evt.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Guide panel */}
          {!searched && (
            <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.08)', border: '1px solid rgba(52, 152, 219, 0.2)', padding: '20px', borderRadius: '8px', color: '#68b3cf', fontSize: '13px', lineHeight: '1.6', marginTop: '20px' }}>
              <h4 style={{ marginBottom: '8px', fontWeight: 'bold' }}>Hướng dẫn tra cứu thông tin sử dụng:</h4>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Dịch vụ tra cứu này cung cấp thông tin trạng thái hoạt động của thẻ, dung lượng còn lại, dung lượng đã dùng và nhật ký kết nối của nhà mạng chuyển vùng nước ngoài.</li>
                <li>Thông tin dữ liệu sử dụng có thể bị trễ 5 - 10 phút tùy thuộc vào phản hồi kết nối từ phía nhà mạng viễn thông quốc tế.</li>
                <li>Nếu phát hiện thẻ chưa kích hoạt hoặc không hiển thị dữ liệu, vui lòng kiểm tra xem APN của điện thoại đã được đặt cấu hình đúng hay chưa.</li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default InquiryService;
