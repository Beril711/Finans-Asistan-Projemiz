import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finans_api.settings')
django.setup()

from django.contrib.auth.models import User
from finans_api.models import Category

# Varsayılan kategorileri oluştur
default_categories = [
    # Gider Kategorileri
    {'name': 'Yemek', 'type': 'EXPENSE'},
    {'name': 'Ulaşım', 'type': 'EXPENSE'},
    {'name': 'Market', 'type': 'EXPENSE'},
    {'name': 'Faturalar', 'type': 'EXPENSE'},
    {'name': 'Eğlence', 'type': 'EXPENSE'},
    {'name': 'Sağlık', 'type': 'EXPENSE'},
    {'name': 'Giyim', 'type': 'EXPENSE'},
    {'name': 'Kira', 'type': 'EXPENSE'},
    {'name': 'Tatil', 'type': 'EXPENSE'},
    {'name': 'Ev Bakımı', 'type': 'EXPENSE'},
    {'name': 'Elektronik', 'type': 'EXPENSE'},
    {'name': 'Eğitim', 'type': 'EXPENSE'},
    {'name': 'Hobi', 'type': 'EXPENSE'},
    {'name': 'Kredi Kartı', 'type': 'EXPENSE'},
    {'name': 'Sigorta', 'type': 'EXPENSE'},
    # Gelir Kategorileri
    {'name': 'Maaş', 'type': 'INCOME'},
    {'name': 'Yatırım Geliri', 'type': 'INCOME'},
    {'name': 'Ek İş', 'type': 'INCOME'},
    {'name': 'Hediye', 'type': 'INCOME'},
    {'name': 'Prim', 'type': 'INCOME'},
    {'name': 'Serbest İş', 'type': 'INCOME'},
    {'name': 'Kira Geliri', 'type': 'INCOME'},
    {'name': 'Freelance', 'type': 'INCOME'},
    {'name': 'Bağış', 'type': 'INCOME'},
    {'name': 'Bonus', 'type': 'INCOME'},
    {'name': 'Emekli Maaşı', 'type': 'INCOME'},
    {'name': 'Burs', 'type': 'INCOME'},
    {'name': 'Yan Gelir', 'type': 'INCOME'},
    {'name': 'Satış Geliri', 'type': 'INCOME'},
    {'name': 'Danışmanlık', 'type': 'INCOME'},
    {'name': 'Telif Hakkı', 'type': 'INCOME'},
]

# Tüm kullanıcılar için eksik kategorileri tamamla
for user in User.objects.all():
    user_cats = Category.objects.filter(user=user)
    existing_names = set(user_cats.values_list('name', flat=True))

    created = 0
    for cat_data in default_categories:
        if cat_data['name'] not in existing_names:
            Category.objects.create(user=user, name=cat_data['name'], type=cat_data['type'])
            created += 1

    if created:
        print(f"✅ {user.username} için {created} eksik kategori eklendi")
    else:
        print(f"ℹ️  {user.username} için eksik kategori yok (toplam {user_cats.count()})")

print("\n🎉 İşlem tamamlandı!")
