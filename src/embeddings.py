"""Embedding engine with caching and FAISS support."""

import logging
import os
from typing import List, Optional

import numpy as np

# Force offline mode — model is already cached locally, no HuggingFace network needed
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

from sentence_transformers import SentenceTransformer

from src.cache import EmbeddingCache, FAISSIndex

logger = logging.getLogger(__name__)

# Resolve the local model path from the HuggingFace cache
_HF_CACHE = os.path.join(os.path.expanduser("~"), ".cache", "huggingface", "hub")
_MODEL_SNAPSHOT = os.path.join(
    _HF_CACHE,
    "models--sentence-transformers--all-MiniLM-L6-v2",
    "snapshots",
    "1110a243fdf4706b3f48f1d95db1a4f5529b4d41",
)
_DEFAULT_MODEL = _MODEL_SNAPSHOT if os.path.isdir(_MODEL_SNAPSHOT) else "all-MiniLM-L6-v2"


class EmbeddingEngine:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", use_cache: bool = True):
        # Use the absolute local path to skip all HuggingFace Hub network checks
        resolved = _DEFAULT_MODEL if model_name == "all-MiniLM-L6-v2" else model_name
        self.model = SentenceTransformer(resolved)
        if hasattr(self.model, "get_embedding_dimension"):
            self._dimension = self.model.get_embedding_dimension()
        else:
            self._dimension = self.model.get_sentence_embedding_dimension()
        self.use_cache = use_cache
        self.cache = EmbeddingCache(namespace=model_name.replace("/", "_")) if use_cache else None
        self.faiss_index: Optional[FAISSIndex] = None

    @property
    def dimension(self) -> int:
        return self._dimension

    def encode(self, texts: List[str], show_progress: bool = True) -> np.ndarray:
        if not texts:
            return np.array([])

        if self.use_cache and self.cache:
            results = [None] * len(texts)
            uncached_indices = []
            uncached_texts = []
            for i, t in enumerate(texts):
                cached = self.cache.get(t)
                if cached is not None:
                    results[i] = cached
                else:
                    uncached_indices.append(i)
                    uncached_texts.append(t)

            if uncached_texts:
                new_embs = self.model.encode(
                    uncached_texts, show_progress_bar=False, normalize_embeddings=True
                )
                for idx, emb in zip(uncached_indices, new_embs):
                    results[idx] = emb
                    self.cache.put(texts[idx], emb)

            self.cache.flush()
            return np.array(results)

        return self.model.encode(texts, show_progress_bar=show_progress, normalize_embeddings=True)

    def encode_job(self, job_text: str) -> np.ndarray:
        return self.encode([job_text], show_progress=False)[0]

    def encode_candidates(self, candidate_texts: List[str]) -> np.ndarray:
        return self.encode(candidate_texts, show_progress=False)

    def compute_similarities(self, job_emb: np.ndarray, candidate_embs: np.ndarray) -> np.ndarray:
        if len(candidate_embs) == 0:
            return np.array([])
        return np.dot(candidate_embs, job_emb)

    def build_faiss_index(self, candidate_texts: List[str], candidate_ids: List[str]):
        self.faiss_index = FAISSIndex(dimension=self.dimension)
        embs = self.encode(candidate_texts, show_progress=True)
        self.faiss_index.build(embs, candidate_texts, ids=candidate_ids)
        logger.info("FAISS index built with %d candidates", len(candidate_texts))
        return self.faiss_index

    def faiss_search(self, query_emb: np.ndarray, k: int = 20):
        if self.faiss_index is None:
            raise ValueError("FAISS index not built. Call build_faiss_index first.")
        return self.faiss_index.search(query_emb, k=k)
