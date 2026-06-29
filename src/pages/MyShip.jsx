import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { createEsimOrder, createSimOrder, topupSim, searchMyQuotations, getApiConfig } from '../utils/api';
import { useAuth } from '../auth/AuthContext';
import { fetchRecords, addRecord, lsSaveAll } from '../utils/dataStore';
import { firebaseEnabled } from '../firebase';

// Fallback nếu chưa có profile
function getAccountNameFallback() {
  return getApiConfig().environment === 'prod' ? 'SimDuLich.VN' : 'SDL';
}
import PlanSelectorPanel from '../components/PlanSelectorPanel';

// ── Mock data (matching real system) ─────────────────────────────────────
const MOCK_ORDERS = [
  { id: 1,  orderId: 'b0002042606250001', ecomOrder: 'Thu Hương vk a Đạt', date: '2026/06/25 10:41:56', quantity: 1, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/25 10:41:56' },
  { id: 2,  orderId: 'b0002042606240002', ecomOrder: 'Cường',              date: '2026/06/24 19:41:31', quantity: 2, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/24 19:41:31' },
  { id: 3,  orderId: 'b0002042606240001', ecomOrder: 'Phương',             date: '2026/06/24 15:07:58', quantity: 5, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/24 15:07:58' },
  { id: 4,  orderId: 'b0002042606230002', ecomOrder: 'Loan',               date: '2026/06/23 15:29:00', quantity: 6, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/23 15:29:00' },
  { id: 5,  orderId: 'b0002042606230001', ecomOrder: 'Cúc',                date: '2026/06/23 11:01:33', quantity: 1, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/23 11:01:33' },
  { id: 6,  orderId: 'b0002042606220002', ecomOrder: 'Thương',             date: '2026/06/22 18:59:57', quantity: 4, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/22 18:59:57' },
  { id: 7,  orderId: 'b0002042606220001', ecomOrder: 'Anh thư',            date: '2026/06/22 14:52:54', quantity: 2, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/22 14:52:54' },
  { id: 8,  orderId: 'b0002042606190001', ecomOrder: 'C thảo',             date: '2026/06/19 15:36:01', quantity: 2, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/19 15:36:01' },
  { id: 9,  orderId: 'b0002042606180010', ecomOrder: 'Toàn đức',           date: '2026/06/18 12:36:16', quantity: 1, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/18 12:36:16' },
  { id: 10, orderId: 'b0002042606180009', ecomOrder: 'Toàn đức',           date: '2026/06/18 12:27:52', quantity: 1, type: 'eSIM', status: 'Success', history: 'Shipped 2026/06/18 12:27:52' },
];

const ESIM_PLANS = [
  { wmproductId: 'WM_CN_001', productName: 'Mainland China, 2 Days, Unlimited data/day',  region: 'Mainland China',        applicable: 'Asia',   price: 25,  isFav: true  },
  { wmproductId: 'WM_CN_002', productName: 'Mainland China, 4 Days, 2GB/Day, 128kbps',    region: 'Mainland China',        applicable: 'Asia',   price: 35,  isFav: true  },
  { wmproductId: 'WM_CN_003', productName: 'Mainland China, 4 Days, 3GB/Day, 128kbps',    region: 'Mainland China',        applicable: 'Asia',   price: 40,  isFav: true  },
  { wmproductId: 'WM_CN_004', productName: 'Mainland China, 4 Days, Unlimited data/day',  region: 'Mainland China',        applicable: 'Asia',   price: 50,  isFav: true  },
  { wmproductId: 'WM_CN_005', productName: 'Mainland China, 5 Days, 1GB/Day, 128kbps',    region: 'Mainland China',        applicable: 'Asia',   price: 38,  isFav: true  },
  { wmproductId: 'WM_CN_006', productName: 'Mainland China, 5 Days, 2GB/Day, 128kbps',    region: 'Mainland China',        applicable: 'Asia',   price: 48,  isFav: true  },
  { wmproductId: 'WM_CN_007', productName: 'Mainland China, 5 Days, 3GB/Day, 128kbps',    region: 'Mainland China',        applicable: 'Asia',   price: 55,  isFav: true  },
  { wmproductId: 'WM_CN_008', productName: 'Mainland China, 5 Days, Unlimited data/day',  region: 'Mainland China',        applicable: 'Asia',   price: 65,  isFav: true  },
  { wmproductId: 'WM_CN_009', productName: 'Mainland China, 6 Days, Unlimited data/day',  region: 'Mainland China',        applicable: 'Asia',   price: 72,  isFav: true  },
  { wmproductId: 'WM_KR_001', productName: 'Korea, 5 Days, 1GB/Day, 128kbps',             region: 'Korea',                 applicable: 'Asia',   price: 45,  isFav: true  },
  { wmproductId: 'WM_KR_002', productName: 'Korea, 5 Days, 2GB/Day, 128kbps',             region: 'Korea',                 applicable: 'Asia',   price: 55,  isFav: true  },
  { wmproductId: 'WM_KR_003', productName: 'Korea, 5 Days, Unlimited data/day',           region: 'Korea',                 applicable: 'Asia',   price: 68,  isFav: false },
  { wmproductId: 'WM_JP_001', productName: 'Japan, 3 Days, 1GB/Day',                      region: 'Japan',                 applicable: 'Asia',   price: 90,  isFav: true  },
  { wmproductId: 'WM_JP_002', productName: 'Japan, 5 Days, 1GB/Day',                      region: 'Japan',                 applicable: 'Asia',   price: 120, isFav: true  },
  { wmproductId: 'WM_HK_001', productName: 'China, Hong Kong, Macau, 3 Days, 1GB/Day',   region: 'China, Hong Kong, Macau', applicable: 'Asia', price: 30,  isFav: true  },
  { wmproductId: 'WM_TW_001', productName: 'Taiwan, 5 Days, 3GB/Day, 128kbps',            region: 'China, Taiwan',         applicable: 'Asia',   price: 55,  isFav: false },
  { wmproductId: 'WM_TH_001', productName: 'Thailand, 7 Days, 1GB/Day, 128kbps',          region: 'Thailand',              applicable: 'Southeast Asia', price: 40, isFav: false },
  { wmproductId: 'WM_VN_001', productName: 'Vietnam, 7 Days, 3GB/Day, 128kbps',           region: 'Vietnam',               applicable: 'Southeast Asia', price: 35, isFav: false },
  { wmproductId: 'WM_GL_001', productName: 'Global, 30 Days, Unlimited',                  region: 'Global',                applicable: 'Global', price: 450, isFav: false },
  { wmproductId: 'WM_EU_001', productName: 'BICS Europe, 5 Days, 3GB/Day, 128kbps',       region: 'BICS Europe',           applicable: 'Europe', price: 55,  isFav: false },
  { wmproductId: 'WM_EU_002', productName: 'BICS Europe, 10 Days, 10GB, 128kbps',         region: 'BICS Europe',           applicable: 'Europe', price: 90,  isFav: false },
  { wmproductId: 'WM_EU_003', productName: 'BICS Europe, 15 Days, Unlimited, 128kbps',    region: 'BICS Europe',           applicable: 'Europe', price: 120, isFav: false },
];

const SIM_PLANS = [
  { productId: 'FS-CN-01', productName: 'China, 7 Days Unlimited SIM Card',       region: 'Mainland China', applicable: 'Asia',   price: 60,  isFav: true  },
  { productId: 'FS-JP-01', productName: 'Japan, Daily 1GB SIM Card',              region: 'Japan',          applicable: 'Asia',   price: 85,  isFav: true  },
  { productId: 'FS-KR-01', productName: 'Korea, 5 Days Unlimited SIM Card',       region: 'Korea',          applicable: 'Asia',   price: 70,  isFav: true  },
  { productId: 'FS-HK-01', productName: 'Hong Kong, 7 Days 5GB SIM Card',         region: 'Hong Kong',      applicable: 'Asia',   price: 50,  isFav: true  },
  { productId: 'FS-TW-01', productName: 'Taiwan, 7 Days 3GB SIM Card',            region: 'China, Taiwan',  applicable: 'Asia',   price: 55,  isFav: false },
  { productId: 'FS-TH-01', productName: 'Thailand, 7 Days 3GB SIM Card',          region: 'Thailand',       applicable: 'Southeast Asia', price: 40, isFav: false },
  { productId: 'FS-SG-01', productName: 'Singapore, 7 Days Unlimited SIM Card',   region: 'Singapore',      applicable: 'Southeast Asia', price: 65, isFav: false },
  { productId: 'FS-EU-01', productName: 'Europe 35+ Countries, 15 Days 20GB',     region: 'BICS Europe',    applicable: 'Europe', price: 110, isFav: false },
  { productId: 'FS-US-01', productName: 'USA, 7 Days 10GB SIM Card',              region: 'United States',  applicable: 'Americas', price: 80, isFav: false },
  { productId: 'FS-AU-01', productName: 'Australia, 14 Days 20GB SIM Card',       region: 'Australia',      applicable: 'Oceania', price: 95, isFav: false },
];

// Top-up plans (SIM vật lý — nạp theo SN+Days). Cần wmproductId cho topupSim().
const TOPUP_PLANS = [
  { wmproductId: 'WM_CN_T01', productName: 'Mainland China, 1GB /day, 128kbps',  region: 'Mainland China',        applicable: 'Asia',   price: 18, isFav: true  },
  { wmproductId: 'WM_CN_T02', productName: 'Mainland China, 2GB /day, 128kbps',  region: 'Mainland China',        applicable: 'Asia',   price: 25, isFav: true  },
  { wmproductId: 'WM_CN_T03', productName: 'Mainland China, 3GB /day, 128kbps',  region: 'Mainland China',        applicable: 'Asia',   price: 32, isFav: true  },
  { wmproductId: 'WM_CN_T04', productName: 'Mainland China, Unlimited data /day', region: 'Mainland China',        applicable: 'Asia',   price: 45, isFav: true  },
  { wmproductId: 'WM_JP_T01', productName: 'Japan, 1GB /day, 128kbps',           region: 'Japan',                 applicable: 'Asia',   price: 40, isFav: true  },
  { wmproductId: 'WM_JP_T02', productName: 'Japan, 3GB /day, 128kbps',           region: 'Japan',                 applicable: 'Asia',   price: 55, isFav: false },
  { wmproductId: 'WM_KR_T01', productName: 'Korea, 1GB /day, 128kbps',           region: 'Korea',                 applicable: 'Asia',   price: 38, isFav: true  },
  { wmproductId: 'WM_KR_T02', productName: 'Korea, 3GB /day, 128kbps',           region: 'Korea',                 applicable: 'Asia',   price: 50, isFav: false },
  { wmproductId: 'WM_EU_T01', productName: 'BICS Europe, 3GB /day, 128kbps',     region: 'BICS Europe',           applicable: 'Europe', price: 55, isFav: false },
  { wmproductId: 'WM_EU_T02', productName: 'BICS Europe, 10GB /day, 128kbps',    region: 'BICS Europe',           applicable: 'Europe', price: 75, isFav: false },
];

// ── helpers ───────────────────────────────────────────────────────────────
function initFavs(plans) {
  const m = {};
  plans.forEach(p => { m[p.wmproductId || p.productId] = p.isFav; });
  return m;
}

// Map WorldMove catalog (searchMyQuotations) → plan lists per tab.
// productType: 0 = eSIM, 1 = SIM vật lý, 2 = Top-up.
function mapCatalog(prodList) {
  const mk = (p) => ({
    wmproductId: p.wmproductId,
    productId:   p.productId,
    productName: p.productName,
    region:      p.productRegion || '',
    applicable:  p.productRegion || '',
    price:       p.productPrice,
    isFav:       false,
  });
  // productType: 0 = eSIM, 1 = SIM vật lý (thẻ trắng), 2 = top-up.
  // Lọc theo productType vì cờ leSIM trong catalog không đáng tin.
  return {
    esim:  prodList.filter(p => p.productType === 0).map(mk),
    sim:   prodList.filter(p => p.productType === 1).map(mk),
    topup: prodList.filter(p => p.productType === 2).map(mk),
  };
}

// ─────────────────────────────────────────────────────────────────────────
export default function MyShip({ autoOpenAdd = false } = {}) {
  // List filters
  const [filterOrderId,    setFilterOrderId]    = useState('');
  const [filterEcomOrder,  setFilterEcomOrder]  = useState('');
  const [filterType,       setFilterType]       = useState('');
  const [filterHistory,    setFilterHistory]    = useState('');
  const [filterStartDate,  setFilterStartDate]  = useState('2026-06-01');
  const [filterEndDate,    setFilterEndDate]    = useState('2026-06-30');
  const [activeFilters,    setActiveFilters]    = useState({ orderId: '', ecomOrder: '', type: '', history: '' });
  const { user, profile } = useAuth();
  const uid = user?.uid;
  const [orders,           setOrders]           = useState([]);
  const [ordersLoaded,     setOrdersLoaded]     = useState(false);
  const [perPage,          setPerPage]          = useState(10);

  // Load đơn: Firestore (đã đăng nhập) hoặc localStorage; rỗng → mock seed.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await fetchRecords('orders', uid);
      if (cancelled) return;
      setOrders(rows ?? MOCK_ORDERS);
      setOrdersLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  // Chỉ ghi localStorage khi KHÔNG dùng Firestore (Firestore tự lưu khi tạo đơn).
  useEffect(() => {
    if (firebaseEnabled && uid) return;
    if (!ordersLoaded) return;
    lsSaveAll('orders', orders);
  }, [orders, ordersLoaded, uid]);

  // Thêm đơn mới: Firestore (addDoc) hoặc state cục bộ.
  const saveOrderRow = async (row) => {
    const enriched = { ...row, ownerName: accountName };
    if (firebaseEnabled && uid) {
      try {
        const saved = await addRecord('orders', uid, enriched, profile?.parentId || null);
        setOrders(p => [saved, ...p]);
        return;
      } catch (e) { console.error('Firestore save order failed:', e); }
    }
    setOrders(p => [{ ...enriched, id: row.id ?? Date.now() }, ...p]);
  };

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab]             = useState('esim'); // 'esim' | 'sim' | 'topup'

  // Mở sẵn modal Add (tab eSIM) khi vào từ menu "Nhập eSIM"
  useEffect(() => {
    if (autoOpenAdd) { setTab('esim'); setShowModal(true); }
  }, [autoOpenAdd]);

  // Cart (eSIM/SIM): [{ plan, qty }]
  const [cart, setCart] = useState([]);

  // Top-up cart (SIM vật lý): [{ plan, day, sn }]
  const [topupCart, setTopupCart] = useState([]);
  const [topupCompany, setTopupCompany] = useState('');
  const [topupTaxId,   setTopupTaxId]   = useState('');
  const [topupNote,    setTopupNote]    = useState('');

  // Favorites (separate per tab)
  const [esimFavs,  setEsimFavs]  = useState(() => initFavs(ESIM_PLANS));
  const [simFavs,   setSimFavs]   = useState(() => initFavs(SIM_PLANS));
  const [topupFavs, setTopupFavs] = useState(() => initFavs(TOPUP_PLANS));
  const favs       = tab === 'esim' ? esimFavs : tab === 'sim' ? simFavs : topupFavs;
  const setFavs    = tab === 'esim' ? setEsimFavs : tab === 'sim' ? setSimFavs : setTopupFavs;
  const toggleFav  = (id) => setFavs(p => ({ ...p, [id]: !p[id] }));

  // Plan lists — loaded from real WorldMove catalog (fallback = mock above).
  const [esimPlans,  setEsimPlans]  = useState(ESIM_PLANS);
  const [simPlans,   setSimPlans]   = useState(SIM_PLANS);
  const [topupPlans, setTopupPlans] = useState(TOPUP_PLANS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await searchMyQuotations();
        if (cancelled || res.code !== 0 || !res.prodList?.length) return;
        const { esim, sim, topup } = mapCatalog(res.prodList);
        if (esim.length)  { setEsimPlans(esim);   setEsimFavs(initFavs(esim)); }
        if (sim.length)   { setSimPlans(sim);     setSimFavs(initFavs(sim)); }
        if (topup.length) { setTopupPlans(topup); setTopupFavs(initFavs(topup)); }
      } catch (err) {
        console.error('Catalog load failed, using mock plans:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Receiving info
  const [company,   setCompany]   = useState('');
  const [email,     setEmail]     = useState('');
  const [ecomOrder, setEcomOrder] = useState('');
  // SIM extra fields
  const [invoiceType,   setInvoiceType]   = useState(1);
  const [taxId,         setTaxId]         = useState('');
  const [receivingName, setReceivingName] = useState('');
  const [receivingTel,  setReceivingTel]  = useState('');
  const [receivingAdd,  setReceivingAdd]  = useState('');
  const [note,          setNote]          = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailTab, setDetailTab] = useState('info'); // 'info' | 'history'

  // Tên hiển thị ở Company: dùng displayName của profile, bỏ @domain nếu là email
  const rawName = profile?.displayName || getAccountNameFallback();
  const accountName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

  // Auto-fill company khi profile load xong
  useEffect(() => { if (accountName && !company) setCompany(accountName); }, [accountName]);

  // ── list ────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveFilters({ orderId: filterOrderId, ecomOrder: filterEcomOrder, type: filterType, history: filterHistory });
  };
  const handleClear = () => {
    setFilterOrderId(''); setFilterEcomOrder(''); setFilterType(''); setFilterHistory('');
    setFilterStartDate('2026-06-01'); setFilterEndDate('2026-06-30');
    setActiveFilters({ orderId: '', ecomOrder: '', type: '', history: '' });
  };
  const filtered = orders.filter(o =>
    o.orderId.toLowerCase().includes(activeFilters.orderId.toLowerCase()) &&
    o.ecomOrder.toLowerCase().includes(activeFilters.ecomOrder.toLowerCase()) &&
    (!activeFilters.type    || o.type === activeFilters.type) &&
    (!activeFilters.history || o.history.includes(activeFilters.history))
  );

  // ── cart ────────────────────────────────────────────────────────────────
  const addToCart = (plan) => {
    const id = plan.wmproductId || plan.productId;
    setCart(p => {
      const ex = p.find(c => (c.plan.wmproductId || c.plan.productId) === id);
      return ex ? p.map(c => (c.plan.wmproductId || c.plan.productId) === id ? { ...c, qty: c.qty + 1 } : c)
                : [...p, { plan, qty: 1 }];
    });
  };
  const updateQty = (id, qty) => {
    if (qty < 1) { setCart(p => p.filter(c => (c.plan.wmproductId || c.plan.productId) !== id)); return; }
    setCart(p => p.map(c => (c.plan.wmproductId || c.plan.productId) === id ? { ...c, qty } : c));
  };
  const totalQty   = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.plan.price * c.qty, 0);

  // ── top-up cart (SIM vật lý) ──────────────────────────────────────────────
  const addTopupPlan = (plan) => {
    setTopupCart(p => p.find(l => l.plan.wmproductId === plan.wmproductId)
      ? p
      : [...p, { plan, day: 1, sn: '' }]);
  };
  const updateTopupDay = (id, val) => {
    const n = Math.min(30, Math.max(1, parseInt(val) || 1));
    setTopupCart(p => p.map(l => l.plan.wmproductId === id ? { ...l, day: n } : l));
  };
  const updateTopupSn = (id, val) =>
    setTopupCart(p => p.map(l => l.plan.wmproductId === id ? { ...l, sn: val } : l));
  const removeTopupLine = (id) =>
    setTopupCart(p => p.filter(l => l.plan.wmproductId !== id));
  const topupTotalAmount = topupCart.reduce((s, l) => s + l.plan.price * l.day, 0);

  const resetModal = () => {
    setCart([]); setCompany(''); setEmail(''); setEcomOrder('');
    setInvoiceType(1); setTaxId(''); setReceivingName(''); setReceivingTel(''); setReceivingAdd(''); setNote('');
    setTopupCart([]); setTopupCompany(''); setTopupTaxId(''); setTopupNote('');
  };

  const handleSubmit = async () => {
    // ── SIM Top-up (nạp theo SN+Days) ──
    if (tab === 'topup') {
      if (topupCart.length === 0) { alert('Please select at least one plan!'); return; }
      if (topupCart.some(l => !l.sn.trim())) { alert('Please enter SN for every line!'); return; }
      if (topupCart.some(l => l.day < 1 || l.day > 30)) { alert('Days must be between 1 and 30.'); return; }
      if (!topupCompany) { alert('Vui lòng chọn Công ty (tài khoản)!'); return; }
      setSubmitting(true);
      try {
        const prodList = topupCart.map(l => ({ wmproductId: l.plan.wmproductId, day: l.day, simNum: l.sn.trim() }));
        const res = await topupSim(prodList);
        if (res.code === 0 && res.orderId) {
          await saveOrderRow({
            orderId: res.orderId, ecomOrder: topupNote || topupCompany || topupCart[0].sn.trim(),
            date: new Date().toLocaleString('sv').replace('T',' ').substr(0,19),
            quantity: topupCart.length, type: 'SIM Top-up', status: 'Success',
            history: 'Top-up success ' + new Date().toLocaleString('sv').substr(0,19),
            company: topupCompany, note: topupNote,
            items: topupCart.map(l => ({ productName: l.plan.productName, price: l.plan.price, day: l.day, sn: l.sn.trim(), amount: l.plan.price * l.day }))
          });
          setShowModal(false); resetModal();
          alert(`Top-Up submitted!\nOrder ID: ${res.orderId}\nTotal: ${prodList.length} SIMs`);
        } else alert('Top-Up failed: ' + (res.msg || 'Unknown error'));
      } catch { alert('API connection error!'); }
      finally { setSubmitting(false); }
      return;
    }

    if (cart.length === 0) { alert('Please select at least one plan!'); return; }

    if (!company) { alert('Vui lòng chọn Công ty (tài khoản)!'); return; }

    if (tab === 'esim') {
      if (!email) { alert('Please enter recipient Email!'); return; }
      setSubmitting(true);
      try {
        const prodList = cart.map(c => ({ wmproductId: c.plan.wmproductId, qty: c.qty }));
        const res = await createEsimOrder(email, prodList, false);
        if (res.code === 0 && res.orderId) {
          await saveOrderRow({
            orderId: res.orderId, ecomOrder: ecomOrder || email,
            date: new Date().toLocaleString('sv').replace('T',' ').substr(0,19),
            quantity: totalQty, type: 'eSIM', status: 'Success',
            history: 'Shipped ' + new Date().toLocaleString('sv').substr(0,19),
            company, email,
            items: cart.map(c => ({ productName: c.plan.productName, price: c.plan.price, qty: c.qty, amount: c.plan.price * c.qty }))
          });
          setShowModal(false); resetModal();
          alert(`eSIM order created!\nOrder ID: ${res.orderId}`);
        } else alert('Failed: ' + (res.msg || 'Unknown error'));
      } catch { alert('API connection error!'); }
      finally { setSubmitting(false); }
    } else {
      if (!receivingName || !receivingTel || !receivingAdd) { alert('Please fill in all receiving fields!'); return; }
      setSubmitting(true);
      try {
        const prodList = cart.map(c => ({ productId: c.plan.productId, productName: c.plan.productName, qty: c.qty }));
        const res = await createSimOrder(Number(invoiceType), taxId, receivingName, receivingTel, receivingAdd, note, prodList);
        if (res.code === 0 && res.orderId) {
          await saveOrderRow({
            orderId: res.orderId, ecomOrder: ecomOrder || receivingName,
            date: new Date().toLocaleString('sv').replace('T',' ').substr(0,19),
            quantity: totalQty, type: 'SIM', status: 'Success',
            history: 'Shipped ' + new Date().toLocaleString('sv').substr(0,19),
            company, receivingName, receivingTel, receivingAdd, note,
            items: cart.map(c => ({ productName: c.plan.productName, price: c.plan.price, qty: c.qty, amount: c.plan.price * c.qty }))
          });
          setShowModal(false); resetModal();
          alert(`SIM order created!\nOrder ID: ${res.orderId}`);
        } else alert('Failed: ' + (res.msg || 'Unknown error'));
      } catch { alert('API connection error!'); }
      finally { setSubmitting(false); }
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">MY ORDER</h1>
        <div className="breadcrumbs">
          <span>Home</span><span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">My Order</span>
        </div>
      </div>

      <div className="card">
        <div className="card-body">

          {/* ── Filters ── */}
          <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input className="search-input" style={{ flex: '1 1 180px' }} placeholder="Order number"
                value={filterOrderId} onChange={e => setFilterOrderId(e.target.value)} />
              <input className="search-input" style={{ flex: '1 1 180px' }} placeholder="E-commerce Order"
                value={filterEcomOrder} onChange={e => setFilterEcomOrder(e.target.value)} />
              <select className="entries-select" style={{ flex: '1 1 140px', height: '32px' }}
                value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">Product Type</option>
                <option value="eSIM">eSIM</option>
                <option value="SIM">SIM</option>
              </select>
              <select className="entries-select" style={{ flex: '1 1 140px', height: '32px' }}
                value={filterHistory} onChange={e => setFilterHistory(e.target.value)}>
                <option value="">History</option>
                <option value="Shipped">Shipped</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="date" className="search-input" style={{ flex: '0 1 160px' }}
                value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <input type="date" className="search-input" style={{ flex: '0 1 160px' }}
                value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
              <button type="submit" className="btn btn-search btn-teal" style={{ padding: '6px 18px' }}>Search</button>
              <button type="button" className="btn btn-reset btn-red" onClick={handleClear}><Trash2 size={14} /></button>
            </div>
          </form>

          {/* Add button */}
          <button className="btn btn-teal" style={{ marginBottom: '16px', padding: '7px 20px', fontWeight: 'bold' }}
            onClick={() => { setShowModal(true); setTab('esim'); }}>
            Add
          </button>

          {/* Show entries */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Show
            <select className="entries-select" style={{ height: '26px', width: '60px' }}
              value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
              {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            entries
          </div>

          {/* ── Table ── */}
          <div style={{ overflowX: 'auto' }}>
            <table className="notices-table">
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px' }}>Order number ↕</th>
                  <th style={{ padding: '10px 14px' }}>E-commerce Order ↕</th>
                  <th style={{ padding: '10px 14px' }}>Order Date ↕</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Quantity ↕</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Product Type ↕</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status ↕</th>
                  <th style={{ padding: '10px 14px' }}>Lastest History ↕</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, perPage).map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="notice-cell" style={{ padding: '10px 14px', color: 'var(--teal-primary)', fontFamily: 'monospace', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => { setSelectedOrder(row); setDetailTab('info'); }}>
                      {row.orderId}
                    </td>
                    <td className="notice-cell" style={{ padding: '10px 14px' }}>{row.ecomOrder}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{row.date}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>{row.quantity}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>{row.type}</td>
                    <td className="notice-cell" style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{ background: 'rgba(32,158,145,0.15)', color: 'var(--teal-primary)', border: '1px solid rgba(32,158,145,0.25)', padding: '2px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>
                        {row.status}
                      </span>
                    </td>
                    <td className="notice-cell" style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '12px' }}>{row.history}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="notice-cell" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Showing 1 to {Math.min(perPage, filtered.length)} of {filtered.length} entries</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['Previous', '1', '2', '3', '...', 'Next'].map((p, i) => (
                <button key={i} style={{ padding: '3px 9px', border: '1px solid var(--border-color)', borderRadius: '3px', background: p === '1' ? 'var(--teal-primary)' : 'transparent', color: p === '1' ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ ADD MODAL ══════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px' }}>
          <div style={{ background: '#fff', color: '#333', borderRadius: '8px', width: '92vw', maxWidth: '1100px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>

            {/* Header — tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex' }}>
                {[['esim','eSIM'], ['sim','SIM'], ['topup','SIM Top-up']].map(([key, label], i, arr) => (
                  <button key={key} onClick={() => { setTab(key); setCart([]); setTopupCart([]); }}
                    style={{ padding: '6px 22px', border: '1px solid #ccc', cursor: 'pointer', background: tab === key ? '#1a9e8e' : '#f5f5f5', color: tab === key ? 'white' : '#555', fontWeight: tab === key ? 'bold' : 'normal', borderRadius: i === 0 ? '4px 0 0 4px' : i === arr.length - 1 ? '0 4px 4px 0' : '0', fontSize: '13px' }}>
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowModal(false); resetModal(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body: 2 columns */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

              {/* LEFT — plan selector */}
              <PlanSelectorPanel
                plans={tab === 'esim' ? esimPlans : tab === 'sim' ? simPlans : topupPlans}
                onAdd={tab === 'topup' ? addTopupPlan : addToCart}
                favs={favs}
                onToggleFav={toggleFav}
              />

              {/* RIGHT — SIM Top-up panel */}
              {tab === 'topup' ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  {/* Reminder */}
                  <div style={{ background: '#e8f7f5', border: '1px solid #b2dfdb', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#2e7d62', lineHeight: '1.8' }}>
                    <div><strong>Reminder:</strong></div>
                    <div>※ Nạp tiền (top-up) theo số SIM. Days = số chu kỳ gói (tối đa 30).</div>
                    <div>※ Mỗi số SIM nạp một dòng, không trùng số.</div>
                  </div>

                  {/* Top-up cart table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #e0e0e0' }}>Product</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #e0e0e0', width: '70px' }}>Price</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #e0e0e0', width: '75px' }}>Days</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #e0e0e0' }}>SN</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid #e0e0e0', width: '80px' }}>Amount</th>
                        <th style={{ padding: '8px 6px', border: '1px solid #e0e0e0', width: '30px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {topupCart.length === 0
                        ? <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e0e0e0', color: '#999', fontSize: '12px' }}>Select plans from the left panel</td></tr>
                        : topupCart.map(line => (
                            <tr key={line.plan.wmproductId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '7px 10px', border: '1px solid #e8e8e8', fontSize: '12px' }}>{line.plan.productName}</td>
                              <td style={{ padding: '7px 10px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>NT {line.plan.price}</td>
                              <td style={{ padding: '5px 8px', border: '1px solid #e8e8e8', textAlign: 'center' }}>
                                <select value={line.day} onChange={e => updateTopupDay(line.plan.wmproductId, e.target.value)}
                                  style={{ width: '56px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px', padding: '3px', fontSize: '12px', background: 'white' }}>
                                  {Array.from({ length: 30 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                                </select>
                              </td>
                              <td style={{ padding: '5px 8px', border: '1px solid #e8e8e8' }}>
                                <input type="text" value={line.sn} onChange={e => updateTopupSn(line.plan.wmproductId, e.target.value)}
                                  placeholder="20-digit SIM number"
                                  style={{ width: '100%', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '11px', boxSizing: 'border-box' }} />
                              </td>
                              <td style={{ padding: '7px 10px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>NT {line.plan.price * line.day}</td>
                              <td style={{ padding: '5px', border: '1px solid #e8e8e8', textAlign: 'center' }}>
                                <button onClick={() => removeTopupLine(line.plan.wmproductId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><X size={13} /></button>
                              </td>
                            </tr>
                          ))
                      }
                      <tr style={{ background: '#f9f9f9' }}>
                        <td colSpan="4" style={{ padding: '8px 10px', border: '1px solid #e0e0e0', fontWeight: '600' }}>Total line: {topupCart.length}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '600' }}>NT {topupTotalAmount}</td>
                        <td style={{ border: '1px solid #e0e0e0' }}></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Receiving Info */}
                  <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '13px', color: '#444' }}>Receiving Info.</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <label style={{ width: '130px', fontSize: '12px', color: '#555', flexShrink: 0 }}>Company <span style={{ color: 'red' }}>*</span></label>
                      <select value={topupCompany} onChange={e => setTopupCompany(e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', border: `1px solid ${topupCompany ? '#ccc' : '#e74c3c'}`, borderRadius: '4px', fontSize: '12px', background: 'white', color: topupCompany ? '#333' : '#999' }}>
                        <option value="">-- Chọn công ty (bắt buộc) --</option>
                        <option value={accountName}>{accountName}</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <label style={{ width: '130px', fontSize: '12px', color: '#555', flexShrink: 0 }}>Company Tax ID</label>
                      <input type="text" value={topupTaxId} onChange={e => setTopupTaxId(e.target.value)} placeholder="Tax ID"
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <label style={{ width: '130px', fontSize: '12px', color: '#555', flexShrink: 0, paddingTop: '7px' }}>Note</label>
                      <input type="text" value={topupNote} maxLength={100} onChange={e => setTopupNote(e.target.value)} placeholder="up to 100 words"
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} />
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
              ) : (
              /* RIGHT — order summary + receiving info (eSIM / SIM) */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

                  {/* Reminder */}
                  <div style={{ background: '#e8f7f5', border: '1px solid #b2dfdb', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#2e7d62', lineHeight: '1.8' }}>
                    <div><strong>Reminder:</strong></div>
                    <div>※ For sending to different recipients, please place separate orders.</div>
                    <div>※ eSIM and SIM will not be included in the same order. Please place separate orders for each.</div>
                  </div>

                  {/* Cart table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #e0e0e0' }}>Product Name</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #e0e0e0', width: '80px' }}>Price</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #e0e0e0', width: '90px' }}>Quantity</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', border: '1px solid #e0e0e0', width: '90px' }}>Amount</th>
                        <th style={{ padding: '8px 12px', border: '1px solid #e0e0e0', width: '36px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.length === 0
                        ? <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', border: '1px solid #e0e0e0', color: '#999', fontSize: '12px' }}>Select plans from the left panel</td></tr>
                        : cart.map(c => {
                            const id = c.plan.wmproductId || c.plan.productId;
                            return (
                              <tr key={id}>
                                <td style={{ padding: '7px 12px', border: '1px solid #e8e8e8', fontSize: '12px' }}>{c.plan.productName}</td>
                                <td style={{ padding: '7px 12px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>NT {c.plan.price}</td>
                                <td style={{ padding: '7px 12px', border: '1px solid #e8e8e8', textAlign: 'center' }}>
                                  <input type="number" min="1" value={c.qty}
                                    onChange={e => updateQty(id, parseInt(e.target.value)||0)}
                                    style={{ width: '55px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '3px', padding: '2px', fontSize: '12px' }} />
                                </td>
                                <td style={{ padding: '7px 12px', border: '1px solid #e8e8e8', textAlign: 'center', fontSize: '12px' }}>NT {c.plan.price * c.qty}</td>
                                <td style={{ padding: '7px 8px', border: '1px solid #e8e8e8', textAlign: 'center' }}>
                                  <button onClick={() => updateQty(id, 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c' }}><X size={13} /></button>
                                </td>
                              </tr>
                            );
                          })
                      }
                      <tr style={{ background: '#f9f9f9' }}>
                        <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0', fontWeight: '600' }}>Total</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '600' }}>NT {totalPrice}</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '600' }}>{totalQty}</td>
                        <td style={{ padding: '8px 12px', border: '1px solid #e0e0e0', textAlign: 'center', fontWeight: '600' }}>NT {totalPrice}</td>
                        <td style={{ border: '1px solid #e0e0e0' }}></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Receiving Info */}
                  <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '13px' }}>Receiving Info.</div>
                    <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Company <span style={{ color: 'red' }}>*</span></label>
                    <select value={company} onChange={e => setCompany(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: `1px solid ${company ? '#ccc' : '#e74c3c'}`, borderRadius: '4px', fontSize: '12px', background: 'white', marginBottom: '12px', color: company ? '#333' : '#999' }}>
                      <option value="">-- Chọn công ty (bắt buộc) --</option>
                      <option value={accountName}>{accountName}</option>
                    </select>

                    {/* eSIM fields */}
                    {tab === 'esim' && <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <label style={{ width: '130px', fontSize: '12px', color: '#555', flexShrink: 0 }}>Email <span style={{color:'red'}}>*</span></label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
                          style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ width: '130px', fontSize: '12px', color: '#555', flexShrink: 0 }}>E-commerce Order</label>
                        <input type="text" value={ecomOrder} onChange={e => setEcomOrder(e.target.value)} placeholder="E-commerce Order"
                          style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} />
                      </div>
                    </>}

                    {/* SIM fields */}
                    {tab === 'sim' && <>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Invoice Type</label>
                          <select value={invoiceType} onChange={e => setInvoiceType(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', background: 'white' }}>
                            <option value={1}>Electronic (PDF)</option>
                            <option value={0}>Donate</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Tax ID</label>
                          <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="Tax ID"
                            style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Receiving Name <span style={{color:'red'}}>*</span></label>
                          <input type="text" value={receivingName} onChange={e => setReceivingName(e.target.value)} placeholder="Full name"
                            style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Tel <span style={{color:'red'}}>*</span></label>
                          <input type="tel" value={receivingTel} onChange={e => setReceivingTel(e.target.value)} placeholder="Phone"
                            style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Receiving Address <span style={{color:'red'}}>*</span></label>
                        <input type="text" value={receivingAdd} onChange={e => setReceivingAdd(e.target.value)} placeholder="Full delivery address"
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <label style={{ width: '130px', fontSize: '12px', color: '#555', flexShrink: 0 }}>E-commerce Order</label>
                        <input type="text" value={ecomOrder} onChange={e => setEcomOrder(e.target.value)} placeholder="E-commerce Order"
                          style={{ flex: 1, padding: '6px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>Note</label>
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Order note"
                          style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                      </div>
                    </>}
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== ORDER DETAIL MODAL ===================== */}
      {selectedOrder && (() => {
        const isTopup = selectedOrder.type === 'SIM Top-up';
        const items = selectedOrder.items || [];
        const total = items.reduce((s, it) => s + (it.amount ?? 0), 0);
        return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px' }}
          onClick={() => setSelectedOrder(null)}>
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
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {detailTab === 'info' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px', marginBottom: '20px' }}>
                    {[
                      ['Order number', selectedOrder.orderId],
                      ['Order Status', selectedOrder.history || ''],
                      ['Quantity', selectedOrder.quantity],
                      ['Order Date', selectedOrder.date],
                      ['Product Type', selectedOrder.type],
                      ['E-commerce Order', selectedOrder.ecomOrder || ''],
                      ['Company name', selectedOrder.company || ''],
                      ['Note', selectedOrder.note || ''],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>{label}</div>
                        <input readOnly value={val ?? ''}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', background: '#fff', color: '#555', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#f5f5f5', padding: '10px 14px', fontWeight: 'bold', fontSize: '13px', borderRadius: '4px 4px 0 0' }}>Order List</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <th style={{ padding: '10px', textAlign: 'left', width: '70px' }}>Item No.</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Product Name</th>
                        <th style={{ padding: '10px', textAlign: 'right', width: '90px' }}>Price</th>
                        {isTopup ? (
                          <>
                            <th style={{ padding: '10px', textAlign: 'left', width: '70px' }}>Days</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>SN</th>
                          </>
                        ) : (
                          <th style={{ padding: '10px', textAlign: 'center', width: '90px' }}>Quantity</th>
                        )}
                        <th style={{ padding: '10px', textAlign: 'right', width: '100px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '10px' }}>{idx + 1}</td>
                          <td style={{ padding: '10px' }}>{it.productName}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>NT {it.price}</td>
                          {isTopup ? (
                            <>
                              <td style={{ padding: '10px' }}>{it.day}</td>
                              <td style={{ padding: '10px', fontFamily: 'monospace' }}>{it.sn}</td>
                            </>
                          ) : (
                            <td style={{ padding: '10px', textAlign: 'center' }}>{it.qty}</td>
                          )}
                          <td style={{ padding: '10px', textAlign: 'right' }}>NT {it.amount}</td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr><td colSpan={isTopup ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Không có chi tiết dòng (đơn cũ).</td></tr>
                      )}
                    </tbody>
                    {items.length > 0 && (
                      <tfoot>
                        <tr style={{ borderTop: '1px solid #e0e0e0' }}>
                          <td colSpan={isTopup ? 5 : 4} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>NT {total}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </>
              ) : (
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
                      <td style={{ padding: '10px' }}>{selectedOrder.date}</td>
                      <td style={{ padding: '10px' }}>{selectedOrder.status}</td>
                      <td style={{ padding: '10px' }}>{selectedOrder.history}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
