import os
from pathlib import Path
from datetime import timedelta
import dj_database_url # Veritabanı URL yönlendirmeleri için

BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik Anahtarı (Production'da .env içinden gelmelidir)
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-default-key-12345')

# Hata Ayıklama Modu (Geliştirme aşamasında True, Production'da False olmalı)
DEBUG = True

# Sunucuya erişebilecek IP veya Domain adresleri ('*' herkese açık demek)
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    # Django'nun Standart Uygulamaları
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # 3. Parti Kütüphaneler (API ve Güvenlik için)
    'rest_framework',            # Django REST API Altyapısı
    'rest_framework_simplejwt',  # JWT (JSON Web Token) Kimlik Doğrulama
    'corsheaders',               # React Native (Mobil) ile Backend'i konuşturmak için

    # Kendi Oluşturduğumuz Uygulamalar
    'finans_api',                    # Ana finans uygulamamız
]

MIDDLEWARE = [
    # CORS Middleware HER ZAMAN en üstte veya Security'den hemen sonra olmalıdır!
    'corsheaders.middleware.CorsMiddleware',
    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'finans_api.urls'
WSGI_APPLICATION = 'finans_api.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Not: Docker içinde PostgreSQL çalıştırıyoruz. Eğer bağlantı kurulamazsa 
# sistem otomatik olarak yedek (sqlite3) veritabanına geçer.
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3')
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us' # İstenirse 'tr-tr' yapılabilir
TIME_ZONE = 'UTC'       # İstenirse 'Europe/Istanbul' yapılabilir
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # <--- Sadece bu satırı ekle
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# A) CORS Ayarları (Mobil uygulamanın API'ye istek atabilmesi için gerekli izin)
CORS_ALLOW_ALL_ORIGINS = True 

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated', # API uçlarını yetkisiz girişlere kapatır
    ),
}

# C) JWT (Kimlik Doğrulama) Ayarları
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), # Token süresi 1 saate çıkarıldı (Testler kolaylaşsın diye)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY, 
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}