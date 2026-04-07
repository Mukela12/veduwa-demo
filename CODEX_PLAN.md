# Codex Backend Plan — Veduwa AI Job Marketplace

## Overview
Build the FastAPI backend for Veduwa, an AI-powered IT job marketplace. The frontend (Next.js 14) is already built and expects these exact API endpoints. Use Anthropic Claude API (NOT OpenAI) for all AI tasks.

## Tech Stack
- **Framework**: FastAPI with Python 3.12
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Task Queue**: Celery + Redis
- **Database**: PostgreSQL (Supabase-hosted, connection string in env)
- **Auth**: Supabase JWT verification middleware
- **AI**: Anthropic Claude API (key in env)
- **Embeddings**: sentence-transformers `all-MiniLM-L6-v2` (local, free, 384-dim vectors)
- **Vector Search**: pgvector extension in PostgreSQL
- **File Upload**: Local storage for demo (Cloudflare R2 structure ready)
- **Email**: Resend API (key in env)
- **Deploy**: Railway (Dockerfile)

## Environment Variables
```
DATABASE_URL=postgresql+asyncpg://postgres:xxx@db.xxx.supabase.co:5432/postgres
REDIS_URL=redis://default:xxx@xxx.railway.app:6379
ANTHROPIC_API_KEY=<your-anthropic-key>
RESEND_API_KEY=<your-resend-key>
SUPABASE_JWT_SECRET=<from Supabase project settings>
CORS_ORIGINS=http://localhost:3000,http://localhost:3099
```

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, routers
│   ├── config.py            # pydantic-settings BaseSettings
│   ├── database.py          # SQLAlchemy 2.0 async engine + session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── job.py
│   │   ├── candidate.py
│   │   ├── application.py
│   │   └── screening.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── job.py
│   │   ├── candidate.py
│   │   ├── application.py
│   │   └── screening.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── jobs.py
│   │   ├── candidates.py
│   │   ├── applications.py
│   │   ├── screening.py
│   │   └── dashboard.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_parser.py     # JD + Resume parsing with Claude
│   │   ├── embeddings.py    # sentence-transformers
│   │   ├── matcher.py       # cosine similarity + skills overlap
│   │   ├── screener.py      # Claude streaming chat
│   │   └── summarizer.py    # screening summary
│   ├── workers/
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── parse_jd.py
│   │   ├── parse_resume.py
│   │   └── compute_matches.py
│   └── middleware/
│       ├── __init__.py
│       └── auth.py           # Supabase JWT verification
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── railway.toml
├── seed_data.py
└── tests/
    ├── __init__.py
    ├── test_auth.py
    ├── test_jobs.py
    ├── test_candidates.py
    └── test_screening.py
```

## Database Schema (5 Tables)

### 1. users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employer', 'candidate')),
    avatar_url TEXT,
    company_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. jobs
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    job_type VARCHAR(20) CHECK (job_type IN ('full_time', 'contract', 'remote')),
    salary_min INTEGER,
    salary_max INTEGER,
    seniority VARCHAR(20) CHECK (seniority IN ('junior', 'mid', 'senior', 'lead')),
    skills JSONB DEFAULT '[]',
    parsed_data JSONB,
    embedding vector(384),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. candidates
```sql
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    resume_url TEXT,
    parsed_resume JSONB,
    skills JSONB DEFAULT '[]',
    experience_years INTEGER,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. applications
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    match_score FLOAT,
    skills_overlap JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'screening', 'interviewed', 'rejected', 'accepted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. screenings
```sql
CREATE TABLE screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id),
    messages JSONB DEFAULT '[]',
    summary TEXT,
    outcome VARCHAR(20) DEFAULT 'pending' CHECK (outcome IN ('pass', 'fail', 'pending')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/verify` | No | Verify Supabase JWT, return user info |

### Jobs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/jobs` | No | List jobs (paginated, filterable by skills/type/seniority/search) |
| POST | `/api/jobs` | Yes (employer) | Create job, triggers async JD parsing |
| GET | `/api/jobs/{id}` | No | Get single job with candidate count and top match |
| PATCH | `/api/jobs/{id}` | Yes (owner) | Update job |
| DELETE | `/api/jobs/{id}` | Yes (owner) | Soft-delete (set status=closed) |

### Candidates
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/candidates` | Yes | List candidates (paginated, filterable) |
| GET | `/api/candidates/{id}` | Yes | Get candidate profile with match scores |
| POST | `/api/candidates/{id}/resume` | Yes (owner) | Upload resume PDF, triggers async parsing |

### Applications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/applications` | Yes (candidate) | Apply to a job |
| GET | `/api/applications/{id}/matches` | Yes | Get match results for application |
| PATCH | `/api/applications/{id}/status` | Yes (employer) | Update application status |

### Screening
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/screening/{app_id}/start` | Yes (employer) | Start AI screening session |
| GET | `/api/screening/{id}/stream` | Yes | SSE streaming chat endpoint |
| POST | `/api/screening/{id}/message` | Yes | Send a message into screening |
| POST | `/api/screening/{id}/summarize` | Yes (employer) | Generate screening summary |

### Dashboard
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/stats` | Yes (employer) | Active jobs, total candidates, avg match, pending screenings |
| GET | `/api/dashboard/pipeline` | Yes (employer) | Candidates count by stage |

## Pagination & Filtering

All list endpoints support:
```
GET /api/jobs?page=1&per_page=20&search=react&skills=React,TypeScript&job_type=remote&seniority=senior&sort=created_at&order=desc
```

