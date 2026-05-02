'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'

export default function SimulatorPage() {
  const [monthly, setMonthly] = useState('')
  const [rate, setRate] = useState('10')
  const [years, setYears] = useState('10')
  const [initial, setInitial] = useState('')
  const [calculated, setCalculated] = useState(false)

  const monthlyNum = parseFloat(monthly.replace(/\./g, '') || '0')
  const rateNum = parseFloat(rate || '0') / 100 / 12
  const monthsNum = parseFloat(years || '0') * 12
  const initialNum = parseFloat(initial.replace(/\./g, '') || '0')

  const futureValue = initialNum * Math.pow(1 + rateNum, monthsNum) +
    (rateNum > 0 ? monthlyNum * ((Math.pow(1 + rateNum, monthsNum) - 1) / rateNum) : monthlyNum * monthsNum)

  const totalContributed = initialNum + (monthlyNum * monthsNum)
  const totalGain = futureValue - totalContributed
  const gainPercent = totalContributed > 0 ? ((totalGain / totalContributed) * 100).toFixed(1) : '0'

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

  const formatInput = (val: string) => {
    const raw = val.replace(/\D/g, '')
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Build chart data
  const chartData = []
  for (let y = 0; y <= parseFloat(years || '0'); y++) {
    const m = y * 12
    const fv = initialNum * Math.pow(1 + rateNum, m) +
      (rateNum > 0 ? monthlyNum * ((Math.pow(1 + rateNum, m) - 1) / rateNum) : monthlyNum * m)
    const contrib = initialNum + monthlyNum * m
    chartData.push({ year: y, value: fv, contributed: contrib })
  }

  const maxVal = Math.max(...chartData.map(d => d.value), 1)

  return (
    <main className="min-h-screen bg-kira-obsidian relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8 page-enter">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-kira-cream-dim hover:text-kira-cream transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-kira-cream">Compound Interest Simulator</h1>
            <p className="text-kira-cream-dim text-sm font-body">Visualize the power of compounding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Inputs */}
          <div className="glass-card p-6 rounded-sm space-y-4">
            <p className="text-xs font-mono text-kira-gold tracking-widest uppercase">Parameters</p>
            <div>
              <label className="block text-xs font-mono text-kira-cream-dim tracking-widest uppercase mb-1.5">Initial Capital (IDR)</label>
              <input
                type="text"
                value={initial}
                onChange={e => setInitial(formatInput(e.target.value))}
                className="kira-input w-full px-4 py-2.5 rounded-sm text-sm font-body"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-kira-cream-dim tracking-widest uppercase mb-1.5">Monthly Investment (IDR)</label>
              <input
                type="text"
                value={monthly}
                onChange={e => setMonthly(formatInput(e.target.value))}
                className="kira-input w-full px-4 py-2.5 rounded-sm text-sm font-body"
                placeholder="1.000.000"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-kira-cream-dim tracking-widest uppercase mb-1.5">Annual Return: {rate}%</label>
              <input
                type="range" min="1" max="30" value={rate}
                onChange={e => setRate(e.target.value)}
                className="w-full accent-kira-gold"
              />
              <div className="flex justify-between text-xs text-kira-cream-dim/40 font-mono mt-1">
                <span>1%</span><span>Conservative ~8%</span><span>30%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-kira-cream-dim tracking-widest uppercase mb-1.5">Duration: {years} Years</label>
              <input
                type="range" min="1" max="40" value={years}
                onChange={e => setYears(e.target.value)}
                className="w-full accent-kira-gold"
              />
              <div className="flex justify-between text-xs text-kira-cream-dim/40 font-mono mt-1">
                <span>1yr</span><span>10yr</span><span>40yr</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="glass-card p-6 rounded-sm">
              <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Projected Result</p>
              <div className="text-center">
                <p className="font-display text-3xl font-black text-kira-gold mb-1">
                  {formatIDR(futureValue)}
                </p>
                <p className="text-xs text-kira-cream-dim font-mono">Total portfolio value</p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-sm space-y-3">
              {[
                { label: 'Total Contributed', value: formatIDR(totalContributed), color: 'text-kira-cream' },
                { label: 'Investment Gain', value: formatIDR(totalGain), color: 'text-kira-green' },
                { label: 'Return on Investment', value: `+${gainPercent}%`, color: 'text-kira-gold' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-kira-cream-dim font-body">{item.label}</span>
                  <span className={`text-sm font-mono font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-card p-6 rounded-sm">
          <p className="text-xs font-mono text-kira-gold tracking-widest uppercase mb-4">Growth Projection</p>
          <div className="flex items-end gap-1 h-40">
            {chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 20)) === 0).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '120px' }}>
                  <div
                    className="w-full rounded-t-sm bg-kira-gold/30 transition-all duration-500"
                    style={{ height: `${(d.contributed / maxVal) * 100}%` }}
                  />
                  <div
                    className="w-full rounded-t-sm bg-kira-gold transition-all duration-500"
                    style={{ height: `${Math.max(0, (d.value - d.contributed) / maxVal * 100)}%` }}
                  />
                </div>
                {d.year % 5 === 0 && (
                  <span className="text-xs text-kira-cream-dim/50 font-mono">{d.year}y</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-kira-gold/30 rounded-sm"/><span className="text-xs text-kira-cream-dim font-body">Contributed</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-kira-gold rounded-sm"/><span className="text-xs text-kira-cream-dim font-body">Investment Gain</span></div>
          </div>
        </div>
      </div>
    </main>
  )
}