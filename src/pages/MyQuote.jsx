import React, { useState, useEffect } from 'react';
import { Search, Trash2, Download, Upload, Star, FileText } from 'lucide-react';
import { searchMyQuotations } from '../utils/api';
import { fetchConfig, getVndPrice } from '../utils/dataStore';

const MyQuote = () => {
  const [productName, setProductName] = useState('');
  const [area, setArea] = useState('');
  const [productType, setProductType] = useState('');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    name: '',
    area: '',
    type: '',
    fav: false
  });

  const [quotes, setQuotes] = useState([]);
  const [pricingConfig, setPricingConfig] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const [res, cfg] = await Promise.all([
          searchMyQuotations(),
          fetchConfig('pricing')
        ]);
        if (cfg) setPricingConfig(cfg);
        if (res.code === 0 && res.prodList) {
          const mapped = res.prodList.map((item, idx) => {
            const rawType = item.productType === 0 ? 'eSIM' : item.productType === 1 ? 'SIM vật lý' : 'Top-Up SIM';
            return {
              id: idx + 1,
              vendor: 'SimDuLich.VN',
              name: item.productNamelang || item.productName,
              area: item.productRegion,
              type: rawType,
              price: getVndPrice(item.productPrice, item.productType, cfg),
              cPrice: getVndPrice(item.productcPrice, item.productType, cfg),
              showC: item.csight === 1 ? 'Y' : 'N',
              isFav: false
            };
          });
          setQuotes(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch quotes: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({
      name: productName,
      area: area,
      type: productType,
      fav: showFavOnly
    });
  };

  const handleClear = () => {
    setProductName('');
    setArea('');
    setProductType('');
    setShowFavOnly(false);
    setActiveFilters({
      name: '',
      area: '',
      type: '',
      fav: false
    });
  };

  const toggleFav = (id) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, isFav: !q.isFav } : q));
  };

  const filteredQuotes = quotes.filter(item => {
    const matchName = item.name.toLowerCase().includes(activeFilters.name.toLowerCase());
    const matchArea = activeFilters.area === '' || item.area === activeFilters.area;
    const matchType = activeFilters.type === '' || item.type === activeFilters.type;
    const matchFav = !activeFilters.fav || item.isFav;
    return matchName && matchArea && matchType && matchFav;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">BÁO GIÁ CỦA TÔI</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Báo giá của tôi</span>
        </div>
      </div>

      {/* Main card */}
      <div className="card">
        <div className="card-header card-header-teal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            <span>Bộ lọc tra cứu báo giá</span>
          </div>
        </div>

        <div className="card-body">
          {/* Advanced Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Tên sản phẩm</label>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Nhập tên sản phẩm..." 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Khu vực áp dụng</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="">Chọn khu vực...</option>
                  <option value="Hàn Quốc">Hàn Quốc</option>
                  <option value="Nhật Bản">Nhật Bản</option>
                  <option value="Thái Lan">Thái Lan</option>
                  <option value="Châu Âu">Châu Âu</option>
                </select>
              </div>

              <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label>Loại sản phẩm</label>
                <select 
                  className="entries-select" 
                  style={{ width: '100%', height: '30px' }}
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                >
                  <option value="">Chọn loại thẻ...</option>
                  <option value="eSIM">eSIM</option>
                  <option value="SIM vật lý">SIM vật lý</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              {/* Checkbox */}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                <input 
                  type="checkbox" 
                  checked={showFavOnly}
                  onChange={(e) => setShowFavOnly(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Chỉ hiển thị sản phẩm yêu thích</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-search btn-teal">
                  <Search size={14} />
                  <span>Tìm kiếm</span>
                </button>
                <button type="button" className="btn btn-reset btn-red" onClick={handleClear} title="Làm mới bộ lọc">
                  <Trash2 size={14} />
                </button>
                <button type="button" className="btn btn-teal" onClick={() => alert('Đang tải xuống bảng báo giá...')}>
                  <Download size={14} />
                  <span>Tải báo giá</span>
                </button>
                <button type="button" className="btn btn-blue" onClick={() => alert('Đang nhập dữ liệu báo giá...')}>
                  <Upload size={14} />
                  <span>Nhập báo giá</span>
                </button>
              </div>
            </div>

          </form>

          {/* Quotations Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>Yêu thích</th>
                  <th style={{ width: '15%' }}>Đại lý</th>
                  <th style={{ width: '35%' }}>Tên sản phẩm</th>
                  <th style={{ width: '12%' }}>Khu vực</th>
                  <th style={{ width: '10%' }}>Loại thẻ</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Giá sỉ</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Giá bán lẻ</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Hiện lẻ</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.length > 0 ? (
                  filteredQuotes.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span onClick={() => toggleFav(row.id)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                          <Star 
                            size={16} 
                            style={{ 
                              color: row.isFav ? 'var(--orange-primary)' : '#555', 
                              fill: row.isFav ? 'var(--orange-primary)' : 'none' 
                            }} 
                          />
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', color: 'var(--text-muted)' }}>{row.vendor}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px', fontWeight: '500', color: 'var(--teal-primary)' }}>{row.name}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>{row.area}</td>
                      <td className="notice-cell" style={{ padding: '12px 15px' }}>
                        {row.type}
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {row.price.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'right', color: row.cPrice > 0 ? 'var(--red-primary)' : 'var(--text-muted)' }}>
                        {row.cPrice > 0 ? `${row.cPrice.toLocaleString('vi-VN')} ₫` : '-'}
                      </td>
                      <td className="notice-cell" style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <span style={{ 
                          backgroundColor: row.showC === 'Y' ? 'rgba(32, 158, 145, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
                          color: row.showC === 'Y' ? 'var(--teal-primary)' : 'var(--text-muted)', 
                          border: row.showC === 'Y' ? '1px solid rgba(32, 158, 145, 0.25)' : '1px solid var(--border-color)',
                          padding: '2px 6px', 
                          borderRadius: '3px', 
                          fontSize: '11px',
                          fontWeight: 'bold' 
                        }}>
                          {row.showC === 'Y' ? 'Có' : 'Không'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      Không tìm thấy bản ghi báo giá phù hợp.
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

export default MyQuote;
