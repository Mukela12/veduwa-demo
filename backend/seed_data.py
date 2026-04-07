from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy import select, text

from app.database import Base, SessionLocal, engine
from app.models.application import Application
from app.models.candidate import Candidate
from app.models.job import Job
from app.models.screening import Screening
from app.models.user import User
from app.services.embeddings import candidate_embedding_text, generate_embedding, job_embedding_text
from app.services.matcher import compute_match_score, compute_skills_overlap


DEMO_EMPLOYER_ID = uuid.UUID("00000000-0000-4000-8000-000000000001")
DEMO_EMPLOYER_2_ID = uuid.UUID("00000000-0000-4000-8000-000000000002")


JOBS = [
    {
        "title": "Senior Full-Stack Engineer",
        "company": "TechFlow AI",
        "location": "San Francisco, CA",
        "job_type": "full_time",
        "salary_min": 150000,
        "salary_max": 200000,
        "seniority": "senior",
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
        "description": "Build and scale our AI-powered analytics platform. Work with cutting-edge LLM integrations.",
    },
    {
        "title": "ML Engineer - NLP Focus",
        "company": "DataMind Labs",
        "location": "Remote",
        "job_type": "remote",
        "salary_min": 140000,
        "salary_max": 180000,
        "seniority": "senior",
        "skills": ["Python", "PyTorch", "Transformers", "FastAPI", "Docker"],
        "description": "Design and deploy production NLP models for enterprise document processing.",
    },
    {
        "title": "Frontend Developer - React",
        "company": "Nexus Design",
        "location": "New York, NY",
        "job_type": "full_time",
        "salary_min": 120000,
        "salary_max": 160000,
        "seniority": "mid",
        "skills": ["React", "TypeScript", "Tailwind CSS", "Figma", "Next.js"],
        "description": "Create beautiful, performant interfaces for our SaaS platform.",
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudScale Inc",
        "location": "Austin, TX",
        "job_type": "full_time",
        "salary_min": 130000,
        "salary_max": 170000,
        "seniority": "senior",
        "skills": ["Kubernetes", "Terraform", "AWS", "CI/CD", "Python"],
        "description": "Manage and optimize our cloud infrastructure across multiple regions.",
    },
    {
        "title": "Backend Engineer - Python",
        "company": "FinAI Solutions",
        "location": "Chicago, IL",
        "job_type": "contract",
        "salary_min": 100000,
        "salary_max": 140000,
        "seniority": "mid",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery"],
        "description": "Build high-performance APIs for our financial analytics platform.",
    },
    {
        "title": "AI Research Intern",
        "company": "DeepLogic AI",
        "location": "Remote",
        "job_type": "remote",
        "salary_min": 60000,
        "salary_max": 80000,
        "seniority": "junior",
        "skills": ["Python", "TensorFlow", "Research", "NLP", "Statistics"],
        "description": "Join our research team exploring novel approaches to language understanding.",
    },
]


