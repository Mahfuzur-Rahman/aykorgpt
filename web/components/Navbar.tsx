'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getSession, clearSession } from '@/lib/session'

export function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const session = getSession()
    const superuserId = typeof window !== 'undefined' ? localStorage.getItem('bd_superuser_id') : null
    setIsLoggedIn(!!(session || superuserId))
  }, [])

  function handleLogout() {
    clearSession()
    setIsLoggedIn(false)
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 dark:bg-gray-950/80 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#0F6E56] flex items-center justify-center text-white font-bold text-xs tracking-tight">
            AK
          </span>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Aykor<span className="text-[#0F6E56]">GPT</span></span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/calculator">Calculator</Link>
          </Button>

          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/chat">Chat</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={14} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
