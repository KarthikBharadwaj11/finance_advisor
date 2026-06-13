The RAG operations have 2 phases:

Phase 1: Indexting. This happens once during the startup. 
Load .txt files fprm knowledge corpus -> split into  chunks -> embed all chunks -> Store in FAISS index -> Save to disk

Phase 2: Query Time
User question comes in -> embed the question -> Search FAISS for similar vectors -> Return top 4 chunks


There are 2 data sources:
1. FAISS - Knowledge base. Stored generic information related to finance and investement
2. PostgreSQL: User data, Persinal financial data of each user


Chunking parameters:
Why 512? Its large enough to capture a complete concept but not too large to retrieve irrelevant content. 
Why 64 characetr overlap? If an important sentence falls on a chunk boundary, overlap ensures that it appears it aleast 1 complete chunk. 

Limitation of FAISS and why pgvector? 
- FAISS doesnt handle dynamic frewuently updated knowledge bases. It required a full re-build, inlike pgvecttor or pinecone that offer incremental updates. 
