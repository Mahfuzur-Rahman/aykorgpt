'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, MessageSquareText } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { HeroAtmosphere } from '@/components/landing/HeroAtmosphere'
import { TaxSimulator } from '@/components/landing/TaxSimulator'
import { MetricsStrip } from '@/components/landing/MetricsStrip'
import { DomainFeatures } from '@/components/landing/DomainFeatures'
import { PricingSection } from '@/components/landing/PricingSection'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-16 px-4 text-center">
        <HeroAtmosphere />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* NBR Badge with pulsing dot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 bg-[#0F6E56]/10 dark:bg-[#0F6E56]/20 border border-[#0F6E56]/25 text-[#0F6E56] dark:text-emerald-300 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F6E56] dark:bg-emerald-400"></span>
            </span>
            <span>Bangladesh National Board of Revenue (NBR) Aligned</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-gray-950 dark:text-white"
          >
            Your Bangladesh Tax Expert,{' '}
            <span className="bg-gradient-to-r from-[#0F6E56] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Available 24/7
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Instant, verified answers on Income Tax, VAT, Customs and TDS — strictly cited from the 
            <strong className="text-gray-900 dark:text-white font-semibold"> Income Tax Act 2023</strong> and official NBR SROs.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Button size="lg" asChild className="text-base px-8 h-12 shadow-lg shadow-[#0F6E56]/25 group">
              <Link href="/register" className="flex items-center gap-2">
                Start Free Analysis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-12 border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
              <Link href="/chat" className="flex items-center gap-2">
                <MessageSquareText size={16} className="text-[#0F6E56]" /> Open Tax Chat
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-gray-400 dark:text-gray-500 pt-1"
          >
            No credit card required · 10 free questions every day · Zero setup
          </motion.p>
        </div>

        {/* Live Interactive Tax Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
        >
          <TaxSimulator />
        </motion.div>
      </section>

      {/* Metrics & Trust Bar */}
      <MetricsStrip />

      {/* Domain Bento Feature Cards with Spotlight Hover */}
      <DomainFeatures />

      {/* Dynamic Pricing Section */}
      <PricingSection />

      {/* Final Call to Action Banner */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0F6E56] to-emerald-900 text-white text-center shadow-2xl overflow-hidden"
          >
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-emerald-200 border border-white/20">
                <Sparkles size={13} /> Immediate Compliance & Peace of Mind
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Get Instant Clarity on Bangladesh Tax Law Today
              </h2>
              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
                Join thousands of individuals, accountants, and businesses making informed tax decisions backed by official statutory references.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button size="lg" asChild className="text-base px-8 h-12 bg-white text-[#0F6E56] hover:bg-emerald-50 font-bold shadow-md">
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8 h-12 border-white/40 text-white hover:bg-white/10">
                  <Link href="/calculator">Open Tax Calculator</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 dark:border-gray-800 py-12 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#0F6E56] flex items-center justify-center text-white font-bold text-xs tracking-tight">
              AK
            </span>
            <span className="font-bold text-gray-900 dark:text-white text-base">
              Aykor<span className="text-[#0F6E56]">GPT</span>
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed">
            AykorGPT provides AI-assisted statutory information for guidance only. Please consult a licensed Income Tax Practitioner (ITP) or Chartered Accountant for certified filings.
          </p>

          <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <Link href="/login" className="hover:text-[#0F6E56] dark:hover:text-emerald-400 transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:text-[#0F6E56] dark:hover:text-emerald-400 transition-colors">
              Sign Up
            </Link>
            <Link href="/calculator" className="hover:text-[#0F6E56] dark:hover:text-emerald-400 transition-colors">
              Tax Calculator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
