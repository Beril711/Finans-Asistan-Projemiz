from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1. KATEGORİ VE İŞLEM MODELLERİ (7. Hafta)
class Category(models.Model):
    CATEGORY_TYPES = (('INCOME', 'Gelir'), ('EXPENSE', 'Gider'))
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    name = models.CharField(max_length=50)
    type = models.CharField(max_length=7, choices=CATEGORY_TYPES, default='EXPENSE')

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class Transaction(models.Model):
    TRANSACTION_TYPES = (('INCOME', 'Gelir'), ('EXPENSE', 'Gider'))
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"

# 2. YATIRIM MODÜLÜ MODELLERİ (9. Hafta)

# Kullanıcının Sanal Bakiyesini Tutan Profil Modeli
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    virtual_balance = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00) # Başlangıç: 10.000$

    def __str__(self):
        return f"{self.user.username} Profili - Bakiye: {self.virtual_balance}"

# Kullanıcının Sahip Olduğu Varlıklar (Portföy)
class AssetHolding(models.Model):
    ASSET_TYPES = (('CRYPTO', 'Kripto Para'), ('STOCK', 'Hisse Senedi'), ('GOLD', 'Altın/Döviz'))
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asset_type = models.CharField(max_length=10, choices=ASSET_TYPES, default='CRYPTO')
    symbol = models.CharField(max_length=20) # Örn: BTC, ETH, AAPL
    quantity = models.DecimalField(max_digits=18, decimal_places=8) # Adet
    average_cost = models.DecimalField(max_digits=18, decimal_places=8) # Ortalama Maliyet ($)

    class Meta:
        unique_together = ('user', 'symbol') # Bir kullanıcının tek bir BTC kaydı olur, miktarı artar.

    def __str__(self):
        return f"{self.symbol} - {self.quantity}"

# Sinyal: Yeni bir User oluşturulduğunda otomatik olarak UserProfile da oluştur.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)