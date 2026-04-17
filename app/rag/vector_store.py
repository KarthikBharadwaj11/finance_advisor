"""
FAISS vector store — no LangChain, direct OpenAI embeddings + faiss-cpu.

Flow:
  First run  → load .txt corpus → chunk → embed via OpenAI → build FAISS index → save to disk
  Later runs → load index + chunks from disk

similarity_search() is the only public function used by the RAG tool.
"""

from __future__ import annotations

import json
import pickle
import asyncio
from pathlib import Path

import faiss
import numpy as np
import structlog
from openai import OpenAI

from app.config import settings

logger = structlog.get_logger(__name__)

CORPUS_DIR = Path(__file__).parent / "knowledge_corpus"
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536

_index: faiss.IndexFlatIP | None = None
_chunks: list[dict] = []  # [{"source": str, "content": str}]


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY.get_secret_value())


def _split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks by character count."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]


def _load_corpus() -> list[dict]:
    """Read all .txt files and split into chunks with source metadata."""
    chunks = []
    for path in sorted(CORPUS_DIR.glob("*.txt")):
        text = path.read_text(encoding="utf-8")
        for chunk in _split_text(text):
            chunks.append({"source": path.stem, "content": chunk})
    logger.info("corpus_loaded", files=len(list(CORPUS_DIR.glob("*.txt"))), chunks=len(chunks))
    return chunks


def _embed(texts: list[str]) -> np.ndarray:
    """Call OpenAI embeddings API and return a float32 numpy array."""
    client = _get_client()
    response = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    vectors = np.array([e.embedding for e in response.data], dtype=np.float32)
    faiss.normalize_L2(vectors)  # cosine similarity via inner product on normalized vectors
    return vectors


def _build_index(chunks: list[dict]) -> faiss.IndexFlatIP:
    texts = [c["content"] for c in chunks]
    # Embed in batches of 100 (OpenAI limit is 2048 but batching keeps memory sane)
    all_vectors = []
    for i in range(0, len(texts), 100):
        all_vectors.append(_embed(texts[i : i + 100]))
    vectors = np.vstack(all_vectors)

    index = faiss.IndexFlatIP(EMBEDDING_DIM)
    index.add(vectors)
    return index


def _save(index_path: Path, index: faiss.IndexFlatIP, chunks: list[dict]) -> None:
    index_path.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(index_path / "index.faiss"))
    (index_path / "chunks.pkl").write_bytes(pickle.dumps(chunks))
    logger.info("faiss_index_saved", path=str(index_path))


def _load(index_path: Path) -> tuple[faiss.IndexFlatIP, list[dict]]:
    index = faiss.read_index(str(index_path / "index.faiss"))
    chunks = pickle.loads((index_path / "chunks.pkl").read_bytes())
    logger.info("faiss_index_loaded", path=str(index_path), chunks=len(chunks))
    return index, chunks


async def initialize_vector_store() -> None:
    """Called once at FastAPI startup. Builds or loads the FAISS index."""
    global _index, _chunks

    index_path = settings.FAISS_INDEX_PATH
    loop = asyncio.get_event_loop()

    if index_path.exists() and (index_path / "index.faiss").exists():
        _index, _chunks = await loop.run_in_executor(None, _load, index_path)
    else:
        chunks = await loop.run_in_executor(None, _load_corpus)
        index = await loop.run_in_executor(None, _build_index, chunks)
        await loop.run_in_executor(None, _save, index_path, index, chunks)
        _index, _chunks = index, chunks


def similarity_search(query: str, k: int = 4) -> list[dict]:
    """Return top-k chunks most semantically similar to query."""
    if _index is None:
        raise RuntimeError("Vector store not initialized.")
    query_vec = _embed([query])
    _, indices = _index.search(query_vec, k)
    return [_chunks[i] for i in indices[0] if i < len(_chunks)]
