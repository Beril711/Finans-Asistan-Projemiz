# Mevcut Python imajı
FROM python:3.11-slim

# Tesseract-OCR ve gerekli sistem kütüphanelerini yükle (BU KISIM YENİ)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]