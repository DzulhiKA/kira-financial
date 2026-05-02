'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/onboarding'), 1500)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-kira-obsidian flex items-center justify-center px-4">
        <div className="text-center glass-card p-12 rounded-sm max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-kira-gold/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 rounded-full bg-kira-gold flex items-center justify-center">
              <span className="font-display font-black text-kira-obsidian">✓</span>
            </div>
          </div>
          <h2 className="font-display text-kira-cream font-bold text-xl mb-2">Account Created!</h2>
          <p className="text-kira-cream-dim text-sm font-body">Redirecting you to setup KIRA...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-kira-obsidian flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-kira-gold flex items-center justify-center">
              <span className="font-display font-black text-kira-obsidian text-lg">K</span>
            </div>
            <span className="font-display font-semibold text-kira-cream tracking-widest">KIRA</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-kira-cream tracking-wide">Create Account</h1>
          <p className="text-kira-cream-dim text-sm mt-2 font-body">Begin your financial intelligence journey</p>
        </div>

        <div className="glass-card p-8 rounded-sm">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-kira-gold tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="kira-input w-full px-4 py-3 pr-11 rounded-sm text-sm font-body"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kira-cream-dim/50 hover:text-kira-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 rounded-sm font-display font-semibold tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-kira-obsidian/30 border-t-kira-obsidian rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-kira-cream-dim/60 text-sm mt-6 font-body">
          Already have an account?{' '}
          <Link href="/login" className="text-kira-gold hover:text-kira-gold-light transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  )
}
