from django.db import models
from django.contrib.auth.models import User
# Django'nun varsayılan User modelini kullanacağız (şimdilik)

# Harcama Takip Modülü Modelleri (Budget Tracker)
CATEGORY_TYPES = (
    ('INCOME', 'Gelir'),
    ('EXPENSE', 'Gider'),
)


class Category(models.Model):
    """
    Harcama veya Gelir Kategorilerini tutar.
    Örn: Gıda, Kira, Maaş, Yatırım.
    """
    # Her kategori bir kullanıcıya aittir
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    
    # Kategorinin adı
    name = models.CharField(max_length=50)
    type = models.CharField(
        max_length=7, 
        choices=CATEGORY_TYPES, # Tanımladığımız sabitleri kullanır
        default='EXPENSE'      # Varsayılan olarak Gider olarak ayarlarız
    )

    class Meta:
        verbose_name_plural = "Categories" # Admin panelinde daha düzgün görünmesi için

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class Transaction(models.Model):
    """
    Kullanıcının her bir gelir veya gider kaydını tutar.
    """
    TRANSACTION_TYPES = (
        ('INCOME', 'Gelir'),
        ('EXPENSE', 'Gider'),
    )

    # İşlemi yapan kullanıcı
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # İşlemin ait olduğu kategori (ForeignKey, Category modeline bağlanır)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    
    # İşlem Türü (Gelir veya Gider)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    
    # İşlem miktarı
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # İşlem tarihi
    date = models.DateField()
    
    # Kısa açıklama
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date'] # Tarihe göre tersten sıralama (en yeni üste)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.date})"

# Not: Diğer modelleri (AssetHolding ve Genişletilmiş User) sonra ekleyeceğiz.