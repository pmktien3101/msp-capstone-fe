import React, { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { StreamVideoProvider } from "@/providers/StreamVideoProvider";
import { ProjectModalProvider } from "@/contexts/ProjectModalContext";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthGuard>
      <ProjectModalProvider>
        <MainLayout>
          <StreamVideoProvider>{children}</StreamVideoProvider>
        </MainLayout>
      </ProjectModalProvider>
    </AuthGuard>
  );
};

export default RootLayout;
