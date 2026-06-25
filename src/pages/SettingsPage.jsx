import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle, XCircle, ExternalLink, AlertTriangle, Globe, Key, Webhook } from 'lucide-react';
import { getEnvPresets, getApiConfig, searchMyQuotations } from '../utils/api';

const PRESETS = getEnvPresets();

const SettingsPage = () => {
  const [environment, setEnvironment] = useState(() => localStorage.getItem('api_environment') || 'test');
  const [isSimulator, setIsSimulator] = useState(() => localStorage.getItem('api_simulator') === 'true');

  const [merchantId, setMerchantId] = useState(() => localStorage.getItem('api_merchant_id') || '');
  const [deptId, setDeptId] = useState(() => localStorage.getItem('api_dept_id') || '');
  const [token, setToken] = useState(() => localStorage.getItem('api_token') || '');

  const [redeemCallback, setRedeemCallback] = useState(() => localStorage.getItem('redeemCallbackUrl') || '');
  const [orderCallback, setOrderCallback] = useState(() => localStorage.getItem('orderCallbackUrl') || '');
  const [orderRedeemCallback, setOrderRedeemCallback] = useState(() => localStorage.getItem('orderRedeemCallbackUrl') || '');
  const [depositCallback, setDepositCallback] = useState(() => localStorage.getItem('depositCallbackUrl') || '');
  const [esimActiveCallback, setEsimActiveCallback] = useState(() => localStorage.getItem('esimActiveCallbackUrl') || '');
  const [simActiveCallback, setSimActiveCallback] = useState(() => localStorage.getItem('simActiveCallbackUrl') || '');
  const [simEndCallback, setSimEndCallback] = useState(() => localStorage.getItem('simEndCallbackUrl') || '');

  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'ok' | 'fail'
  const [testMsg, setTestMsg] = useState('');
  const [saved, setSaved] = useState(false);

  const currentPreset = PRESETS[environment];

  const handleApply = (e) => {
    e.preventDefault();
    localStorage.setItem('api_merchant_id', merchantId);
    localStorage.setItem('api_dept_id', deptId);
    localStorage.setItem('api_token', token);
    localStorage.setItem('api_simulator', isSimulator.toString());
    localStorage.setItem('api_environment', environment);
    localStorage.setItem('redeemCallbackUrl', redeemCallback);
    localStorage.setItem('orderCallbackUrl', orderCallback);
    localStorage.setItem('orderRedeemCallbackUrl', orderRedeemCallback);
    localStorage.setItem('depositCallbackUrl', depositCallback);
    localStorage.setItem('esimActiveCallbackUrl', esimActiveCallback);
    localStorage.setItem('simActiveCallbackUrl', simActiveCallback);
    localStorage.setItem('simEndCallbackUrl', simEndCallback);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMsg('Đang kết nối...');
    // Temporarily save current values for test
    localStorage.setItem('api_merchant_id', merchantId);
    localStorage.setItem('api_dept_id', deptId);
    localStorage.setItem('api_token', token);
    localStorage.setItem('api_environment', environment);
    localStorage.setItem('api_simulator', 'false'); // always test real connection
    try {
      const res = await searchMyQuotations();
      if (res.code === 0) {
        setTestStatus('ok');
        setTestMsg(`Kết nối thành công! Nhận được ${res.prodList?.length || 0} gói sản phẩm.`);
      } else {
        setTestStatus('fail');
        setTestMsg(`Lỗi API: code=${res.code} — ${res.msg || 'Unknown error'}`);
      }
    } catch (err) {
      setTestStatus('fail');
      setTestMsg('Không thể kết nối: ' + err.message);
    } finally {
      // Restore simulator setting
      localStorage.setItem('api_simulator', isSimulator.toString());
    }
  };

  const inputStyle = {
    width: '100%', padding: '7px 10px', background: 'var(--input-bg, #1b222a)',
    border: '1px solid var(--border-color)', borderRadius: '5px', color: 'var(--text-main)',
    fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', fontWeight: '500' };
  const sectionStyle = { borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '24px' };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">CẤU HÌNH HỆ THỐNG</h1>
        <div className="breadcrumbs">
          <span>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">Cài đặt</span>
        </div>
      </div>

      <form onSubmit={handleApply}>
        {/* ── SECTION 1: Environment ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header card-header-teal">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={15} />
              <span>Môi trường kết nối</span>
            </div>
          </div>
          <div className="card-body">
            <div style={sectionStyle}>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '12px 16px', border: `2px solid ${environment === key ? 'var(--teal-primary)' : 'var(--border-color)'}`, borderRadius: '8px', flex: '1 1 200px', background: environment === key ? 'rgba(32,158,145,0.08)' : 'transparent' }}>
                    <input type="radio" name="apiEnv" value={key} checked={environment === key} onChange={() => setEnvironment(key)} style={{ marginTop: '3px' }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: environment === key ? 'var(--teal-primary)' : 'var(--text-main)' }}>
                        {key === 'test' ? '🧪 Test Environment' : '🚀 Production'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{preset.baseUrl}</div>
                      <a href={preset.adminUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: 'var(--teal-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                        Mở Admin Portal <ExternalLink size={10} />
                      </a>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="apiMode" checked={!isSimulator} onChange={() => setIsSimulator(false)} />
                  <span style={{ fontSize: '13px', fontWeight: !isSimulator ? '700' : 'normal', color: !isSimulator ? 'var(--teal-primary)' : 'inherit' }}>
                    🔌 Kết nối API thật (Live)
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="apiMode" checked={isSimulator} onChange={() => setIsSimulator(true)} />
                  <span style={{ fontSize: '13px', fontWeight: isSimulator ? '700' : 'normal', color: isSimulator ? 'var(--orange-primary)' : 'inherit' }}>
                    🤖 Giả lập nội bộ (Simulator)
                  </span>
                </label>
              </div>
            </div>

            {/* Current active endpoint info */}
            <div style={{ background: 'rgba(32,158,145,0.08)', border: '1px solid rgba(32,158,145,0.2)', borderRadius: '6px', padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--teal-primary)' }}>Endpoint hiện tại:</strong>{' '}
              <code style={{ color: 'var(--text-main)' }}>{currentPreset.baseUrl}</code>
              {' '}|{' '}
              <strong>Mode:</strong>{' '}
              <span style={{ color: isSimulator ? 'var(--orange-primary)' : '#4caf50', fontWeight: 'bold' }}>
                {isSimulator ? 'SIMULATOR' : 'LIVE API'}
              </span>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Credentials ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header card-header-orange">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={15} />
              <span>Thông tin xác thực API (Merchant Credentials)</span>
            </div>
          </div>
          <div className="card-body">
            {/* Test environment banner */}
            {environment === 'test' && (
              <div style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', fontSize: '12px' }}>
                <AlertTriangle size={13} style={{ color: 'orange', verticalAlign: 'middle', marginRight: '6px' }} />
                <strong style={{ color: 'orange' }}>Môi trường TEST</strong> — Sử dụng tài khoản <code>SDL</code> tại{' '}
                <a href="https://tfmshippingsys.fastmove.com.tw/fmshippingsysadmin" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal-primary)' }}>
                  tfmshippingsys.fastmove.com.tw
                </a>{' '}để lấy <strong>MerchantId</strong>, <strong>DeptId</strong> và <strong>Token</strong> điền vào bên dưới.
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={labelStyle}>Merchant ID <span style={{ color: 'red' }}>*</span></label>
                <input type="text" style={inputStyle} placeholder="VD: 0001" value={merchantId} onChange={e => setMerchantId(e.target.value)} />
              </div>
              <div style={{ flex: '2 1 220px' }}>
                <label style={labelStyle}>Dept ID <span style={{ color: 'red' }}>*</span></label>
                <input type="text" style={inputStyle} placeholder="VD: SDL (0001xx)" value={deptId} onChange={e => setDeptId(e.target.value)} />
              </div>
              <div style={{ flex: '3 1 300px' }}>
                <label style={labelStyle}>Token / Secret Key <span style={{ color: 'red' }}>*</span></label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="text" style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={token} onChange={e => setToken(e.target.value)} />
                  <button type="button" title="Clear token" onClick={() => setToken('')}
                    style={{ padding: '0 10px', border: '1px solid var(--border-color)', borderRadius: '5px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Test connection button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleTestConnection} disabled={testStatus === 'testing' || !merchantId || !token}
                style={{ padding: '7px 18px', background: 'rgba(32,158,145,0.15)', border: '1px solid var(--teal-primary)', color: 'var(--teal-primary)', borderRadius: '5px', cursor: (!merchantId || !token) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: (!merchantId || !token) ? 0.5 : 1 }}>
                {testStatus === 'testing' ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra kết nối'}
              </button>

              {testStatus === 'ok' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4caf50', fontSize: '13px' }}>
                  <CheckCircle size={15} /> {testMsg}
                </div>
              )}
              {testStatus === 'fail' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f44336', fontSize: '13px' }}>
                  <XCircle size={15} /> {testMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Webhooks ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header" style={{ background: 'rgba(90,60,150,0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Webhook size={15} />
              <span>Callback Webhook URLs</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Worldmove sẽ gửi POST request đến các URL này khi có sự kiện. Để trống nếu không dùng.
            </div>
            {[
              { label: 'eSIM Order Callback (2.2)', placeholder: 'https://your-domain.com/callback/order', value: orderCallback, setter: setOrderCallback },
              { label: 'eSIM Order & Redeem Callback (2.5)', placeholder: 'https://your-domain.com/callback/order-redeem', value: orderRedeemCallback, setter: setOrderRedeemCallback },
              { label: 'Redeem Callback (3.2)', placeholder: 'https://your-domain.com/callback/redeem', value: redeemCallback, setter: setRedeemCallback },
              { label: 'Top-Up / Deposit Callback (5.2)', placeholder: 'https://your-domain.com/callback/deposit', value: depositCallback, setter: setDepositCallback },
              { label: 'eSIM Activation Callback', placeholder: 'https://your-domain.com/callback/esim-active', value: esimActiveCallback, setter: setEsimActiveCallback },
              { label: 'SIM Physical Activation Callback', placeholder: 'https://your-domain.com/callback/sim-active', value: simActiveCallback, setter: setSimActiveCallback },
              { label: 'SIM End-of-Plan Callback', placeholder: 'https://your-domain.com/callback/sim-end', value: simEndCallback, setter: setSimEndCallback },
            ].map(({ label, placeholder, value, setter }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <label style={{ width: '280px', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</label>
                <input type="url" style={{ ...inputStyle, flex: 1, minWidth: '260px', fontFamily: 'inherit' }}
                  placeholder={placeholder} value={value} onChange={e => setter(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4caf50', fontSize: '13px' }}>
              <CheckCircle size={15} /> Đã lưu cấu hình!
            </span>
          )}
          <button type="submit" className="btn btn-orange" style={{ padding: '9px 28px', fontWeight: 'bold' }}>
            <Save size={14} />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
