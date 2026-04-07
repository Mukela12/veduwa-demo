# Veduwa Backend

FastAPI backend for the Veduwa AI job marketplace demo.

## Local Setup

```bash
cd /Users/mukelakatungu/veduwa-demo/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `DATABASE_URL`, `SUPABASE_JWT_SECRET`, `REDIS_URL`, and `ANTHROPIC_API_KEY` in `.env`.

For local demo work without Supabase JWTs, set `DEMO_AUTH=true`. Do not use that in production.

The backend can verify Supabase access tokens without `SUPABASE_JWT_SECRET` when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set. Cloudinary uploads use `CLOUDINARY_URL` or the `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` trio, with local file storage as a fallback. Resend emails use `RESEND_API_KEY` and `EMAIL_FROM`, with safe no-op logging when Resend is not configured.

Demo auth account:

```text
demo@veduwa.com / demo123
```

## Database

```bash
alembic upgrade head
python seed_data.py
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
celery -A app.workers.celery_app worker --loglevel=info
```

Health check:

```bash
curl http://localhost:8000/health
```
