Meaning As Distance:
COnsider a world map. EVery sentecne has a place in that map, with the sentences with similar meaning close and the ones with not so similar meanings away from each other. Instead of a 2D map, vector embeddings have multi dimensions. 1536 to be precise. 
So embeddings basically convert words to vectors in high dimensional space. Every semantic search finds the cloest vector to your query and returns top 4 chunks. 

Small vs Lrage embedding model trade off?
Small models are faster (higher search speed), have lower cost. 
Large models have a slighly slower search speed, but are more accurate and of course are cost heavy. 
For small projects, it wouldnt make much of a difference to sue small embedding models. 

pgvector creation steps:
1. CHeck if pgVector exists:
   SELECT * FROM pg_available_extensions WHERE name = 'vector';

2. Enable the extension:
   CREATE EXTENSION IF NOT EXISTS vector;
   SELECT * FROM pg_extension WHERE extname = 'vector';

3. Create table with vector column:
   CREATE TABLE financial_knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT now()
);

We used HNSW because our data is small and we dont really need clustering and it has better accuracy. 
HNSW builds a graph connecting similar vectors for fast traversal, while IVFFlat clusters vectors into groups and only searches relevant clusters - IVFFlat needs enough data to form meaningful clusters, which is why HNSW suits a small corpus.


COnceptual SQL for FAISS vs PgVector:

FAISS:
_, indices = _index.search(query_vec, k)
return [_chunks[i] for i in indices[0]]

pgvector:

SELECT source, content
FROM financial_knowledge_chunks
ORDER BY embedding <=> %(query_vector)s
LIMIT 4;

The advnatage is that the initial startup process is completely unnecessary when we use pgvector. With pgvector, the data is already there as rows in a table we have a connection pool for. 
