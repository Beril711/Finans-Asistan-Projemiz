# Backend/finans_api/views.py

# Backend/finans_api/views.py

from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

# BU İKİ IMPORT SATIRININ KESİNLİKLE OLMASI GEREKİYOR:
from .models import Category, Transaction 
from .serializers import CategorySerializer, TransactionSerializer 

from rest_framework import generics, permissions

# ... (ViewSet tanımları aşağıda devam etmeli)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Kategori verileri için CRUD işlemleri sağlar.
    Sadece oturum açmış kullanıcılar (IsAuthenticated) kendi verilerine erişebilir.
    """
    serializer_class = CategorySerializer
    # DÜZELTİLEN KISIM: Listenin tanımı tek bir satırda kapatıldı.
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        """Kullanıcının sadece kendi kategorilerini görmesini sağlar."""
        return Category.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        """Kategori oluşturulurken kullanıcının otomatik atanmasını sağlar."""
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    """
    Harcama/Gelir verileri (Transaction) için CRUD işlemleri sağlar.
    Sadece oturum açmış kullanıcılar kendi işlemlerine erişebilir.
    """
    serializer_class = TransactionSerializer
    # DÜZELTİLEN KISIM: Listenin tanımı tek bir satırda kapatıldı.
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        """Kullanıcının sadece kendi işlemlerini görmesini sağlar."""
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """İşlem oluşturulurken kullanıcının otomatik atanmasını sağlar."""
        serializer.save(user=self.request.user)

class RegisterView(generics.CreateAPIView):
    """
    Yeni kullanıcı kaydı için API Endpoint'i.
    Gereksinim: İzin (Permission): Herkes (Anonim kullanıcılar dahil)
    """
    queryset = User.objects.all() 
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    class DashboardSummaryView(APIView):
    """
    Dashboard ve Raporlar sayfası için özet verileri sunar.
    8. Hafta: Grafiklerin ihtiyaç duyduğu kategori bazlı toplamları hesaplar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Kullanıcının tüm işlemlerini al
        user_transactions = Transaction.objects.filter(user=request.user)

        # 2. Toplam Gelir ve Gider Hesaplama
        # aggregate fonksiyonu veritabanı seviyesinde toplama yapar (daha performanslıdır)
        total_income = user_transactions.filter(transaction_type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = user_transactions.filter(transaction_type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0
        
        # 3. Güncel Bakiye
        balance = total_income - total_expense

        # 4. Pasta Grafiği İçin Veri (Category Based Spending) 
        # Sadece Giderleri (EXPENSE) al, kategori adına göre grupla ve her grubun toplamını al.
        category_data = user_transactions.filter(transaction_type='EXPENSE')\
            .values('category__name')\
            .annotate(total=Sum('amount'))\
            .order_by('-total')

        # 5. Frontend'e JSON olarak dön
        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "chart_data": category_data # Chart.js bu veriyi kullanacak
        })