FROM python:3.9-alpine

WORKDIR /app

COPY . . 

RUN apk update && \
    apk add --no-cache python3-dev libpq-dev gcc musl-dev 

RUN pip install -r requirements.txt

EXPOSE 8000

