FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt && \
    pip install --no-cache-dir \
        sentence-transformers==2.7.0 \
        scikit-learn \
        numpy \
        faiss-cpu \
        pandas \
        tqdm

# Copy all application code
COPY backend/ ./backend/
COPY src/      ./src/
COPY data/     ./data/
COPY cache/    ./cache/

# HF Spaces requires non-root user + port 7860
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

# Download model at build time as appuser so cache is saved in /home/appuser/.cache
RUN python -c "\
from sentence_transformers import SentenceTransformer; \
m = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2'); \
print('Model ready, dim=', m.get_sentence_embedding_dimension())"

ENV PYTHONPATH=/app
ENV TRANSFORMERS_OFFLINE=1
ENV HF_HUB_OFFLINE=1

EXPOSE 7860

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "7860"]
