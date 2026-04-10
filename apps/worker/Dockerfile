FROM runpod/pytorch:1.0.3-cu1281-torch260-ubuntu2204

WORKDIR /app

ENV RUNPOD_MODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Build tools + llama.cpp for optional GGUF quantization
RUN apt-get update && apt-get install -y --no-install-recommends \
        cmake \
        build-essential \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Pinned llama.cpp release for reproducibility
ARG LLAMA_CPP_REF=b3997
RUN git clone --depth 1 --branch ${LLAMA_CPP_REF} https://github.com/ggerganov/llama.cpp.git /opt/llama.cpp \
    && cd /opt/llama.cpp \
    && cmake -B build -DLLAMA_CURL=OFF -DGGML_NATIVE=OFF \
    && cmake --build build --config Release -j 2 --target llama-quantize \
    && find /opt/llama.cpp -type d -name tests -exec rm -rf {} + 2>/dev/null || true \
    && find /opt/llama.cpp -type d -name examples -exec rm -rf {} + 2>/dev/null || true

ENV LLAMA_CPP_DIR=/opt/llama.cpp
ENV PATH="/opt/llama.cpp/build/bin:${PATH}"

# Use lock file for reproducible builds; fall back to requirements.txt
COPY requirements.lock requirements.txt ./
RUN pip install --no-cache-dir -r requirements.lock || pip install --no-cache-dir -r requirements.txt

# Cache bust: per-commit SHA to force COPY layer invalidation
ARG BUILD_SHA=unknown
ENV BUILD_SHA=${BUILD_SHA}

COPY . .

CMD ["python", "-u", "-m", "worker.main"]
