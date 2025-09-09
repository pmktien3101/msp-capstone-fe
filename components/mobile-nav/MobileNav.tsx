'use client'
import React from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { MdMenu } from 'react-icons/md'
import Image from 'next/image'
import Link from 'next/link'
import { sidebarLinks } from '@/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const MobileNav = () => {
  const pathname = usePathname()
  return (
    <section className='w-full max-w-[264px] m-4'>
      <Sheet>
        <SheetTrigger asChild>
          <MdMenu size={32} className="text-orange-500 cursor-pointer sm:hidden" />
        </SheetTrigger>
        <SheetContent side='left' className="border-none bg-black px-4 py-6 z-[100]">
          <SheetTitle className="text-white sr-only">Navigation Menu</SheetTitle>
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/logo.png"
              width={42}
              height={42}
              alt="MSP logo"
            />
            <p className="text-[20px] font-extrabold text-white">
              MSP
            </p>
          </Link>
          <div className='flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto'>
              <section className='flex h-full flex-col gap-6 text-white'>
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.route
                  const Icon = link.icon
                  return (
                    <SheetClose asChild key={link.route}>
                      <Link
                        href={link.route}
                        className={cn(
                          'flex gap-4 items-center px-3 py-2 rounded-lg w-full max-w-60',
                          {
                            'bg-orange-400': isActive,
                          }
                        )}
                      >
                        <Icon width={24} height={24} className={isActive ? 'text-white' : 'text-orange-500'} />
                        <p className={`text-lg font-normal ${isActive ? 'text-white' : 'text-gray-500'}`}>
                          {link.label}
                        </p>
                      </Link>
                    </SheetClose>
                  )
                })}
              </section>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default MobileNav