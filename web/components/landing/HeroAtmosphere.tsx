'use client'

import { motion } from 'framer-motion'

export function HeroAtmosphere() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
      {/* Background dot matrix with radial mask fade */}
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_30%,transparent_80%)]" 
      />

      {/* Primary Emerald Glow Orb */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.35, 0.5, 0.3, 0.35],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#0F6E56]/30 via-[#10b981]/20 to-transparent blur-[120px] dark:from-[#0F6E56]/40 dark:via-[#059669]/25"
      />

      {/* Secondary Teal/Cyan Accent Orb */}
      <motion.div
        animate={{
          x: [0, -40, 25, 0],
          y: [0, 30, -30, 0],
          scale: [1, 0.9, 1.1, 1],
          opacity: [0.25, 0.4, 0.2, 0.25],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-[15%] right-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-teal-400/25 via-emerald-500/15 to-transparent blur-[110px] dark:from-teal-500/30 dark:via-emerald-600/20"
      />

      {/* Subtle Bottom Grounding Glow */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-t from-[#0F6E56]/15 via-transparent to-transparent blur-[140px] dark:from-[#0F6E56]/20" />
    </div>
  )
}
