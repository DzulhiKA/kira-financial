'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  "How can I improve my financial health score?",
  "What's the best investment for my risk profile?",
  "How much emergency fund should I have?",
  "Should I pay off debt or invest first?",
]

function KiraTypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-up">
      <div className="w-8 h-8 rounded-full bg-kira-gold/20 border border-kira-gold/30 flex items-center justify-center flex-shrink-0">
        <span className="font-display font-black text-kira-gold text-xs">K</span>
      </div>
      <div className="chat-bubble-kira px-4 py-3 rounded-sm rounded-bl-none">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-kira-gold/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-kira-gold/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-kira-gold/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function formatMessage(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-kira-cream font-semibold">$1</strong>')
    .replace(/✦/g, '<span class="text-kira-gold">✦</span>')
    .replace(/\n/g, '<br/>')
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initChat = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const res = await fetch('/api/kira')
    const data = await res.json()

    if (data.messages && data.messages.length > 0) {
      setMessages(data.messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content,
      })))
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm **KIRA** — your AI Financial Intelligence Advisor. ✦\n\nI have access to your financial data and I'm here to give you precise, personalized guidance. Whether it's investment strategy, debt management, or planning your financial future — ask me anything.\n\nWhat would you like to discuss today?",
      }])
    }
    setInitializing(false)
  }, [supabase, router])

  useEffect(() => { initChat() }, [initChat])
  useEffect(() => { scrollToBottom() }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: Message = { role: 'user', content: messageText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/kira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      })

      const data = await res.json()
      if (data.response) {
        setMessages([...newMessages, { role: 'assistant', content: data.response }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (initializing) {
    return (
      <main className="min-h-screen bg-kira-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-kira-gold/30 border-t-kira-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-kira-cream-dim text-sm font-mono">Connecting to KIRA...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen bg-kira-obsidian flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 radial-gold pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-5 py-4 border-b border-kira-gold/10 bg-kira-obsidian/80 backdrop-blur-sm">
        <Link href="/dashboard" className="text-kira-cream-dim hover:text-kira-cream transition-colors">
          <ArrowLeft size={18} />
        </Link>

        {/* Kira identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full border border-kira-gold/30 bg-kira-obsidian-3 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <rect width="36" height="36" fill="#111118"/>
                <ellipse cx="18" cy="16" rx="8" ry="9" fill="#F5D5B8"/>
                <ellipse cx="18" cy="10" rx="10" ry="9" fill="#1A0A2E"/>
                <ellipse cx="14.5" cy="16" rx="2" ry="2.2" fill="#0A0A0F"/>
                <ellipse cx="21.5" cy="16" rx="2" ry="2.2" fill="#0A0A0F"/>
                <ellipse cx="14.5" cy="16.2" rx="1.2" ry="1.3" fill="#C9A84C"/>
                <ellipse cx="21.5" cy="16.2" rx="1.2" ry="1.3" fill="#C9A84C"/>
                <path d="M 16 21 Q 18 23 20 21" stroke="#C9A84C" strokeWidth="0.8" fill="rgba(201,168,76,0.2)" strokeLinecap="round"/>
                <path d="M 22 27 Q 25 22 28 27 Q 32 30 36 36 L 0 36 Q 4 30 8 27 Q 11 22 14 27 Q 16 29 18 28 Q 20 29 22 27" fill="#C9A84C"/>
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-kira-teal rounded-full border border-kira-obsidian" />
          </div>
          <div>
            <p className="font-display font-semibold text-kira-cream text-sm tracking-wide">KIRA</p>
            <p className="text-kira-teal text-xs font-mono">● Online</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative z-10 max-w-3xl mx-auto w-full">
        <div className="space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-kira-gold/20 border border-kira-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-black text-kira-gold text-xs">K</span>
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-sm text-sm font-body leading-relaxed ${
                msg.role === 'user'
                  ? 'chat-bubble-user rounded-br-none text-kira-cream'
                  : 'chat-bubble-kira rounded-bl-none text-kira-cream-dim'
              }`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {loading && <KiraTypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested questions (only show if few messages) */}
      {messages.length <= 1 && !loading && (
        <div className="relative z-10 px-4 md:px-8 pb-2 max-w-3xl mx-auto w-full">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs btn-outline-gold px-3 py-1.5 rounded-full font-body"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 px-4 md:px-8 py-4 border-t border-kira-gold/10 bg-kira-obsidian/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask KIRA anything about your finances..."
              className="kira-input w-full px-4 py-3 rounded-sm text-sm font-body resize-none max-h-32"
              rows={1}
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-gold w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-center text-kira-cream-dim/30 text-xs font-mono mt-2">
          KIRA · AI Financial Intelligence · Not professional financial advice
        </p>
      </div>
    </main>
  )
}
