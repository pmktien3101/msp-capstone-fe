'use client'
import React from 'react'
import { sidebarLinks } from '@/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <section className="sticky left-0 top-16 flex h-screen w-fit flex-col bg-gray-50 px-4 py-6 pb-20 text-black max-sm:hidden lg:w-[264px]">
      {/* Navigation Links */}
      <div className="flex flex-col items-center gap-4 mt-20">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route
          const Icon = link.icon
          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn(
                'flex w-full items-center gap-4 rounded-lg px-6 py-4 transition-all hover:bg-orange-100',
                {
                  'bg-orange-400 hover:bg-orange-500': isActive,
                }
              )}
            >
              <div className="flex items-center justify-center">
                <Icon width={24} height={24} className={isActive ? 'text-white' : 'text-orange-500'} />
              </div>
              <p className={`flex-1 text-lg font-normal max-lg:hidden ${isActive ? 'text-white' : 'text-gray-500'}`}>{link.label}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default Sidebar