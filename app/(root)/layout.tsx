import React, { ReactNode } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import AuthGuard from '@/components/auth/AuthGuard'

const RootLayout = ({children}: {children:ReactNode}) => {
  return (
    <AuthGuard>
      <MainLayout>
        {/* <StreamVideoProvider> */}
          {children}
        {/* </StreamVideoProvider> */}
      </MainLayout>
    </AuthGuard>
  )
}

export default RootLayout