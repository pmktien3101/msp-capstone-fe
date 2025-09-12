import React, { ReactNode } from 'react'
import MainLayout from '@/components/layout/MainLayout'

const RootLayout = ({children}: {children:ReactNode}) => {
  return (
    <MainLayout>
      {/* <StreamVideoProvider> */}
        {children}
      {/* </StreamVideoProvider> */}
    </MainLayout>
  )
}

export default RootLayout