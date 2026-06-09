# Architecture of this app

User request -> API Layer (api/v1/) -> service layer (services/) -> agent layer (egent/executor.py) -> Tools (budget_panner, financial_health etc) -> RAG (rag/ + FAISS) -> Database layer (/db) -> LLM (openAI) 
