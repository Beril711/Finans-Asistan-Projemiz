# Backend/finans_api/admin.py

from django.contrib import admin
from .models import Category, Transaction

# Modelleri Admin Paneli'ne kaydediyoruz
admin.site.register(Category)
admin.site.register(Transaction)