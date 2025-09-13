import React, { ReactNode } from 'react';
import AdminGuard from '@/components/auth/AdminGuard';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  );
};

export default AdminLayout;
