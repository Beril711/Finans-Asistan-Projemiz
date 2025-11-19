# Backend/finans_api/views.py

# Backend/finans_api/views.py

from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

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