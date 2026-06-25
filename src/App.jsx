import React, { useState } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import DailyNotice from './pages/DailyNotice';
import ImportantNotice from './pages/ImportantNotice';
import EsimApn from './pages/EsimApn';
import TopupApn from './pages/TopupApn';
import MyQuote from './pages/MyQuote';
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

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('daily-notice');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'daily-notice':
        return <DailyNotice />;
      case 'important-notice':
        return <ImportantNotice />;
      case 'esim-apn':
        return <EsimApn />;
      case 'topup-apn':
        return <TopupApn />;
      case 'my-quote':
        return <MyQuote />;
      case 'my-bill':
        return <MyBill />;
      case 'my-order':
        return <MyShip />;
      case 'my-order-new':
        return <MyShip autoOpenAdd />;
      case 'my-topup':
        return <MyDeposit />;
      case 'order-matching':
        return <OrderMatching />;
      case 'mail-customized':
        return <MailCustomized />;
      case 'refund-order':
        return <ReturnOrders />;
      case 'refund-auto':
        return <ReturnAuto />;
      case 'settings':
        return <SettingsPage />;
      case 'inquiry-service':
        return <InquiryService />;
      default:
        return <GeneralPlaceholder pageKey={activePage} />;
    }
  };

  return (
    <div className="app-container" style={{ paddingBottom: '40px' }}>
      {/* Top Navigation Bar */}
      <Topbar 
        isSidebarCollapsed={isSidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Main Content Area: Sidebar + Scrollable View Wrapper */}
      <div className="main-content">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          activePage={activePage} 
          setActivePage={setActivePage} 
        />
        
        {/* Scrollable page body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          {renderActivePage()}
        </div>
      </div>

      {/* Footer bar */}
      <footer className="footer">
        <div>WorldMove mobile &copy; 2023 Copyright.</div>
        <div>2.6.7.1</div>
      </footer>

      {/* Developer API Console */}
      <ApiConsole />
    </div>
  );
}

export default App;
