import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiModel, TRANSACTION_CATEGORIZER_PROMPT } from '@/lib/gemini'

// Auto-categorize using Gemini
async function categorizeTransaction(description: string, type: string): Promise<string> {
  if (!description?.trim()) {
    return type === 'income' ? 'Pendapatan' : 'Lainnya'
  }
  try {
    const model = getGeminiModel()
    const prompt = `${TRANSACTION_CATEGORIZER_PROMPT}\n\nTransaction: "${description}" (type: ${type})`
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return json.category || (type === 'income' ? 'Pendapatan' : 'Lainnya')
  } catch {
    return type === 'income' ? 'Pendapatan' : 'Lainnya'
  }
}

// GET /api/transactions?month=YYYY-MM
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // format: YYYY-MM

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (month) {
    const [year, mon] = month.split('-')
    const start = `${year}-${mon}-01`
    const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate()
    const end = `${year}-${mon}-${lastDay}`
    query = query.gte('date', start).lte('date', end)
  }

  const { data: transactions, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Compute monthly summary
  const txList = transactions || []
  const totalIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const byCategory: Record<string, number> = {}
  txList.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })

  return NextResponse.json({
    transactions: txList,
    summary: {
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
      byCategory,
    }
  })
}

// POST /api/transactions
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, amount, description, date, category: manualCategory } = body

  if (!type || !amount || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Auto-categorize if no manual category given
  const category = manualCategory || await categorizeTransaction(description || '', type)

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      description: description || '',
      category,
      date,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ transaction: data, category })
}

// DELETE /api/transactions
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
