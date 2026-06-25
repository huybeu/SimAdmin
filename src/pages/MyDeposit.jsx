import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Plus, X, Heart, CheckCircle, AlertCircle, Upload, Zap, RefreshCw } from 'lucide-react';
import { topupSim, remoteActivation, trafficReset, verifySimCard, searchMyQuotations, getApiConfig } from '../utils/api';
import PlanSelectorPanel from '../components/PlanSelectorPanel';

// Tên tài khoản hiển thị duy nhất ở ô Company (theo môi trường đang kết nối)
function getAccountName() {
  return getApiConfig().environment === 'prod' ? 'SimDuLich.VN' : 'SDL';
}

// Map WorldMove catalog → top-up plan list (dùng wmproductId thật).
// productType === 2 là gói top-up; lọc theo productType vì cờ leSIM không đáng tin.
function mapTopupPlans(prodList) {
  const mk = (p) => ({
    wmproductId: p.wmproductId,
    productName: p.productName,
    region:      p.productRegion || '',
    applicable:  p.productRegion || '',
    price:       p.productPrice,
    isFav:       false,
  });
  return prodList.filter(p => p.productType === 2).map(mk);
}

// localStorage key for persisting placed top-up orders
const DEPOSITS_KEY = 'simadmin_my_topups';

// Mock history data matching real system
const MOCK_DEPOSITS = [
  { id: 1, orderId: 'b0000a2top260618007', date: '2026/06/18 09:28:47', quantity: 2, status: 'Success', history: 'Dealer recharge successfully' },
  { id: 2, orderId: 'b0000a2top260618006', date: '2026/06/18 09:21:59', quantity: 2, status: 'Success', history: 'Dealer recharge successfully' },
  { id: 3, orderId: 'b0000a2top260610003', date: '2026/06/10 14:12:05', quantity: 10, status: 'Success', history: 'Dealer recharge successfully' },
  { id: 4, orderId: 'b0000a2top260608001', date: '2026/06/08 17:35:12', quantity: 5, status: 'Success', history: 'Dealer recharge successfully' },
];

// Mock top-up plans (1984 plans in reality)
const MOCK_TOPUP_PLANS = [
  { wmproductId: 'WM_CN_T01', productName: 'Mainland China, 1GB /day, 128kbps', region: 'China', applicable: 'Asia', price: 18, isFav: true },
  { wmproductId: 'WM_CN_T02', productName: 'Mainland China, 2GB /day, 128kbps', region: 'China', applicable: 'Asia', price: 25, isFav: true },
  { wmproductId: 'WM_CN_T03', productName: 'Mainland China, 3GB /day, 128kbps', region: 'China', applicable: 'Asia', price: 32, isFav: true },
  { wmproductId: 'WM_CN_T04', productName: 'Mainland China, Unlimited data /day', region: 'China', applicable: 'Asia', price: 45, isFav: true },
  { wmproductId: 'WM_EU_T01', productName: 'BICS Europe, 3GB /day, 128kbps', region: 'Europe', applicable: 'Europe', price: 55, isFav: false },
  { wmproductId: 'WM_EU_T02', productName: 'BICS Europe, 10GB /day, 128kbps', region: 'Europe', applicable: 'Europe', price: 75, isFav: false },
  { wmproductId: 'WM_EU_T03', productName: 'BICS Europe, 15 Days, 10GB, 128kbps', region: 'Europe', applicable: 'Europe', price: 90, isFav: false },
  { wmproductId: 'WM_EU_T04', productName: 'BICS Europe, 15 Days, 20GB, 128kbps', region: 'Europe', applicable: 'Europe', price: 110, isFav: false },
  { wmproductId: 'WM_EU_T05', productName: 'BICS Europe, 15 Days, 3GB, 128kbps', region: 'Europe', applicable: 'Europe', price: 70, isFav: false },
  { wmproductId: 'WM_EU_T06', productName: 'BICS Europe, 15 Days, 5GB, 128kbps', region: 'Europe', applicable: 'Europe', price: 80, isFav: false },
  { wmproductId: 'WM_EU_T07', productName: 'BICS Europe, 1GB /day, 128kbps', region: 'Europe', applicable: 'Europe', price: 60, isFav: false },
  { wmproductId: 'WM_JP_T01', productName: 'Japan, 1GB /day, 128kbps', region: 'Japan', applicable: 'Asia', price: 40, isFav: true },
  { wmproductId: 'WM_JP_T02', productName: 'Japan, 3GB /day, 128kbps', region: 'Japan', applicable: 'Asia', price: 55, isFav: true },
  { wmproductId: 'WM_KR_T01', productName: 'Korea, 1GB /day, 128kbps', region: 'Korea', applicable: 'Asia', price: 38, isFav: true },
  { wmproductId: 'WM_KR_T02', productName: 'Korea, 3GB /day, 128kbps', region: 'Korea', applicable: 'Asia', price: 50, isFav: false },
];

