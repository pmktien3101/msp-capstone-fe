'use client'
import React from 'react'
import { sidebarLinks } from '@/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-gray-50 p-6 pt-28 text-black max-sm:hidden lg:w-[264px]">
      {/* Navigation Links */}
      <div className="flex flex- flex-col gap-6">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route
          const Icon = link.icon
          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn(
                'flex gap-4 items-center p-4 rounded-lg justify-start',
                {
                  'bg-orange-400': isActive,
                }
              )}
            >
              <Icon width={24} height={24} className={isActive ? 'text-white' : 'text-orange-500'} />
              <p className={`text-lg font-normal max-lg:hidden ${isActive ? 'text-white' : 'text-gray-500'}`}>{link.label}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default Sidebar