import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, RISK_PROFILER_PROMPT } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

const RISK_QUESTIONS = [
  {
    id: 'q1',
    question: 'If your investment dropped 20% in a month, what would you do?',
    options: [
      { value: 'sell_all', label: 'Sell everything immediately', weight: 1 },
      { value: 'sell_some', label: 'Sell some to reduce losses', weight: 2 },
      { value: 'hold', label: 'Hold and wait for recovery', weight: 3 },
      { value: 'buy_more', label: 'Buy more at lower price', weight: 4 },
    ],
  },
  {
    id: 'q2',
    question: 'What is your primary investment goal?',
    options: [
      { value: 'preserve', label: 'Preserve capital, avoid losses', weight: 1 },
      { value: 'income', label: 'Generate steady income', weight: 2 },
      { value: 'grow', label: 'Grow wealth over time', weight: 3 },
      { value: 'maximize', label: 'Maximize returns aggressively', weight: 4 },
    ],
  },
  {
    id: 'q3',
    question: 'How long can you leave your investment untouched?',
    options: [
      { value: 'less_1yr', label: 'Less than 1 year', weight: 1 },
      { value: '1_3yr', label: '1–3 years', weight: 2 },
      { value: '3_5yr', label: '3–5 years', weight: 3 },
      { value: 'more_5yr', label: 'More than 5 years', weight: 4 },
    ],
  },
  {
    id: 'q4',
    question: 'What percentage of your monthly income can you invest?',
    options: [
      { value: 'less_5', label: 'Less than 5%', weight: 1 },
      { value: '5_15', label: '5–15%', weight: 2 },
      { value: '15_30', label: '15–30%', weight: 3 },
      { value: 'more_30', label: 'More than 30%', weight: 4 },
    ],
  },
  {
    id: 'q5',
    question: 'Your investment experience level?',
    options: [
      { value: 'none', label: 'No experience, just starting', weight: 1 },
      { value: 'basic', label: 'Basic — savings/deposits only', weight: 2 },
      { value: 'intermediate', label: 'Intermediate — mutual funds/stocks', weight: 3 },
      { value: 'advanced', label: 'Advanced — stocks, crypto, derivatives', weight: 4 },
    ],
  },
]

export async function GET() {
  return NextResponse.json({ questions: RISK_QUESTIONS })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers } = await request.json()

    const model = getGeminiModel()

    const answersText = Object.entries(answers)
      .map(([qId, answer]) => {
        const question = RISK_QUESTIONS.find(q => q.id === qId)
        const option = question?.options.find(o => o.value === answer)
        return `${question?.question}: ${option?.label} (weight: ${option?.weight})`
      })
      .join('\n')

    const profilePrompt = `${RISK_PROFILER_PROMPT}

User Risk Assessment Answers:
${answersText}

Based on these answers, determine the user's risk profile. Respond in English.`

    const result = await model.generateContent(profilePrompt)
    let responseText = result.response.text()
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const riskProfile = JSON.parse(responseText)

    // Save risk assessment
    await supabase.from('risk_assessments').upsert({
      user_id: user.id,
      answers,
      risk_profile: riskProfile.risk_profile,
      explanation: riskProfile.description,
      recommendations: riskProfile.instrument_recommendations,
    }, { onConflict: 'user_id' })

    // Update financial profile with risk profile
    await supabase
      .from('financial_profiles')
      .update({ risk_profile: riskProfile.risk_profile })
      .eq('user_id', user.id)

    return NextResponse.json({ riskProfile })
  } catch (error) {
    console.error('Risk profile API error:', error)
    return NextResponse.json({ error: 'Failed to generate risk profile' }, { status: 500 })
  }
}
