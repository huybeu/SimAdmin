import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Calculator, Layers, CheckCircle, Smartphone, CreditCard } from 'lucide-react';
import { fetchConfig, saveConfig } from '../utils/dataStore';

const CONFIG_NAME = 'pricing';

// Giá = giá_nhập × conversionRate + markup_loại_SIM
const DEFAULTS = {
  conversionRate: 1000,
  esimMarkup: 30000,
  physicalMarkup: 5000,
};

const fmt = (n) => (Number(n) || 0).toLocaleString('vi-VN');

const NumberInput = ({ value, onChange, suffix, placeholder }) => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState('');

  const handleFocus = (e) => {
    setFocused(true);
    setText(value === 0 ? '' : String(value));
    setTimeout(() => e.target.select(), 0);
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseInt(text.replace(/\D/g, ''), 10) || 0;
    onChange(parsed);
    setText('');
  };

  const handleChange = (e) => setText(e.target.value.replace(/[^\d]/g, ''));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'ArrowUp')   { e.preventDefault(); onChange(value + 1000); }
    if (e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(0, value - 1000)); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={focused ? text : fmt(value)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: suffix ? '11px 60px 11px 14px' : '11px 14px',
          background: 'var(--input-bg, #1b222a)',
          border: focused ? '1px solid var(--teal-primary)' : '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--text-main)',
          fontSize: '16px',
          fontFamily: 'monospace',
          fontWeight: 600,
          boxSizing: 'border-box',
          outline: 'none',
          transition: 'border-color 0.15s',
          letterSpacing: '0.3px',
        }}
      />
      {suffix && (
        <span style={{
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '11px', color: 'var(--text-muted)', pointerEvents: 'none',
        }}>
          {suffix}
        </span>
      )}
    </div>
  );
};

const PriceConfig = () => {
  const [cfg, setCfg] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sample, setSample] = useState(10);

  useEffect(() => {
    let active = true;
    fetchConfig(CONFIG_NAME)
      .then((data) => { if (active && data) setCfg({ ...DEFAULTS, ...data }); })
      .catch((err) => console.error('[price-config] load lỗi:', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const num = (v) => (v === '' ? 0 : Number(v) || 0);
  const set = (key) => (val) => setCfg((prev) => ({ ...prev, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    const normalized = Object.fromEntries(
      Object.entries(cfg).map(([k, v]) => [k, num(v)])
    );
    setSaving(true);
    try {
      await saveConfig(CONFIG_NAME, normalized);
      setCfg(normalized);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[price-config] lưu lỗi:', err);
      alert('Lưu cấu hình thất bại: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const base = num(sample) * num(cfg.conversionRate);
  const priceEsim = base + num(cfg.esimMarkup);
  const pricePhysical = base + num(cfg.physicalMarkup);

  const labelStyle = {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-main)',
    display: 'block', marginBottom: '8px',
  };
  const hintStyle = { fontSize: '11px', color: 'var(--text-muted)', marginTop: '7px' };

  const ResultTile = ({ icon, label, markup, total, accent }) => (
    <div style={{ flex: '1 1 220px', background: 'var(--card-header-bg)', border: `1px solid ${accent}33`, borderRadius: '10px', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accent, fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>
        {icon}<span>{label}</span>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
        ({fmt(sample)} × {fmt(cfg.conversionRate)}) + {fmt(markup)}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
        {fmt(total)} <span style={{ fontSize: '14px', fontWeight: 600, color: accent }}>₫</span>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">CẤU HÌNH GIÁ HỆ THỐNG</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span>Báo giá</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Cấu hình giá</span>
        </div>
      </div>

      <form onSubmit={handleSave}>

        {/* ── 1. Hệ số quy đổi ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header card-header-teal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={15} />
              <span>Hệ số quy đổi VND</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ maxWidth: '360px' }}>
              <label style={labelStyle}>Hệ số quy đổi (VND)</label>
              <NumberInput value={num(cfg.conversionRate)} onChange={set('conversionRate')} suffix="× VND" placeholder="VD: 1000" />
              <div style={hintStyle}>
                Giá bán = <code style={{ color: 'var(--teal-primary)' }}>giá_nhập × {fmt(cfg.conversionRate)}</code> + markup
                &nbsp;·&nbsp; ↑↓ tăng/giảm 1.000
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Markup theo loại SIM ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header card-header-orange">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={15} />
              <span>+ Markup theo loại SIM (cộng thêm)</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px' }}>
                <label style={labelStyle}>
                  <Smartphone size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
                  eSIM — cộng thêm
                </label>
                <NumberInput value={num(cfg.esimMarkup)} onChange={set('esimMarkup')} suffix="₫" placeholder="VD: 30000" />
                <div style={hintStyle}>↑↓ tăng/giảm 1.000 · hiện tại: {fmt(cfg.esimMarkup)} ₫</div>
              </div>
              <div style={{ flex: '1 1 220px' }}>
                <label style={labelStyle}>
                  <CreditCard size={13} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
                  SIM vật lý — cộng thêm
                </label>
                <NumberInput value={num(cfg.physicalMarkup)} onChange={set('physicalMarkup')} suffix="₫" placeholder="VD: 5000" />
                <div style={hintStyle}>↑↓ tăng/giảm 1.000 · hiện tại: {fmt(cfg.physicalMarkup)} ₫</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Bảng giá tham chiếu ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={15} />
              <span>Bảng giá tham chiếu</span>
            </div>
          </div>
          <div className="card-body">

            {/* Công thức */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <strong style={{ color: 'var(--text-main)' }}>Giá</strong> =
              <span style={{ color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>giá nhập</span> ×
              <span style={{ color: '#00ffd5', fontFamily: 'monospace', fontWeight: 700 }}>{fmt(cfg.conversionRate)}</span> +
              <span style={{ color: '#ff9f43', fontFamily: 'monospace', fontWeight: 700 }}>markup loại SIM</span>
            </div>

            {/* Giá nhập thử */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa', whiteSpace: 'nowrap' }}>Giá nhập thử:</label>
              <div style={{ width: '160px' }}>
                <NumberInput value={num(sample)} onChange={setSample} placeholder="VD: 10" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>→ giá bán tính lại ngay theo cấu hình hiện tại.</span>
            </div>

            {/* Hai thẻ kết quả */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <ResultTile icon={<Smartphone size={16} />} label="eSIM" markup={num(cfg.esimMarkup)} total={priceEsim} accent="#00ffd5" />
              <ResultTile icon={<CreditCard size={16} />} label="SIM vật lý" markup={num(cfg.physicalMarkup)} total={pricePhysical} accent="#ff9f43" />
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4caf50', fontSize: '13px' }}>
              <CheckCircle size={15} /> Đã lưu cấu hình giá!
            </span>
          )}
          <button
            type="submit"
            className="btn btn-orange"
            disabled={loading || saving}
            style={{ padding: '9px 28px', fontWeight: 'bold', opacity: (loading || saving) ? 0.6 : 1, cursor: (loading || saving) ? 'not-allowed' : 'pointer' }}
          >
            <Save size={14} />
            <span>{saving ? 'Đang lưu…' : loading ? 'Đang tải…' : 'Lưu cấu hình chung'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default PriceConfig;
