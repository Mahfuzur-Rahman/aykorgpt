'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setSession } from '@/lib/session'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

type Step = 'details' | 'verify'

const API = process.env.NEXT_PUBLIC_API_URL || ''

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`)
  return data
}

function RegisterFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'free'

  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  // ── Step 1: create the account, backend emails a verification code ────────
  async function handleDetails(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await postJson('/api/auth/register', {
        email,
        password,
        full_name: name,
        plan,
      })
      toast.success('We sent a 6-digit code to your email.')
      setStep('verify')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: verify the emailed code, backend returns a session ────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length !== 6) {
      toast.error('Enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      const session = await postJson('/api/auth/verify', { email, code: code.trim() })
      setSession(session)
      toast.success('Email verified! Welcome to AykorGPT.')
      router.push('/chat')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend the code ───────────────────────────────────────────────────────
  async function handleResend() {
    setResending(true)
    try {
      await postJson('/api/auth/resend', { email })
      toast.success('A new code is on its way.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend.')
    } finally {
      setResending(false)
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
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {step === 'details' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 'details'
              ? plan === 'pro'
                ? 'Start your Pro trial'
                : '10 free questions every day'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {step === 'details' && plan === 'pro' && (
          <div className="bg-[#0F6E56]/10 border border-[#0F6E56]/20 rounded-xl px-4 py-3 text-sm text-[#0F6E56] text-center mb-4 font-medium">
            You&apos;re signing up for Pro — unlimited questions
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm p-8 space-y-5">
          {step === 'details' ? (
            <>
              <GoogleSignInButton label="Sign up with Google" />

              <div className="relative flex items-center justify-center">
                <div className="border-t w-full border-gray-200 dark:border-gray-800"></div>
                <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-400 absolute">OR</span>
              </div>

              <form onSubmit={handleDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
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
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Sending code…' : 'Create Account'}
              </Button>
            </form>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </Button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#0F6E56] font-medium hover:underline disabled:opacity-50"
                >
                  {resending ? 'Resending…' : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0F6E56] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>}>
      <RegisterFormContent />
    </Suspense>
  )
}
