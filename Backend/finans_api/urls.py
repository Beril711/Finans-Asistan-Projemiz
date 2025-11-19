# Backend/finans_api/urls.py

# GEREKLİ İMPORTLAR
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path, include # <-- 'include' buraya eklendi
from django.contrib import admin
from rest_framework.routers import DefaultRouter # <-- DefaultRouter eklendi

# VIEW İMPORTLARI
from .views import RegisterView
from .views import CategoryViewSet, TransactionViewSet # <-- Category ve Transaction View'ları geri getirildi

# 1. API için router oluştur
router = DefaultRouter() # <-- Router tanımlandı
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')


# 2. URL listesi
urlpatterns = [
    # Django Yönetim Paneli
    path('admin/', admin.site.urls),
    
    # 6. Hafta - Kullanıcı Kayıt API'si
    path('api/register/', RegisterView.as_view(), name='register'),
    
    # SimpleJWT Kimlik Doğrulama endpoint'leri
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 7. Hafta - Router URL'lerini dahil et
    path('api/', include(router.urls)), # <-- Bu satır artık Category ve Transaction View'larını aktif edecek
]