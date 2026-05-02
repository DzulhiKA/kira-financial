'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react'
import { FinancialAnalysis } from '@/lib/types'

const steps = [
  { id: 1, title: 'Income & Expenses', subtitle: 'Tell KIRA about your monthly cash flow' },
  { id: 2, title: 'Assets & Liabilities', subtitle: 'Your savings, investments, and debts' },
  { id: 3, title: 'Goals & Ambitions', subtitle: 'What are you working towards?' },
]

function formatIDR(value: string) {
  const num = value.replace(/\D/g, '')
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null)

  const [formData, setFormData] = useState({
    monthly_income: '',
    monthly_expenses: '',
    total_savings: '',
    total_debt: '',
    investment_amount: '',
    financial_goals: '',
  })

  const handleNumberInput = (field: string, value: string) => {
    const raw = value.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, [field]: raw }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        monthly_income: parseInt(formData.monthly_income || '0'),
        monthly_expenses: parseInt(formData.monthly_expenses || '0'),
        total_savings: parseInt(formData.total_savings || '0'),
        total_debt: parseInt(formData.total_debt || '0'),
        investment_amount: parseInt(formData.investment_amount || '0'),
        financial_goals: formData.financial_goals,
        health_score: 0,
        risk_profile: 'moderate' as const,
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (analysis) {
    const gradeColors: Record<string, string> = {
      A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#EF4444'
    }
    return (
      <main className="min-h-screen bg-kira-obsidian flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 radial-gold pointer-events-none" />
        <div className="w-full max-w-lg relative z-10 page-enter">
          <div className="glass-card p-8 rounded-sm text-center">
            <div className="font-display text-xs text-kira-gold tracking-widest uppercase mb-6">
              KIRA Analysis Complete
            </div>

            {/* Score circle */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <svg width="140" height="140" viewBox="0 0 140 140" className="score-ring">
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="8"/>
                <circle cx="70" cy="70" r="60" fill="none"
                  stroke={gradeColors[analysis.grade] || '#C9A84C'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 60 * analysis.health_score / 100} ${2 * Math.PI * 60 * (1 - analysis.health_score / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="absolute text-center">
                <div className="font-display font-black text-4xl" style={{ color: gradeColors[analysis.grade] }}>
                  {analysis.health_score}
                </div>
                <div className="text-kira-cream-dim text-xs font-mono">/ 100</div>
              </div>
            </div>

            <div className="inline-block px-4 py-1 rounded-full border mb-4"
              style={{ borderColor: gradeColors[analysis.grade] + '60', background: gradeColors[analysis.grade] + '15' }}>
              <span className="text-sm font-display font-semibold" style={{ color: gradeColors[analysis.grade] }}>
                Grade {analysis.grade}
              </span>
            </div>

            <p className="text-kira-cream-dim text-sm leading-relaxed mb-6 font-body">{analysis.summary}</p>

            <div className="space-y-2 mb-6 text-left">
              {analysis.top_priorities.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-kira-gold mt-0.5">✦</span>
                  <span className="text-kira-cream-dim font-body">{p}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="btn-gold w-full py-3 rounded-sm font-display font-semibold tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <TrendingUp size={16} />
              View Full Dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-kira-obsidian flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-sm bg-kira-gold flex items-center justify-center">
              <span className="font-display font-black text-kira-obsidian text-sm">K</span>
            </div>
            <span className="font-display font-semibold text-kira-cream tracking-widest text-sm">KIRA Setup</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-kira-cream tracking-wide">{steps[step - 1].title}</h1>
          <p className="text-kira-cream-dim text-sm mt-1 font-body">{steps[step - 1].subtitle}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map(s => (
            <div key={s.id} className="flex-1 h-1 rounded-full overflow-hidden bg-kira-slate">
              <div className={`h-full bg-kira-gold transition-all duration-500 ${s.id <= step ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <div className="glass-card p-8 rounded-sm">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                  Monthly Income (IDR)
                </label>
                <input
                  type="text"
                  value={formData.monthly_income ? formatIDR(formData.monthly_income) : ''}
                  onChange={e => handleNumberInput('monthly_income', e.target.value)}
                  className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                  placeholder="e.g. 10.000.000"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                  Monthly Expenses (IDR)
                </label>
                <input
                  type="text"
                  value={formData.monthly_expenses ? formatIDR(formData.monthly_expenses) : ''}
                  onChange={e => handleNumberInput('monthly_expenses', e.target.value)}
                  className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                  placeholder="e.g. 6.000.000"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                  Total Savings (IDR)
                </label>
                <input
                  type="text"
                  value={formData.total_savings ? formatIDR(formData.total_savings) : ''}
                  onChange={e => handleNumberInput('total_savings', e.target.value)}
                  className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                  placeholder="e.g. 50.000.000"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                  Total Debt (IDR)
                </label>
                <input
                  type="text"
                  value={formData.total_debt ? formatIDR(formData.total_debt) : ''}
                  onChange={e => handleNumberInput('total_debt', e.target.value)}
                  className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                  placeholder="e.g. 20.000.000"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                  Monthly Investment (IDR)
                </label>
                <input
                  type="text"
                  value={formData.investment_amount ? formatIDR(formData.investment_amount) : ''}
                  onChange={e => handleNumberInput('investment_amount', e.target.value)}
                  className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                  placeholder="e.g. 1.000.000"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                  Financial Goals
                </label>
                <textarea
                  value={formData.financial_goals}
                  onChange={e => setFormData(prev => ({ ...prev, financial_goals: e.target.value }))}
                  className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body resize-none"
                  placeholder="e.g. Buy a house in 5 years, retire at 50, build 3-month emergency fund, invest for passive income..."
                  rows={5}
                />
              </div>
              <p className="text-kira-cream-dim/50 text-xs font-mono">
                Be specific — KIRA will personalize all advice based on your goals.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/')}
              className="btn-outline-gold px-5 py-2.5 rounded-sm font-body text-sm flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="btn-gold px-5 py-2.5 rounded-sm font-body font-semibold text-sm flex items-center gap-2"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-gold px-5 py-2.5 rounded-sm font-body font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-kira-obsidian/30 border-t-kira-obsidian rounded-full animate-spin" />
                    KIRA Analyzing...
                  </>
                ) : (
                  <>
                    Analyze with KIRA
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
