export interface FinancialProfile {
  id?: string
  user_id?: string
  monthly_income: number
  monthly_expenses: number
  total_savings: number
  total_debt: number
  investment_amount: number
  financial_goals: string
  health_score: number
  risk_profile: 'conservative' | 'moderate' | 'aggressive'
  created_at?: string
  updated_at?: string
}

export interface ChatMessage {
  id?: string
  user_id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface RiskAssessment {
  id?: string
  user_id?: string
  answers: Record<string, string>
  risk_profile: string
  explanation: string
  recommendations: InvestmentRecommendation[]
  created_at?: string
}

export interface InvestmentRecommendation {
  name: string
  type: string
  reason: string
  risk_level: 'low' | 'medium' | 'high'
}

export interface FinancialAnalysis {
  health_score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  summary: string
  breakdown: {
    liquidity: { score: number; label: string; insight: string }
    debt_ratio: { score: number; label: string; insight: string }
    savings_rate: { score: number; label: string; insight: string }
    investment_health: { score: number; label: string; insight: string }
  }
  top_priorities: string[]
  positive_signals: string[]
}

export interface RiskProfile {
  risk_profile: 'conservative' | 'moderate' | 'aggressive'
  risk_score: number
  profile_title: string
  description: string
  recommended_allocation: {
    cash_deposits: number
    bonds: number
    mutual_funds: number
    stocks: number
    alternative: number
  }
  instrument_recommendations: InvestmentRecommendation[]
  key_advice: string
}

export interface Transaction {
  id: string
  user_id?: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  created_at?: string
}

export interface MonthlySummary {
  month: string        // 'YYYY-MM'
  totalIncome: number
  totalExpense: number
  netCashflow: number
  byCategory: Record<string, number>
}
