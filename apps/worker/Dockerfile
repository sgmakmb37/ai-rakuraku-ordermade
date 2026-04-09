FROM runpod/pytorch:1.0.3-cu1281-torch260-ubuntu2204

WORKDIR /app

ENV RUNPOD_MODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-u", "-m", "worker.main"]
