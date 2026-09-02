'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setSession } from '@/lib/session'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || `Sign in failed (${res.status})`)

      setSession(data)
      router.push('/chat')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-gray-50/60 dark:bg-gray-950 px-4 py-12">
      {/* Top Left Navigation Bar */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#0F6E56] hover:text-[#0F6E56] dark:hover:text-emerald-400 shadow-sm transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity">
            <span className="w-10 h-10 rounded-xl bg-[#0F6E56] flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-md shadow-[#0F6E56]/20">
              AK
            </span>
            <span className="font-bold text-2xl text-gray-900 dark:text-white">Aykor<span className="text-[#0F6E56]">GPT</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your AykorGPT account</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm p-8 space-y-5">
          <GoogleSignInButton label="Sign in with Google" />

          <div className="relative flex items-center justify-center">
            <div className="border-t w-full border-gray-200 dark:border-gray-800"></div>
            <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-400 absolute">OR</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link href="/register" className="text-[#0F6E56] font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  )
}
