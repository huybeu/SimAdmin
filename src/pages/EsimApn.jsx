import React, { useState } from 'react';
import { Download, Search, RefreshCw, Cpu } from 'lucide-react';

const ESIM_DATA = [
  {
    id: 1,
    name: '【Worldmove】Đài Loan Taiwan',
    operator: 'Chunghwa Telecom',
    network: '5G/4G',
    apn: 'mobile.three.com.hk',
    partner: '3HK',
    area: 'Đài Loan',
    notes: 'Đặt lại dữ liệu hàng ngày vào 00:00 Giờ Đài Loan (UTC +8).'
  },
  {
    id: 2,
    name: '【Worldmove】Đài Loan (KYC)',
    operator: 'Chunghwa Telecom',
    network: '5G/4G',
    apn: 'mobile.three.com.hk',
    partner: '3HK',
    area: 'Đài Loan',
    notes: 'Yêu cầu KYC: Gửi thông tin tên thật tại https://kyc.esim.exchange'
  },
  {
    id: 3,
    name: '【Worldmove】Trung Quốc Đại lục',
    operator: 'China Unicom',
    network: '5G/4G',
    apn: 'mobile',
    partner: 'CSL',
    area: 'Trung Quốc Đại lục',
    notes: 'Chỉ bán ngoài lãnh thổ Trung Quốc đại lục. Dịch vụ Google/Facebook khả dụng qua chuyển vùng quốc tế.'
  },
  {
    id: 4,
    name: '【Worldmove】Nhật Bản Japan Softbank',
    operator: 'Softbank',
    network: '5G/4G',
    apn: 'plus.acs.jp',
    partner: 'Softbank',
    area: 'Nhật Bản',
    notes: 'Kích hoạt tự động. Hỗ trợ phủ sóng LTE/5G.'
  },
  {
    id: 5,
    name: '【Worldmove】Thái Lan Thailand TrueMove',
    operator: 'TrueMove H',
    network: '5G/4G',
    apn: 'internet',
    partner: 'TrueMove',
    area: 'Thái Lan',
    notes: 'Gói dữ liệu không giới hạn. Kết nối tốc độ cao.'
  }
];

const EsimApn = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = ESIM_DATA.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.apn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    alert('Đang tạo và tải xuống bảng cấu hình APN eSIM (định dạng Excel)...');
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">CẤU HÌNH APN ESIM</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">APN eSIM</span>
        </div>
      </div>

      {/* Card */}
      <div className="card">
        <div className="card-header" style={{ backgroundColor: 'rgba(32, 158, 145, 0.15)', borderColor: 'rgba(32, 158, 145, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-primary)' }}>
            <Cpu size={16} />
            <span>Bảng thông số APN eSIM</span>
          </div>
        </div>

        <div className="card-body">
          {/* Controls */}
          <div className="controls-row">
            <div className="search-group">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Tìm theo tên, nhà mạng, APN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-search" style={{ backgroundColor: 'var(--teal-primary)', color: '#070b18' }}>
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              <button className="btn btn-reset" onClick={() => setSearchTerm('')} title="Làm mới">
                <RefreshCw size={14} />
              </button>
            </div>

            <div>
              <button className="btn btn-search" style={{ backgroundColor: 'var(--teal-primary)', color: '#070b18' }} onClick={handleDownload}>
                <Download size={14} />
                <span>Tải xuống Excel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: '600', width: '25%' }}>Tên sản phẩm</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: '600', width: '20%' }}>Nhà mạng đối tác</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: '600', width: '10%' }}>Mạng hỗ trợ</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: '600', width: '15%' }}>Tên APN</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: '600', width: '10%' }}>Hub trung chuyển</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: '600', width: '20%' }}>Ghi chú / Lưu ý</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '600', color: 'var(--teal-primary)' }}>{row.name}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-main)' }}>{row.operator}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>
                        <span style={{ backgroundColor: 'rgba(0, 255, 213, 0.1)', color: 'var(--teal-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {row.network}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontFamily: 'monospace', color: 'var(--text-main)' }}>{row.apn}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-main)' }}>{row.partner}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)', fontSize: '12px' }}>{row.notes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không tìm thấy dữ liệu nhà mạng phù hợp.
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

export default EsimApn;
