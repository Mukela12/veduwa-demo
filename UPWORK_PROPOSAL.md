# Upwork Proposal — Veduwa AI Job Marketplace

---

Hi,

I read your system design document requirements carefully and I've already built a working demo of Veduwa to show you exactly what I can deliver. Rather than describe what I could do, I'm showing you what I've done.

**Live demo:** https://frontend-vert-tau-84.vercel.app
**Live API:** https://veduwa-api.onrender.com/health
**GitHub repo:** https://github.com/Mukela12/veduwa-demo

Login with `demo@veduwa.com / demo123` to see the employer dashboard, job board, AI screening chat, and candidate profiles — all functional with real Supabase auth and seeded data.

---

## Answering Your 4 Required Questions

### 1. GitHub Profile
https://github.com/Mukela12

### 2. Project Using OpenAI or Anthropic API
The Veduwa demo itself uses the Anthropic Claude API for:
- **JD parsing** (claude-haiku structured output to extract skills, seniority, domain)
- **Resume parsing** (claude-haiku structured extraction from uploaded PDFs)
- **AI screening chat** (claude-sonnet with SSE streaming responses)
- **Screening summarizer** (claude-sonnet generating plain-English employer summaries)

Live endpoint: `POST https://veduwa-api.onrender.com/api/auth/verify`

Additionally, I built **Levy** — an AI-powered legal research platform for Zambian law that uses Claude for RAG-based chat with citation panels, streaming responses, and IRAC legal brief generation. It also uses embeddings for document similarity search.

### 3. Celery + Redis Experience
Yes. In this Veduwa demo, the backend includes Celery worker definitions for:
- `parse_job_description` — async JD parsing triggered on job creation
- `parse_resume` — async resume parsing triggered on upload
- `compute_embeddings` — background embedding generation after parsing
- `compute_match_scores` — batch match scoring after embeddings are ready

The Celery app is configured with Redis as broker (`celery[redis]==5.4.0`) in `backend/app/workers/celery_app.py`. The main API path works synchronously for the demo, with Celery tasks ready to offload heavy AI processing in production.

I've also used Celery + Redis in a previous project (Blue Roller Demo) for background email scheduling and Outlook calendar sync via Microsoft Graph API.

### 4. Honest Time Estimate
**4-5 weeks for full production build**, not 8. Here's why:

I've already built the foundation in this demo:
- FastAPI backend with all 5 tables, Alembic migrations, 15+ endpoints
- Next.js 14 frontend with all 6 screens, dark mode, mobile responsive
- Supabase Auth working (email + Google OAuth ready)
- Claude AI integration for parsing, screening, and summarization
- Deployed to Vercel + Render with CI/CD

What remains for production:
- Week 1-2: Polish AI pipeline (OpenAI embeddings, pgvector cosine search, Celery workers live)
- Week 2-3: Cloudflare R2 file uploads, resume PDF parsing, email notifications via Resend
- Week 3-4: Production hardening, error handling, rate limiting, monitoring
- Week 4-5: Railway deployment, staging URL, final QA, documentation

I can maintain daily GitHub commits and a live staging URL from day 1 — the staging URL already exists.

---

## What I Bring

**Exact tech stack match:** FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, Next.js 14, TypeScript, Tailwind, PostgreSQL, Supabase Auth, Claude API, Celery + Redis. Every technology you listed, I've already used in this demo.

**Design quality:** The frontend isn't generic shadcn. It has a custom Clarity theme (warm neutrals, navy accents), animated LordIcons, Rive login animations, match score donut rings, glassmorphic nav, macOS-style mobile dock, and full dark mode. The UI is designed to impress, not just function.

**AI pipeline depth:** The entire AI architecture is implemented — JD parsing to structured JSON, semantic embeddings, cosine similarity + skills overlap matching (40/60 weighted), Claude streaming screening chat, and plain-English summary generation.

**Deployment experience:** I deploy to Vercel, Railway, and Render regularly. Supabase is my primary database/auth provider across 5+ production projects. I maintain live staging URLs throughout development.

---

## Proposed Milestones

| Milestone | Deliverable | Timeline | Amount |
|-----------|-------------|----------|--------|
| M1 | Backend API complete (all endpoints, migrations, auth) | Week 1 | $1,250 |
| M2 | Frontend 6 screens + Supabase Auth integration | Week 2 | $1,250 |
| M3 | AI pipeline (parsing, embeddings, matching, screening) | Week 3 | $1,250 |
| M4 | Celery workers, R2 uploads, deployment, QA | Week 4 | $750 |
| **Total** | | **4 weeks** | **$4,500** |

---

I'm available to start immediately. The demo speaks for itself — happy to walk you through it on a call.

Best,
Mukela Katungu
