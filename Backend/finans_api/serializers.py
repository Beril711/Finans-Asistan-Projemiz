# Backend/finans_api/serializers.py

from .models import Category, Transaction
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