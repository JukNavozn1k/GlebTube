FROM python:3.9-alpine



RUN apk update && \
    apk add --no-cache python3-dev libpq-dev gcc musl-dev 


RUN pip install -r requirements.txt

EXPOSE 8000
# Copy your application code here
# COPY . /app
# WORKDIR /app
# CMD ["python", "your_app.py"]
