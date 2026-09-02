'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pricingFeatures: { feature: string; free: string | boolean; pro: string | boolean; note?: string }[] = [
  { feature: 'Daily AI questions', free: '10 / day', pro: 'Unlimited', note: 'No rate limit' },
  { feature: 'NBR Act & SRO Citations', free: true, pro: true, note: 'Direct section links' },
  { feature: 'Conversation History & Folders', free: true, pro: true },
  { feature: 'Tax Slabs & Calculation Formula', free: true, pro: true },
  { feature: 'Citation & Memo Export (PDF/Doc)', free: false, pro: true },
  { feature: 'Priority High-Speed Reasoning', free: false, pro: true },
  { feature: 'Dedicated Support & Tax Updates', free: false, pro: true },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  const proPrice = isAnnual ? '৳799' : '৳999'
  const billingPeriod = isAnnual ? '/ month, billed yearly' : '/ month'

  return (
    <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/30 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0F6E56]/10 text-[#0F6E56] dark:text-emerald-400 dark:bg-[#0F6E56]/20 mb-2"
          >
            Flexible & Transparent
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            Simple, Predictable Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-base"
          >
            Start free, upgrade anytime when your tax advisory needs expand.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-6 flex items-center justify-center gap-3"
          >
            <div className="relative p-1 bg-gray-200/80 dark:bg-gray-800 rounded-full flex items-center">
              <button
                onClick={() => setIsAnnual(false)}
                className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors z-10 ${
                  !isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {!isAnnual && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-gray-900 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Monthly Billing</span>
              </button>

              <button
                onClick={() => setIsAnnual(true)}
                className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors z-10 flex items-center gap-1.5 ${
                  isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {isAnnual && (
                  <motion.div
                    layoutId="billingPill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-gray-900 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Annual Billing</span>
                <span className="relative z-10 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#0F6E56] text-white">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Pricing Comparison Table & Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
            
            {/* Free Plan */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free Starter</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
                    Personal
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Perfect for individual taxpayers and casual tax questions.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">৳0</span>
                  <span className="text-sm text-gray-400">/ forever</span>
                </div>

                <div className="space-y-3 mb-8">
                  {pricingFeatures.map((item) => (
                    <div key={item.feature} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.feature}</span>
                      <div>
                        {typeof item.free === 'boolean' ? (
                          item.free ? (
                            <Check size={16} className="text-[#0F6E56]" />
                          ) : (
                            <X size={16} className="text-gray-300 dark:text-gray-700" />
                          )
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {item.free}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>

            {/* Pro Plan (Highlighted with Glow Accent) */}
            <div className="relative p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-b from-[#0F6E56]/5 via-transparent to-transparent dark:from-[#0F6E56]/10">
              {/* Popular Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#0F6E56] text-white shadow-md shadow-[#0F6E56]/30">
                  <Sparkles size={12} /> Most Popular
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Pro Expert <span className="text-[#0F6E56] text-xs font-mono">UNLIMITED</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  For accountants, businesses, tax consultants, and law firms.
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <motion.span 
                    key={proPrice}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-extrabold text-[#0F6E56] dark:text-emerald-400"
                  >
                    {proPrice}
                  </motion.span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{billingPeriod}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {pricingFeatures.map((item) => (
                    <div key={item.feature} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{item.feature}</span>
                      <div>
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <div className="w-5 h-5 rounded-full bg-[#0F6E56]/10 dark:bg-[#0F6E56]/30 flex items-center justify-center text-[#0F6E56] dark:text-emerald-400">
                              <Check size={14} className="stroke-[2.5]" />
                            </div>
                          ) : (
                            <X size={16} className="text-gray-300 dark:text-gray-700" />
                          )
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#0F6E56]/10 dark:bg-[#0F6E56]/30 text-[#0F6E56] dark:text-emerald-400">
                            {item.pro}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button size="lg" className="w-full shadow-lg shadow-[#0F6E56]/20 group" asChild>
                <Link href="/register" className="flex items-center justify-center gap-2">
                  Upgrade to Pro <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

          </div>
        </motion.div>

        {/* Security & Guarantee Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck size={14} className="text-[#0F6E56]" />
          <span>7-day money-back guarantee · Cancel anytime · bKash, Nagad, Visa & Mastercard accepted</span>
        </div>
      </div>
    </section>
  )
}
