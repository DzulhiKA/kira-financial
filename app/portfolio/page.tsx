'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

interface Holding {
  id: string
  asset_name: string
  asset_type: string
  ticker: string
  quantity: number
  avg_buy_price: number
  current_price: number
}

interface Goal {
  id: string
  goal_name: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  expected_return: number
  target_date: string
}

const ASSET_TYPES = ['stock', 'mutual_fund', 'bond', 'crypto', 'gold', 'other']

export default function PortfolioPage() {
  const router = useRouter()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'goals'>('portfolio')
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)

  const [newHolding, setNewHolding] = useState({
    asset_name: '', asset_type: 'stock', ticker: '',
    quantity: '', avg_buy_price: '', current_price: ''
  })
  const [newGoal, setNewGoal] = useState({
    goal_name: '', target_amount: '', current_amount: '',
    monthly_contribution: '', expected_return: '10', target_date: ''
  })

  const load = useCallback(async () => {
    const res = await fetch('/api/portfolio')
    if (res.status === 401) return router.push('/login')
    const data = await res.json()
    setHoldings(data.holdings || [])
    setGoals(data.goals || [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

  const addHolding = async () => {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'holding',
        data: {
          ...newHolding,
          quantity: parseFloat(newHolding.quantity),
          avg_buy_price: parseFloat(newHolding.avg_buy_price.replace(/\./g, '')),
          current_price: parseFloat(newHolding.current_price.replace(/\./g, '')),
        }
      })
    })
    if (res.ok) { load(); setShowAddHolding(false); setNewHolding({ asset_name: '', asset_type: 'stock', ticker: '', quantity: '', avg_buy_price: '', current_price: '' }) }
  }

  const addGoal = async () => {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'goal',
        data: {
          ...newGoal,
          target_amount: parseFloat(newGoal.target_amount.replace(/\./g, '')),
          current_amount: parseFloat(newGoal.current_amount.replace(/\./g, '') || '0'),
          monthly_contribution: parseFloat(newGoal.monthly_contribution.replace(/\./g, '')),
          expected_return: parseFloat(newGoal.expected_return),
        }
      })
    })
    if (res.ok) { load(); setShowAddGoal(false) }
  }

  const deleteItem = async (id: string, type: string) => {
    await fetch('/api/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type })
    })
    load()
  }

  const formatInput = (val: string) => val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  // Portfolio calculations
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.current_price, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.avg_buy_price, 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPct = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(2) : '0'

  // Goal projections
  const calcGoalProjection = (goal: Goal) => {
    const r = goal.expected_return / 100 / 12
    const months = goal.target_date
      ? Math.max(0, (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
      : 120
    const fv = goal.current_amount * Math.pow(1 + r, months) +
      (r > 0 ? goal.monthly_contribution * ((Math.pow(1 + r, months) - 1) / r) : goal.monthly_contribution * months)
    const progress = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0
    const onTrack = fv >= goal.target_amount
    return { fv, progress, onTrack }
  }

  if (loading) return (
    <main className="min-h-screen bg-kira-obsidian flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-kira-gold/30 border-t-kira-gold rounded-full animate-spin" />
    </main>
  )

  return (
    <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 page-enter">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-kira-cream-dim hover:text-kira-cream transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-kira-cream">Investment Hub</h1>
            <p className="text-kira-cream-dim text-sm font-body">Portfolio & Goals Tracker</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass-card rounded-sm mb-6 w-fit">
          {(['portfolio', 'goals'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-sm text-xs font-mono tracking-widest uppercase transition-all ${
                activeTab === tab ? 'bg-kira-gold text-kira-obsidian font-bold' : 'text-kira-cream-dim hover:text-kira-cream'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'portfolio' && (
          <>
            {/* Summary */}
            {holdings.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Value', value: formatIDR(totalValue), color: 'text-kira-gold' },
                  { label: 'Total Cost', value: formatIDR(totalCost), color: 'text-kira-cream' },
                  { label: 'P&L', value: `${totalPnL >= 0 ? '+' : ''}${formatIDR(totalPnL)} (${totalPnLPct}%)`, color: totalPnL >= 0 ? 'text-green-400' : 'text-red-400' },
                ].map(item => (
                  <div key={item.label} className="glass-card p-4 rounded-sm text-center">
                    <p className="text-xs font-mono text-kira-cream-dim/60 mb-1">{item.label}</p>
                    <p className={`text-sm font-mono font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Holdings list */}
            <div className="space-y-3 mb-4">
              {holdings.map(h => {
                const value = h.quantity * h.current_price
                const cost = h.quantity * h.avg_buy_price
                const pnl = value - cost
                const pnlPct = cost > 0 ? ((pnl / cost) * 100).toFixed(2) : '0'
                return (
                  <div key={h.id} className="glass-card p-4 rounded-sm flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-kira-cream text-sm">{h.asset_name}</span>
                        {h.ticker && <span className="text-xs font-mono text-kira-gold bg-kira-gold/10 px-1.5 py-0.5 rounded">{h.ticker}</span>}
                        <span className="text-xs text-kira-cream-dim/50 font-mono capitalize">{h.asset_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-kira-cream-dim/60 font-mono">
                        <span>{h.quantity} units @ {formatIDR(h.avg_buy_price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-kira-cream">{formatIDR(value)}</p>
                      <div className={`flex items-center gap-1 text-xs font-mono justify-end ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {pnl >= 0 ? '+' : ''}{pnlPct}%
                      </div>
                    </div>
                    <button onClick={() => deleteItem(h.id, 'holding')} className="text-kira-cream-dim/30 hover:text-red-400 transition-colors ml-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setShowAddHolding(!showAddHolding)}
              className="btn-outline-gold w-full py-2.5 rounded-sm text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2">
              <Plus size={14} /> Add Asset
            </button>

            {showAddHolding && (
              <div className="glass-card p-6 rounded-sm mt-4 space-y-3">
                <p className="text-xs font-mono text-kira-gold tracking-widest uppercase">Add New Asset</p>
                <div className="grid grid-cols-2 gap-3">
                  <input value={newHolding.asset_name} onChange={e => setNewHolding(p => ({...p, asset_name: e.target.value}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm col-span-2" placeholder="Asset Name" />
                  <select value={newHolding.asset_type} onChange={e => setNewHolding(p => ({...p, asset_type: e.target.value}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm">
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                  <input value={newHolding.ticker} onChange={e => setNewHolding(p => ({...p, ticker: e.target.value}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" placeholder="Ticker (optional)" />
                  <input value={newHolding.quantity} onChange={e => setNewHolding(p => ({...p, quantity: e.target.value}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" placeholder="Quantity" type="number" />
                  <input value={newHolding.avg_buy_price} onChange={e => setNewHolding(p => ({...p, avg_buy_price: formatInput(e.target.value)}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" placeholder="Avg Buy Price (IDR)" />
                  <input value={newHolding.current_price} onChange={e => setNewHolding(p => ({...p, current_price: formatInput(e.target.value)}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm col-span-2" placeholder="Current Price (IDR)" />
                </div>
                <button onClick={addHolding} className="btn-gold w-full py-2.5 rounded-sm text-xs font-mono tracking-widest uppercase">
                  Save Asset
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'goals' && (
          <>
            <div className="space-y-4 mb-4">
              {goals.map(goal => {
                const { fv, progress, onTrack } = calcGoalProjection(goal)
                return (
                  <div key={goal.id} className="glass-card p-5 rounded-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-kira-cream text-sm">{goal.goal_name}</h3>
                        <p className="text-xs text-kira-cream-dim/60 font-mono mt-0.5">
                          Target: {formatIDR(goal.target_amount)} · {goal.expected_return}% p.a.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${onTrack ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {onTrack ? 'On Track' : 'Review'}
                        </span>
                        <button onClick={() => deleteItem(goal.id, 'goal')} className="text-kira-cream-dim/30 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-kira-slate rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-kira-gold rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-kira-cream-dim/60">{progress.toFixed(1)}% funded</span>
                      <span className="text-kira-gold">Projected: {formatIDR(fv)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={() => setShowAddGoal(!showAddGoal)}
              className="btn-outline-gold w-full py-2.5 rounded-sm text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2">
              <Plus size={14} /> Add Goal
            </button>

            {showAddGoal && (
              <div className="glass-card p-6 rounded-sm mt-4 space-y-3">
                <p className="text-xs font-mono text-kira-gold tracking-widest uppercase">Add Investment Goal</p>
                <div className="grid grid-cols-2 gap-3">
                  <input value={newGoal.goal_name} onChange={e => setNewGoal(p => ({...p, goal_name: e.target.value}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm col-span-2" placeholder="Goal Name (e.g. Buy House)" />
                  <input value={newGoal.target_amount} onChange={e => setNewGoal(p => ({...p, target_amount: formatInput(e.target.value)}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" placeholder="Target Amount (IDR)" />
                  <input value={newGoal.current_amount} onChange={e => setNewGoal(p => ({...p, current_amount: formatInput(e.target.value)}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" placeholder="Current Savings (IDR)" />
                  <input value={newGoal.monthly_contribution} onChange={e => setNewGoal(p => ({...p, monthly_contribution: formatInput(e.target.value)}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" placeholder="Monthly Contribution (IDR)" />
                  <input value={newGoal.target_date} onChange={e => setNewGoal(p => ({...p, target_date: e.target.value}))}
                    className="kira-input px-3 py-2 rounded-sm text-sm" type="date" />
                  <div className="col-span-2">
                    <label className="text-xs font-mono text-kira-cream-dim tracking-widest uppercase mb-1 block">Expected Return: {newGoal.expected_return}%</label>
                    <input type="range" min="1" max="30" value={newGoal.expected_return}
                      onChange={e => setNewGoal(p => ({...p, expected_return: e.target.value}))}
                      className="w-full accent-kira-gold" />
                  </div>
                </div>
                <button onClick={addGoal} className="btn-gold w-full py-2.5 rounded-sm text-xs font-mono tracking-widest uppercase">
                  Save Goal
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}