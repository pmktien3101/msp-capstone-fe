import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import MobileNav from '../mobile-nav/MobileNav'

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center fixed z-50 w-full bg-gray-50 px-6 py-4 lg:px-10">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/logo.png"
          width={42}
          height={42}
          alt="MSP logo"
          className="max-sm:size-12"
        />
        <p className="text-[26px] font-extrabold text-black max-sm:hidden">
          MSP
        </p>
      </Link>

      <div className="flex justify-between items-center gap-5">
       
        <MobileNav />
      </div>
    </nav>
  )
}

export default Navbar