const APPLICABLE_OPTIONS = ['Applicable Region', 'Asia', 'Europe', 'America', 'Global', 'Oceania', 'Middle East'];

const MyDeposit = () => {
  // --- List filters ---
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterCardNum, setFilterCardNum] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('2026-06-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-06-30');
  const [activeFilters, setActiveFilters] = useState({ orderId: '', cardNum: '' });
  const [deposits, setDeposits] = useState(() => {
    try {
      const saved = localStorage.getItem(DEPOSITS_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return MOCK_DEPOSITS;
  });
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Persist top-up orders to localStorage (SimAdmin has no backend).
  useEffect(() => {
    try { localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits)); } catch { /* ignore */ }
  }, [deposits]);

  // --- Modal ---
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState('multiple'); // 'multiple' | 'batch'

  // Plan list — loaded from real WorldMove catalog (fallback = mock).
  const [topupPlans, setTopupPlans] = useState(MOCK_TOPUP_PLANS);

  // Plan favorites
  const [planFavs, setPlanFavs] = useState(() => {
    const m = {};
    MOCK_TOPUP_PLANS.forEach(p => { m[p.wmproductId] = p.isFav; });
    return m;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await searchMyQuotations();
        if (cancelled || res.code !== 0 || !res.prodList?.length) return;
        const plans = mapTopupPlans(res.prodList);
        if (!plans.length) return;
        setTopupPlans(plans);
        const m = {};
        plans.forEach(p => { m[p.wmproductId] = p.isFav; });
        setPlanFavs(m);
      } catch (err) {
        console.error('Catalog load failed, using mock plans:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Cart rows: [{ plan, days, simNums: ['', '', ...] }]
  const [cartRows, setCartRows] = useState([]);
  const [company, setCompany] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Batch top-up
  const [batchFile, setBatchFile] = useState(null);
  const fileRef = useRef(null);

  // Order detail modal
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [detailTab, setDetailTab] = useState('info'); // 'info' | 'history'

  const accountName = getAccountName();

  // Verify
  const [verifyTarget, setVerifyTarget] = useState(null); // { rowIdx, simIdx }
  const [verifyStatus, setVerifyStatus] = useState({}); // key: `${rowIdx}-${simIdx}` → 'valid'|'invalid'

  // Callback
  useEffect(() => {
    const handle = (e) => {
      if (e.detail.callbackType === 'deposit') {
        const { orderId, itemList } = e.detail.payload;
        setDeposits(prev => prev.map(d => d.orderId === orderId
          ? { ...d, status: 'Success', history: 'Dealer recharge successfully' }
          : d));
      }
    };
    window.addEventListener('api-callback-received', handle);
    return () => window.removeEventListener('api-callback-received', handle);
  }, []);

  // --- List logic ---
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({ orderId: filterOrderId, cardNum: filterCardNum });
  };
  const handleClear = () => {
    setFilterOrderId(''); setFilterCardNum('');
    setFilterStartDate('2026-06-01'); setFilterEndDate('2026-06-30');
    setActiveFilters({ orderId: '', cardNum: '' });
  };
  const filteredDeposits = deposits.filter(d =>
    d.orderId.toLowerCase().includes(activeFilters.orderId.toLowerCase())
  );



  // Add plan to cart (creates new row with 1 empty SIM slot)
  const addPlanToCart = (plan) => {
    setCartRows(prev => {
      const existing = prev.findIndex(r => r.plan.wmproductId === plan.wmproductId);
      if (existing >= 0) {
        // Add one more SIM slot to that row
        return prev.map((r, i) => i === existing ? { ...r, simNums: [...r.simNums, ''] } : r);
      }
      return [...prev, { plan, days: 1, simNums: [''] }];
    });
  };

  const updateDays = (rowIdx, val) => {
    const n = Math.min(30, Math.max(1, parseInt(val) || 1));
    setCartRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, days: n } : r));
  };

  const updateSim = (rowIdx, simIdx, val) => {
    setCartRows(prev => prev.map((r, i) => i === rowIdx
      ? { ...r, simNums: r.simNums.map((s, j) => j === simIdx ? val : s) }
      : r));
  };

  const addSimSlot = (rowIdx) => {
    setCartRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, simNums: [...r.simNums, ''] } : r));
  };

  const removeSimSlot = (rowIdx, simIdx) => {
    setCartRows(prev => prev.map((r, i) => i === rowIdx
      ? { ...r, simNums: r.simNums.filter((_, j) => j !== simIdx) }
      : r).filter(r => r.simNums.length > 0));
  };

  const removeRow = (rowIdx) => setCartRows(prev => prev.filter((_, i) => i !== rowIdx));

  const totalQty = cartRows.reduce((s, r) => s + r.simNums.filter(Boolean).length, 0);
  const totalPrice = cartRows.reduce((s, r) => s + r.plan.price * r.simNums.filter(Boolean).length, 0);

  const handleVerify = async (rowIdx, simIdx) => {
    const simNum = cartRows[rowIdx].simNums[simIdx];
    if (!simNum) return;
    const key = `${rowIdx}-${simIdx}`;
    setVerifyStatus(prev => ({ ...prev, [key]: 'checking' }));
    try {
      const res = await verifySimCard(simNum);
      setVerifyStatus(prev => ({ ...prev, [key]: res.code === 0 ? 'valid' : 'invalid' }));
    } catch { setVerifyStatus(prev => ({ ...prev, [key]: 'invalid' })); }
  };

  const resetModal = () => {
    setCartRows([]); setCompany(''); setNote(''); setBatchFile(null);
    setVerifyStatus({});
  };

  const handleSubmit = async () => {
    const validRows = cartRows.filter(r => r.simNums.some(Boolean));
    if (validRows.length === 0) { alert('Vui lòng thêm ít nhất 1 gói và nhập số SIM!'); return; }
    if (!company) { alert('Vui lòng chọn Công ty (tài khoản)!'); return; }
    setSubmitting(true);
    try {
      const prodList = validRows.flatMap(r =>
        r.simNums.filter(Boolean).map(simNum => ({ wmproductId: r.plan.wmproductId, day: r.days, simNum }))
      );
      const res = await topupSim(prodList);
      if (res.code === 0 && res.orderId) {
        const now = new Date().toLocaleString('sv').replace('T', ' ').substr(0, 19);
        const items = validRows.flatMap(r =>
          r.simNums.filter(Boolean).map(sn => ({
            productName: r.plan.productName, price: r.plan.price, day: r.days, sn, status: 'Success'
          }))
        );
        const newDep = {
          id: Date.now(), orderId: res.orderId,
          date: now,
          quantity: prodList.length, status: 'Success',
          history: `top-up success by ${company || 'company'} ${now}`,
          productType: 'Top-Up SIM', company, note, items
        };
        setDeposits(prev => [newDep, ...prev]);
        setShowModal(false); resetModal();
        alert(`Top-Up submitted!\nOrder ID: ${res.orderId}\nTotal: ${prodList.length} SIMs`);
      } else {
        alert('Top-Up failed: ' + (res.msg || 'Unknown error'));
      }
    } catch { alert('API connection error!'); }
    finally { setSubmitting(false); }
  };

  const triggerActivation = async (simNum, orderId) => {
    if (!window.confirm(`Remote activate SIM ${simNum}?`)) return;
    try {
      const res = await remoteActivation(simNum, orderId);
      alert(res.code === 0 ? 'Activation sent successfully!' : 'Failed: ' + res.msg);
    } catch { alert('Connection error!'); }
  };

  const triggerReset = async (simNum, orderId) => {
    if (!window.confirm(`Reset traffic for SIM ${simNum}?`)) return;
    try {
      const res = await trafficReset(simNum, orderId);
      alert(res.code === 0 ? 'Traffic reset requested!' : 'Failed: ' + res.msg);
    } catch { alert('Connection error!'); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">MY TOP-UP</h1>
        <div className="breadcrumbs">
          <span>Home</span><span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">My Top-Up</span>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Filters */}
          <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input type="text" className="search-input" style={{ flex: '1 1 180px' }}
                placeholder="Order number" value={filterOrderId} onChange={e => setFilterOrderId(e.target.value)} />
              <input type="text" className="search-input" style={{ flex: '1 1 180px' }}
                placeholder="SIM Card Number" value={filterCardNum} onChange={e => setFilterCardNum(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="search-input" style={{ flex: '0 1 160px' }}
                value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <input type="date" className="search-input" style={{ flex: '0 1 160px' }}
                value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
              <button type="submit" className="btn btn-search btn-teal" style={{ padding: '6px 18px' }}>Search</button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleClear} title="Clear">
                <Trash2 size={14} />
              </button>
            </div>
          </form>

          {/* Add button */}
          <button className="btn btn-teal" style={{ marginBottom: '16px', padding: '7px 20px', fontWeight: 'bold' }}
            onClick={() => { setShowModal(true); setModalTab('multiple'); }}>
            Add
          </button>

          {/* Show entries */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Show
            <select className="entries-select" style={{ height: '26px', width: '60px' }}
              value={entriesPerPage} onChange={e => setEntriesPerPage(Number(e.target.value))}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            entries
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px' }}>Order number ↕</th>
                  <th style={{ padding: '10px 14px' }}>Order Date ↕</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Quantity ↕</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status ↕</th>
                  <th style={{ padding: '10px 14px' }}>Lastest History ↕</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.slice(0, entriesPerPage).length > 0 ? (
                  filteredDeposits.slice(0, entriesPerPage).map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="notice-cell" style={{ padding: '10px 14px', color: 'var(--teal-primary)', fontFamily: 'monospace', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => { setSelectedDeposit(row); setDetailTab('info'); }}>{row.orderId}</td>
                      <td className="notice-cell" style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{row.date}</td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>{row.quantity}</td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ background: row.status === 'Success' ? 'rgba(32,158,145,0.15)' : 'rgba(240,173,78,0.15)', color: row.status === 'Success' ? 'var(--teal-primary)' : 'var(--orange-primary)', border: `1px solid ${row.status === 'Success' ? 'rgba(32,158,145,0.25)' : 'rgba(240,173,78,0.25)'}`, padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                          {row.status}
                        </span>
                      </td>
                      <td className="notice-cell" style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '12px' }}>{row.history}</td>
                      <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button className="btn btn-teal" style={{ height: '22px', padding: '0 8px', fontSize: '10px', gap: '3px' }}
                            onClick={() => triggerActivation('89851100002002001111', row.orderId)} title="Remote Activation">
                            <Zap size={10} /><span>Activate</span>
                          </button>
                          <button className="btn btn-orange" style={{ height: '22px', padding: '0 8px', fontSize: '10px', gap: '3px' }}
                            onClick={() => triggerReset('89851100002002001111', row.orderId)} title="Traffic Reset">
                            <RefreshCw size={10} /><span>Reset</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Showing 1 to {Math.min(entriesPerPage, filteredDeposits.length)} of {filteredDeposits.length} entries</span>
          </div>
        </div>
      </div>

      {/* ===================== TOP-UP MODAL ===================== */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px' }}>
          <div style={{ background: '#fff', color: '#333', borderRadius: '8px', width: '92vw', maxWidth: '1100px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

            {/* Modal header — tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', gap: '0' }}>
                {[['multiple', 'Multiple Top-Up'], ['batch', 'Batch Top-Up']].map(([key, label]) => (
                  <button key={key} onClick={() => { setModalTab(key); setCartRows([]); }}
                    style={{ padding: '6px 22px', border: '1px solid #ccc', cursor: 'pointer', background: modalTab === key ? '#1a9e8e' : '#f5f5f5', color: modalTab === key ? 'white' : '#555', fontWeight: modalTab === key ? 'bold' : 'normal', borderRadius: key === 'multiple' ? '4px 0 0 4px' : '0 4px 4px 0', fontSize: '13px' }}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowModal(false); resetModal(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={20} />
              </button>
            </div>

            {modalTab === 'batch' ? (
              /* ── BATCH TOP-UP ── */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '16px', overflowY: 'auto' }}>
                <div style={{ background: '#e8f7f5', border: '1px solid #b2dfdb', borderRadius: '6px', padding: '12px 16px', fontSize: '12px', color: '#2e7d62', lineHeight: '1.9' }}>
                  <div><strong>Reminder:</strong></div>
                  <div>※ To recharge more card numbers, please select "Batch Top-Up" in the top left corner and import the Excel file.</div>
                  <div>※ Assuming the product specification is 4 days, which represents one cycle of 4 days. If the number of days entered = 2, it would be equivalent to the product specification of 4 days * 2 cycles, resulting in 8 days.</div>
                  <div>※ The recharge period cannot exceed 30 days.</div>
                  <div>※ The number of recharge cards must not exceed 500 and there should be no duplicate card numbers.</div>
                </div>
                <div style={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
                  onClick={() => fileRef.current?.click()}>
                  <Upload size={32} style={{ color: '#1a9e8e', marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', color: '#555' }}>Click to upload Excel file (.xlsx)</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Max 500 SIM numbers, no duplicates</div>
                  {batchFile && <div style={{ marginTop: '10px', color: '#1a9e8e', fontWeight: 'bold' }}>📄 {batchFile.name}</div>}
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                    onChange={e => setBatchFile(e.target.files[0])} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ padding: '8px 28px', background: '#1a9e8e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                    disabled={!batchFile} onClick={() => alert('Batch import: ' + batchFile?.name)}>
                    Upload & Process
                  </button>
                </div>
              </div>
            ) : (
              /* ── MULTIPLE TOP-UP ── */
              <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* LEFT: Plan selector — using shared PlanSelectorPanel */}
                <PlanSelectorPanel
                  plans={topupPlans}
                  onAdd={addPlanToCart}
                  favs={planFavs}
                  onToggleFav={(id) => setPlanFavs(p => ({ ...p, [id]: !p[id] }))}
                />

                {/* RIGHT: Order table + Receiving info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

                    {/* Reminder */}
                    <div style={{ background: '#e8f7f5', border: '1px solid #b2dfdb', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#2e7d62', lineHeight: '1.8' }}>
                      <div><strong>Reminder:</strong></div>
                      <div>※ To recharge more card numbers, please select "Batch Top-Up" in the top left corner and import the Excel file.</div>
                      <div>※ Assuming the product specification is 4 days. If the number of days entered = 2, it equals 4 days × 2 cycles = 8 days.</div>
                      <div>※ The recharge period cannot exceed 30 days.</div>
                      <div>※ The number of recharge cards must not exceed 500 and there should be no duplicate card numbers.</div>
                    </div>

                    {/* Product table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #e0e0e0', width: '40px' }}>No.</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #e0e0e0' }}>Product Name</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #e0e0e0', width: '70px' }}>Price</th>
                          <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #e0e0e0', width: '75px' }}>Days</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #e0e0e0' }}>SN (SIM Number)</th>
                          <th style={{ padding: '8px 6px', border: '1px solid #e0e0e0', width: '30px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartRows.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e0e0e0', color: '#999', fontSize: '12px' }}>
                              Select plans from the left panel
                            </td>
                          </tr>
                        ) : (
                          cartRows.flatMap((row, rowIdx) =>
                            row.simNums.map((simNum, simIdx) => {
                              const vKey = `${rowIdx}-${simIdx}`;
                              const vs = verifyStatus[vKey];
                              return (
                                <tr key={vKey} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                  {simIdx === 0 && (
                                    <>
                                      <td rowSpan={row.simNums.length} style={{ padding: '7px 10px', border: '1px solid #e8e8e8', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>{rowIdx + 1}</td>
                                      <td rowSpan={row.simNums.length} style={{ padding: '7px 10px', border: '1px solid #e8e8e8', verticalAlign: 'middle' }}>{row.plan.productName}</td>
                                      <td rowSpan={row.simNums.length} style={{ padding: '7px 10px', border: '1px solid #e8e8e8', textAlign: 'center', verticalAlign: 'middle' }}>NT {row.plan.price}</td>
                                      <td rowSpan={row.simNums.length} style={{ padding: '7px 10px', border: '1px solid #e8e8e8', textAlign: 'center', verticalAlign: 'middle' }}>
                                        <input type="number" min="1" max="30" value={row.days}
                                          onChange={e => updateDays(rowIdx, e.target.value)}
                                          style={{ width: '50px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px', padding: '2px 4px', fontSize: '12px' }} />
                                      </td>
                                    </>
                                  )}
                                  <td style={{ padding: '5px 8px', border: '1px solid #e8e8e8' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <input type="text" value={simNum} onChange={e => updateSim(rowIdx, simIdx, e.target.value)}
                                        placeholder="20-digit SIM number"
                                        style={{ flex: 1, padding: '4px 6px', border: `1px solid ${vs === 'valid' ? '#4caf50' : vs === 'invalid' ? '#f44336' : '#ccc'}`, borderRadius: '3px', fontSize: '11px' }} />
                                      <button type="button" onClick={() => handleVerify(rowIdx, simIdx)}
                                        style={{ padding: '3px 6px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', whiteSpace: 'nowrap', color: '#555' }}>
                                        {vs === 'checking' ? '...' : 'Check'}
                                      </button>
                                      {vs === 'valid' && <CheckCircle size={12} color="#4caf50" />}
                                      {vs === 'invalid' && <AlertCircle size={12} color="#f44336" />}
                                      <button type="button" onClick={() => addSimSlot(rowIdx)}
                                        style={{ padding: '2px 5px', background: '#e8f7f5', border: '1px solid #1a9e8e', borderRadius: '3px', cursor: 'pointer', color: '#1a9e8e' }}>
                                        <Plus size={10} />
                                      </button>
                                      <button type="button" onClick={() => removeSimSlot(rowIdx, simIdx)}
                                        style={{ padding: '2px 5px', background: '#fff5f5', border: '1px solid #e74c3c', borderRadius: '3px', cursor: 'pointer', color: '#e74c3c' }}>
                                        <X size={10} />
                                      </button>
                                    </div>
                                  </td>
                                  {simIdx === 0 && (
                                    <td rowSpan={row.simNums.length} style={{ padding: '5px', border: '1px solid #e8e8e8', textAlign: 'center', verticalAlign: 'middle' }}>
                                      <button onClick={() => removeRow(rowIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>
                                        <X size={13} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )
                        )}
                        <tr style={{ background: '#f9f9f9' }}>
                          <td colSpan="2" style={{ padding: '8px 10px', border: '1px solid #e0e0e0', fontWeight: '600' }}>Total</td>
                          <td style={{ padding: '8px 10px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '600' }}>NT {totalPrice}</td>
                          <td colSpan="3" style={{ padding: '8px 10px', border: '1px solid #e0e0e0' }}></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Receiving Info */}
                    <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '13px', color: '#444' }}>Receiving Info.</div>
                      <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Company <span style={{ color: 'red' }}>*</span></label>
                      <select value={company} onChange={e => setCompany(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: `1px solid ${company ? '#ccc' : '#e74c3c'}`, borderRadius: '4px', fontSize: '12px', background: 'white', marginBottom: '12px', color: company ? '#333' : '#999' }}>
                        <option value="">-- Chọn công ty (bắt buộc) --</option>
                        <option value={accountName}>{accountName}</option>
                      </select>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <label style={{ fontSize: '12px', color: '#555', paddingTop: '7px', flexShrink: 0, width: '50px' }}>Note</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)}
                          placeholder="up to 100 words" maxLength={500} rows={2}
                          style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', resize: 'vertical' }} />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSubmit} disabled={submitting}
                      style={{ padding: '8px 28px', background: '#1a9e8e', color: 'white', border: 'none', borderRadius: '5px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: submitting ? 0.7 : 1 }}>
                      {submitting ? 'Processing...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== ORDER DETAIL MODAL ===================== */}
      {selectedDeposit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px' }}
          onClick={() => setSelectedDeposit(null)}>
          <div style={{ background: '#fff', color: '#333', borderRadius: '8px', width: '92vw', maxWidth: '1000px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>

            {/* Header — tabs + close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex' }}>
                {[['info', 'Order Info.'], ['history', 'Order History']].map(([key, label], i) => (
                  <button key={key} onClick={() => setDetailTab(key)}
                    style={{ padding: '6px 18px', border: '1px solid #ccc', cursor: 'pointer', background: detailTab === key ? '#e9ecef' : '#fff', color: '#333', fontWeight: detailTab === key ? 'bold' : 'normal', borderRadius: i === 0 ? '4px 0 0 4px' : '0 4px 4px 0', fontSize: '13px' }}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setSelectedDeposit(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {detailTab === 'info' ? (
                <>
                  {/* Info grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px', marginBottom: '20px' }}>
                    {[
                      ['Order number', selectedDeposit.orderId],
                      ['Order Status', selectedDeposit.history || ''],
                      ['Quantity', selectedDeposit.quantity],
                      ['Order Date', selectedDeposit.date],
                      ['Product Type', selectedDeposit.productType || 'Top-Up SIM'],
                      ['Company name', selectedDeposit.company || ''],
                      ['Note', selectedDeposit.note || ''],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>{label}</div>
                        <input readOnly value={val ?? ''}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', background: '#fff', color: '#555', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>

                  {/* Order List */}
                  <div style={{ background: '#f5f5f5', padding: '10px 14px', fontWeight: 'bold', fontSize: '13px', borderRadius: '4px 4px 0 0' }}>Order List</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <th style={{ padding: '10px', textAlign: 'left', width: '70px' }}>Item No.</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Product Name</th>
                        <th style={{ padding: '10px', textAlign: 'right', width: '90px' }}>Price</th>
                        <th style={{ padding: '10px', textAlign: 'left', width: '70px' }}>Days</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>SN</th>
                        <th style={{ padding: '10px', textAlign: 'left', width: '110px' }}>Top-Up Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedDeposit.items || []).map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px' }}>{idx + 1}</td>
                          <td style={{ padding: '10px' }}>{it.productName}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>NT {it.price}</td>
                          <td style={{ padding: '10px' }}>{it.day}</td>
                          <td style={{ padding: '10px', fontFamily: 'monospace' }}>{it.sn}</td>
                          <td style={{ padding: '10px', color: it.status === 'Success' ? '#1a9e8e' : '#555' }}>{it.status}</td>
                        </tr>
                      ))}
                      {(!selectedDeposit.items || selectedDeposit.items.length === 0) && (
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Không có chi tiết dòng (đơn cũ).</td></tr>
                      )}
                    </tbody>
                    {selectedDeposit.items && selectedDeposit.items.length > 0 && (
                      <tfoot>
                        <tr style={{ borderTop: '1px solid #e0e0e0' }}>
                          <td colSpan="2"></td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                          <td colSpan="3" style={{ padding: '10px', fontWeight: 'bold' }}>
                            NT {selectedDeposit.items.reduce((s, it) => s + it.price * it.day, 0)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </>
              ) : (
                /* Order History tab */
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px' }}>{selectedDeposit.date}</td>
                        <td style={{ padding: '10px' }}>{selectedDeposit.status}</td>
                        <td style={{ padding: '10px' }}>{selectedDeposit.history}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeposit;
