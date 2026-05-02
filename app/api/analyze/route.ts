import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, ANALYZER_PROMPT } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import { FinancialProfile } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileData: FinancialProfile = await request.json()

    const model = getGeminiModel()

    const analysisPrompt = `${ANALYZER_PROMPT}

Financial Data to Analyze:
- Monthly Income: IDR ${profileData.monthly_income}
- Monthly Expenses: IDR ${profileData.monthly_expenses}
- Total Savings: IDR ${profileData.total_savings}
- Total Debt: IDR ${profileData.total_debt}
- Monthly Investment Amount: IDR ${profileData.investment_amount}
- Financial Goals: ${profileData.financial_goals}

Calculate ratios:
- Monthly Net: IDR ${profileData.monthly_income - profileData.monthly_expenses}
- Savings Rate: ${profileData.monthly_income > 0 ? ((profileData.total_savings / profileData.monthly_income) * 100).toFixed(1) : 0}% of monthly income
- Debt-to-Annual-Income: ${profileData.monthly_income > 0 ? ((profileData.total_debt / (profileData.monthly_income * 12)) * 100).toFixed(1) : 0}%
- Investment Rate: ${profileData.monthly_income > 0 ? ((profileData.investment_amount / profileData.monthly_income) * 100).toFixed(1) : 0}% of income

Provide response in the same language as the financial goals text.`

    const result = await model.generateContent(analysisPrompt)
    let responseText = result.response.text()

    // Clean JSON response
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(responseText)

    // Upsert financial profile with health score
    const { error: profileError } = await supabase
      .from('financial_profiles')
      .upsert({
        user_id: user.id,
        ...profileData,
        health_score: analysis.health_score,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Analyze API error:', error)
    return NextResponse.json({ error: 'Failed to analyze financial data' }, { status: 500 })
  }
}
