import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, KIRA_SYSTEM_PROMPT } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, history } = await request.json()

    // Get user's financial profile for context
    const { data: profile } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let contextualSystemPrompt = KIRA_SYSTEM_PROMPT

    if (profile) {
      const monthlyNet = profile.monthly_income - profile.monthly_expenses
      const savingsRate = profile.monthly_income > 0
        ? ((profile.monthly_savings || profile.total_savings) / profile.monthly_income * 100).toFixed(1)
        : '0'
      const debtToIncome = profile.monthly_income > 0
        ? (profile.total_debt / (profile.monthly_income * 12) * 100).toFixed(1)
        : '0'

      contextualSystemPrompt += `

USER FINANCIAL CONTEXT (always reference this when relevant):
- Monthly Income: IDR ${profile.monthly_income?.toLocaleString('id-ID') || 'N/A'}
- Monthly Expenses: IDR ${profile.monthly_expenses?.toLocaleString('id-ID') || 'N/A'}
- Monthly Net Cash Flow: IDR ${monthlyNet?.toLocaleString('id-ID') || 'N/A'}
- Total Savings: IDR ${profile.total_savings?.toLocaleString('id-ID') || 'N/A'}
- Total Debt: IDR ${profile.total_debt?.toLocaleString('id-ID') || 'N/A'}
- Monthly Investment: IDR ${profile.investment_amount?.toLocaleString('id-ID') || 'N/A'}
- Financial Goals: ${profile.financial_goals || 'Not specified'}
- Health Score: ${profile.health_score}/100
- Risk Profile: ${profile.risk_profile}
- Savings Rate: ~${savingsRate}%
- Debt-to-Annual-Income: ~${debtToIncome}%`
    }

    const model = getGeminiModel()

    // Build conversation history for Gemini
    const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'System: ' + contextualSystemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am KIRA, your AI Financial Intelligence Advisor. I'm ready to help with precise, personalized financial guidance. How can I assist you today?" }],
        },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const responseText = result.response.text()

    // Save messages to DB
    await supabase.from('chat_messages').insert([
      { user_id: user.id, role: 'user', content: message },
      { user_id: user.id, role: 'assistant', content: responseText },
    ])

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('Kira API error:', error)
    return NextResponse.json({ error: 'Failed to get response from Kira' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50)

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
