# AykorGPT Home Page High-Tech AI Animations Design

## Overview
Transform the AykorGPT home page into an interactive, visually stunning AI SaaS landing page. This will feature rich ambient effects, staggered entrance animations, an interactive floating AI Tax Simulator demo, mouse-tracking spotlight feature cards, and dynamic pricing transitions.

## Visual & Animation Architecture

### 1. Hero Section & Atmospheric FX
- **Background Layer**:
  - Ambient radial glowing gradient orbs (Emerald `#0F6E56` and Teal `#0d9488`) with subtle float/pulse keyframes.
  - Subtle grid dot-matrix overlay with radial mask fade-out.
- **Hero Content & Badges**:
  - Staggered spring entrance for headline, subheadline, and CTA buttons using `framer-motion`.
  - Animated pulsing status beacon for NBR 2023 alignment.
- **Interactive AI Tax Simulator (Hero Showcase)**:
  - Glassmorphic card floating in the hero with dynamic interactive prompt chips (e.g., "Individual Tax Slabs 24-25", "Software VAT Exemption", "TDS on Vendor Payments").
  - Simulated real-time streaming answer with step-by-step tax calculation, highlight callouts, and official legal citation badges (`[Income Tax Act 2023]`).
  - Floating accent micro-badges with gentle hover/float physics.

### 2. Metrics & Trust Bar
- Staggered scroll-reveal counters:
  - 50,000+ SROs & Gazettes Indexed
  - Income Tax Act 2023 Complete Law Map
  - < 0.5s Citation Lookup Speed
  - 100% Official Law Grounding

### 3. Feature Domain Cards (Interactive Bento Glow)
- 4 Domain Cards: Income Tax, VAT, Customs, TDS.
- Interactive mouse-tracking spotlight radial gradient border and background glow.
- Icon bounce & elevation on hover with micro-tags for domain highlights.
- Viewport scroll trigger with staggered reveal (`framer-motion`).

### 4. Interactive Pricing & Interactive Details
- Annual / Monthly toggle switch with smooth animated pill indicator and "Save 20%" bounce badge.
- Pro plan card spotlight with glowing gradient border accent.
- Micro-interactions on buttons (scale on tap/hover, shimmer highlight swipe).

### 5. Tech Stack & Dependencies
- `framer-motion` for spring physics, scroll-triggered viewports, interactive tab state switching, and hover spotlight effects.
- Tailwind CSS for utilities, gradients, and backdrop filters.
- Lucide React for consistent icons.

## Performance & Accessibility
- Full support for `prefers-reduced-motion`.
- Hardware-accelerated CSS transforms (`transform`, `opacity`).
- Zero layout shift during dynamic content tab changes.
