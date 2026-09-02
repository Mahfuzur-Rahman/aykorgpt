'use client'

import { motion } from 'framer-motion'
import { Database, ShieldCheck, Zap, Scale } from 'lucide-react'

const stats = [
  {
    icon: Database,
    value: '50,000+',
    label: 'SROs & Gazettes Indexed',
    description: 'Updated with latest 2024 NBR circulars',
  },
  {
    icon: Scale,
    value: 'Income Tax Act 2023',
    label: 'Complete Legal Mapping',
    description: 'Cross-referenced with Finance Act 2024',
  },
  {
    icon: Zap,
    value: '< 0.5s',
    label: 'Instant Citation Speed',
    description: 'Zero hallucination retrieval engine',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Verified Legal References',
    description: 'Every answer links to official statutory clauses',
  },
]

export function MetricsStrip() {
  return (
    <section className="relative py-12 px-4 border-y border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="relative p-6 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0F6E56]/10 dark:bg-[#0F6E56]/20 flex items-center justify-center mb-4 text-[#0F6E56] dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Icon size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
