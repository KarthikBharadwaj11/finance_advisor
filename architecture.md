# Architecture of this app

User request -> API Layer (api/v1/) -> service layer (services/) -> agent layer (egent/executor.py) -> Tools (budget_panner, financial_health etc) -> RAG (rag/ + FAISS) -> Database layer (/db) -> LLM (openAI) 

System Architecture

1. API Layer (api/v1/) Receives incoming HTTP requests from the frontend and routes them to the correct service. Handles authentication and input validation before anything else runs.
2. Service Layer (services/) Orchestrates the business logic. Decides which agent to invoke and with what context. Keeps the API layer clean by separating routing from logic.
3. Agent Layer (agent/executor.py) This is the AI brain of the app. The executor.py runs the agent loop. It runs a while loop, that first calls the LLM, checks whether it wants to use a tool,. If yes, it executes the tool, and feeds back the result. This is repeated for every iteration. It has an iteration limit so as to not make it an infinite loop.
4. Tools (agent/tools/) The tools layer do the real actions that the agent can take. There are 5 tool registries that are called based on the user's query. They are: analyze_financial_health, retrieve_finance_knowledge, aaccess_risk_profile, calculate_portfilio_allocation, generate_budget_plan. he agent decides which tool to call based on the user's question. The backend executes it and feeds the result back to the LLM
5. RAG Layer (rag/) This is the retrieval layer. It finds relevant context. We use FAISS, that lets us search through thousands of vectors extremely fast to find the ones most similar to our query. This is how the app finds data before sending it to the LLM.
6. Database Layer (db/) This is the posgreSQL data. It sores user's data, financial history, transaction history, expenses, savings. 
7. LLM (OpenAI) This is the API call for the LLM. The LLM is used to analyze data and give out a response based on the user's query. The LLM doesnt directly access the database. All data is retrieved by the backend and is injected to the LLM as context
