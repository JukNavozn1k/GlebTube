FROM python:3.9-alpine

# Install ffmpeg and any other required packages
RUN apk update && apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Install Python dependencies first to leverage caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 8000
