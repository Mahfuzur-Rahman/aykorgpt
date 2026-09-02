# Home Page High-Tech AI Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the AykorGPT landing page into a state-of-the-art AI SaaS experience with ambient background FX, interactive AI Tax Simulator demo, animated metrics, spotlight bento cards, and dynamic pricing transitions.

**Architecture:** Decompose the landing page into modular client components powered by `framer-motion` and Tailwind CSS. The hero showcases a live interactive tax query breakdown simulator with instant prompt switching, accompanied by glowing ambient mesh orbs and spotlight cards with mouse-tracking radial borders.

**Tech Stack:** Next.js 14 (App Router), React 18, `framer-motion`, Tailwind CSS, Lucide React.

## Global Constraints
- All animations must respect `prefers-reduced-motion`.
- Maintain dark and light mode responsiveness.
- Use official NBR emerald palette (`#0F6E56` primary, teal/emerald glow accents).
- Zero layout shift during tab/prompt changes in simulator.

---

### Task 1: Install Dependencies & Global Keyframes Configuration

**Files:**
- Modify: `package.json`
- Modify: `tailwind.config.ts` or `app/globals.css`

**Interfaces:**
- Consumes: `npm install framer-motion`
- Produces: CSS animation utilities for grid patterns and ambient float effects.

- [ ] **Step 1: Install framer-motion**
  Run: `npm install framer-motion`
- [ ] **Step 2: Update globals.css with dot matrix background & glow pulse keyframes**
  Add background grid pattern styling and custom keyframes if needed.
- [ ] **Step 3: Verify build / dev server compilation**
  Run: `npm run build` or test compile without errors.

---

### Task 2: Build Hero Atmospheric Background Component

**Files:**
- Create: `components/landing/HeroAtmosphere.tsx`

**Interfaces:**
- Consumes: `framer-motion`
- Produces: `<HeroAtmosphere />` component rendering subtle floating gradient orbs and dot-matrix overlay.

- [ ] **Step 1: Create `HeroAtmosphere.tsx` with floating radial gradient orbs**
  Render floating emerald/teal blur orbs with perpetual micro-motion and radial dot grid.
- [ ] **Step 2: Verify component rendering and dark/light mode compatibility**

---

### Task 3: Build Interactive AI Tax Simulator Component

**Files:**
- Create: `components/landing/TaxSimulator.tsx`

**Interfaces:**
- Consumes: Pre-configured Bangladesh tax question-and-answer datasets (Individual Income Tax FY 2024-25, Software VAT Exemption, TDS rates).
- Produces: `<TaxSimulator />` interactive showcase card with prompt selector pills, animated typing breakdown, and verified citation badges.

- [ ] **Step 1: Implement simulation state and structured responses**
  Include scenarios for:
  - 1. Individual Tax Slabs 2024-25 (৳12,00,000 income calculation breakdown)
  - 2. IT & Software VAT Exemption (NBR SRO 136-Ain/2023/217-VAT)
  - 3. TDS on Consultancy Services (Section 52AA, Income Tax Act 2023)
- [ ] **Step 2: Add animated streaming breakdown and floating micro-badges**
  Use `framer-motion` `AnimatePresence` and spring transitions for instant prompt toggling and step reveals.
- [ ] **Step 3: Test click interactions and responsive sizing**

---

### Task 4: Build Metrics & Trust Counter Bar Component

**Files:**
- Create: `components/landing/MetricsStrip.tsx`

**Interfaces:**
- Consumes: `framer-motion` `useInView` / scroll triggers
- Produces: `<MetricsStrip />` displaying animated counters and trust badges (50,000+ SROs, Income Tax Act 2023, <0.5s Lookup, 100% Law Grounded).

- [ ] **Step 1: Create `MetricsStrip.tsx` with staggered scroll-entrance**
- [ ] **Step 2: Verify smooth viewport trigger animation**

---

### Task 5: Build Interactive Spotlight Bento Domain Feature Cards

**Files:**
- Create: `components/landing/DomainFeatures.tsx`

**Interfaces:**
- Consumes: Feature domain definitions (Income Tax, VAT, Customs, TDS)
- Produces: `<DomainFeatures />` with mouse-tracking radial spotlight border hover effect and animated icon elevations.

- [ ] **Step 1: Implement mouse coordinate tracking spotlight card effect**
- [ ] **Step 2: Add interactive feature badges, icon micro-rotations, and domain highlights**
- [ ] **Step 3: Verify hover and mobile touch responsiveness**

---

### Task 6: Build Dynamic Pricing & CTA Section

**Files:**
- Create: `components/landing/PricingSection.tsx`

**Interfaces:**
- Consumes: Free and Pro pricing tiers and feature comparisons
- Produces: `<PricingSection />` with Monthly/Annual billing period toggle, animated discount tag, and glowing gradient border beam on the Pro card.

- [ ] **Step 1: Build Billing Toggle with smooth slide indicator and "Save 20%" badge**
- [ ] **Step 2: Build table / card comparison with highlighted Pro plan accent**
- [ ] **Step 3: Test billing switch calculations and transitions**

---

### Task 7: Integrate Home Page & End-to-End Verification

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Navbar.tsx` (ensure glassmorphism and smooth transition)

**Interfaces:**
- Consumes: All `components/landing/*` components
- Produces: The full animated, high-performance home page.

- [ ] **Step 1: Update `app/page.tsx` to assemble all animated landing components**
- [ ] **Step 2: Run build / lint checks to ensure zero TypeScript or bundling issues**
- [ ] **Step 3: Test locally in browser with live interaction verification**
