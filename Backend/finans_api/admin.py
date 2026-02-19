# Backend/finans_api/admin.py

from django.contrib import admin
from .models import Category, Transaction, Portfolio, Asset, Investment, Holding

# Modelleri Admin Paneli'ne kaydediyoruz
admin.site.register(Category)
admin.site.register(Transaction)
admin.site.register(Portfolio)
admin.site.register(Asset)
admin.site.register(Investment)
admin.site.register(Holding)