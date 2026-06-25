import React, { useState, useEffect } from 'react';
import { Menu, Globe, User, ChevronDown, LogOut, Settings } from 'lucide-react';

const Topbar = ({ isSidebarCollapsed, toggleSidebar }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 56, seconds: 15 });

  // Real-time countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Reset timer to mock active session loop
              hours = 5;
              minutes = 56;
              seconds = 15;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (val) => String(val).padStart(2, '0');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar} title="Đóng/Mở thanh bên">
          <Menu size={18} />
        </button>
        <div className="brand">
          <strong>WorldMove</strong><span>Hệ thống Giao hàng</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Language selector */}
        <div className="topbar-item" onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
          <Globe size={14} />
          <span>Tiếng Việt</span>
          <ChevronDown size={12} />
          <div className={`dropdown-menu ${isLangDropdownOpen ? 'show' : ''}`}>
            <div className="dropdown-item">Tiếng Việt</div>
            <div className="dropdown-item">Tiếng Anh (English)</div>
          </div>
        </div>

        {/* Real-time Ticking Countdown */}
        <div className="topbar-item session-timer">
          <span>Phiên chạy: {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}</span>
        </div>

        {/* Profile Dropdown */}
        <div className="topbar-item" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
          <User size={14} />
          <span>SimDuLich.VN</span>
          <ChevronDown size={12} />
          <div className={`dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`}>
            <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={14} />
              <span>Cấu hình</span>
            </div>
            <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
