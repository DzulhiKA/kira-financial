# KIRA — AI Financial Intelligence

> Your elite AI financial advisor powered by Gemini 2.5 Flash + Supabase

## Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Supabase Database
Run this SQL in your Supabase SQL Editor:

```sql
create extension if not exists "uuid-ossp";

create table financial_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  monthly_income numeric default 0,
  monthly_expenses numeric default 0,
  total_savings numeric default 0,
  total_debt numeric default 0,
  investment_amount numeric default 0,
  financial_goals text,
  health_score integer default 0,
  risk_profile text default 'moderate',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

create table risk_assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb,
  risk_profile text,
  explanation text,
  recommendations jsonb,
  created_at timestamp with time zone default now()
);

alter table financial_profiles enable row level security;
alter table chat_messages enable row level security;
alter table risk_assessments enable row level security;

create policy "Users can manage own financial profile"
  on financial_profiles for all using (auth.uid() = user_id);

create policy "Users can manage own chat messages"
  on chat_messages for all using (auth.uid() = user_id);

create policy "Users can manage own risk assessments"
  on risk_assessments for all using (auth.uid() = user_id);
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

---

## Features

- **KIRA Landing Page** — Branded hero with character identity
- **Auth** — Register/Login via Supabase Auth
- **Onboarding** — 3-step financial data collection
- **Financial Health Score** — AI-analyzed score 0-100 with breakdown
- **Dashboard** — Monthly overview, score gauge, quick actions
- **Chat with KIRA** — Full conversational AI with financial context
- **Risk Assessment** — 5-question profiling with portfolio recommendations

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS
- **Fonts**: Cinzel (display) + Outfit (body)
- **Deployment**: Vercel
