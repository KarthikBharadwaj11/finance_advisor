#!/usr/bin/env python
"""
Rebuild the FAISS vector store from the knowledge corpus.
Run this after adding new documents to app/rag/knowledge_corpus/.

Usage:
    python scripts/build_vector_store.py [--force]
"""

import asyncio
import argparse
import sys
from pathlib import Path

# Ensure app package is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.logging_config import configure_structlog
from app.rag.vector_store import CORPUS_DIR, _build_from_corpus, _get_embeddings

import structlog


async def main(force: bool) -> None:
    configure_structlog()
    log = structlog.get_logger()

    index_path = settings.FAISS_INDEX_PATH
    if index_path.exists() and not force:
        log.info("index_exists_skipping", path=str(index_path), tip="Use --force to rebuild")
        return

    log.info("building_vector_store", corpus_dir=str(CORPUS_DIR))
    embeddings = _get_embeddings()
    loop = asyncio.get_event_loop()
    store = await loop.run_in_executor(None, _build_from_corpus, embeddings)

    index_path.mkdir(parents=True, exist_ok=True)
    store.save_local(str(index_path))
    log.info("vector_store_saved", path=str(index_path))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build FAISS vector store")
    parser.add_argument("--force", action="store_true", help="Rebuild even if index exists")
    args = parser.parse_args()
    asyncio.run(main(args.force))
