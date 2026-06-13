"""Embedding cache and FAISS index for performance optimization."""

import os
import json
import hashlib
import logging
import pickle
from typing import Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cache")


def _ensure_cache_dir():
    os.makedirs(CACHE_DIR, exist_ok=True)


def _content_hash(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()


class EmbeddingCache:
    """Persistent cache for embeddings to avoid recomputation."""

    def __init__(self, namespace: str = "default"):
        _ensure_cache_dir()
        self.cache_path = os.path.join(CACHE_DIR, f"embeddings_{namespace}.pkl")
        self.cache: Dict[str, np.ndarray] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.cache_path):
            try:
                with open(self.cache_path, "rb") as f:
                    self.cache = pickle.load(f)
                logger.info("Loaded %d cached embeddings from %s", len(self.cache), self.cache_path)
            except Exception as e:
                logger.warning("Failed to load cache: %s", e)
                self.cache = {}

    def _save(self):
        try:
            with open(self.cache_path, "wb") as f:
                pickle.dump(self.cache, f)
        except Exception as e:
            logger.warning("Failed to save cache: %s", e)

    def get(self, text: str) -> Optional[np.ndarray]:
        key = _content_hash(text)
        emb = self.cache.get(key)
        if emb is not None:
            return emb
        return None

    def put(self, text: str, embedding: np.ndarray):
        key = _content_hash(text)
        self.cache[key] = embedding
        if len(self.cache) % 50 == 0:
            self._save()

    def flush(self):
        self._save()

    def size(self) -> int:
        return len(self.cache)


class FAISSIndex:
    """FAISS vector index for fast similarity search."""

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = None
        self._documents = []

    def build(self, embeddings: np.ndarray, documents: List[str], ids: Optional[List[str]] = None):
        import faiss
        if len(embeddings) == 0:
            return
        self.dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(self.dimension)
        normalized = embeddings.copy()
        faiss.normalize_L2(normalized)
        self.index.add(normalized.astype(np.float32))
        self._documents = documents if ids is None else ids
        logger.info("FAISS index built with %d vectors (dim=%d)", self.index.ntotal, self.dimension)

    def search(self, query_emb: np.ndarray, k: int = 10) -> List[Tuple[int, float]]:
        if self.index is None or self.index.ntotal == 0:
            return []
        query_norm = query_emb.reshape(1, -1).astype(np.float32)
        faiss.normalize_L2(query_norm)
        scores, indices = self.index.search(query_norm, min(k, self.index.ntotal))
        return [(int(indices[0][i]), float(scores[0][i])) for i in range(len(indices[0]))]

    def save(self, path: str):
        import faiss
        if self.index is not None:
            faiss.write_index(self.index, path)
            meta_path = path + ".meta"
            with open(meta_path, "w") as f:
                json.dump({"documents": self._documents, "dimension": self.dimension}, f)

    def load(self, path: str):
        import faiss
        if os.path.exists(path):
            self.index = faiss.read_index(path)
            meta_path = path + ".meta"
            if os.path.exists(meta_path):
                with open(meta_path) as f:
                    meta = json.load(f)
                    self._documents = meta.get("documents", [])
                    self.dimension = meta.get("dimension", self.dimension)
            logger.info("FAISS index loaded from %s (%d vectors)", path, self.index.ntotal)

    @property
    def ntotal(self) -> int:
        return self.index.ntotal if self.index is not None else 0
