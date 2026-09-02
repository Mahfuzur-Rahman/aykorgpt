'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Calculator, 
  FileCheck2,
  ChevronRight,
  TrendingDown
} from 'lucide-react'

interface QueryScenario {
  id: string
  pillLabel: string
  question: string
  category: string
  answer: {
    summary: string
    breakdown: { label: string; rate: string; amount: string; tax: string }[]
    totalTax: string
    effectiveRate: string
    citations: string[]
    note: string
  }
}

const scenarios: QueryScenario[] = [
  {
    id: 'individual-slabs',
    pillLabel: 'Individual Tax 2024-25',
    category: 'Income Tax',
    question: 'How is taxable income of ৳12,00,000 calculated for a male individual assessee in FY 2024-25?',
    answer: {
      summary: 'Under the Income Tax Act 2023 & Finance Act 2024, your tax is calculated using progressive slab rates:',
      breakdown: [
        { label: 'First ৳3,50,000', rate: '0%', amount: '৳3,50,000', tax: '৳0' },
        { label: 'Next ৳1,00,000', rate: '5%', amount: '৳1,00,000', tax: '৳5,000' },
        { label: 'Next ৳4,00,000', rate: '10%', amount: '৳4,00,000', tax: '৳40,000' },
        { label: 'Remaining ৳3,50,000', rate: '15%', amount: '৳3,50,000', tax: '৳52,500' },
      ],
      totalTax: '৳97,500',
      effectiveRate: '8.125%',
      citations: ['Income Tax Act 2023, Second Schedule', 'Finance Act 2024, Clause 48'],
      note: 'Minimum tax of ৳5,000 applies for Dhaka & Chattogram City Corporation residents.'
    }
  },
  {
    id: 'vat-software',
    pillLabel: 'Software VAT Exemption',
    category: 'VAT & SD',
    question: 'Are custom software development and ITES services exempt from VAT in Bangladesh?',
    answer: {
      summary: 'Yes, Software development and Information Technology Enabled Services (ITES) qualify for specific VAT exemptions under NBR statutory orders:',
      breakdown: [
        { label: 'Software Dev & ITES', rate: '0% / Exempt', amount: 'Domestic & Export', tax: 'Exempted' },
        { label: 'Cloud Hosting Services', rate: '5%', amount: 'Standard SRO list', tax: 'Standard' },
        { label: 'Input Tax Credit', rate: 'Eligible', amount: 'Form Mushak 9.1', tax: 'Adjustable' },
      ],
      totalTax: 'Exempt / Zero-Rated',
      effectiveRate: '0.00%',
      citations: ['Value Added Tax and Supplementary Duty Act 2012', 'NBR SRO No. 136-Ain/2023/217-VAT'],
      note: 'Subject to valid BASIS membership and compliance with quarterly return filing.'
    }
  },
  {
    id: 'tds-consultancy',
    pillLabel: 'TDS on Consultancy (Sec 52AA)',
    category: 'TDS / Withholding',
    question: 'What is the TDS deduction rate for professional and technical consultancy fee payment of ৳5,00,000?',
    answer: {
      summary: 'Under Section 52AA of Income Tax Act 2023, TDS on technical service or consultancy fees is deducted at source prior to disbursement:',
      breakdown: [
        { label: 'Consultancy Fees up to ৳50L', rate: '10%', amount: 'With e-TIN & PSR', tax: '৳50,000' },
        { label: 'Without 12-Digit e-TIN / PSR', rate: '15%', amount: 'Penalty Rate (150%)', tax: '৳75,000' },
      ],
      totalTax: '৳50,000 (10%)',
      effectiveRate: '10.00%',
      citations: ['Income Tax Act 2023, Section 52AA & Rule 64', 'NBR Withholding Tax Manual 2024'],
      note: 'TDS must be deposited to Govt. treasury via e-Challan within 2 weeks of deduction.'
    }
  }
]

