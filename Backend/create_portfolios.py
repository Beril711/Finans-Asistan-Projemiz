import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finans_api.settings')
django.setup()

from django.contrib.auth.models import User
from finans_api.models import Portfolio

# Tüm kullanıcılar için portfolio oluştur
for user in User.objects.all():
    portfolio, created = Portfolio.objects.get_or_create(
        user=user,
        defaults={'balance': 10000.00}
    )
    if created:
        print(f"✅ {user.username} için portfolio oluşturuldu (Bakiye: 10,000 TL)")
    else:
        print(f"⚠️  {user.username} zaten portfolio'ya sahip")

print("\n🎉 İşlem tamamlandı!")
