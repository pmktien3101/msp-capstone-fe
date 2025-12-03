import React, { ReactNode } from 'react';
import BusinessOwnerGuard from '@/components/auth/BusinessOwnerGuard';

interface BusinessLayoutProps {
  children: ReactNode;
}

const BusinessLayout = ({ children }: BusinessLayoutProps) => {
  return (
    <BusinessOwnerGuard>
      {children}
    </BusinessOwnerGuard>
  );
};

export default BusinessLayout;
