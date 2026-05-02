import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: holdings } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: goals } = await supabase
    .from('investment_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ holdings: holdings || [], goals: goals || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, data } = body

  if (type === 'holding') {
    const { data: holding, error } = await supabase
      .from('portfolio_holdings')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ holding })
  }

  if (type === 'goal') {
    const { data: goal, error } = await supabase
      .from('investment_goals')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ goal })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, type } = await request.json()
  const table = type === 'holding' ? 'portfolio_holdings' : 'investment_goals'

  await supabase.from(table).delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}