CANDIDATES = [
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000101"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000201"),
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "title": "Senior Full-Stack Developer",
        "location": "San Francisco, CA",
        "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Python"],
        "experience_years": 7,
        "summary": "Experienced full-stack engineer with strong background in React and Node.js.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000102"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000202"),
        "name": "Marcus Johnson",
        "email": "marcus.j@example.com",
        "title": "ML Engineer",
        "location": "New York, NY",
        "skills": ["Python", "PyTorch", "Transformers", "FastAPI", "Docker", "Kubernetes"],
        "experience_years": 5,
        "summary": "ML engineer specializing in NLP and production model deployment.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000103"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000203"),
        "name": "Elena Rodriguez",
        "email": "elena.r@example.com",
        "title": "Frontend Engineer",
        "location": "Remote",
        "skills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Figma", "Framer Motion"],
        "experience_years": 4,
        "summary": "Creative frontend developer with an eye for design and animation.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000104"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000204"),
        "name": "David Kim",
        "email": "david.kim@example.com",
        "title": "DevOps Engineer",
        "location": "Seattle, WA",
        "skills": ["Kubernetes", "Terraform", "AWS", "GCP", "Python", "Go"],
        "experience_years": 6,
        "summary": "Infrastructure specialist managing large-scale Kubernetes clusters.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000105"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000205"),
        "name": "Aisha Patel",
        "email": "aisha.p@example.com",
        "title": "Backend Engineer",
        "location": "Austin, TX",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker"],
        "experience_years": 5,
        "summary": "Backend engineer focused on high-performance APIs and distributed systems.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000106"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000206"),
        "name": "James Wright",
        "email": "james.w@example.com",
        "title": "Full-Stack Developer",
        "location": "Chicago, IL",
        "skills": ["React", "Python", "Django", "PostgreSQL", "Redis", "TypeScript"],
        "experience_years": 3,
        "summary": "Versatile developer comfortable across the stack.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000107"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000207"),
        "name": "Lisa Nakamura",
        "email": "lisa.n@example.com",
        "title": "AI/ML Engineer",
        "location": "Remote",
        "skills": ["Python", "TensorFlow", "NLP", "FastAPI", "SQL", "Statistics"],
        "experience_years": 2,
        "summary": "Recent MS graduate in Computer Science with focus on NLP.",
    },
    {
        "id": uuid.UUID("00000000-0000-4000-8000-000000000108"),
        "user_id": uuid.UUID("00000000-0000-4000-8000-000000000208"),
        "name": "Omar Hassan",
        "email": "omar.h@example.com",
        "title": "Senior Backend Engineer",
        "location": "Remote",
        "skills": ["Go", "Python", "PostgreSQL", "gRPC", "Kubernetes", "Redis"],
        "experience_years": 8,
        "summary": "Seasoned backend engineer with expertise in distributed systems.",
    },
]


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        existing = await session.scalar(select(User).where(User.email == "demo@veduwa.com"))
        if existing:
            print("Seed data already exists.")
            return

        employers = [
            User(id=DEMO_EMPLOYER_ID, email="demo@veduwa.com", full_name="Demo Employer", role="employer", company_name="Veduwa Demo"),
            User(id=DEMO_EMPLOYER_2_ID, email="talent@veduwa.com", full_name="Talent Ops", role="employer", company_name="Veduwa Demo"),
        ]
        candidate_users = [
            User(id=item["user_id"], email=item["email"], full_name=item["name"], role="candidate")
            for item in CANDIDATES
        ]
        session.add_all(employers + candidate_users)
        await session.flush()

        jobs: list[Job] = []
        for index, item in enumerate(JOBS):
            parsed_data = {
                "skills": item["skills"],
                "seniority": item["seniority"],
                "domain": "Software Engineering",
                "requirements": [item["description"]],
                "source": "seed",
            }
            job = Job(
                employer_id=DEMO_EMPLOYER_ID if index < 5 else DEMO_EMPLOYER_2_ID,
                parsed_data=parsed_data,
                embedding=generate_embedding(job_embedding_text(item["title"], item["description"], item["skills"])),
                status="active",
                **item,
            )
            jobs.append(job)
        session.add_all(jobs)

        candidates: list[Candidate] = []
        for item in CANDIDATES:
            parsed_resume = {
                "name": item["name"],
                "title": item["title"],
                "location": item["location"],
                "summary": item["summary"],
                "skills": item["skills"],
                "experience_years": item["experience_years"],
                "source": "seed",
            }
            candidate = Candidate(
                id=item["id"],
                user_id=item["user_id"],
                parsed_resume=parsed_resume,
                skills=item["skills"],
                experience_years=item["experience_years"],
                embedding=generate_embedding(candidate_embedding_text(parsed_resume, item["skills"])),
            )
            candidates.append(candidate)
        session.add_all(candidates)
        await session.flush()

        applications: list[Application] = []
        statuses = ["screening", "interviewed", "pending", "pending", "accepted", "rejected"]
        for job in jobs:
            for candidate in candidates:
                if len(applications) >= 20:
                    break
                score = compute_match_score(job.embedding, candidate.embedding, job.skills, candidate.skills)
                if score < 60 and len(applications) > 12:
                    continue
                application = Application(
                    job_id=job.id,
                    candidate_id=candidate.id,
                    match_score=score,
                    skills_overlap=compute_skills_overlap(job.skills, candidate.skills),
                    status=statuses[len(applications) % len(statuses)],
                )
                applications.append(application)
            if len(applications) >= 20:
                break
        session.add_all(applications)
        await session.flush()

        first_application = applications[0]
        session.add(
            Screening(
                application_id=first_application.id,
                messages=[
                    {
                        "role": "system",
                        "content": "AI screening session started for Sarah Chen - Senior Full-Stack Engineer at TechFlow AI",
                        "timestamp": "2026-04-07T10:30:00+00:00",
                    },
                    {
                        "role": "ai",
                        "content": "Can you tell me about a complex full-stack project you led from architecture to deployment?",
                        "timestamp": "2026-04-07T10:30:05+00:00",
                    },
                    {
                        "role": "candidate",
                        "content": "I led a rebuild of an analytics dashboard using React, TypeScript, Node.js, PostgreSQL, WebSockets, and AWS ECS.",
                        "timestamp": "2026-04-07T10:31:20+00:00",
                    },
                ],
                summary="Strong technical match. Proceed to final interview.",
                outcome="pass",
                completed_at=datetime.now(timezone.utc),
            )
        )

        await session.commit()
        print(f"Seeded {len(jobs)} jobs, {len(candidates)} candidates, and {len(applications)} applications.")


if __name__ == "__main__":
    asyncio.run(seed())