export function TaxSimulator() {
  const [selectedId, setSelectedId] = useState<string>(scenarios[0].id)
  const currentScenario = scenarios.find(s => s.id === selectedId) || scenarios[0]

  return (
    <div className="relative max-w-4xl mx-auto mt-12 mb-16 px-4">
      {/* Interactive Prompt Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mr-2 flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#0F6E56]" /> Try a live query:
        </span>
        {scenarios.map((scenario) => {
          const isActive = scenario.id === selectedId
          return (
            <button
              key={scenario.id}
              onClick={() => setSelectedId(scenario.id)}
              className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-white shadow-md shadow-[#0F6E56]/20'
                  : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800 hover:border-[#0F6E56]/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePillIndicator"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0F6E56] to-[#10b981]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {scenario.pillLabel}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Glassmorphic Showcase Box */}
      <div className="relative">
        {/* Decorative Floating Micro-Badges */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden sm:flex absolute -top-5 -right-4 z-20 items-center gap-1.5 bg-white dark:bg-gray-900 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-emerald-500/10 backdrop-blur-md"
        >
          <ShieldCheck size={14} className="text-[#0F6E56]" />
          <span>NBR Tax Act 2023 Verified</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="hidden sm:flex absolute -bottom-5 -left-4 z-20 items-center gap-1.5 bg-white dark:bg-gray-900 border border-teal-500/30 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-teal-500/10 backdrop-blur-md"
        >
          <Clock size={14} className="text-teal-600" />
          <span>0.42s Law Citation Lookup</span>
        </motion.div>

        {/* The Card */}
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#0F6E56]/30 via-teal-500/15 to-[#0F6E56]/20 shadow-2xl shadow-[#0F6E56]/10">
          <div className="rounded-[22px] bg-white/95 dark:bg-gray-950/90 backdrop-blur-xl p-5 sm:p-7 border border-white/60 dark:border-gray-800 text-left overflow-hidden">
            
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs font-mono text-gray-400">aykorgpt-engine // v2.4</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#0F6E56]/10 text-[#0F6E56] text-xs font-medium">
                  <CheckCircle2 size={12} /> {currentScenario.category}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentScenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* User Query Bubble */}
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/60 p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    You
                  </div>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
                      {currentScenario.question}
                    </p>
                  </div>
                </div>

                {/* AI Assistant Breakdown */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0F6E56] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-[#0F6E56]/20 mt-1">
                    AK
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">AykorGPT Expert</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                          NBR Aligned
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {currentScenario.answer.summary}
                      </p>
                    </div>

                    {/* Interactive Calculation Slabs Table */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/40">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="py-2.5 px-3 sm:px-4 text-left font-medium">Tier / Slab</th>
                            <th className="py-2.5 px-2 sm:px-3 text-center font-medium">Rate</th>
                            <th className="py-2.5 px-2 sm:px-3 text-right font-medium">Base Amount</th>
                            <th className="py-2.5 px-3 sm:px-4 text-right font-medium">Calculated Tax</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                          {currentScenario.answer.breakdown.map((row, idx) => (
                            <motion.tr
                              key={row.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06 }}
                              className="hover:bg-[#0F6E56]/5 transition-colors"
                            >
                              <td className="py-2.5 px-3 sm:px-4 font-medium text-gray-900 dark:text-gray-200">{row.label}</td>
                              <td className="py-2.5 px-2 sm:px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs">
                                  {row.rate}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 sm:px-3 text-right font-mono">{row.amount}</td>
                              <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-semibold text-[#0F6E56] dark:text-emerald-400">
                                {row.tax}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-[#0F6E56]/5 dark:bg-[#0F6E56]/15 font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-800">
                          <tr>
                            <td colSpan={3} className="py-3 px-3 sm:px-4 text-right text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Total Estimated Tax Payable
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right text-sm sm:text-base font-bold text-[#0F6E56] dark:text-emerald-400 font-mono">
                              {currentScenario.answer.totalTax}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Official Citations Box */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <BookOpen size={13} className="text-[#0F6E56]" /> Official Citations:
                      </span>
                      {currentScenario.answer.citations.map((cite) => (
                        <span
                          key={cite}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-[#0F6E56]/10 text-[#0F6E56] dark:text-emerald-300 dark:bg-[#0F6E56]/20 font-medium border border-[#0F6E56]/20"
                        >
                          <FileCheck2 size={12} /> {cite}
                        </span>
                      ))}
                    </div>

                    {/* Pro Tip note */}
                    <p className="text-xs text-gray-400 dark:text-gray-400 italic">
                      💡 {currentScenario.answer.note}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  )
}
