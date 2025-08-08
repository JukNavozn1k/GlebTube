FROM python:3.10.0-slim

# Install ffmpeg and any other required packages
RUN apt-get update && apt-get install -y ffmpeg \
    && rm -rf /var/lib/apt/lists/*
# Set working directory
WORKDIR /app

# Install Python dependencies first to leverage caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 8000
