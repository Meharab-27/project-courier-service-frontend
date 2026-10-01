

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const routes = [
  { name: 'Home', url: '/' },
  { name: 'About us', url: '/about-us' },
] as const

export default function Header() {
  return (
    <header className="w-full h-16 border-b">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
      
        <Link href="/" className="text-lg font-bold">
          courier-service
        </Link>

        
        <nav className="flex gap-3">
          {routes.map((route) => (
            <Link key={route.url} href={route.url}>
              {route.name}
            </Link>
          ))}
        </nav>

       
        <div>
            <Button 
            variant="outline"
            render={<Link href="/login">Login</Link>}
            nativeButton={false}
            
            >
                Login
            </Button>
        </div>
      </div>
    </header>
  )
}