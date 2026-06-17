Semantic Gap rpoblem:
Semantic gap is the actual dofference between Lexical similarirty and contextual relevance. FOr eag: If you ask the LLM "What can help me pay off my mortgage in the next few months?", It should give suggestions like "Debt management strategies, Debt management funds etc. But there are chances of it giving out suggestions like House loan trends, just because it identifes the word mortgage. This difference is Semantic Gap problem.

Retrieve-then-rerank compensates for semantic search'ss weakness with contextual relevance. It first retrieves about 10 chunks (more than what we need) and then its rereanked by contextual relevance and then the top 4 is chosen.

Embedding model converts text to vetors independently. It never sees the query and chunk together. Rereanking model takes the query and the chunk together, and outptus a single relevance score. Since it sees both together, it can understand the relationship between them. Its more accurate but slower. 

BM25 is a keyword search algorithm. It scores documents based on how often the query terms appear in the document, how rarerely the query terms appear across all documents and the document length. 

The implmentation: When the query comes in, BOTH (Faiss and BM25) searches run in parallel. The results are merged using reciprocal rank fusion. The merged results are then reranked and top 4 are returned. 
RRF score = 1/(rank_in_semantic + k) + 1/(rank_in_keyword +k) 

Reranking works better for our app since our user queries and more context based and not keyword based. Hybrid gives us marginal benifits over reranking but using just BM25 wouldnt help us. 
