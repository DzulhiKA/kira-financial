'use client'

import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Brain, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 radial-gold pointer-events-none" />
      <div className="fixed inset-0 radial-teal pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(201,168,76,0.3) 40px, rgba(201,168,76,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(201,168,76,0.3) 40px, rgba(201,168,76,0.3) 41px)`
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-kira-gold flex items-center justify-center">
            <span className="font-display font-black text-kira-obsidian text-sm">K</span>
          </div>
          <span className="font-display font-semibold text-kira-cream tracking-widest text-sm">KIRA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-kira-cream-dim hover:text-kira-cream text-sm transition-colors font-body">
            Sign In
          </Link>
          <Link href="/register" className="btn-gold px-5 py-2 rounded-sm text-sm font-body font-semibold">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-8 animate-fade-up">
          <div className="w-1.5 h-1.5 bg-kira-teal rounded-full animate-pulse" />
          <span className="text-xs text-kira-cream-dim font-mono tracking-widest uppercase">AI Financial Intelligence</span>
        </div>

        {/* Kira Avatar */}
        <div className="relative mb-8 animate-float">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full kira-glow animate-pulse-gold overflow-hidden border-2 border-kira-gold/30 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1A1A24, #111118)' }}>
            {/* SVG Kira Avatar */}
            <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Background glow */}
              <defs>
                <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="skinGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#F5D5B8"/>
                  <stop offset="100%" stopColor="#D4A882"/>
                </radialGradient>
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1A0A2E"/>
                  <stop offset="50%" stopColor="#2D1B4E"/>
                  <stop offset="100%" stopColor="#0D0818"/>
                </linearGradient>
                <linearGradient id="outfitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="#8B6914"/>
                </linearGradient>
              </defs>

              {/* BG */}
              <rect width="160" height="160" fill="#111118"/>
              <circle cx="80" cy="80" r="80" fill="url(#faceGlow)"/>

              {/* Hair back */}
              <ellipse cx="80" cy="60" rx="42" ry="50" fill="url(#hairGrad)"/>

              {/* Neck */}
              <rect x="68" y="106" width="24" height="20" rx="4" fill="url(#skinGrad)"/>

              {/* Outfit / collar */}
              <path d="M 30 160 Q 60 110 80 115 Q 100 110 130 160 Z" fill="url(#outfitGrad)"/>
              <path d="M 50 160 Q 65 118 80 120 Q 95 118 110 160 Z" fill="#0A0A0F"/>

              {/* Face */}
              <ellipse cx="80" cy="75" rx="32" ry="36" fill="url(#skinGrad)"/>

              {/* Eyes */}
              <ellipse cx="67" cy="70" rx="7" ry="8" fill="#0A0A0F"/>
              <ellipse cx="93" cy="70" rx="7" ry="8" fill="#0A0A0F"/>
              {/* Eye iris */}
              <ellipse cx="67" cy="71" rx="4.5" ry="5" fill="#C9A84C"/>
              <ellipse cx="93" cy="71" rx="4.5" ry="5" fill="#C9A84C"/>
              {/* Pupil */}
              <circle cx="67" cy="71" r="2.5" fill="#0A0A0F"/>
              <circle cx="93" cy="71" r="2.5" fill="#0A0A0F"/>
              {/* Eye shine */}
              <circle cx="68.5" cy="69.5" r="1" fill="white" opacity="0.8"/>
              <circle cx="94.5" cy="69.5" r="1" fill="white" opacity="0.8"/>

              {/* Eyebrows */}
              <path d="M 59 62 Q 67 59 75 61" stroke="#1A0A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M 85 61 Q 93 59 101 62" stroke="#1A0A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

              {/* Nose */}
              <path d="M 78 78 Q 76 84 80 85 Q 84 84 82 78" stroke="#C4906A" strokeWidth="1" fill="none" opacity="0.6"/>

              {/* Lips */}
              <path d="M 72 91 Q 80 96 88 91" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.3)" strokeLinecap="round"/>
              <path d="M 72 91 Q 80 88 88 91" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>

              {/* Hair front strands */}
              <path d="M 38 55 Q 45 30 62 35 Q 50 50 48 70" fill="url(#hairGrad)"/>
              <path d="M 122 55 Q 115 30 98 35 Q 110 50 112 70" fill="url(#hairGrad)"/>
              <path d="M 62 38 Q 72 25 80 28 Q 75 40 72 55" fill="url(#hairGrad)"/>
              <path d="M 98 38 Q 88 25 80 28 Q 85 40 88 55" fill="url(#hairGrad)"/>

              {/* Gold earring */}
              <circle cx="48" cy="80" r="3" fill="#C9A84C" opacity="0.9"/>
              <circle cx="112" cy="80" r="3" fill="#C9A84C" opacity="0.9"/>

              {/* Subtle circuit lines on forehead */}
              <line x1="58" y1="52" x2="65" y2="52" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
              <line x1="65" y1="52" x2="65" y2="48" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
              <line x1="95" y1="52" x2="102" y2="52" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
              <line x1="95" y1="52" x2="95" y2="48" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-kira-teal rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight animate-fade-up"
          style={{ animationDelay: '0.1s', opacity: 0 }}>
          <span className="text-gold-shimmer">KIRA</span>
          <br />
          <span className="text-kira-cream text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wide">
            Financial Intelligence
          </span>
        </h1>

        <p className="text-kira-cream-dim text-lg md:text-xl max-w-2xl mb-10 font-body font-light leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.2s', opacity: 0 }}>
          Meet KIRA — your elite AI financial advisor. She analyzes your wealth, profiles your risk, 
          and guides every financial decision with precision.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-up"
          style={{ animationDelay: '0.3s', opacity: 0 }}>
          <Link href="/register"
            className="btn-gold px-8 py-4 rounded-sm font-display font-semibold tracking-widest text-sm flex items-center gap-2 group">
            Start with KIRA
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login"
            className="btn-outline-gold px-8 py-4 rounded-sm font-display font-semibold tracking-widest text-sm">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain size={24} />,
                title: 'Financial Health Score',
                desc: 'KIRA analyzes your income, expenses, savings, and debt to give you a precise financial health score with actionable insights.',
              },
              {
                icon: <Shield size={24} />,
                title: 'Risk Profiling',
                desc: 'Discover your investment personality. KIRA maps your risk tolerance and recommends the perfect instrument mix for your profile.',
              },
              {
                icon: <TrendingUp size={24} />,
                title: 'AI Financial Advisor',
                desc: 'Chat with KIRA anytime. Ask about investments, planning, and strategy — she always has your financial context in mind.',
              },
            ].map((feature, i) => (
              <div key={i} className="glass-card glass-card-hover p-8 rounded-sm relative overflow-hidden"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <div className="text-kira-gold mb-4">{feature.icon}</div>
                <h3 className="font-display text-kira-cream font-semibold text-base tracking-wide mb-3">{feature.title}</h3>
                <p className="text-kira-cream-dim text-sm leading-relaxed font-body">{feature.desc}</p>
                <ChevronRight size={16} className="absolute top-8 right-8 text-kira-gold/30" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-kira-gold/10 px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-kira-gold flex items-center justify-center">
              <span className="font-display font-black text-kira-obsidian text-[10px]">K</span>
            </div>
            <span className="font-display text-kira-cream-dim text-xs tracking-widest">KIRA Financial Intelligence</span>
          </div>
          <p className="text-kira-cream-dim/40 text-xs font-mono">
            AI-powered · Not financial advice · For educational purposes
          </p>
        </div>
      </footer>
    </main>
  )
}
