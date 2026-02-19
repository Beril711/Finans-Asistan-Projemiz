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

# Yatırım Simülatörü Modelleri

class Portfolio(models.Model):
    """
    Kullanıcının yatırım portföyünü tutar.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='portfolio')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)  # Başlangıç bakiyesi
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Portfolio - Balance: {self.balance}"

class Asset(models.Model):
    """
    Yatırım yapılabilecek varlıkları tutar (hisse, kripto vb.)
    """
    ASSET_TYPES = (
        ('STOCK', 'Hisse Senedi'),
        ('CRYPTO', 'Kripto Para'),
        ('FOREX', 'Döviz'),
    )
    
    symbol = models.CharField(max_length=10, unique=True)  # BTC, AAPL, EUR/USD
    name = models.CharField(max_length=100)
    asset_type = models.CharField(max_length=10, choices=ASSET_TYPES)
    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.name} ({self.current_price})"

class Investment(models.Model):
    """
    Kullanıcının yaptığı alım/satım işlemlerini tutar.
    """
    TRANSACTION_TYPES = (
        ('BUY', 'Alım'),
        ('SELL', 'Satım'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=12, decimal_places=4)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} {self.quantity} {self.asset.symbol}"

class Holding(models.Model):
    """
    Kullanıcının elindeki varlıkları tutar.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    average_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ('user', 'asset')

    def __str__(self):
        return f"{self.user.username} - {self.quantity} {self.asset.symbol}"

# Not: Diğer modelleri (AssetHolding ve Genişletilmiş User) sonra ekleyeceğiz.