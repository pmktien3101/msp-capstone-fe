import React, { ReactNode } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AuthGuard from '@/components/auth/AuthGuard'
import { ProjectModalProvider } from '@/contexts/ProjectModalContext'
import { GlobalModals } from '@/components/layout/GlobalModals'

const RootLayout = ({children}: {children:ReactNode}) => {
  return (
    <AuthGuard>
      <ProjectModalProvider>
        <MainLayout>
          {/* <StreamVideoProvider> */}
            {children}
          {/* </StreamVideoProvider> */}
          <GlobalModals />
        </MainLayout>
      </ProjectModalProvider>
    </AuthGuard>
  )
}

export default RootLayout