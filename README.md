# FinanceAdv AI

An AI-powered personal financial advisor that uses agentic reasoning, RAG pipelines, and LLMs to deliver structured, grounded financial analysis — not generic chatbot responses.

Built as a portfolio project demonstrating **Agentic AI**, **RAG with FAISS**, **OpenAI tool-calling**, and a full-stack React + FastAPI architecture.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat) ![Stack](https://img.shields.io/badge/AI-GPT--4o-412991?style=flat) ![Stack](https://img.shields.io/badge/RAG-FAISS-00A67E?style=flat) ![Stack](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat) ![Stack](https://img.shields.io/badge/Database-Neon%20PostgreSQL-4169E1?style=flat)

---

## What It Does

Users enter their financial details — income, expenses, savings, debt, and goals. An AI agent then runs 5 specialized tools in sequence and returns a full financial report:

1. **Financial Health Analysis** — computes savings rate, debt-to-income ratio, emergency fund coverage, and a health score out of 100
2. **RAG Knowledge Retrieval** — queries a FAISS vector store to retrieve grounded financial knowledge relevant to the user's situation
3. **Risk Profile Assessment** — scores risk tolerance based on age, investment horizon, financial cushion, and goals
4. **Portfolio Allocation** — maps the risk profile to an asset class allocation (US stocks, international, bonds, etc.)
5. **Budget Plan Generation** — applies an adapted 50/30/20 framework and produces a monthly surplus estimate and 90-day action plan

Users can also chat with an **AI Advisor** — a RAG-powered Q&A interface that retrieves from the knowledge base before answering.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API | FastAPI (async) |
| Agent | Raw OpenAI tool-calling loop (no LangChain) |
| RAG | FAISS + OpenAI `text-embedding-3-small` |
| LLM | GPT-4o |
| Database | Neon (serverless PostgreSQL) |
| ORM | SQLAlchemy 2 async + Alembic migrations |
| Auth | Passlib + bcrypt |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + inline styles |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand (with persistence) |
| Routing | React Router v7 |

---

## Project Structure

```
FinanceAdv/
├── app/
│   ├── agent/
│   │   ├── executor.py          # Raw OpenAI tool-calling loop
│   │   ├── memory.py            # Conversation memory (plain message dicts)
│   │   ├── prompts.py           # System prompt
│   │   └── tools/               # 5 agent tools
│   │       ├── financial_health.py
│   │       ├── knowledge_retrieval.py
│   │       ├── risk_assessment.py
│   │       ├── portfolio_calc.py
│   │       └── budget_planner.py
│   ├── rag/
│   │   ├── vector_store.py      # FAISS + OpenAI embeddings
│   │   └── knowledge_corpus/    # Financial knowledge text files
│   ├── api/v1/                  # FastAPI route handlers
│   ├── db/                      # SQLAlchemy models + session
│   ├── services/                # Business logic layer
│   └── schemas/                 # Pydantic request/response models
├── frontend/
│   └── src/
│       ├── pages/               # Landing, Setup, Dashboard, Analysis, Advisor
│       ├── components/          # Layout, UI primitives
│       ├── store/               # Zustand global state
│       ├── api/                 # API client
│       └── types/               # TypeScript interfaces
├── alembic/                     # Database migrations
└── scripts/                     # DB init + vector store builder
```

---

## How the Agent Works

The agent uses a **raw OpenAI tool-calling loop** — no LangChain or agent frameworks:

```python
while iteration < MAX_ITERATIONS:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=ALL_SCHEMAS,       # JSON schemas for all 5 tools
        tool_choice="auto"
    )
    if not response.tool_calls:
        return response.content  # Final answer
    
    # Execute each tool and append results
    for tool_call in response.tool_calls:
        result = TOOL_REGISTRY[tool_call.function.name](**args)
        messages.append({"role": "tool", "content": result})
```

The model decides which tools to call, in what order, and when it has enough information to return a final answer.

---

## How RAG Works

Knowledge is chunked, embedded with `text-embedding-3-small`, and stored in a FAISS index. At query time:

```python
query_vector = embed([query])           # Embed the question
faiss.normalize_L2(query_vector)        # Normalize for cosine similarity
distances, indices = index.search(...)  # Find top-k closest chunks
return [corpus[i] for i in indices]     # Return matching passages
```

The retrieved passages are injected into the agent's context before it generates a response.

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- An OpenAI API key

### Backend

```bash
# Install dependencies
pip install -e ".[dev]"

# Set up environment
cp .env.example .env
# Fill in OPENAI_API_KEY and DATABASE_URL in .env

# Run migrations
alembic upgrade head

# Build FAISS index
python scripts/build_vector_store.py

# Start server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies `/api` requests to the backend at `localhost:8000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Model name (default: `gpt-4o`) |
| `DATABASE_URL` | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `SECRET_KEY` | App secret for security middleware |
| `MAX_AGENT_ITERATIONS` | Max agent loop iterations (default: `10`) |

---

## Key Design Decisions

- **No LangChain** — the agent loop, RAG pipeline, tool registry, and memory are all implemented from scratch using the raw OpenAI SDK. This makes the reasoning process fully transparent and debuggable.
- **FAISS over managed vector DBs** — keeps the stack simple and free; the index is rebuilt from the corpus on startup.
- **Structured JSON outputs** — the agent returns a typed Pydantic schema rather than free text, ensuring the frontend always gets consistent data.
- **Zustand with persistence** — the last analysis result is persisted to localStorage so the dashboard survives page refreshes.

---

## Disclaimer

For educational and portfolio demonstration purposes only. Not financial advice.
