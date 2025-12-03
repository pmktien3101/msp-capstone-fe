import React, { ReactNode } from 'react';
import MemberGuard from '@/components/auth/MemberGuard';

interface MemberLayoutProps {
  children: ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
  return (
    <MemberGuard>
      {children}
    </MemberGuard>
  );
};

export default MemberLayout;
