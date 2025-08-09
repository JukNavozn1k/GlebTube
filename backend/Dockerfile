FROM python:3.11-alpine

WORKDIR /backend

COPY requirements.txt .

RUN apk add --no-cache gcc musl-dev postgresql-libs postgresql-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del gcc musl-dev postgresql-dev

COPY . .

EXPOSE 8000