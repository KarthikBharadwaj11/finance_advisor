# FinanceAdv AI

An AI-powered personal financial advisor that uses agentic reasoning, RAG pipelines, and LLMs to deliver structured, grounded financial analysis.

Built as a portfolio project demonstrating **Agentic AI**, **RAG with FAISS**, and a full-stack React + FastAPI architecture.

---

## Tech Stack

**Backend:** FastAPI · GPT-4o · FAISS RAG · SQLAlchemy 2 · Neon PostgreSQL · Alembic

**Frontend:** React 18 · TypeScript · Vite · Framer Motion · Recharts · Zustand

---

## Features

- **Financial Analysis** — enter your income, expenses, savings, and debt. An AI agent runs 5 specialized tools in sequence and returns a health score, risk profile, portfolio allocation, budget plan, and 90-day action plan.
- **AI Advisor** — a RAG-powered chat interface that retrieves from a financial knowledge base before answering your questions.
- **Dashboard** — view your latest analysis results at a glance.

---

## Local Setup

### Backend

```bash
pip install -e ".[dev]"
cp .env.example .env   # fill in your OpenAI key and Neon DB URL
alembic upgrade head
python scripts/build_vector_store.py
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

> For educational and portfolio demonstration purposes only. Not financial advice.
