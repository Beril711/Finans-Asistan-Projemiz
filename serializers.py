from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction, AssetHolding, UserProfile

# KULLANICI SERİLEŞTİRİCİSİ
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

# KAYIT SERİLEŞTİRİCİSİ
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'user')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Şifreler eşleşmiyor."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2') 
        user = User.objects.create_user(**validated_data)
        return user

# KATEGORİ SERİLEŞTİRİCİSİ
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'type') 
        read_only_fields = ('user',) 

# İŞLEM (TRANSACTION) SERİLEŞTİRİCİSİ
class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'date', 'description', 'category', 'category_name', 'transaction_type')
        read_only_fields = ('user',)

# 9. HAFTA: YATIRIM SERİLEŞTİRİCİLERİ

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('virtual_balance',)

class AssetHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetHolding
        fields = ('id', 'symbol', 'asset_type', 'quantity', 'average_cost')
        read_only_fields = ('user',)


# 11. HAFTA: ALIM/SATIM İŞLEM SERİLEŞTİRİCİSİ
class TradeSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20) # Örn: bitcoin
    quantity = serializers.DecimalField(max_digits=18, decimal_places=8) # Kaç adet?
    price = serializers.DecimalField(max_digits=18, decimal_places=8) # O anki fiyatı ($)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Miktar pozitif olmalıdır.")
        return value
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Fiyat pozitif olmalıdır.")
        return value