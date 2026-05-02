'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'

const KIRA_TIPS = [
  "Hai! Saya KIRA 👋 Siap membantu perjalanan finansialmu hari ini?",
  "💡 Tips: Aturan 50/30/20 — 50% kebutuhan, 30% keinginan, 20% tabungan.",
  "📈 Compounding adalah keajaiban kedelapan dunia. Mulai investasi lebih awal!",
  "🛡️ Dana darurat ideal: 3–6× pengeluaran bulananmu.",
  "✨ Kamu melakukan hal yang tepat dengan memantau kondisi finansialmu.",
  "💰 Kurangi 1 pengeluaran kecil hari ini — akumulasinya luar biasa!",
  "🎯 Tujuan finansial yang jelas = motivasi yang lebih kuat untuk menabung.",
  "📊 Review portofoliomu secara berkala, pasar selalu bergerak!",
  "🌟 Setiap rupiah yang kamu tabung hari ini bekerja untukmu esok hari.",
  "🔒 Diversifikasi adalah kunci mengurangi risiko investasi.",
]

export default function KiraCompanion() {
  const [open, setOpen] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [blinking, setBlinking] = useState(false)
  const [eyeY, setEyeY] = useState(71)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Random blink effect
  useEffect(() => {
    const blinkLoop = () => {
      const delay = 2500 + Math.random() * 3000
      setTimeout(() => {
        setBlinking(true)
        setTimeout(() => setBlinking(false), 140)
        blinkLoop()
      }, delay)
    }
    blinkLoop()
  }, [])

  // Subtle eye wander
  useEffect(() => {
    const wander = setInterval(() => {
      setEyeY(70 + Math.random() * 3 - 1.5)
    }, 2000)
    return () => clearInterval(wander)
  }, [])

  // Cycle tips on open
  useEffect(() => {
    if (open) {
      intervalRef.current = setInterval(() => {
        setTipIndex(i => (i + 1) % KIRA_TIPS.length)
      }, 6000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [open])

  // Random peek when closed
  useEffect(() => {
    if (!open) {
      const peek = setInterval(() => {
        setTipIndex(i => (i + 1) % KIRA_TIPS.length)
      }, 12000)
      return () => clearInterval(peek)
    }
  }, [open])

  if (!visible) return null

  const eyeHeight = blinking ? 1 : 8

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Speech bubble */}
      {open && (
        <div
          className="kira-companion-bubble relative max-w-[260px] glass-card rounded-2xl rounded-br-sm p-4 shadow-2xl"
          style={{
            animation: 'bubbleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            background: 'rgba(17,17,24,0.95)',
          }}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-kira-cream-dim/40 hover:text-kira-cream-dim transition-colors"
            aria-label="Tutup pesan KIRA"
          >
            <X size={12} />
          </button>

          {/* KIRA label */}
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={10} className="text-kira-gold" />
            <span className="text-kira-gold font-mono text-[10px] tracking-widest uppercase font-semibold">KIRA</span>
          </div>

          {/* Tip text */}
          <p
            key={tipIndex}
            className="text-kira-cream text-xs font-body leading-relaxed"
            style={{ animation: 'tipFadeIn 0.4s ease-out forwards' }}
          >
            {KIRA_TIPS[tipIndex]}
          </p>

          {/* Tip dots */}
          <div className="flex gap-1 mt-3 justify-center">
            {KIRA_TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTipIndex(i)}
                className="transition-all duration-300"
                style={{
                  width: i === tipIndex ? 16 : 4,
                  height: 4,
                  borderRadius: 9999,
                  background: i === tipIndex ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                }}
                aria-label={`Tip ${i + 1}`}
              />
            ))}
          </div>

          {/* Bubble tail */}
          <div
            className="absolute -bottom-2 right-6 w-4 h-2 overflow-hidden"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgba(201,168,76,0.3)',
              }}
            />
          </div>
        </div>
      )}

      {/* Avatar button */}
      <div className="relative">
        {/* Notification pulse when closed */}
        {!open && (
          <span className="absolute -top-1 -right-1 z-10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kira-teal opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-kira-teal" />
            </span>
          </span>
        )}

        {/* Dismiss button */}
        {open && (
          <button
            onClick={() => setVisible(false)}
            className="absolute -top-2 -left-2 z-10 w-5 h-5 rounded-full bg-kira-slate border border-kira-gold/20 flex items-center justify-center text-kira-cream-dim/50 hover:text-kira-cream hover:border-kira-gold/50 transition-all"
            title="Sembunyikan KIRA"
          >
            <X size={9} />
          </button>
        )}

        <button
          id="kira-companion-btn"
          onClick={() => setOpen(o => !o)}
          className="kira-companion-avatar relative w-16 h-16 rounded-full overflow-hidden border-2 focus:outline-none transition-all duration-300"
          style={{
            borderColor: open ? '#C9A84C' : 'rgba(201,168,76,0.4)',
            boxShadow: open
              ? '0 0 0 4px rgba(201,168,76,0.15), 0 0 30px rgba(201,168,76,0.35)'
              : '0 0 20px rgba(201,168,76,0.2)',
            animation: 'companionFloat 5s ease-in-out infinite',
            background: 'linear-gradient(135deg, #1A1A24, #111118)',
          }}
          aria-label="Chat dengan KIRA"
        >
          {/* Kira SVG Avatar */}
          <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="cFaceGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="cSkinGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#F5D5B8"/>
                <stop offset="100%" stopColor="#D4A882"/>
              </radialGradient>
              <linearGradient id="cHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A0A2E"/>
                <stop offset="50%" stopColor="#2D1B4E"/>
                <stop offset="100%" stopColor="#0D0818"/>
              </linearGradient>
              <linearGradient id="cOutfitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A84C"/>
                <stop offset="100%" stopColor="#8B6914"/>
              </linearGradient>
            </defs>

            {/* BG */}
            <rect width="160" height="160" fill="#111118"/>
            <circle cx="80" cy="80" r="80" fill="url(#cFaceGlow)"/>

            {/* Hair back */}
            <ellipse cx="80" cy="60" rx="42" ry="50" fill="url(#cHairGrad)"/>

            {/* Neck */}
            <rect x="68" y="106" width="24" height="20" rx="4" fill="url(#cSkinGrad)"/>

            {/* Outfit */}
            <path d="M 30 160 Q 60 110 80 115 Q 100 110 130 160 Z" fill="url(#cOutfitGrad)"/>
            <path d="M 50 160 Q 65 118 80 120 Q 95 118 110 160 Z" fill="#0A0A0F"/>

            {/* Face */}
            <ellipse cx="80" cy="75" rx="32" ry="36" fill="url(#cSkinGrad)"/>

            {/* Eyes with blink */}
            <ellipse cx="67" cy="70" rx="7" ry={eyeHeight} fill="#0A0A0F"
              style={{ transition: 'ry 0.07s ease' }}/>
            <ellipse cx="93" cy="70" rx="7" ry={eyeHeight} fill="#0A0A0F"
              style={{ transition: 'ry 0.07s ease' }}/>
            {!blinking && <>
              <ellipse cx="67" cy={eyeY} rx="4.5" ry="5" fill="#C9A84C"/>
              <ellipse cx="93" cy={eyeY} rx="4.5" ry="5" fill="#C9A84C"/>
              <circle cx="67" cy={eyeY} r="2.5" fill="#0A0A0F"/>
              <circle cx="93" cy={eyeY} r="2.5" fill="#0A0A0F"/>
              <circle cx="68.5" cy={eyeY - 1.5} r="1" fill="white" opacity="0.8"/>
              <circle cx="94.5" cy={eyeY - 1.5} r="1" fill="white" opacity="0.8"/>
            </>}

            {/* Eyebrows */}
            <path d="M 59 62 Q 67 59 75 61" stroke="#1A0A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M 85 61 Q 93 59 101 62" stroke="#1A0A2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

            {/* Nose */}
            <path d="M 78 78 Q 76 84 80 85 Q 84 84 82 78" stroke="#C4906A" strokeWidth="1" fill="none" opacity="0.6"/>

            {/* Smile */}
            <path d="M 72 91 Q 80 97 88 91" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.25)" strokeLinecap="round"/>

            {/* Hair front strands */}
            <path d="M 38 55 Q 45 30 62 35 Q 50 50 48 70" fill="url(#cHairGrad)"/>
            <path d="M 122 55 Q 115 30 98 35 Q 110 50 112 70" fill="url(#cHairGrad)"/>
            <path d="M 62 38 Q 72 25 80 28 Q 75 40 72 55" fill="url(#cHairGrad)"/>
            <path d="M 98 38 Q 88 25 80 28 Q 85 40 88 55" fill="url(#cHairGrad)"/>

            {/* Earrings */}
            <circle cx="48" cy="80" r="3" fill="#C9A84C" opacity="0.9"/>
            <circle cx="112" cy="80" r="3" fill="#C9A84C" opacity="0.9"/>

            {/* Circuit accent */}
            <line x1="58" y1="52" x2="65" y2="52" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
            <line x1="65" y1="52" x2="65" y2="48" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
            <line x1="95" y1="52" x2="102" y2="52" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
            <line x1="95" y1="52" x2="95" y2="48" stroke="#C9A84C" strokeWidth="0.5" opacity="0.3"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
