# Veduwa — Technical Whitepaper

**Last Updated:** April 7, 2026
**Status:** Demo v1.0 — Live
**Author:** Mukela Katungu

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Backend API Layer](#5-backend-api-layer)
6. [AI Pipeline](#6-ai-pipeline)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Seed Data & Demo Credentials](#10-seed-data--demo-credentials)
11. [Design System](#11-design-system)
12. [Performance & Security](#12-performance--security)

---

## 1. Executive Summary

**Veduwa** is an AI-powered IT job marketplace that automates the hiring pipeline from job posting to candidate screening. The platform uses vector embeddings for semantic matching, Claude AI for real-time candidate screening via streaming chat, and a modern full-stack architecture built for production scale.

### Key Metrics

| Metric | Value |
|--------|-------|
| Frontend Routes | 12 |
| Backend Endpoints | 15 |
| Database Tables | 5 |
| AI Services | 5 (parser, embeddings, matcher, screener, summarizer) |
| Seeded Data | 6 jobs, 8 candidates, 15 applications |
| Deploy Regions | US East (Vercel, Render, Supabase) |

### Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://frontend-vert-tau-84.vercel.app |
| Backend API | https://veduwa-api.onrender.com |
| Health Check | https://veduwa-api.onrender.com/health |
| API Docs | https://veduwa-api.onrender.com/docs |

---

## 2. System Architecture

```
                    ┌──────────────┐
                    │   Vercel CDN  │
                    │  (Next.js 14) │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
┌──────────┐      ┌──────────────┐      ┌──────────────┐
│ Supabase │◄────►│  Render.com  │◄────►│   Claude AI  │
│   Auth   │ JWT  │  (FastAPI)   │ API  │  (Anthropic) │
│   + DB   │      └──────┬───────┘      └──────────────┘
└──────────┘             │
     ▲                   │ asyncpg
     │                   ▼
     │            ┌──────────────┐
     └────────────│  PostgreSQL  │
                  │  (Supabase)  │
                  │  + pgvector  │
                  └──────────────┘
```

### Communication Flow

1. **Client → Vercel**: Next.js SSR + CSR with Tailwind v4
2. **Client → Supabase**: Direct auth (login, signup, OAuth)
3. **Client → FastAPI**: REST API calls with Bearer JWT
4. **FastAPI → Supabase**: Token verification via Supabase Auth API
5. **FastAPI → PostgreSQL**: SQLAlchemy 2.0 async ORM
6. **FastAPI → Claude**: AI parsing, screening, summarization

---

## 3. Technology Stack

### Backend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | FastAPI | 0.115.0 | REST API with async support |
| ORM | SQLAlchemy | 2.0.36 | Async database operations |
| Migrations | Alembic | 1.14.0 | Schema versioning |
| Validation | Pydantic | 2.10.0 | Request/response schemas |
| Auth | python-jose | 3.3.0 | JWT decoding |
| AI | Anthropic SDK | 0.42.0 | Claude API integration |
| Embeddings | NumPy | 2.0.2 | Vector operations |
| Task Queue | Celery | 5.4.0 | Background processing |
| Cache | Redis | 5.2.0 | Task broker |
| Server | Uvicorn | 0.34.0 | ASGI server |

### Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 14.2.35 | React meta-framework |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animation | Framer Motion | 12.38.0 | Page transitions, gestures |
| Icons | Lottie React | 2.4.1 | LordIcon animations (25) |
| Login Anim | Rive Canvas | - | Interactive Rive animations |
| Charts | Recharts | 3.8.1 | Dashboard visualizations |
| Auth | Supabase SSR | 0.10.0 | Auth state management |
| Theme | next-themes | 0.4.6 | Dark/light mode |
| UI | Radix UI | Various | Accessible primitives |

### Infrastructure

| Service | Provider | Region |
|---------|----------|--------|
| Database | Supabase PostgreSQL | US East (Virginia) |
| Auth | Supabase Auth | US East |
| Backend Hosting | Render.com | Ohio |
| Frontend Hosting | Vercel | Edge (global) |
| AI | Anthropic Claude | US |

---

## 4. Database Schema

### Entity Relationship

```
users ──┬── jobs (employer_id)
        │
        └── candidates (user_id)
                │
                └── applications (candidate_id, job_id)
                        │
                        └── screenings (application_id)
```

### Table: `users`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED |
| full_name | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | CHECK IN ('employer', 'candidate') |
| avatar_url | VARCHAR | NULLABLE |
| company_name | VARCHAR(255) | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Table: `jobs`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| employer_id | UUID | FK → users.id, INDEXED |
| title | VARCHAR(255) | NOT NULL, INDEXED |
| company | VARCHAR(255) | NOT NULL, INDEXED |
| description | TEXT | NOT NULL |
| location | VARCHAR(255) | NULLABLE |
| job_type | VARCHAR(20) | CHECK IN ('full_time', 'contract', 'remote') |
| salary_min | INTEGER | NULLABLE |
| salary_max | INTEGER | NULLABLE |
| seniority | VARCHAR(20) | CHECK IN ('junior', 'mid', 'senior', 'lead') |
| skills | JSONB | DEFAULT '[]' |
| parsed_data | JSONB | NULLABLE (AI-generated) |
| embedding | VECTOR(384) | NULLABLE (semantic) |
| status | VARCHAR(20) | DEFAULT 'active' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Table: `candidates`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, UNIQUE |
| resume_url | VARCHAR | NULLABLE |
| parsed_resume | JSONB | NULLABLE (AI-generated) |
| skills | JSONB | DEFAULT '[]' |
| experience_years | INTEGER | NULLABLE |
| embedding | VECTOR(384) | NULLABLE (semantic) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Table: `applications`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| job_id | UUID | FK → jobs.id, INDEXED |
| candidate_id | UUID | FK → candidates.id |
| match_score | FLOAT | NULLABLE (0-100) |
| skills_overlap | JSONB | NULLABLE |
| status | VARCHAR(20) | DEFAULT 'pending' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Unique constraint:** (job_id, candidate_id)

### Table: `screenings`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| application_id | UUID | FK → applications.id |
| messages | JSONB | DEFAULT '[]' |
| summary | TEXT | NULLABLE |
| outcome | VARCHAR(20) | DEFAULT 'pending' |
| started_at | TIMESTAMPTZ | DEFAULT NOW() |
| completed_at | TIMESTAMPTZ | NULLABLE |

---

## 5. Backend API Layer

### Route Modules

| Module | Prefix | Endpoints | Auth |
|--------|--------|-----------|------|
| auth | /api/auth | 1 | Public |
| jobs | /api/jobs | 5 | Mixed |
| candidates | /api/candidates | 3 | Required |
| applications | /api/applications | 3 | Required |
| screening | /api/screening | 4 | Required |
| dashboard | /api/dashboard | 2 | Employer only |

### Endpoint Specification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | - | Health check |
| POST | /api/auth/verify | - | Verify Supabase JWT |
| GET | /api/jobs | - | List jobs (paginated, filtered) |
| POST | /api/jobs | Employer | Create job + AI parse |
| GET | /api/jobs/{id} | - | Job detail |
| PATCH | /api/jobs/{id} | Owner | Update job |
| DELETE | /api/jobs/{id} | Owner | Soft-delete (close) |
| GET | /api/candidates | Auth | List candidates |
| GET | /api/candidates/{id} | Auth | Candidate profile |
| POST | /api/candidates/{id}/resume | Owner | Upload + AI parse resume |
| POST | /api/applications | Candidate | Apply to job |
| GET | /api/applications/{id}/matches | Auth | Match results |
| PATCH | /api/applications/{id}/status | Employer | Update status |
| POST | /api/screening/{id}/start | Employer | Start AI screening |
| GET | /api/screening/{id}/stream | Auth | SSE streaming chat |
| POST | /api/screening/{id}/message | Auth | Send message |
| POST | /api/screening/{id}/summarize | Employer | Generate summary |
| GET | /api/dashboard/stats | Employer | KPI metrics |
| GET | /api/dashboard/pipeline | Employer | Candidate funnel |

### Pagination Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

## 6. AI Pipeline

### Overview

All AI operations use the Anthropic Claude API. No OpenAI dependency.

```
Job Description ──► JD Parser (Haiku) ──► Structured JSON
                                              │
Resume PDF ────────► Resume Parser (Haiku) ──►│
                                              ▼
                                     Embedding Generator
                                     (384-dim vectors)
                                              │
                                              ▼
                                      Match Scorer
                                   (cosine + skills)
                                              │
                                              ▼
                                    AI Screening Chat
                                   (Sonnet streaming)
                                              │
                                              ▼
                                   Summary Generator
                                      (Sonnet)
```

### Service Details

| Service | Model | Purpose | Output |
|---------|-------|---------|--------|
| JD Parser | claude-haiku-4-5 | Extract skills, seniority, domain | JSON |
| Resume Parser | claude-haiku-4-5 | Extract skills, experience, education | JSON |
| Embeddings | Hash-based (384d) | Semantic vector generation | float[384] |
| Match Scorer | Python (NumPy) | Cosine similarity + skills overlap | 0-100 score |
| Screening Chat | claude-sonnet-4 | Real-time interview | SSE stream |
| Summarizer | claude-sonnet-4 | Plain-English assessment | Text |

### Match Score Formula

```
match_score = (cosine_similarity * 0.4 + skills_overlap_ratio * 0.6) * 100
```

- **Cosine similarity** (40%): Semantic similarity between job and candidate embeddings
- **Skills overlap** (60%): Ratio of matched skills to required skills

---

## 7. Frontend Architecture

### Route Map

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| / | Landing | - | Marketing page |
| /auth/login | Login | - | Email + Google OAuth + demo |
| /auth/signup | Signup | - | Role selection + registration |
| /auth/callback | Callback | - | OAuth redirect handler |
| /dashboard | Dashboard | Employer | Stats + pipeline + table |
| /jobs | Job Board | - | Filter + search + cards |
| /jobs/[id] | Job Detail | - | Full job view |
| /dashboard/post | Post Job | Employer | 4-step form |
| /screening | AI Screening | Employer | 70/30 chat + profile |
| /candidates | Candidates | Auth | Grid + filters |
| /candidates/[id] | Profile | Auth | Tabs + timeline |

### Component Architecture

```
app/
├── layout.tsx              (ThemeProvider + AuthProvider + Toaster)
├── page.tsx                (Landing page)
├── auth/
│   ├── login/page.tsx      (Rive animation + demo cards)
│   ├── signup/page.tsx     (Role selection + form)
│   └── callback/route.ts   (OAuth handler)
└── (dashboard)/
    ├── layout.tsx          (Sidebar + Header + MobileDock)
    ├── dashboard/page.tsx  (Stats, chart, table)
    ├── jobs/page.tsx       (Filters + cards)
    ├── screening/page.tsx  (Chat + candidate panel)
    └── candidates/page.tsx (Grid + tabs)
```

### Key UI Components

| Component | Purpose | Animation |
|-----------|---------|-----------|
| LordIcon | Animated icons (25 total) | Lottie hover/click/loop |
| MatchScoreRing | SVG donut 0-100 | CSS transition 1s |
| Dock | Mobile navigation (macOS-style) | Framer Motion spring |
| ThemeToggle | Sun/moon dark mode switch | CSS cubic-bezier 0.5s |
| AnimationPanel | Rive login illustration | Rive state machine |
| StatCard | KPI with delta trend | None (data-focused) |
| JobCard | Rich job listing | Transform translateY |

---

## 8. Authentication & Authorization

### Auth Flow

```
1. User signs in via Supabase Auth (email/password or Google OAuth)
2. Supabase returns JWT access token
3. Frontend stores token in Supabase session
4. API requests include: Authorization: Bearer <token>
5. Backend verifies token via Supabase Auth API
6. User record auto-created in DB if first login
7. Role extracted from user_metadata.role
```

### Role-Based Access Control

| Resource | Employer | Candidate | Public |
|----------|----------|-----------|--------|
| View jobs | Yes | Yes | Yes |
| Post jobs | Yes | - | - |
| View candidates | Yes | - | - |
| Apply to jobs | - | Yes | - |
| Start screening | Yes | - | - |
| View dashboard | Yes | - | - |

### Demo Authentication

- **DEMO_AUTH=true**: Enables auth bypass for demo mode
- Demo user auto-created: `00000000-0000-4000-8000-000000000001`
- Fallback when no token provided: Returns demo employer user

---

## 9. Infrastructure & Deployment

### Vercel (Frontend)

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | npm run build |
| Output Directory | .next |
| Node Version | 18.x |
| Region | Edge (global) |

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### Render (Backend)

| Setting | Value |
|---------|-------|
| Runtime | Docker |
| Dockerfile | backend/Dockerfile |
| Root Directory | backend |
| Region | Ohio |
| Plan | Free |
| Health Check | /health |

**Environment Variables:**
- `DATABASE_URL` (Supabase Postgres pooler)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `CORS_ORIGINS`
- `DEMO_AUTH`

### Supabase

| Feature | Status |
|---------|--------|
| Auth (email) | Enabled |
| Auth (Google OAuth) | Configurable |
| PostgreSQL | Active (US East) |
| pgvector extension | Installed |
| Connection Pooler | Enabled (port 5432) |

---

## 10. Seed Data & Demo Credentials

### Demo Users

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| demo@veduwa.com | demo123 | Employer | Full demo access |

### Seeded Data

| Entity | Count | Details |
|--------|-------|---------|
| Users | 10 | 2 employers, 8 candidates |
| Jobs | 6 | Full-Stack, ML, Frontend, DevOps, Backend, AI Intern |
| Candidates | 8 | With parsed resumes, skills, embeddings |
| Applications | 15 | Various statuses and match scores |
| Screenings | 1 | Completed with messages and summary |

### Sample Job Data

| Title | Company | Salary | Skills |
|-------|---------|--------|--------|
| Senior Full-Stack Engineer | TechFlow AI | $150-200K | React, Node.js, TypeScript, PostgreSQL, AWS |
| ML Engineer — NLP Focus | DataMind Labs | $140-180K | Python, PyTorch, Transformers, FastAPI, Docker |
| Frontend Developer — React | Nexus Design | $120-160K | React, TypeScript, Tailwind, Figma, Next.js |
| DevOps Engineer | CloudScale Inc | $130-170K | Kubernetes, Terraform, AWS, CI/CD, Python |
| Backend Engineer — Python | FinAI Solutions | $100-140K | Python, FastAPI, PostgreSQL, Redis, Celery |
| AI Research Intern | DeepLogic AI | $60-80K | Python, TensorFlow, Research, NLP, Statistics |

---

## 11. Design System

### Theme: Clarity

Inspired by Linear.app — clean, minimal, Swiss typography, maximum data-ink ratio.

### Color Palette

**Light Mode:**

| Token | Value | Usage |
|-------|-------|-------|
| --background | #FAFAF8 | Page background |
| --foreground | #1C1C1A | Primary text |
| --primary | #3B5BDB | Buttons, links, accents |
| --surface | #FFFFFF | Card backgrounds |
| --border | #E6E4DF | Borders, dividers |
| --muted-foreground | #9C9C96 | Secondary text |
| --success | #40C057 | Positive indicators |
| --warning | #FAB005 | Caution indicators |
| --error | #FA5252 | Error states |

**Dark Mode:**

| Token | Value | Usage |
|-------|-------|-------|
| --background | #0C0C0E | Page background |
| --foreground | #EDEDEB | Primary text |
| --primary | #4C6EF5 | Buttons, links, accents |
| --surface | #161618 | Card backgrounds |
| --border | #2A2A2E | Borders, dividers |

### Typography

| Font | Weight | Usage |
|------|--------|-------|
| Satoshi | 600-700 | Headings (font-heading) |
| Inter | 400-500 | Body text (font-sans) |
| JetBrains Mono | 400 | Data, code, labels (font-mono) |

### Animated Icons

25 LordIcon Lottie animations with hover/click/loop triggers for micro-interactions across all pages.

### Responsive Design

- **Desktop** (768px+): Sidebar navigation, full layout
- **Mobile** (<768px): macOS-style Dock navigation (Framer Motion spring physics), no sidebar, compact header

---

## 12. Performance & Security

### Security Measures

- JWT-based authentication via Supabase
- Role-based access control on all protected endpoints
- CORS whitelist configuration
- No secrets in client-side code
- Environment variables for all credentials
- SQL injection prevention via SQLAlchemy ORM
- Input validation via Pydantic v2

### Performance Features

- Async database operations (asyncpg)
- Connection pooling via Supabase pooler
- Static page generation where possible (Next.js)
- Lazy-loaded API data with mock fallback
- Framer Motion for GPU-accelerated animations
- Image optimization via next/image
- Code splitting per route

---

*Document generated for the Veduwa AI Job Marketplace demo. For questions, contact Mukela Katungu.*
