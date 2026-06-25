LangGraph represents agent workflows as explicit graphs. The benefit of it over a while loop is that its readable, maintainable, testable and extensible. 

Nodes: Individual processing steps. Each node is a python function that takes a state and returns updated state. 
Edges: Connections between the nodes. Normal edges always go ffrom A to B. COnditional edges choose the next node based on the current state. 
State: A shared data stucture that flows through the entire graph. Every node reads from state and writes to state. 

Explicit state makes branching logic clean, testable and readbale. Any ndoe can readt the state directly. Hence its better

research_symptoms → severity_check → [EMERGENCY] → emergency_response
                                   → [NORMAL]    → retrieve_knowledge → analyze → respond


Current implementation uses mock data in all nodes — hardcoded user profiles, keyword-based severity detection, and simulated knowledge retrieval. Production implementation would require: real PostgreSQL queries in get_user_profile, actual RAG pipeline calls in retrieve_knowledge, LLM-based symptom analysis in research_symptoms instead of keyword matching, and integration with a real provider search API in find_healthcare_providers

