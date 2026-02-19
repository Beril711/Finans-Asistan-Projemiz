from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path, include # <-- 'include' buraya eklendi
from django.contrib import admin
from rest_framework.routers import DefaultRouter # <-- DefaultRouter eklendi
from .views import OCRScanView
# VIEW İMPORTLARI
from .views import RegisterView
from .views import (CategoryViewSet, TransactionViewSet, 
                   PortfolioViewSet, AssetViewSet, InvestmentViewSet, HoldingViewSet)

# 1. API için router oluştur
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'portfolio', PortfolioViewSet, basename='portfolio')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'holdings', HoldingViewSet, basename='holding')


# 2. URL listesi
urlpatterns = [
    # Django Yönetim Paneli
    path('admin/', admin.site.urls),
    
    # 6. Hafta - Kullanıcı Kayıt API'si
    path('api/register/', RegisterView.as_view(), name='register'),
    
    # SimpleJWT Kimlik Doğrulama endpoint'leri
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/scan-receipt/', OCRScanView.as_view(), name='scan-receipt'),
    # 7. Hafta - Router URL'lerini dahil et
    path('api/', include(router.urls)), # <-- Bu satır artık Category ve Transaction View'larını aktif edecek
]