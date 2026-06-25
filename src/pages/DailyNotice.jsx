import React, { useState } from 'react';
import { Search, Trash2, PlusCircle, MinusCircle } from 'lucide-react';

const MOCK_NOTICES = [
  {
    id: 1,
    date: '2026/06/24 09:24:43',
    title: 'Cập nhật tự động hóa phân phối hồ sơ eSIM',
    content: 'Chúng tôi đã cập nhật hệ thống phân phối eSIM tự động. Tất cả các đơn hàng được đặt qua API hiện sẽ nhận được mã QR và chi tiết SM-DP+ trong vòng 15 giây. Vui lòng đảm bảo hệ thống của bạn phân tích cú pháp tải trọng dữ liệu chính xác.'
  },
  {
    id: 2,
    date: '2026/06/24 09:17:26',
    title: 'Lịch bảo trì định kỳ của nhà mạng Softbank & KDDI Nhật Bản',
    content: 'Softbank & KDDI sẽ tiến hành bảo trì mạng theo lịch trình vào ngày 27 tháng 6 từ 01:00 AM đến 04:00 AM JST. Trong thời gian này, người dùng ở Nhật Bản có thể bị mất tín hiệu ngắn. Kết nối dữ liệu sẽ tự động phục hồi sau bảo trì.'
  },
  {
    id: 3,
    date: '2026/06/22 17:41:44',
    title: 'Hướng dẫn thiết lập APN mới cho các gói chuyển vùng Châu Âu & Vương Quốc Anh',
    content: 'Đối với tất cả các SIM chuyển vùng Châu Âu mới, vui lòng hướng dẫn khách hàng cấu hình APN của họ là "mobile.three.com.hk" (Tên đăng nhập/Mật khẩu: để trống) nếu tự động kích hoạt thất bại. Chuyển vùng dữ liệu phải được bật trong cài đặt thiết bị.'
  },
  {
    id: 4,
    date: '2026/06/17 16:39:30',
    title: 'Tối ưu hóa tài nguyên mạng Mobifone & Vinaphone Việt Nam',
    content: 'Tối ưu hóa định tuyến mạng đã được triển khai thành công cho các gói cước Việt Nam. Độ trễ đã giảm 40ms và tốc độ tải xuống hiện đạt mức đỉnh 120 Mbps dưới vùng phủ sóng 5G.'
  },
  {
    id: 5,
    date: '2026/06/16 15:07:31',
    title: 'Cập nhật cổng API nạp tiền và xem xét biểu giá',
    content: 'Biểu giá nạp tiền số lượng lớn mới cho các gói cước Mỹ, Canada và Thái Lan đã được cập nhật. Phiên bản API schema 2.4 mới nhất hiện đã hoạt động. Kiểm tra tab Tài liệu để biết thêm chi tiết triển khai.'
  },
  {
    id: 6,
    date: '2026/06/15 14:26:52',
    title: 'Tối ưu hóa phân phối email mã QR eSIM',
    content: 'Chúng tôi đã tối ưu hóa các máy chủ gửi email để tránh bộ lọc thư rác của Gmail và Outlook. Tất cả các tệp đính kèm PDF hiện được nén dưới 150KB. Vui lòng thông báo cho khách hàng kiểm tra hòm thư rác nếu email bị chậm.'
  },
  {
    id: 7,
    date: '2026/06/15 09:09:00',
    title: 'Thông báo chuyển đổi đối tác mạng Hàn Quốc',
    content: 'Bắt đầu từ tuần tới, cấu hình chuyển vùng Hàn Quốc sẽ mặc định chuyển sang KT (Korea Telecom) để có vùng phủ sóng tín hiệu mạnh hơn ngoài các khu vực đô thị lớn. SKT vẫn khả dụng dưới dạng chọn nhà mạng thủ công.'
  },
  {
    id: 8,
    date: '2026/06/12 16:15:28',
    title: 'Nâng cấp cơ sở dữ liệu cổng thanh toán',
    content: 'Cổng xử lý thanh toán của chúng tôi (Stripe/PayPal) sẽ nâng cấp cơ sở dữ liệu vào ngày 15 tháng 6 từ 02:00 đến 03:00 UTC. Các giao dịch trực tuyến có thể thất bại trong thời gian này. Chúng tôi khuyến nghị nạp tiền trước lịch bảo trì.'
  },
  {
    id: 9,
    date: '2026/06/11 10:18:03',
    title: 'Mở rộng vùng phủ sóng 5G của Optus Australia',
    content: 'Chúng tôi rất vui mừng thông báo rằng tốc độ chuyển vùng 5G hiện đã được hỗ trợ chính thức trên mạng Optus khắp Australia. Hãy chắc chắn rằng thiết bị của khách hàng đã bật 5G trong cài đặt mạng.'
  },
  {
    id: 10,
    date: '2026/06/10 17:35:52',
    title: 'Cập nhật chính sách hoàn tiền đối với eSIM chưa kích hoạt',
    content: 'Yêu cầu hoàn tiền cho các cấu hình eSIM chưa kích hoạt phải được gửi trong vòng 30 ngày kể từ ngày mua. Sau khi cấu hình đã được tải xuống (cài đặt) trên điện thoại, việc hoàn tiền sẽ không còn khả dụng do chi phí kích hoạt từ nhà mạng.'
  }
];

