"""
Tool: retrieve_financial_knowledge

RAG tool: queries the FAISS vector store for relevant financial knowledge.
Returns cited passages to ground the agent's recommendations in
documented best practices rather than model weights alone.
"""

import json

from app.rag.vector_store import similarity_search


def retrieve_financial_knowledge(query: str, k: int = 4) -> str:
    """
    Search the financial knowledge base using semantic similarity.
    Always call this tool before making investment or budgeting recommendations
    to ensure advice is grounded in documented financial principles.
    Returns JSON array of {source, content} objects.
    """
    passages = similarity_search(query=query, k=k)
    return json.dumps({"query": query, "passages": passages, "count": len(passages)})


SCHEMA = {
    "type": "function",
    "function": {
        "name": "retrieve_financial_knowledge",
        "description": (
            "Search the financial knowledge base using semantic similarity. "
            "Always call this before making investment or budgeting recommendations. "
            "Returns cited passages from documented financial best practices."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "Financial topic or question to look up. "
                        "Examples: 'emergency fund guidelines', 'aggressive portfolio allocation'"
                    ),
                },
                "k": {
                    "type": "integer",
                    "description": "Number of knowledge passages to retrieve (1-8)",
                    "default": 4,
                },
            },
            "required": ["query"],
        },
    },
}
