FROM runpod/pytorch:1.0.3-cu1281-torch260-ubuntu2204

WORKDIR /app

ENV RUNPOD_MODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Cache bust: build timestamp
ARG BUILD_SHA=unknown
ENV BUILD_SHA=${BUILD_SHA}

COPY . .

CMD ["python", "-u", "-m", "worker.main"]
