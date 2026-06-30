import React, { useState } from 'react';
import {
  Laptop,
  FileText,
  CreditCard,
  Truck,
  Zap,
  GitCompare,
  Mail,
  RotateCcw,
  Settings,
  MessageSquare,
  Users,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { isPageAllowed } from '../lib/roles';

const Sidebar = ({ isCollapsed, activePage, setActivePage, role }) => {
  // Keep System submenu open by default
  const [openSubmenus, setOpenSubmenus] = useState({
    system: true,
    'quotation-system': false,
    'billing-system': false,
    'shipping-system': false,
    'topup-system': false,
    'mail-management-menu': false,
    'return-management-menu': false,
    'debt-system': false,
  });

  const toggleSubmenu = (menuKey) => {
    setOpenSubmenus(prev => {
      const isCurrentlyOpen = prev[menuKey];
      const allClosed = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      return { ...allClosed, [menuKey]: !isCurrentlyOpen };
    });
  };

  const menuItems = [
    {
      key: 'system',
      label: 'Hệ thống',
      icon: <Laptop size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'important-notice', label: 'Thông báo quan trọng' },
        { key: 'daily-notice', label: 'Thông báo hàng ngày' },
        { key: 'esim-apn', label: 'Cấu hình APN eSIM' },
        { key: 'topup-apn', label: 'APN Nạp tiền vật lý' }
      ]
    },
    {
      key: 'quotation-system',
      label: 'Hệ thống Báo giá',
      icon: <FileText size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'my-quote', label: 'Báo giá của tôi' },
        { key: 'price-config', label: 'Cấu hình giá' }
      ]
    },
    {
      key: 'billing-system',
      label: 'Hệ thống Hóa đơn',
      icon: <CreditCard size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'my-bill', label: 'Hóa đơn của tôi' }
      ]
    },
    {
      key: 'shipping-system',
      label: 'Tạo eSIM',
      icon: <Truck size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'my-order', label: 'Xem thông tin đơn hàng' }
      ]
    },
    {
      key: 'topup-system',
      label: 'Hệ thống Nạp thẻ',
      icon: <Zap size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'my-topup', label: 'Lịch sử nạp thẻ' }
      ]
    },
    {
      key: 'manage-agents',
      label: 'Quản lý đại lý',
      icon: <Users size={16} />
    },
    {
      key: 'order-matching',
      label: 'Khớp đơn hàng',
      icon: <GitCompare size={16} />
    },
    {
      key: 'mail-management-menu',
      label: 'Quản lý Email',
      icon: <Mail size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'mail-customized', label: 'Tùy chỉnh email gửi đi' }
      ]
    },
    {
      key: 'return-management-menu',
      label: 'Quản lý Trả hàng',
      icon: <RotateCcw size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'refund-order', label: 'Đơn hàng trả lại' },
        { key: 'refund-auto', label: 'Tự động trả hàng' }
      ]
    },
    {
      key: 'settings',
      label: 'Cấu hình hệ thống',
      icon: <Settings size={16} />
    },
    {
      key: 'debt-system',
      label: 'Quản lý Công nợ',
      icon: <Wallet size={16} />,
      hasSubmenu: true,
      subItems: [
        { key: 'debt-management', label: 'Sổ cái công nợ' },
        { key: 'my-debt', label: 'Công nợ của tôi' },
      ]
    },
    {
      key: 'inquiry-service',
      label: 'Dịch vụ tra cứu',
      icon: <MessageSquare size={16} />
    }
  ];

  const handleLinkClick = (item) => {
    if (isCollapsed) return; // Don't trigger submenus when collapsed
    
    if (item.hasSubmenu) {
      toggleSubmenu(item.key);
    } else {
      setActivePage(item.key);
    }
  };

  const visibleItems = menuItems
    .map((item) => {
      // Role chưa load (profile null) → hiển thị hết, không ẩn menu
      if (!role) return item;
      if (item.subItems) {
        const subs = item.subItems.filter((s) => isPageAllowed(role, s.key));
        return subs.length ? { ...item, subItems: subs } : null;
      }
      return isPageAllowed(role, item.key) ? item : null;
    })
    .filter(Boolean);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <ul className="sidebar-menu">
        {visibleItems.map((item) => {
          const isSubmenuOpen = openSubmenus[item.key];
          const hasActiveSubItem = item.subItems?.some(sub => sub.key === activePage);
          const isItemActive = activePage === item.key || hasActiveSubItem;

          return (
            <li 
              key={item.key} 
              className={`sidebar-item ${isItemActive ? 'active' : ''}`}
            >
              <div 
                className="sidebar-link" 
                onClick={() => handleLinkClick(item)}
              >
                <div className="sidebar-link-content">
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </div>
                {item.hasSubmenu && !isCollapsed && (
                  <ChevronRight 
                    size={14} 
                    className={`submenu-arrow ${isSubmenuOpen ? 'open' : ''}`} 
                  />
                )}
              </div>

              {item.hasSubmenu && isSubmenuOpen && !isCollapsed && (
                <ul className="submenu">
                  {item.subItems.map((subItem) => {
                    const isSubActive = activePage === subItem.key;
                    return (
                      <li 
                        key={subItem.key} 
                        className={`submenu-item ${isSubActive ? 'active' : ''}`}
                        onClick={() => setActivePage(subItem.key)}
                      >
                        <div className="submenu-link">
                          {subItem.label}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
