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