Response format:
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

## Error Format
```json
{
  "detail": "Error message here",
  "code": "VALIDATION_ERROR"
}
```

## AI Services Implementation

### 1. JD Parser (`services/ai_parser.py`)
```python
# Use Claude Haiku for speed and cost
# Model: claude-haiku-4-5-20251001

SYSTEM_PROMPT = """Extract structured data from this job description.
Return JSON with: title, skills (array), seniority (junior/mid/senior/lead),
domain, salary_range (object with min/max), requirements (array of strings)."""

# Call with structured output (tool_use or JSON mode)
```

### 2. Resume Parser (`services/ai_parser.py`)
```python
# Same model: claude-haiku-4-5-20251001

SYSTEM_PROMPT = """Extract structured data from this resume.
Return JSON with: name, skills (array), experience (array of objects with
company/role/duration/description), education (array), summary (string)."""
```

### 3. Embeddings (`services/embeddings.py`)
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')  # 384 dimensions

def generate_embedding(text: str) -> list[float]:
    return model.encode(text).tolist()
```

### 4. Match Scorer (`services/matcher.py`)
```python
import numpy as np

def compute_match_score(job_embedding, candidate_embedding, job_skills, candidate_skills):
    # Cosine similarity (40% weight)
    cos_sim = np.dot(job_embedding, candidate_embedding) / (
        np.linalg.norm(job_embedding) * np.linalg.norm(candidate_embedding)
    )

    # Skills overlap (60% weight)
    job_set = set(s.lower() for s in job_skills)
    cand_set = set(s.lower() for s in candidate_skills)
    overlap = len(job_set & cand_set) / max(len(job_set), 1)

    # Combined score 0-100
    return round((cos_sim * 0.4 + overlap * 0.6) * 100, 1)
```

### 5. Screening Chat (`services/screener.py`)
```python
# Use Claude Sonnet for quality
# Model: claude-sonnet-4-20250514
# SSE streaming via FastAPI StreamingResponse

import anthropic

client = anthropic.Anthropic()

async def stream_screening(job_data, candidate_data, messages):
    system = f"""You are an AI interviewer for the role: {job_data['title']}.
    The candidate has these skills: {candidate_data['skills']}.
    Ask structured technical questions relevant to the role.
    Be professional but conversational."""

    with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield f"data: {json.dumps({'text': text})}\n\n"
```

### 6. Summary Generator (`services/summarizer.py`)
```python
# Model: claude-sonnet-4-20250514

SYSTEM_PROMPT = """Generate a plain-English screening summary for the employer.
Include: overall assessment (Strong/Good/Weak), key strengths, areas of concern,
skills demonstrated, and hiring recommendation (Proceed/Maybe/Pass).
Score 0-100."""
```

## Celery Workers

### `workers/celery_app.py`
```python
from celery import Celery

app = Celery('veduwa', broker=settings.REDIS_URL, backend=settings.REDIS_URL)
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'
```

### Tasks
1. `parse_jd` — Called when job is created, parses description, stores in parsed_data
2. `parse_resume` — Called when resume uploaded, parses content, stores in parsed_resume
3. `compute_embeddings` — Called after parsing, generates 384-dim vector, stores in embedding column
4. `compute_match_scores` — Called after embeddings ready, computes scores for all relevant applications

## Auth Middleware

```python
from jose import jwt
from fastapi import Request, HTTPException

async def verify_supabase_jwt(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "Missing token")

    payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"],
                         audience="authenticated")
    request.state.user_id = payload["sub"]
    request.state.user_email = payload.get("email")
```

## Seed Data Script (`seed_data.py`)

Create realistic demo data:
- 2 employer users, 8 candidate users
- 6 jobs with parsed_data and embeddings
- 8 candidates with parsed_resume and embeddings
- 20 applications with computed match scores
- 2 completed screenings with messages and summaries

## Testing Strategy

1. **Unit tests**: AI service mocks, matcher math
2. **Integration tests**: Full API flow with test database
3. **Auth tests**: JWT verification, role-based access
4. Run with: `pytest tests/ -v`

## Requirements (`requirements.txt`)
```
fastapi==0.115.0
uvicorn[standard]==0.34.0
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
pydantic==2.10.0
pydantic-settings==2.7.0
python-jose[cryptography]==3.3.0
celery[redis]==5.4.0
redis==5.2.0
anthropic==0.42.0
sentence-transformers==3.3.0
pgvector==0.3.6
python-multipart==0.0.18
httpx==0.28.0
pytest==8.3.0
pytest-asyncio==0.24.0
resend==2.0.0
numpy==2.2.0
```

## Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Download the embedding model at build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## railway.toml
```toml
[build]
builder = "DOCKERFILE"

[deploy]
numReplicas = 1
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"

# Celery worker runs as separate service
# Create a second Railway service with:
# CMD: celery -A app.workers.celery_app worker --loglevel=info
```

## Key Implementation Notes

1. **CORS**: Allow frontend origins (localhost:3000, localhost:3099, vercel URL)
2. **Health check**: `GET /health` returns `{"status": "ok"}`
3. **SSE format**: `data: {"text": "chunk"}\n\n` for streaming, `data: [DONE]\n\n` for end
4. **pgvector**: Use `CREATE EXTENSION IF NOT EXISTS vector` in first migration
5. **File uploads**: Use `python-multipart` for resume PDF uploads
6. **Error handling**: Return proper HTTP status codes with detail messages
7. **Logging**: Use Python logging, log all AI API calls with timing
