FROM python:3.9

RUN apt-get update && apt-get install -y ffmpeg --fix-missing

WORKDIR /app

COPY . . 

RUN pip install -r requirements.txt

EXPOSE 8000

