# Backend/finans_api/serializers.py

from .models import Category, Transaction, Portfolio, Asset, Investment, Holding
from django.contrib.auth.models import User
from rest_framework import serializers

# 1. KULLANICI SERİLEŞTİRİCİSİ (EKSİK KISIM)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

# 2. KAYIT SERİLEŞTİRİCİSİ (EKSİK KISIM)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, required=True, style={'input_type': 'password'}
    )
    user = UserSerializer(read_only=True) # Kayıt sonrası kullanıcıyı göstermek için

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'user')
        extra_kwargs = {
            'password': {'write_only': True},
            'password2': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Şifreler eşleşmiyor."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2') 
        user = User.objects.create_user(**validated_data)
        user.is_active = True
        user.save()
        
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
            # Gelir Kategorileri
            {'name': 'Maaş', 'type': 'INCOME'},
            {'name': 'Yatırım Geliri', 'type': 'INCOME'},
            {'name': 'Ek İş', 'type': 'INCOME'},
            {'name': 'Hediye', 'type': 'INCOME'},
            {'name': 'Freelance', 'type': 'INCOME'},
            {'name': 'Kira Geliri', 'type': 'INCOME'},
            {'name': 'Bağış', 'type': 'INCOME'},
            {'name': 'Prim/Bonus', 'type': 'INCOME'},
            {'name': 'Emekli Maaşı', 'type': 'INCOME'},
            {'name': 'Burs', 'type': 'INCOME'},
            {'name': 'Yan Gelir', 'type': 'INCOME'},
            {'name': 'Satış Geliri', 'type': 'INCOME'},
            {'name': 'Serbest İş', 'type': 'INCOME'},
            {'name': 'Danışmanlık', 'type': 'INCOME'},
            {'name': 'Telif Hakkı', 'type': 'INCOME'},
            {'name': 'Prim', 'type': 'INCOME'},
            {'name': 'Bonus', 'type': 'INCOME'},
        ]
        
        for cat_data in default_categories:
            Category.objects.create(user=user, name=cat_data['name'], type=cat_data['type'])
        
        return user
        
# 3. KATEGORİ SERİLEŞTİRİCİSİ (Sizin Paylaştığınızdan Alındı)
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'type') 
        read_only_fields = ('user',) 

# 4. İŞLEM (TRANSACTION) SERİLEŞTİRİCİSİ (Sizin Paylaştığınızdan Alındı)
class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'date', 'description', 'category', 'category_name', 'transaction_type')
        read_only_fields = ('user',)

# 5. YATIRIM SİMÜLATÖRÜ SERİLEŞTİRİCİLERİ

class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ('id', 'balance', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ('id', 'symbol', 'name', 'asset_type', 'current_price', 'last_updated')

class InvestmentSerializer(serializers.ModelSerializer):
    asset_symbol = serializers.CharField(source='asset.symbol', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    
    class Meta:
        
        model = Investment
        fields = ('id', 'asset', 'asset_symbol', 'asset_name', 'transaction_type', 'quantity', 'price', 'total', 'date')
        read_only_fields = ('user', 'total', 'date')

class HoldingSerializer(serializers.ModelSerializer):
    asset_symbol = serializers.CharField(source='asset.symbol', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    current_price = serializers.DecimalField(source='asset.current_price', max_digits=12, decimal_places=2, read_only=True)
    current_value = serializers.SerializerMethodField()
    profit_loss = serializers.SerializerMethodField()
    
    class Meta:
        model = Holding
        fields = ('id', 'asset', 'asset_symbol', 'asset_name', 'quantity', 'average_price', 'current_price', 'current_value', 'profit_loss')
        read_only_fields = ('user',)
    
    def get_current_value(self, obj):
        return float(obj.quantity * obj.asset.current_price)
    
    def get_profit_loss(self, obj):
        return float((obj.asset.current_price - obj.average_price) * obj.quantity)