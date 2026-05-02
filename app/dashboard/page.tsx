'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, LogOut, Shield, TrendingUp, AlertCircle, PlusCircle, RefreshCw, Receipt } from 'lucide-react'
import { FinancialProfile, FinancialAnalysis, Transaction } from '@/lib/types'

function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const gradeColors: Record<string, string> = {
    A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#F97316', F: '#EF4444'
  }
  const color = gradeColors[grade] || '#C9A84C'
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * score / 100

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="score-ring -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="10"/>
        <circle cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s ease' }}
        />
      </svg>
      <div className="absolute text-center rotate-0">
        <div className="font-display font-black text-4xl" style={{ color }}>{score}</div>
        <div className="text-kira-cream-dim text-xs font-mono">Grade {grade}</div>
      </div>
    </div>
  )
}

function MetricBar({ label, score, insight }: { label: string; score: number; insight: string }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-mono text-kira-cream-dim tracking-wide">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-kira-slate rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <p className="text-xs text-kira-cream-dim/50 font-body">{insight}</p>
    </div>
  )
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Makanan & Minuman': '🍽️', 'Transportasi': '🚗', 'Investasi': '📈',
  'Tagihan': '⚡', 'Belanja': '🛍️', 'Hiburan': '🎮', 'Kesehatan': '💊',
  'Pendidikan': '📚', 'Pendapatan': '💰', 'Tabungan': '🏦', 'Lainnya': '📦',
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<FinancialProfile | null>(null)
  const [analysis, setAnalysis] = useState<FinancialAnalysis | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)
  const [recentTx, setRecentTx] = useState<Transaction[]>([])
  const [txSummary, setTxSummary] = useState({ totalIncome: 0, totalExpense: 0 })
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    setUserName(user.user_metadata?.full_name?.split(' ')[0] || 'User')

    const { data: profileData } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileData) setProfile(profileData)
    setLoading(false)

    // Load recent transactions
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    try {
      const txRes = await fetch(`/api/transactions?month=${month}`)
      if (txRes.ok) {
        const txData = await txRes.json()
        setRecentTx((txData.transactions || []).slice(0, 5))
        setTxSummary({ totalIncome: txData.summary?.totalIncome || 0, totalExpense: txData.summary?.totalExpense || 0 })
      }
    } catch {}
  }, [supabase, router])

  useEffect(() => { loadData() }, [loadData])

  const handleReanalyze = async () => {
    if (!profile) return
    setReanalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const data = await res.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
        setProfile(prev => prev ? { ...prev, health_score: data.analysis.health_score } : prev)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setReanalyzing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-kira-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-kira-gold/30 border-t-kira-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-kira-cream-dim text-sm font-mono">Loading KIRA...</p>
        </div>
      </main>
    )
  }

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

  return (
    <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-kira-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-kira-gold flex items-center justify-center">
            <span className="font-display font-black text-kira-obsidian text-sm">K</span>
          </div>
          <span className="font-display font-semibold text-kira-cream tracking-widest text-sm">KIRA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/chat" className="btn-gold px-4 py-2 rounded-sm text-xs font-display font-semibold tracking-widest flex items-center gap-1.5">
            <MessageSquare size={14} />
            Chat KIRA
          </Link>
          <button onClick={handleLogout} className="text-kira-cream-dim/50 hover:text-kira-cream transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-8 page-enter">
        {/* Greeting */}
        <div className="mb-8">
          <p className="text-kira-cream-dim text-sm font-mono tracking-widest uppercase mb-1">
            Welcome back,
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-kira-cream">
            {userName} <span className="text-gold-shimmer">✦</span>
          </h1>
        </div>

        {!profile ? (
          /* No profile yet */
          <div className="glass-card p-12 rounded-sm text-center">
            <AlertCircle size={40} className="text-kira-gold/50 mx-auto mb-4" />
            <h2 className="font-display text-kira-cream font-bold text-xl mb-2">No Financial Data Yet</h2>
            <p className="text-kira-cream-dim text-sm mb-6 font-body">Let KIRA analyze your financial health to get started.</p>
            <Link href="/onboarding" className="btn-gold px-6 py-3 rounded-sm font-display font-semibold tracking-widest text-sm inline-flex items-center gap-2">
              <PlusCircle size={16} />
              Start KIRA Setup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score card */}
            <div className="glass-card p-6 rounded-sm flex flex-col items-center text-center">
              <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Financial Health</p>
              <ScoreGauge score={profile.health_score} grade={
                profile.health_score >= 85 ? 'A' :
                profile.health_score >= 70 ? 'B' :
                profile.health_score >= 55 ? 'C' :
                profile.health_score >= 40 ? 'D' : 'F'
              } />
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  profile.risk_profile === 'conservative' ? 'bg-kira-teal' :
                  profile.risk_profile === 'moderate' ? 'bg-kira-gold' : 'bg-red-400'
                }`} />
                <span className="text-xs font-mono text-kira-cream-dim capitalize">{profile.risk_profile} Risk</span>
              </div>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="btn-outline-gold mt-4 px-4 py-2 rounded-sm text-xs font-mono flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={12} className={reanalyzing ? 'animate-spin' : ''} />
                {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
              </button>
            </div>

            {/* Financial summary */}
            <div className="glass-card p-6 rounded-sm">
              <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Monthly Overview</p>
              <div className="space-y-4">
                {[
                  { label: 'Income', value: profile.monthly_income, color: '#22C55E' },
                  { label: 'Expenses', value: profile.monthly_expenses, color: '#EF4444' },
                  { label: 'Net Cash Flow', value: profile.monthly_income - profile.monthly_expenses, color: profile.monthly_income - profile.monthly_expenses >= 0 ? '#22C55E' : '#EF4444' },
                  { label: 'Investment', value: profile.investment_amount, color: '#C9A84C' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-kira-cream-dim font-body">{item.label}</span>
                    <span className="text-sm font-mono font-semibold" style={{ color: item.color }}>
                      {formatIDR(item.value)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-kira-gold/10 pt-3 flex justify-between">
                  <span className="text-xs text-kira-cream-dim font-body">Total Savings</span>
                  <span className="text-sm font-mono font-semibold text-kira-gold">{formatIDR(profile.total_savings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-kira-cream-dim font-body">Total Debt</span>
                  <span className="text-sm font-mono font-semibold text-red-400">{formatIDR(profile.total_debt)}</span>
                </div>
              </div>
            </div>

            {/* Actions / Risk */}
            <div className="flex flex-col gap-4">
              <div className="glass-card p-5 rounded-sm flex-1">
                <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <Link href="/chat" className="flex items-center gap-3 p-3 rounded-sm hover:bg-kira-gold/5 transition-colors group">
                    <MessageSquare size={16} className="text-kira-gold" />
                    <div>
                      <p className="text-xs font-semibold text-kira-cream">Chat with KIRA</p>
                      <p className="text-xs text-kira-cream-dim/50">Ask anything financial</p>
                    </div>
                  </Link>
                  <Link href="/transactions" className="flex items-center gap-3 p-3 rounded-sm hover:bg-kira-gold/5 transition-colors group">
                    <Receipt size={16} className="text-kira-gold" />
                    <div>
                      <p className="text-xs font-semibold text-kira-cream">Budget Tracker</p>
                      <p className="text-xs text-kira-cream-dim/50">Log & track expenses</p>
                    </div>
                  </Link>
                  <Link href="/onboarding" className="flex items-center gap-3 p-3 rounded-sm hover:bg-kira-gold/5 transition-colors group">
                    <TrendingUp size={16} className="text-kira-gold" />
                    <div>
                      <p className="text-xs font-semibold text-kira-cream">Update Finances</p>
                      <p className="text-xs text-kira-cream-dim/50">Refresh your data</p>
                    </div>
                  </Link>
                  <Link href="/risk" className="flex items-center gap-3 p-3 rounded-sm hover:bg-kira-gold/5 transition-colors group">
                    <Shield size={16} className="text-kira-gold" />
                    <div>
                      <p className="text-xs font-semibold text-kira-cream">Risk Assessment</p>
                      <p className="text-xs text-kira-cream-dim/50">Discover your profile</p>
                    </div>
                    </Link>
                    <Link href="/portfolio" className="flex items-center gap-3 p-3 rounded-sm hover:bg-kira-gold/5 transition-colors group">
                    <TrendingUp size={16} className="text-kira-gold" />
                    <div>
                      <p className="text-xs font-semibold text-kira-cream">Investment Hub</p>
                      <p className="text-xs text-kira-cream-dim/50">Portfolio & goals</p>
                    </div>
                  </Link>
                  <Link href="/simulator" className="flex items-center gap-3 p-3 rounded-sm hover:bg-kira-gold/5 transition-colors group">
                    <TrendingUp size={16} className="text-kira-gold" />
                    <div>
                      <p className="text-xs font-semibold text-kira-cream">Compound Simulator</p>
                      <p className="text-xs text-kira-cream-dim/50">Visualize growth</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Goals */}
              <div className="glass-card p-5 rounded-sm">
                <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">Your Goals</p>
                <p className="text-xs text-kira-cream-dim font-body leading-relaxed line-clamp-4">
                  {profile.financial_goals || 'No goals set yet.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Widget */}
        <div className="mt-6 glass-card p-5 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase">This Month's Transactions</p>
            <Link href="/transactions" className="text-xs font-mono text-kira-cream-dim/50 hover:text-kira-gold transition-colors tracking-widest">View All →</Link>
          </div>
          {/* Mini summary */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-sm p-3 text-center">
              <p className="text-[10px] font-mono text-green-400/70 tracking-widest uppercase mb-1">Income</p>
              <p className="text-sm font-mono font-bold text-green-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(txSummary.totalIncome)}
              </p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-3 text-center">
              <p className="text-[10px] font-mono text-red-400/70 tracking-widest uppercase mb-1">Expenses</p>
              <p className="text-sm font-mono font-bold text-red-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(txSummary.totalExpense)}
              </p>
            </div>
          </div>
          {/* Recent tx list */}
          {recentTx.length === 0 ? (
            <Link href="/transactions"
              className="flex items-center justify-center gap-2 p-4 border border-dashed border-kira-gold/20 rounded-sm text-kira-cream-dim/40 hover:border-kira-gold/40 hover:text-kira-cream-dim transition-all">
              <Receipt size={14} />
              <span className="text-xs font-mono tracking-widest">No transactions yet — click to log</span>
            </Link>
          ) : (
            <div className="space-y-2">
              {recentTx.map(tx => (
                <div key={tx.id} className="flex items-center gap-3">
                  <span className="text-base">{CATEGORY_EMOJI[tx.category] || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-kira-cream truncate">{tx.description || tx.category}</p>
                    <p className="text-[10px] text-kira-cream-dim/40 font-mono">{tx.category}</p>
                  </div>
                  <span className={`text-xs font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis breakdown */}
        {analysis && (
          <div className="mt-6 glass-card p-6 rounded-sm">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">KIRA Analysis Breakdown</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricBar label="LIQUIDITY" score={analysis.breakdown.liquidity.score} insight={analysis.breakdown.liquidity.insight} />
              <MetricBar label="DEBT RATIO" score={analysis.breakdown.debt_ratio.score} insight={analysis.breakdown.debt_ratio.insight} />
              <MetricBar label="SAVINGS RATE" score={analysis.breakdown.savings_rate.score} insight={analysis.breakdown.savings_rate.insight} />
              <MetricBar label="INVESTMENT HEALTH" score={analysis.breakdown.investment_health.score} insight={analysis.breakdown.investment_health.insight} />
            </div>
            {analysis.top_priorities.length > 0 && (
              <div className="mt-6 pt-4 border-t border-kira-gold/10">
                <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-3">Top Priorities</p>
                <div className="space-y-1.5">
                  {analysis.top_priorities.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-kira-gold mt-0.5 text-xs">✦</span>
                      <span className="text-kira-cream-dim font-body text-sm">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
