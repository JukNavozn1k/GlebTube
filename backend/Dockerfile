FROM python:3.11-slim

WORKDIR /backend

COPY requirements.txt .

# Устанавливаем ffmpeg и зависимости для postgresql
RUN apt-get update && apt-get install -y \
    ffmpeg \
    gcc \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000