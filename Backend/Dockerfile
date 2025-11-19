# 1. Temel Python imajını al
FROM python:3.11-slim

# 2. Çalışma ortamı değişkenlerini ayarla
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Çalışma dizini oluştur
WORKDIR /app

# 4. Gerekli kütüphaneleri kur
COPY requirements.txt .
RUN pip install -r requirements.txt

# 5. Proje kodlarını container'a kopyala
COPY . .