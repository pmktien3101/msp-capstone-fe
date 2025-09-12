'use client';

import React from 'react';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';

const Header = () => {
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
          <div className="user-name">Anima Agrawal</div>
          <div className="user-location">U.P, India</div>
        </div>
        
        {/* User Avatar */}
        <div className="user-avatar">
          <Avatar name="Anima Agrawal" size="lg" />
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

        .user-avatar {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Header;
