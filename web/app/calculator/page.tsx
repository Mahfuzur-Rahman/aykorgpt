'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator, 
  Receipt, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  TrendingDown, 
  Building2, 
  MapPin, 
  UserCheck, 
  HelpCircle,
  Percent,
  DollarSign
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import {
  calculateIncomeTax,
  calculateTdsVat,
  type TaxpayerCategory,
  type LocationCategory,
} from '@/lib/tax-calculator'

const COMMON_TDS_SERVICES = [
  { label: 'Office / Property Rent', tds: 5, vat: 15, tag: 'Sec 53A' },
  { label: 'IT Services / Software', tds: 5, vat: 5, tag: 'SRO 136' },
  { label: 'Consulting & Legal Advisory', tds: 10, vat: 15, tag: 'Sec 52AA' },
  { label: 'Goods Supply / Procurement', tds: 3, vat: 7.5, tag: 'Sec 52' },
  { label: 'Advertising & Marketing', tds: 4, vat: 15, tag: 'Sec 52B' },
  { label: 'Custom / Manual Rates', tds: 5, vat: 15, tag: 'Manual' },
]

const INCOME_PRESETS = [
  { label: '৳ 6,00,000', value: 600000 },
  { label: '৳ 10,00,000', value: 1000000 },
  { label: '৳ 15,00,000', value: 1500000 },
  { label: '৳ 25,00,000', value: 2500000 },
]

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<'income' | 'tdsvat'>('income')

  // Income Tax state
  const [grossIncome, setGrossIncome] = useState<number>(600000)
  const [category, setCategory] = useState<TaxpayerCategory>('general')
  const [investment, setInvestment] = useState<number>(100000)
  const [location, setLocation] = useState<LocationCategory>('dhaka_chittagong')

  // TDS VAT state
  const [baseAmount, setBaseAmount] = useState<number>(100000)
  const [tdsRate, setTdsRate] = useState<number>(5)
  const [vatRate, setVatRate] = useState<number>(15)

  const incomeResult = calculateIncomeTax(grossIncome, category, investment, location)
  const tdsvatResult = calculateTdsVat(baseAmount, tdsRate, vatRate)

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-[#0F6E56]/20">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#0F6E56]/10 dark:bg-[#0F6E56]/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-teal-500/10 dark:bg-teal-500/10 blur-[110px]" />
      </div>

      <main className="pt-28 pb-20 px-4 max-w-6xl mx-auto space-y-8">
        
        {/* Top Header & Tab Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6E56] dark:text-emerald-400 hover:underline mb-2 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to AI Tax Chat
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white">
              Bangladesh Tax Calculator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Aligned with <span className="font-semibold text-gray-700 dark:text-gray-300">Income Tax Act 2023</span>, Finance Act 2024 & NBR SROs.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="p-1.5 bg-gray-200/80 dark:bg-gray-900 border border-gray-300/60 dark:border-gray-800 rounded-2xl flex items-center shadow-inner">
            <button
              onClick={() => setActiveTab('income')}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 flex items-center gap-2 ${
                activeTab === 'income'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'income' && (
                <motion.div
                  layoutId="calcActiveTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0F6E56] to-emerald-600 shadow-md shadow-[#0F6E56]/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Calculator size={16} /> Income Tax (Individual)
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tdsvat')}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 flex items-center gap-2 ${
                activeTab === 'tdsvat'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {activeTab === 'tdsvat' && (
                <motion.div
                  layoutId="calcActiveTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0F6E56] to-emerald-600 shadow-md shadow-[#0F6E56]/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Receipt size={16} /> TDS & VAT Withholding
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Income Tax Calculator */}
        <AnimatePresence mode="wait">
          {activeTab === 'income' ? (
            <motion.div
              key="income-calc"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Form Input Card */}
              <div className="lg:col-span-6 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCheck size={18} className="text-[#0F6E56]" /> Taxpayer Assessment
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#0F6E56]/20 dark:text-emerald-300">
                    AY 2024–25
                  </span>
                </div>

                {/* Gross Income Input & Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Gross Annual Income (৳)
                    </label>
                    <span className="text-xs text-gray-400 font-mono">
                      ৳ {grossIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold">
                      ৳
                    </div>
                    <input
                      type="number"
                      value={grossIncome || ''}
                      onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value)))}
                      placeholder="e.g. 1200000"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                    />
                  </div>
                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {INCOME_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setGrossIncome(preset.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                          grossIncome === preset.value
                            ? 'bg-[#0F6E56] text-white border-[#0F6E56]'
                            : 'bg-gray-100/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#0F6E56]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taxpayer Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Taxpayer Category (Exemption Threshold)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaxpayerCategory)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                  >
                    <option value="general">General Taxpayer (Threshold: ৳3,50,000)</option>
                    <option value="female_senior">Female Assessee & Seniors 65+ (Threshold: ৳4,00,000)</option>
                    <option value="disabled">Physically Challenged Persons (Threshold: ৳4,75,000)</option>
                    <option value="freedom_fighter">Gazetted War-Wounded Freedom Fighters (Threshold: ৳5,00,000)</option>
                  </select>
                </div>

                {/* Eligible Investment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Eligible Investment for Rebate (৳)
                    </label>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      15% Rebate
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold">
                      ৳
                    </div>
                    <input
                      type="number"
                      value={investment || ''}
                      onChange={(e) => setInvestment(Math.max(0, Number(e.target.value)))}
                      placeholder="e.g. 150000 (DPS, Sanchayapatra, Shares)"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Qualifies under 6th Schedule Part 2 (DPS up to ৳1.2L, Gov Sanchayapatra, Life Insurance).
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <MapPin size={15} className="text-[#0F6E56]" /> Location / Area Jurisdiction
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as LocationCategory)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                  >
                    <option value="dhaka_chittagong">Dhaka & Chattogram City Corp (Min: ৳5,000)</option>
                    <option value="other_city_corp">Other City Corporations (Min: ৳4,000)</option>
                    <option value="other_areas">Non-City Corp Municipalities & Districts (Min: ৳3,000)</option>
                  </select>
                </div>
              </div>

              {/* Calculation Output Card */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Hero Summary Card */}
                <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0F6E56] via-emerald-800 to-emerald-950 text-white shadow-xl shadow-[#0F6E56]/15 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Calculator size={120} />
                  </div>

                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider uppercase bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                        Estimated Tax Payable
                      </span>
                      <span className="text-xs text-emerald-200 font-mono">
                        Income Tax Act 2023
                      </span>
                    </div>

                    <div>
                      <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
                        ৳ {incomeResult.finalTaxPayable.toLocaleString()}
                      </div>
                      <p className="text-xs text-emerald-100 mt-1">
                        Effective Tax Rate: {grossIncome > 0 ? ((incomeResult.finalTaxPayable / grossIncome) * 100).toFixed(2) : 0}% of gross income
                      </p>
                    </div>

                    {/* 4-Box Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20 text-xs">
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                        <span className="text-emerald-200 block text-[11px]">Tax-Free Limit</span>
                        <span className="font-bold text-sm font-mono">৳ {incomeResult.threshold.toLocaleString()}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                        <span className="text-emerald-200 block text-[11px]">Taxable Balance</span>
                        <span className="font-bold text-sm font-mono">৳ {incomeResult.taxableIncome.toLocaleString()}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                        <span className="text-emerald-200 block text-[11px]">Gross Tax</span>
                        <span className="font-bold text-sm font-mono">৳ {incomeResult.grossTax.toLocaleString()}</span>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                        <span className="text-amber-200 block text-[11px]">Rebate Benefit</span>
                        <span className="font-bold text-sm font-mono text-amber-300">
                          - ৳ {incomeResult.investmentRebate.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progressive Slabs Breakdown Table */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Percent size={15} className="text-[#0F6E56]" /> Progressive Slab Breakdown
                    </h3>
                    <span className="text-xs text-gray-400">NBR Tier Schedule</span>
                  </div>

                  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                          <th className="py-2.5 px-3 text-left font-semibold">Tier / Slab</th>
                          <th className="py-2.5 px-2 text-center font-semibold">Rate</th>
                          <th className="py-2.5 px-2 text-right font-semibold">Portion</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Tax</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {incomeResult.slabBreakdown.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                            <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-200">
                              {s.slab}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs font-semibold">
                                {s.rate}%
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-gray-600 dark:text-gray-400">
                              ৳ {s.amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0F6E56] dark:text-emerald-400">
                              ৳ {s.tax.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {incomeResult.minimumTax > 0 && incomeResult.netTaxBeforeMinimum < incomeResult.minimumTax && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <ShieldCheck size={16} className="shrink-0 text-amber-600" />
                      <span>
                        Calculated tax was below statutory minimum. Area minimum tax of <strong>৳ {incomeResult.minimumTax.toLocaleString()}</strong> applied.
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ) : (
            /* Tab 2: TDS & VAT Withholding Calculator */
            <motion.div
              key="tdsvat-calc"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Form Input Card */}
              <div className="lg:col-span-6 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 size={18} className="text-[#0F6E56]" /> Invoice & Bill Parameters
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    VDS & TDS
                  </span>
                </div>

                {/* Service Presets */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Quick Industry Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_TDS_SERVICES.map((s) => {
                      const isSelected = tdsRate === s.tds && vatRate === s.vat
                      return (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            setTdsRate(s.tds)
                            setVatRate(s.vat)
                          }}
                          className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                            isSelected
                              ? 'border-[#0F6E56] bg-[#0F6E56]/10 dark:bg-[#0F6E56]/20 ring-1 ring-[#0F6E56]'
                              : 'border-gray-200 dark:border-gray-800 hover:border-[#0F6E56]/40 bg-gray-50/50 dark:bg-gray-800/40'
                          }`}
                        >
                          <div className="font-bold text-gray-900 dark:text-white truncate">{s.label}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                            TDS {s.tds}% | VAT {s.vat}%
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Base Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Base Bill / Service Value (৳)
                    </label>
                    <span className="text-xs text-gray-400 font-mono">
                      ৳ {baseAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold">
                      ৳
                    </div>
                    <input
                      type="number"
                      value={baseAmount || ''}
                      onChange={(e) => setBaseAmount(Math.max(0, Number(e.target.value)))}
                      placeholder="e.g. 100000"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                    />
                  </div>
                </div>

                {/* TDS & VAT Rates Dual Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      TDS Deduction (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={tdsRate}
                        onChange={(e) => setTdsRate(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                      />
                      <span className="absolute right-3.5 top-3 text-gray-400 font-bold text-sm">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      VAT Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={vatRate}
                        onChange={(e) => setVatRate(Math.max(0, Number(e.target.value)))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition-all"
                      />
                      <span className="absolute right-3.5 top-3 text-gray-400 font-bold text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output / Withholding Breakdown Card */}
              <div className="lg:col-span-6 space-y-6">
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-950 text-white shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full">
                      Net Payable to Vendor
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">
                      Bank / Cheque Disbursement
                    </span>
                  </div>

                  <div>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono text-emerald-400">
                      ৳ {tdsvatResult.netPayableToVendor.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-300 mt-1">
                      Final payment after subtracting TDS withholding from gross invoice
                    </p>
                  </div>

                  {/* Summary Breakdown Box */}
                  <div className="space-y-3 pt-4 border-t border-gray-800 text-sm">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-400">Base Bill / Service Charge</span>
                      <span className="font-semibold font-mono">৳ {tdsvatResult.baseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-emerald-300 flex items-center gap-1">
                        + VAT Added ({vatRate}%)
                      </span>
                      <span className="font-semibold font-mono text-emerald-400">
                        + ৳ {tdsvatResult.vatAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-y border-gray-800 font-bold text-white">
                      <span>Gross Invoice Value</span>
                      <span className="font-mono">৳ {tdsvatResult.grossInvoice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-amber-300 flex items-center gap-1">
                        - TDS Deducted ({tdsRate}%)
                      </span>
                      <span className="font-semibold font-mono text-amber-300">
                        - ৳ {tdsvatResult.tdsAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Treasury Compliance Info Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#0F6E56]" /> Treasury Deposit Compliance
                  </h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#0F6E56] font-bold">•</span>
                      <span><strong>TDS Treasury Deposit:</strong> Withholding tax of ৳{tdsvatResult.tdsAmount.toLocaleString()} must be deposited via NBR e-Challan within 2 weeks of deduction.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#0F6E56] font-bold">•</span>
                      <span><strong>Mushak 6.3 / 6.6:</strong> Issue VAT withholding certificate (Mushak 6.6) to the vendor within 3 working days of payment.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
