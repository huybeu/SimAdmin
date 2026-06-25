import React from 'react';
import { LayoutGrid, Cpu, TrendingUp, AlertTriangle } from 'lucide-react';

const GeneralPlaceholder = ({ pageKey }) => {
  const getPageInfo = (key) => {
    switch (key) {
      case 'important-notice':
        return {
          title: 'IMPORTANT NOTICE',
          description: 'Critical system status, billing updates, and carrier maintenance announcements requiring urgent attention.',
          color: '#d9534f',
          icon: <AlertTriangle size={32} style={{ color: '#d9534f' }} />
        };
      case 'esim-apn':
        return {
          title: 'ESIM APN CONFIGURATION',
          description: 'Manage and search eSIM APN profiles, carrier settings, and auto-activation payloads by MCC/MNC.',
          color: '#209e91',
          icon: <Cpu size={32} style={{ color: '#209e91' }} />
        };
      case 'topup-apn':
        return {
          title: 'TOP-UP APN CONFIGURATION',
          description: 'APN mapping profiles specifically tailored for top-up packages, voucher codes, and manual carrier switches.',
          color: '#f0ad4e',
          icon: <LayoutGrid size={32} style={{ color: '#f0ad4e' }} />
        };
      default:
        // Quotation System, Billing System, etc.
        const label = key.replace(/-/g, ' ').toUpperCase();
        return {
          title: label,
          description: `Manage operations, logs, configurations, and analytical views for the ${label} module.`,
          color: '#209e91',
          icon: <TrendingUp size={32} style={{ color: '#209e91' }} />
        };
    }
  };

  const info = getPageInfo(pageKey);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{info.title}</h1>
        <div className="breadcrumbs">
          <span>Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-active">{info.title}</span>
        </div>
      </div>

      {/* Main card */}
      <div className="card">
        <div className={`card-header ${info.color === '#d9534f' ? 'card-header-red' : info.color === '#f0ad4e' ? 'card-header-orange' : 'card-header-teal'}`}>
          <span>{info.title} - Management Panel</span>
        </div>
        <div className="card-body" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'inline-flex', border: '1px solid var(--border-color)' }}>
            {info.icon}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-main)' }}>{info.title} Dashboard</h2>
          <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
            {info.description} This page has been successfully scaffolded and styled.
          </p>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '15px 25px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: info.color }}>Active</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>System Status</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', padding: '15px 25px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)' }}>0</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Pending Tasks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralPlaceholder;
