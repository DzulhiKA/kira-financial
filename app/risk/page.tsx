'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { RiskProfile } from '@/lib/types'

interface Question {
  id: string
  question: string
  options: { value: string; label: string; weight: number }[]
}

const riskColors = {
  conservative: '#2DD4BF',
  moderate: '#C9A84C',
  aggressive: '#EF4444',
}

const riskLabels = {
  conservative: 'Shield Guardian',
  moderate: 'Balanced Navigator',
  aggressive: 'Growth Hunter',
}

export default function RiskPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RiskProfile | null>(null)
  const [currentQ, setCurrentQ] = useState(0)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => setQuestions(d.questions || []))
  }, [])

  const handleAnswer = (qId: string, value: string) => {
    const newAnswers = { ...answers, [qId]: value }
    setAnswers(newAnswers)
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(c => c + 1), 300)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (data.riskProfile) setResult(data.riskProfile)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id])
  const progress = questions.length > 0 ? Object.keys(answers).length / questions.length : 0

  if (result) {
    const color = riskColors[result.risk_profile] || '#C9A84C'
    const allocation = result.recommended_allocation

    return (
      <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
        <div className="fixed inset-0 radial-gold pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-8 page-enter">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-kira-cream-dim hover:text-kira-cream text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div className="glass-card p-8 rounded-sm mb-6">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">KIRA Risk Profile</p>
            <h1 className="font-display text-3xl font-bold mb-1" style={{ color }}>
              {result.profile_title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-mono capitalize" style={{ color }}>{result.risk_profile} · Score {result.risk_score}/10</span>
            </div>
            <p className="text-kira-cream-dim text-sm font-body leading-relaxed">{result.description}</p>
          </div>

          {/* Allocation */}
          <div className="glass-card p-6 rounded-sm mb-6">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Recommended Portfolio Allocation</p>
            <div className="space-y-3">
              {Object.entries(allocation).map(([key, pct]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-mono text-kira-cream-dim capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-mono text-kira-gold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-kira-slate rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card p-6 rounded-sm mb-6">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Instrument Recommendations</p>
            <div className="space-y-3">
              {result.instrument_recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-kira-obsidian-2/50">
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
                    <span className="text-xs font-mono" style={{ color }}>{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-kira-cream font-body">{rec.name}</p>
                    <p className="text-xs text-kira-cream-dim/60 font-body mt-0.5">{rec.reason}</p>
                  </div>
                  <div className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full flex-shrink-0 ${
                    rec.risk_level === 'low' ? 'bg-teal-500/20 text-teal-400' :
                    rec.risk_level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {rec.risk_level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 rounded-sm border border-kira-gold/20 mb-6">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">KIRA's Key Advice</p>
            <p className="text-sm text-kira-cream font-body leading-relaxed">✦ {result.key_advice}</p>
          </div>

          <div className="flex gap-3">
            <Link href="/chat" className="btn-gold flex-1 py-3 rounded-sm font-display font-semibold tracking-widest text-sm text-center">
              Discuss with KIRA
            </Link>
            <Link href="/dashboard" className="btn-outline-gold flex-1 py-3 rounded-sm font-display font-semibold tracking-widest text-sm text-center">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const currentQuestion = questions[currentQ]

  return (
    <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />
      <div className="relative z-10 max-w-lg mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-kira-cream-dim hover:text-kira-cream text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="mb-8">
          <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-1">Risk Assessment</p>
          <h1 className="font-display text-2xl font-bold text-kira-cream">Discover Your Investor Profile</h1>
          <p className="text-kira-cream-dim text-sm mt-1 font-body">KIRA will map your investment personality</p>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-kira-slate">
              <div className={`h-full bg-kira-gold transition-all duration-500 ${i < Object.keys(answers).length ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        {currentQuestion && (
          <div className="glass-card p-8 rounded-sm page-enter" key={currentQ}>
            <p className="text-xs font-mono text-kira-cream-dim/50 tracking-widest uppercase mb-3">
              Question {currentQ + 1} of {questions.length}
            </p>
            <h2 className="font-display text-lg font-semibold text-kira-cream mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>
            <div className="space-y-3">
              {currentQuestion.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                  className={`w-full text-left p-4 rounded-sm border transition-all duration-200 text-sm font-body ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-kira-gold bg-kira-gold/10 text-kira-cream'
                      : 'border-kira-gold/15 bg-kira-obsidian-2/50 text-kira-cream-dim hover:border-kira-gold/35 hover:text-kira-cream'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {opt.label}
                    {answers[currentQuestion.id] === opt.value && (
                      <span className="text-kira-gold text-xs">✦</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {currentQ > 0 && currentQ < questions.length && (
              <button
                onClick={() => setCurrentQ(c => c - 1)}
                className="mt-4 text-xs text-kira-cream-dim/50 hover:text-kira-cream-dim transition-colors font-mono"
              >
                ← Previous question
              </button>
            )}
          </div>
        )}

        {allAnswered && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-gold w-full py-3 rounded-sm font-display font-semibold tracking-widest text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-kira-obsidian/30 border-t-kira-obsidian rounded-full animate-spin" />
                KIRA Profiling...
              </>
            ) : (
              <>
                Get My Risk Profile
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </main>
  )
}
