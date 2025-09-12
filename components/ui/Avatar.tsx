'use client';

import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div className={`avatar-container ${sizeClasses[size]} ${className}`}>
      <div className="avatar-fallback">
        {getInitials(name)}
      </div>
      
      <style jsx>{`
        .avatar-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF5E13, #FFA463);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          border: 2px solid #FDF0D2;
          transition: transform 0.2s ease;
        }

        .avatar-fallback:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Avatar;
