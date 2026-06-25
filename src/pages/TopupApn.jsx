import React, { useState } from 'react';
import { Download, Search, RefreshCw, Layers } from 'lucide-react';

const TOPUP_DATA = [
  {
    id: 1,
    name: '【Worldmove】Đài Loan Taiwan (Thẻ nạp tiền)',
    operator: 'Chunghwa Telecom',
    network: '5G/4G',
    apn: 'mobile.three.com.hk',
    partner: '3HK',
    area: 'Đài Loan',
    notes: 'Hướng dẫn nạp tiền cho thẻ vật lý. Reset dung lượng lúc 00:00 hàng ngày (UTC +8).'
  },
  {
    id: 2,
    name: '【Worldmove】Đài Loan (KYC) (Thẻ nạp tiền)',
    operator: 'Chunghwa Telecom',
    network: '5G/4G',
    apn: 'mobile.three.com.hk',
    partner: '3HK',
    area: 'Đài Loan',
    notes: 'Yêu cầu thực danh (KYC): Gửi thông tin tại https://kyc.esim.exchange trước khi cắm thẻ vật lý.'
  },
  {
    id: 3,
    name: '【Worldmove】Hồng Kông Hong Kong (Nạp tiền)',
    operator: 'Smartone / CSL',
    network: '5G/4G',
    apn: 'smartone',
    partner: '3HK',
    area: 'Hồng Kông',
    notes: 'Tương thích với các phôi thẻ Hồng Kông tiêu chuẩn. Kết nối trực tiếp mạng nội địa.'
  }
];

const TopupApn = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = TOPUP_DATA.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.apn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    alert('Đang tạo và tải xuống bảng cấu hình APN nạp tiền (Excel format)...');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">APN NẠP TIỀN VẬT LÝ</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">APN nạp tiền vật lý</span>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header card-header-orange">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} />
            <span>Thông số APN thẻ nạp tiền vật lý</span>
          </div>
        </div>

        <div className="card-body">
          {/* Controls */}
          <div className="controls-row">
            <div className="search-group">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Tìm cấu hình nạp tiền..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-search btn-orange">
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              <button className="btn btn-reset btn-red" onClick={() => setSearchTerm('')} title="Làm mới">
                <RefreshCw size={14} />
              </button>
            </div>

            <div>
              <button className="btn btn-orange" onClick={handleDownload}>
                <Download size={14} />
                <span>Tải xuống Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ padding: '12px 15px', width: '25%' }}>Tên sản phẩm</th>
                  <th style={{ padding: '12px 15px', width: '20%' }}>Nhà mạng đối tác</th>
                  <th style={{ padding: '12px 15px', width: '10%' }}>Mạng hỗ trợ</th>
                  <th style={{ padding: '12px 15px', width: '15%' }}>Tên APN</th>
                  <th style={{ padding: '12px 15px', width: '10%' }}>Hub trung chuyển</th>
                  <th style={{ padding: '12px 15px', width: '20%' }}>Ghi chú / Lưu ý</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '500', color: 'var(--orange-primary)' }}>{row.name}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>{row.operator}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>
                        <span style={{ 
                          backgroundColor: 'rgba(255, 159, 67, 0.15)', 
                          color: 'var(--orange-primary)', 
                          border: '1px solid rgba(255, 159, 67, 0.25)', 
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '11px', 
                          fontWeight: 'bold' 
                        }}>
                          {row.network}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontFamily: 'monospace' }}>{row.apn}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>{row.partner}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)', fontSize: '12px' }}>{row.notes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không tìm thấy cấu hình APN nạp tiền phù hợp.
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

export default TopupApn;
