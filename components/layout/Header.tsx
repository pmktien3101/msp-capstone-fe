'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { useUser } from '@/hooks/useUser';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { email, role, logout } = useUser();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserDisplayName = () => {
    if (email) {
      return email.split('@')[0];
    }
    return 'User';
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'pm':
        return 'Project Manager';
      case 'AdminSystem':
        return 'System Administrator';
      case 'BusinessOwner':
        return 'Business Owner';
      default:
        return 'User';
    }
  };

  return (
    <div className="header-container">
      <div className="header-background" />
      
      {/* Logo and Brand */}
      <div className="header-brand">
        <div className="brand-logo">
          <Image src="/logo.png" alt="MSP Logo" width={50} height={45} />
        </div>
        <div className="brand-name">MSP</div>
      </div>

      {/* Right Side - Search, Notify, User */}
      <div className="header-right">
        {/* Search Bar */}
        <div className="header-search">
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#FF5E13" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="#FF5E13" strokeWidth="2"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="search-input"
          />
        </div>

        {/* Notification Icon */}
        <div className="notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#FF5E13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#FF5E13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="18" cy="6" r="4" fill="#D8727D"/>
          </svg>
        </div>
        
        {/* User Info */}
        <div className="user-info">
          <div className="user-name">{getUserDisplayName()}</div>
          <div className="user-location">{getRoleDisplayName()}</div>
        </div>
        
        {/* User Avatar with Dropdown */}
        <div className="user-avatar-container" ref={dropdownRef}>
          <div 
            className="user-avatar" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <Avatar name={getUserDisplayName()} size="lg" />
          </div>
          
          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <div className="dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Profile</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                <div className="dropdown-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .header-container {
          width: 100%;
          height: 90px;
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 24px;
        }

        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.16);
          z-index: -1;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .brand-logo {
          width: 50px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-placeholder {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FF5E13, #FFA463);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
        }

        .brand-name {
          color: #FF5E13;
          font-size: 25px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
        }

        .header-search {
          width: 300px;
          height: 44px;
          background: #FEFEFE;
          border: 1px solid #FFA463;
          border-radius: 6px;
          display: flex;
          align-items: center;
          padding: 0 16px;
        }

        .search-icon {
          margin-right: 12px;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: #787486;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        .search-input::placeholder {
          color: #787486;
        }

        .notification-icon {
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .notification-icon:hover {
          background-color: #FDF0D2;
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          color: #0D062D;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
        }

        .user-location {
          color: #787486;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
        }

        .user-avatar-container {
          position: relative;
        }

        .user-avatar {
          cursor: pointer;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid #E5E7EB;
          min-width: 200px;
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
        }

        .dropdown-item:hover {
          background-color: #F9FAFB;
        }

        .dropdown-item.logout-item {
          color: #EF4444;
        }

        .dropdown-item.logout-item:hover {
          background-color: #FEF2F2;
        }

        .dropdown-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .dropdown-divider {
          height: 1px;
          background-color: #E5E7EB;
          margin: 4px 0;
        }
      `}</style>
    </div>
  );
};

export default Header;