const DailyNotice = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  // Toggle expansion of a row
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter notices
  const filteredNotices = MOCK_NOTICES.filter(notice => {
    const keyword = currentSearch.toLowerCase();
    return (
      notice.date.toLowerCase().includes(keyword) ||
      notice.title.toLowerCase().includes(keyword) ||
      notice.content.toLowerCase().includes(keyword)
    );
  });

  // Pagination calculation
  const totalEntries = filteredNotices.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filteredNotices.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentSearch(searchKeyword);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setCurrentSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">THÔNG BÁO HÀNG NGÀY</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Thông báo hàng ngày</span>
        </div>
      </div>

      {/* Main card */}
      <div className="card">
        {/* Table header teal block */}
        <div className="card-header">
          <span>Thông báo hàng ngày</span>
        </div>

        <div className="card-body">
          {/* Controls row */}
          <form className="controls-row" onSubmit={handleSearch}>
            <div className="search-group">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Nhập từ khóa tìm kiếm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="btn btn-search">
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              <button type="button" className="btn btn-reset" onClick={handleReset} title="Làm mới">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="entries-group">
              <span>Hiển thị</span>
              <select 
                className="entries-select" 
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>dòng</span>
            </div>
          </form>

          {/* Notices list table */}
          <table className="notices-table">
            <thead>
              <tr>
                <th style={{ width: '100%' }}>Ngày phát hành (Publication Date)</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length > 0 ? (
                currentEntries.map((notice) => {
                  const isExpanded = expandedRows[notice.id];
                  return (
                    <React.Fragment key={notice.id}>
                      <tr 
                        className="notice-row-header"
                        onClick={() => toggleRow(notice.id)}
                      >
                        <td className="notice-cell">
                          <div className="notice-date-cell">
                            <span className={`toggle-icon-container ${isExpanded ? 'expanded' : ''}`}>
                              {isExpanded ? (
                                <MinusCircle size={15} style={{ fill: '#ffffff', color: '#209e91' }} />
                              ) : (
                                <PlusCircle size={15} style={{ fill: '#ffffff', color: '#209e91' }} />
                              )}
                            </span>
                            <span>{notice.date}</span>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="notice-details-row">
                          <td className="notice-details-cell">
                            <h4 style={{ marginBottom: '8px', color: '#209e91' }}>{notice.title}</h4>
                            <p>{notice.content}</p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td className="notice-cell" style={{ textAlign: 'center', color: '#999', padding: '30px' }}>
                    Không tìm thấy thông báo phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination row */}
          {totalEntries > 0 && (
            <div className="pagination-row">
              <div>
                Hiển thị từ {startIndex + 1} đến {endIndex} trong tổng số {totalEntries} dòng
              </div>

              <div className="pagination-controls">
                <button 
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button 
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyNotice;
