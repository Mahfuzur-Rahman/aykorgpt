'use client'

import { useState } from 'react'
import { Check, X, ShieldCheck, CreditCard, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const API = process.env.NEXT_PUBLIC_API_URL || ''

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess?: () => void
}

export function UpgradeModal({ isOpen, onClose, userId, onSuccess }: UpgradeModalProps) {
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash')
  const [trxId, setTrxId] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) {
      toast.error('Please sign in first.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan: 'pro',
          payment_method: method,
          trx_id: trxId.trim() || 'DEMO-TRX-' + Math.floor(100000 + Math.random() * 900000),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Upgrade failed.')

      toast.success('Successfully upgraded to Pro! Unlimited questions unlocked.')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upgrade failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#0F6E56]/10 text-[#0F6E56] font-semibold text-xs rounded-full px-3 py-1">
            <Sparkles size={13} /> Upgrade to Pro
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Unlimited Tax Advice & PDF Exports
          </h2>
          <p className="text-sm text-gray-500">
            ৳ 999 / month · Cancel anytime
          </p>
        </div>

        {/* Features */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#0F6E56] shrink-0" />
            <span><strong>Unlimited Questions</strong> every day</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#0F6E56] shrink-0" />
            <span><strong>Printable PDF Advisory Reports</strong> with official NBR Act citations</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#0F6E56] shrink-0" />
            <span><strong>Priority AI Processing</strong> & faster response times</span>
          </div>
        </div>

        {/* Payment selector */}
        <form onSubmit={handleUpgrade} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('bkash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'bkash'
                    ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E] ring-2 ring-[#E2136E]/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="font-bold text-sm">bKash</span>
                <span className="text-[10px] text-gray-400">Personal/Merchant</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('nagad')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'nagad'
                    ? 'border-[#F7941D] bg-[#F7941D]/5 text-[#F7941D] ring-2 ring-[#F7941D]/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="font-bold text-sm">Nagad</span>
                <span className="text-[10px] text-gray-400">Mobile Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'card'
                    ? 'border-[#0F6E56] bg-[#0F6E56]/5 text-[#0F6E56] ring-2 ring-[#0F6E56]/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <CreditCard size={18} className="mb-0.5" />
                <span className="font-medium text-xs">Debit / Card</span>
              </button>
            </div>
          </div>

          {(method === 'bkash' || method === 'nagad') && (
            <div className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700 text-xs space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                Send <strong>৳ 999</strong> to Merchant Number: <strong className="font-mono text-[#0F6E56]">01700000000</strong>
              </p>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="Enter Transaction ID (TrxID)"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
              />
            </div>
          )}

          <Button type="submit" className="w-full text-sm font-semibold py-3" disabled={loading}>
            {loading ? 'Upgrading Account…' : 'Pay ৳999 & Upgrade to Pro'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <ShieldCheck size={13} className="text-[#0F6E56]" /> 256-bit Encrypted & Guaranteed Instant Access
          </div>
        </form>
      </div>
    </div>
  )
}
