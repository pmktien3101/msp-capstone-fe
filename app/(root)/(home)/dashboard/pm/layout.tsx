import React, { ReactNode } from 'react';
import ProjectManagerGuard from '@/components/auth/ProjectManagerGuard';

interface PMLayoutProps {
  children: ReactNode;
}

const PMLayout = ({ children }: PMLayoutProps) => {
  return (
    <ProjectManagerGuard>
      {children}
    </ProjectManagerGuard>
  );
};

export default PMLayout;
