import React, { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import ManageAgents from './pages/ManageAgents';
import DailyNotice from './pages/DailyNotice';
import ImportantNotice from './pages/ImportantNotice';
import EsimApn from './pages/EsimApn';
import TopupApn from './pages/TopupApn';
import MyQuote from './pages/MyQuote';
import PriceConfig from './pages/PriceConfig';
import MyBill from './pages/MyBill';
import MyShip from './pages/MyShip';
import MyDeposit from './pages/MyDeposit';
import OrderMatching from './pages/OrderMatching';
import MailCustomized from './pages/MailCustomized';
import ReturnOrders from './pages/ReturnOrders';
import ReturnAuto from './pages/ReturnAuto';
import SettingsPage from './pages/SettingsPage';
import InquiryService from './pages/InquiryService';
import GeneralPlaceholder from './pages/GeneralPlaceholder';
import ApiConsole from './components/ApiConsole';
import LoginScreen from './components/LoginScreen';
import { useAuth } from './auth/AuthContext';
import { isPageAllowed, defaultPageForRole } from './lib/roles';

function App() {
  const { user, profile, role, loading, logout, firebaseEnabled, authenticated, profileError, retryProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('daily-notice');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Chuyển về trang mặc định theo role nếu trang hiện tại không được phép
  useEffect(() => {
    if (!firebaseEnabled || !role) return;
    if (!isPageAllowed(role, activePage)) setActivePage(defaultPageForRole(role));
  }, [role, activePage, firebaseEnabled]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #8a97a8)' }}>Đang tải…</div>;
  }
  if (!authenticated) {
    return <LoginScreen />;
  }

  // Hồ sơ lỗi (Firestore Rules chưa publish) → banner + nút thử lại
  const profileErrorBanner = firebaseEnabled && user && profileError ? (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#7d1f1f', color: '#ffd0d0', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', gap: '12px' }}>
      <span>⚠ Không tải được hồ sơ: <em>{profileError}</em> — Hãy publish Firestore Rules rồi nhấn thử lại.</span>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button onClick={retryProfile} className="btn btn-teal" style={{ padding: '4px 14px', fontSize: '12px' }}>Thử lại</button>
        <button onClick={() => logout()} className="btn btn-red" style={{ padding: '4px 14px', fontSize: '12px' }}>Đăng xuất</button>
      </div>
    </div>
  ) : null;

  // Tài khoản bị khoá
  if (firebaseEnabled && profile && profile.active === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main, #e6edf3)', background: 'var(--bg-main, #0f141a)' }}>
        <div>Tài khoản của bạn đã bị khoá. Liên hệ quản trị viên.</div>
        <button onClick={() => logout()} className="btn btn-teal" style={{ padding: '8px 20px' }}>Đăng xuất</button>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'daily-notice':      return <DailyNotice />;
      case 'important-notice':  return <ImportantNotice />;
      case 'esim-apn':          return <EsimApn />;
      case 'topup-apn':         return <TopupApn />;
      case 'my-quote':          return <MyQuote />;
      case 'price-config':      return <PriceConfig />;
      case 'my-bill':           return <MyBill />;
      case 'my-order':          return <MyShip />;
      case 'my-order-new':      return <MyShip autoOpenAdd />;
      case 'my-topup':          return <MyDeposit />;
      case 'manage-agents':     return <ManageAgents />;
      case 'order-matching':    return <OrderMatching />;
      case 'mail-customized':   return <MailCustomized />;
      case 'refund-order':      return <ReturnOrders />;
      case 'refund-auto':       return <ReturnAuto />;
      case 'settings':          return <SettingsPage />;
      case 'inquiry-service':   return <InquiryService />;
      default:                  return <GeneralPlaceholder pageKey={activePage} />;
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px', paddingTop: profileErrorBanner ? '44px' : undefined }}>
      {profileErrorBanner}
      <Topbar isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activePage={activePage}
          setActivePage={setActivePage}
          role={role}
        />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          {renderActivePage()}
        </div>
      </div>
      <footer className="footer">
        <div>WorldMove mobile &copy; 2023 Copyright.</div>
        <div>2.6.7.1</div>
      </footer>
      <ApiConsole />
    </div>
  );
}

export default App;
