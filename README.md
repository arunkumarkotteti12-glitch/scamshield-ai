# ScamShield AI — AI-Powered Scam & Phishing Message Detector

[![AI Security](https://img.shields.io/badge/Security-Zero--Trust%20RLS-blue?style=flat-square&logo=postgresql)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%202.5--Flash-emerald?style=flat-square&logo=googlecloud)](https://ai.google.dev)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20Tailwind-purple?style=flat-square)](https://vitejs.dev)

**ScamShield AI** is a full-stack, production-grade web application built to address the **AI Security, Privacy & Trust** challenge. It empowers everyday users to paste suspicious emails, SMS texts, WhatsApp messages, or social media DMs and receive instant AI-powered threat analysis — featuring numeric risk scores (0–100), red flag indicators, plain-English explanations, and recommended immediate safety actions.

All scans are protected with database-level isolation enforced via **PostgreSQL Row Level Security (RLS)** in Supabase.

---

## 🌟 Key Features

1. **AI Threat Detection Engine**: Server-side Google Gemini AI integration (`@google/genai` SDK) evaluating fraud patterns, urgency manipulation, domain credibility, and bank/government impersonation.
2. **PostgreSQL Row Level Security (RLS)**: Scans are bound directly to `auth.uid() = user_id`. Application and database-level rules guarantee true data isolation.
3. **Cursor-Interactive Particle Field Background**: Canvas-based drifting dust particle field on `/login` and `/signup` that repels smoothly as the user moves their cursor.
4. **Dual Scanning Radar & Converging Particle Loader**: Combined loading animation while waiting for Gemini AI responses — featuring a sweeping radar line across pasted text and particles converging inward toward the result card.
5. **Detailed Risk Visualization**: Risk verdict badges (`HIGH`, `MEDIUM`, `LOW`), numeric score progress bar (0–100), scam category pills (`phishing`, `fake_delivery`, `lottery_prize_scam`, etc.), red flags array, and actionable next steps.
6. **User History & Scan Details**: Protected `/history` and `/history/:scanId` routes displaying past scans with keyword search and risk level filtering.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide React, Zod
- **Backend**: Node.js, Express.js, `@google/genai` SDK, `@supabase/supabase-js`, Zod, express-rate-limit
- **Auth & Database**: Supabase Auth (JWT), Supabase PostgreSQL with RLS
- **Target Deployment**: Vercel (Frontend) + Render (Backend) + Supabase (Database + Auth)

---

## 📁 Repository Structure

```
/client
  /src
    /api (Axios client with automatic Supabase JWT bearer injection)
    /components (Navbar, ParticleBackground, ScanLoadingAnimation, ScanResultCard, HistoryList, etc.)
    /lib (Supabase browser client)
    /pages (Landing, Login, Signup, Dashboard, History, HistoryDetailPage, NotFound)
    App.jsx
    main.jsx
    index.css
  index.html
  vite.config.js
  tailwind.config.js
/server
  /middleware (supabaseAuthMiddleware.js, rateLimiter.js, errorHandler.js)
  /routes (scans.js)
  /services (geminiService.js)
  /validators (scanValidators.js)
  /scripts (runMigration.js, seedDemoData.js)
  server.js
/supabase
  /migrations (001_initial_schema.sql)
.env.example
README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- A Supabase Project (URL + Anon Key + Service Role Key)
- A Google Gemini API Key

### 2. Environment Configuration

Copy `.env.example` to create `.env` in both `/server` and `/client`:

**Backend (`/server/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Frontend (`/client/.env`):**
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Database Migration (Supabase PostgreSQL + RLS)

Run the database setup script or execute `/supabase/migrations/001_initial_schema.sql` inside your Supabase Dashboard SQL Editor:

```sql
create extension if not exists "uuid-ossp";

create table public.scans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_source text not null default 'other',
  original_text text not null,
  is_scam boolean not null,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  risk_level text not null check (risk_level in ('low','medium','high')),
  scam_type text not null,
  red_flags text[] not null default '{}',
  explanation text not null,
  recommended_action text not null,
  created_at timestamptz not null default now()
);

alter table public.scans enable row level security;

create policy "Users can view their own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users can insert their own scans" on public.scans for insert with check (auth.uid() = user_id);
create policy "Users can delete their own scans" on public.scans for delete using (auth.uid() = user_id);
```

### 4. Start Server & Client

**Run Server:**
```bash
cd server
npm install
npm run dev
```

**Run Client:**
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Privacy Enforcement

- **Bearer Token Verification**: The Express backend parses the `Authorization: Bearer <token>` header issued by Supabase Auth and constructs a request-scoped Supabase client for all database operations.
- **Database-Level Data Privacy**: Because the request-scoped client uses the user's JWT, PostgreSQL RLS policies automatically filter all queries to `auth.uid() = user_id`.
- **Zero API Key Leakage**: Google Gemini API keys exist strictly on the backend.

---

## 📜 License
MIT © ScamShield AI Team
