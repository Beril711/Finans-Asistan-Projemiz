from django.db import transaction # Veritabanı bütünlüğü için
from .serializers import TradeSerializer # Yeni serializer'ı import et
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
import requests # Canlı veri çekmek için

from .models import Category, Transaction, AssetHolding, UserProfile
from .serializers import (
    RegisterSerializer, UserSerializer, CategorySerializer, 
    TransactionSerializer, AssetHoldingSerializer, UserProfileSerializer
)

# 7. HAFTA VIEWSET'LERİ
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).order_by('name')
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 6. HAFTA REGISTER VIEW
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all() 
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

# 8. HAFTA DASHBOARD SUMMARY (Düzeltilmiş Hali - Girinti Hatası Giderildi)
class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_transactions = Transaction.objects.filter(user=request.user)
        total_income = user_transactions.filter(transaction_type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = user_transactions.filter(transaction_type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0
        balance = total_income - total_expense
        
        category_data = user_transactions.filter(transaction_type='EXPENSE')\
            .values('category__name')\
            .annotate(total=Sum('amount'))\
            .order_by('-total')

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "chart_data": category_data
        })

# 9. HAFTA YATIRIM MODÜLÜ VIEW'LARI

# A. Portföy Listeleme
class PortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = AssetHoldingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssetHolding.objects.filter(user=self.request.user)

# B. Kullanıcı Sanal Bakiyesini Gösterme
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Kullanıcının profilini al veya oluştur (Signal çalışmazsa diye önlem)
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

# C. Canlı Piyasa Verisi (CoinGecko API Entegrasyonu)
class MarketDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # CoinGecko'dan popüler koinleri çekelim (Bitcoin, Ethereum vb.)
        # Sembol: btc, eth, sol, avax
        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            'vs_currency': 'usd',
            'ids': 'bitcoin,ethereum,solana,avalanche-2,tether', # İstediklerinizi ekleyebilirsiniz
            'order': 'market_cap_desc',
            'per_page': 10,
            'page': 1,
            'sparkline': 'false'
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            return Response(data)
        except Exception as e:
            return Response({"error": "Canlı veri çekilemedi", "details": str(e)}, status=500)
        


# 11. HAFTA: ALIM İŞLEMİ (BUY)
class BuyAssetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TradeSerializer(data=request.data)
        if serializer.is_valid():
            symbol = serializer.validated_data['symbol']
            quantity = serializer.validated_data['quantity']
            price = serializer.validated_data['price']
            
            total_cost = quantity * price
            user = request.user

            with transaction.atomic(): # İşlemleri atomik yap (Hepsi ya olur ya hiçbiri olmaz)
                # 1. Kullanıcı Profilini ve Bakiyeyi Getir
                # select_for_update: İşlem sırasında bakiyeyi kilitle (Race condition önlemi)
                profile = UserProfile.objects.select_for_update().get(user=user)
                
                # 2. Bakiye Kontrolü
                if profile.virtual_balance < total_cost:
                    return Response(
                        {"error": "Yetersiz bakiye", "balance": profile.virtual_balance, "cost": total_cost}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 3. Bakiyeyi Düş
                profile.virtual_balance -= total_cost
                profile.save()

                # 4. Varlığı Ekle veya Güncelle
                asset, created = AssetHolding.objects.get_or_create(
                    user=user, 
                    symbol=symbol,
                    defaults={'asset_type': 'CRYPTO', 'quantity': 0, 'average_cost': 0}
                )

                # Ortalama Maliyet Hesabı (Ağırlıklı Ortalama)
                # Yeni Maliyet = ((Eski Adet * Eski Maliyet) + (Yeni Adet * Yeni Fiyat)) / Toplam Adet
                current_total_value = asset.quantity * asset.average_cost
                new_total_value = current_total_value + total_cost
                new_total_quantity = asset.quantity + quantity

                asset.average_cost = new_total_value / new_total_quantity
                asset.quantity = new_total_quantity
                asset.save()

            return Response({
                "message": f"{quantity} adet {symbol} başarıyla alındı.",
                "new_balance": profile.virtual_balance,
                "average_cost": asset.average_cost
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 11. HAFTA: SATIM İŞLEMİ (SELL)
class SellAssetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TradeSerializer(data=request.data)
        if serializer.is_valid():
            symbol = serializer.validated_data['symbol']
            quantity = serializer.validated_data['quantity']
            price = serializer.validated_data['price']
            
            total_revenue = quantity * price
            user = request.user

            with transaction.atomic():
                # 1. Varlık Kontrolü
                try:
                    asset = AssetHolding.objects.select_for_update().get(user=user, symbol=symbol)
                except AssetHolding.DoesNotExist:
                    return Response({"error": "Bu varlığa sahip değilsiniz."}, status=status.HTTP_400_BAD_REQUEST)

                # 2. Miktar Kontrolü
                if asset.quantity < quantity:
                    return Response(
                        {"error": "Yetersiz varlık miktarı", "owned": asset.quantity, "selling": quantity},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 3. Varlığı Düş
                asset.quantity -= quantity
                
                # Eğer miktar 0'a düşerse kaydı silmek yerine 0 olarak tutabiliriz veya silebiliriz.
                # Şimdilik 0 olarak tutalım, geçmiş maliyet bilgisi kaybolmasın.
                asset.save()

                # 4. Bakiyeyi Artır (Para Ekle)
                profile = UserProfile.objects.select_for_update().get(user=user)
                profile.virtual_balance += total_revenue
                profile.save()

            return Response({
                "message": f"{quantity} adet {symbol} başarıyla satıldı.",
                "new_balance": profile.virtual_balance,
                "profit_added": total_revenue
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)