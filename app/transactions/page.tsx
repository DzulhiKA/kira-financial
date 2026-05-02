'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Transaction } from '@/lib/types'

const CATEGORIES = [
  { name: 'Makanan & Minuman', emoji: '🍽️', color: '#F97316' },
  { name: 'Transportasi',      emoji: '🚗', color: '#3B82F6' },
  { name: 'Investasi',         emoji: '📈', color: '#22C55E' },
  { name: 'Tagihan',           emoji: '⚡', color: '#EAB308' },
  { name: 'Belanja',           emoji: '🛍️', color: '#A855F7' },
  { name: 'Hiburan',           emoji: '🎮', color: '#EC4899' },
  { name: 'Kesehatan',         emoji: '💊', color: '#EF4444' },
  { name: 'Pendidikan',        emoji: '📚', color: '#06B6D4' },
  { name: 'Pendapatan',        emoji: '💰', color: '#C9A84C' },
  { name: 'Tabungan',          emoji: '🏦', color: '#2DD4BF' },
  { name: 'Lainnya',           emoji: '📦', color: '#6B7280' },
]

const getCat = (name: string) => CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1]

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)

const formatInput = (v: string) =>
  v.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

function DonutChart({ byCategory, total }: { byCategory: Record<string, number>; total: number }) {
  const entries = Object.entries(byCategory).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const r = 50, cx = 60, cy = 60, stroke = 14
  const circ = 2 * Math.PI * r
  let cumulative = 0

  if (total === 0) return (
    <div className="flex items-center justify-center h-[120px] text-kira-cream-dim/30 text-xs font-mono">
      Belum ada data
    </div>
  )

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {entries.map(([cat, val]) => {
          const pct = val / total
          const dash = pct * circ
          const offset = circ * (1 - cumulative)
          cumulative += pct
          const color = getCat(cat).color
          return (
            <circle key={cat} cx={cx} cy={cy} r={r}
              fill="none" stroke={color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'all 0.6s ease' }}
            />
          )
        })}
        <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="#111118" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="monospace">{entries.length}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#C8C0B0" fontSize="7" fontFamily="monospace">kategori</text>
      </svg>
      <div className="flex-1 space-y-1.5 overflow-auto max-h-[120px] pr-1">
        {entries.slice(0, 6).map(([cat, val]) => {
          const c = getCat(cat)
          const pct = Math.round((val / total) * 100)
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-sm">{c.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[10px] text-kira-cream-dim font-body">{cat}</span>
                  <span className="text-[10px] font-mono" style={{ color: c.color }}>{pct}%</span>
                </div>
                <div className="h-1 bg-kira-slate rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  const router = useRouter()
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netCashflow: 0, byCategory: {} as Record<string, number> })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all')

  const [form, setForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/transactions?month=${selectedMonth}`)
    if (res.status === 401) return router.push('/login')
    const data = await res.json()
    setTransactions(data.transactions || [])
    setSummary(data.summary || { totalIncome: 0, totalExpense: 0, netCashflow: 0, byCategory: {} })
    setLoading(false)
  }, [selectedMonth, router])

  useEffect(() => { load() }, [load])

  const prevMonth = () => {
    const d = new Date(selectedMonth + '-01')
    d.setMonth(d.getMonth() - 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const d = new Date(selectedMonth + '-01')
    d.setMonth(d.getMonth() + 1)
    const today = new Date()
    if (d <= today) setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const monthLabel = new Date(selectedMonth + '-02').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const handleSubmit = async () => {
    if (!form.amount) return
    setSaving(true)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount.replace(/\./g, '')) }),
    })
    const data = await res.json()
    if (res.ok) {
      setShowForm(false)
      setForm({ type: 'expense', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] })
      load()
      // Show the auto-detected category briefly
      if (data.category && !form.category) {
        // category was auto-detected by KIRA
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  const filtered = transactions.filter(t => activeTab === 'all' ? true : t.type === activeTab)

  // Group by date
  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => {
    if (!grouped[t.date]) grouped[t.date] = []
    grouped[t.date].push(t)
  })

  return (
    <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 page-enter">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-kira-cream-dim hover:text-kira-cream transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-kira-cream">Budget Tracker</h1>
            <p className="text-kira-cream-dim text-sm font-body flex items-center gap-1.5 mt-0.5">
              <Sparkles size={11} className="text-kira-gold" />
              Transaksi dikategorikan otomatis oleh KIRA
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ml-auto btn-gold px-4 py-2 rounded-sm text-xs font-mono tracking-widest uppercase flex items-center gap-1.5"
          >
            <Plus size={14} /> Tambah
          </button>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between glass-card px-4 py-3 rounded-sm mb-6">
          <button onClick={prevMonth} className="text-kira-cream-dim hover:text-kira-cream transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="font-mono text-sm text-kira-cream tracking-widest capitalize">{monthLabel}</span>
          <button onClick={nextMonth} className="text-kira-cream-dim hover:text-kira-cream transition-colors disabled:opacity-30"
            disabled={selectedMonth === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pemasukan', value: summary.totalIncome, color: '#22C55E', icon: <TrendingUp size={14} /> },
            { label: 'Pengeluaran', value: summary.totalExpense, color: '#EF4444', icon: <TrendingDown size={14} /> },
            { label: 'Net Cashflow', value: summary.netCashflow, color: summary.netCashflow >= 0 ? '#C9A84C' : '#EF4444', icon: null },
          ].map(item => (
            <div key={item.label} className="glass-card p-4 rounded-sm text-center">
              <div className="flex items-center justify-center gap-1 mb-1" style={{ color: item.color }}>
                {item.icon}
                <p className="text-[10px] font-mono tracking-widest uppercase">{item.label}</p>
              </div>
              <p className="text-sm font-mono font-bold" style={{ color: item.color }}>
                {item.value >= 0 ? '' : '-'}{formatIDR(Math.abs(item.value))}
              </p>
            </div>
          ))}
        </div>

        {/* Donut Chart */}
        {!loading && Object.keys(summary.byCategory).length > 0 && (
          <div className="glass-card p-5 rounded-sm mb-6">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Breakdown Kategori</p>
            <DonutChart byCategory={summary.byCategory} total={summary.totalIncome + summary.totalExpense} />
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="glass-card p-6 rounded-sm mb-6 space-y-4"
            style={{ border: '1px solid rgba(201,168,76,0.3)', animation: 'bubbleIn 0.3s ease forwards' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-kira-gold" />
              <p className="text-xs font-mono text-kira-gold tracking-widest uppercase">Transaksi Baru</p>
            </div>

            {/* Income / Expense toggle */}
            <div className="flex gap-1 p-1 bg-kira-obsidian rounded-sm w-fit">
              {(['expense', 'income'] as const).map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: '' }))}
                  className={`px-4 py-1.5 rounded-sm text-xs font-mono tracking-widest uppercase transition-all ${
                    form.type === t
                      ? t === 'income' ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                       : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'text-kira-cream-dim'
                  }`}>
                  {t === 'income' ? '⬆ Pemasukan' : '⬇ Pengeluaran'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Amount */}
              <div>
                <label className="block text-[10px] font-mono text-kira-cream-dim tracking-widest uppercase mb-1">Nominal (IDR)</label>
                <input
                  value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: formatInput(e.target.value) }))}
                  className="kira-input w-full px-3 py-2.5 rounded-sm text-sm font-mono"
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-mono text-kira-cream-dim tracking-widest uppercase mb-1">Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="kira-input w-full px-3 py-2.5 rounded-sm text-sm font-mono"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-[10px] font-mono text-kira-cream-dim tracking-widest uppercase mb-1">
                  Deskripsi <span className="text-kira-gold">(KIRA auto-kategorisasi)</span>
                </label>
                <input
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="kira-input w-full px-3 py-2.5 rounded-sm text-sm font-body"
                  placeholder="Contoh: makan siang di warteg, grab ke kantor, bayar listrik..."
                />
              </div>

              {/* Manual category override */}
              <div className="col-span-2">
                <label className="block text-[10px] font-mono text-kira-cream-dim tracking-widest uppercase mb-1.5">
                  Kategori Manual <span className="text-kira-cream-dim/40">(opsional — biarkan kosong untuk auto)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.filter(c => form.type === 'income' ? ['Pendapatan', 'Investasi', 'Tabungan', 'Lainnya'].includes(c.name) : c.name !== 'Pendapatan').map(c => (
                    <button
                      key={c.name}
                      onClick={() => setForm(p => ({ ...p, category: p.category === c.name ? '' : c.name }))}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-body transition-all border ${
                        form.category === c.name
                          ? 'border-opacity-60 text-kira-obsidian font-semibold'
                          : 'border-kira-slate text-kira-cream-dim hover:border-kira-gold/30'
                      }`}
                      style={form.category === c.name ? { background: c.color, borderColor: c.color } : {}}
                    >
                      {c.emoji} {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving || !form.amount}
              className="btn-gold w-full py-2.5 rounded-sm text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <><div className="w-3 h-3 border border-kira-obsidian/50 border-t-kira-obsidian rounded-full animate-spin" /> KIRA sedang menganalisis...</>
              ) : (
                <><Sparkles size={12} /> Simpan & Auto-Kategorisasi</>
              )}
            </button>
          </div>
        )}

        {/* Tab filter */}
        <div className="flex gap-1 p-1 glass-card rounded-sm mb-4 w-fit">
          {(['all', 'income', 'expense'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-sm text-xs font-mono tracking-widest uppercase transition-all ${
                activeTab === tab ? 'bg-kira-gold text-kira-obsidian font-bold' : 'text-kira-cream-dim hover:text-kira-cream'
              }`}>
              {tab === 'all' ? 'Semua' : tab === 'income' ? '⬆ Masuk' : '⬇ Keluar'}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-kira-gold/30 border-t-kira-gold rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="glass-card p-12 rounded-sm text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-kira-cream-dim text-sm font-body">Belum ada transaksi bulan ini.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 btn-outline-gold px-5 py-2 rounded-sm text-xs font-mono tracking-widest uppercase">
              + Tambah Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, txs]) => {
              const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
              const dayTotal = txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0)
              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-mono text-kira-cream-dim/60 tracking-widest uppercase">{dayLabel}</span>
                    <span className={`text-[10px] font-mono ${dayTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {dayTotal >= 0 ? '+' : ''}{formatIDR(dayTotal)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {txs.map(tx => {
                      const cat = getCat(tx.category)
                      return (
                        <div key={tx.id} className="glass-card px-4 py-3 rounded-sm flex items-center gap-3 group hover:border-kira-gold/20 transition-all">
                          {/* Category badge */}
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                            style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                            {cat.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-body text-kira-cream truncate">
                                {tx.description || tx.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                style={{ background: `${cat.color}18`, color: cat.color }}>
                                {cat.emoji} {tx.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-mono font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                            </span>
                            <button onClick={() => handleDelete(tx.id)}
                              className="text-kira-cream-dim/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
