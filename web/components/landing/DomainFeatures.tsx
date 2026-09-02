'use client'

import React, { useRef, useState, MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Receipt, Package, FileText, ArrowUpRight, CheckCircle } from 'lucide-react'

interface FeatureDomain {
  icon: typeof Calculator
  title: string
  subtitle: string
  desc: string
  tags: string[]
  stat: string
}

const features: FeatureDomain[] = [
  {
    icon: Calculator,
    title: 'Income Tax',
    subtitle: 'Act 2023 & SROs',
    desc: 'Progressive slab rates, allowable deductions, 6th schedule investment rebates, company tax, and wealth surcharge.',
    tags: ['Individual Slabs', 'Corporate Tax', 'Rebate 2024-25', 'Wealth Surcharge'],
    stat: 'Updated for FY 24-25',
  },
  {
    icon: Receipt,
    title: 'VAT & Supplementary Duty',
    subtitle: 'VAT Act 2012',
    desc: 'Value Added Tax rates (15%, 10%, 7.5%, 5%), Mushak 9.1 returns, VDS withholding rules, and statutory exemptions.',
    tags: ['Standard & Reduced Rates', 'VDS Rules', 'Input Tax Credit', 'Mushak 9.1'],
    stat: 'SRO 136 Mapped',
  },
  {
    icon: Package,
    title: 'Customs & Tariffs',
    subtitle: 'Customs Act 2023',
    desc: 'HS Code classifications, Customs Duty (CD), Regulatory Duty (RD), Advance Tax (AT), and duty drawback procedures.',
    tags: ['HS Codes', 'Assessable Value', 'Import Surcharges', 'Duty Drawback'],
    stat: 'Bangladesh Customs Tariff',
  },
  {
    icon: FileText,
    title: 'TDS (Tax Deducted at Source)',
    subtitle: 'Withholding Tax Manual',
    desc: 'Statutory withholding rates under Section 52 series, Proof of Submission of Return (PSR) rules, and treasury e-Challans.',
    tags: ['Sec 52 Deductions', 'PSR Verification', 'Vendor Payments', 'e-Challan Timelines'],
    stat: 'Section 52 Series',
  },
]

function SpotlightCard({ feature, index }: { feature: FeatureDomain; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const Icon = feature.icon

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative rounded-2xl p-[1px] group overflow-hidden bg-gray-200/80 dark:bg-gray-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-[#0F6E56]/5"
    >
      {/* Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(15, 110, 86, 0.4), transparent 80%)`
            : '',
        }}
      />

      {/* Card Body */}
      <div className="relative h-full rounded-[15px] bg-white dark:bg-gray-950 p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
        {/* Spotlight Surface Glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: isHovered
              ? `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(15, 110, 86, 0.05), transparent 80%)`
              : '',
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#0F6E56]/10 dark:bg-[#0F6E56]/20 flex items-center justify-center text-[#0F6E56] dark:text-emerald-400 group-hover:scale-110 group-hover:bg-[#0F6E56] group-hover:text-white transition-all duration-300 shadow-sm">
              <Icon size={24} />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
              <CheckCircle size={11} className="text-[#0F6E56]" /> {feature.stat}
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#0F6E56] dark:text-emerald-400 tracking-wide uppercase mb-1">
              {feature.subtitle}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#0F6E56] dark:group-hover:text-emerald-400 transition-colors">
              {feature.title}
            </h3>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {feature.desc}
          </p>
        </div>

        {/* Feature Tags */}
        <div className="relative z-10 pt-6 mt-4 border-t border-gray-100 dark:border-gray-900 flex flex-wrap gap-1.5">
          {feature.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 group-hover:border-[#0F6E56]/20 border border-transparent transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function DomainFeatures() {
  return (
    <section className="py-24 px-4 bg-white dark:bg-gray-950 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0F6E56]/10 text-[#0F6E56] dark:text-emerald-400 dark:bg-[#0F6E56]/20 mb-2"
          >
            Comprehensive Coverage
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            Expert Knowledge Across All Tax Domains
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-base"
          >
            Trained on official Bangladesh tax legislation, statutory regulatory orders (SROs), and National Board of Revenue precedents.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <SpotlightCard key={feat.title} feature={feat} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
