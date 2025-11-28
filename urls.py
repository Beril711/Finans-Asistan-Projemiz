from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, CategoryViewSet, TransactionViewSet, 
    DashboardSummaryView, PortfolioViewSet, MarketDataView, UserProfileView,
    BuyAssetView, SellAssetView # <-- Bunları ekleyin
)

# Router
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'portfolio', PortfolioViewSet, basename='portfolio') # 9. Hafta

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 8. Hafta Dashboard
    path('api/dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),

    # 9. Hafta Yatırım
    path('api/market-data/', MarketDataView.as_view(), name='market_data'),
    path('api/user-profile/', UserProfileView.as_view(), name='user_profile'),

    # Router (Categories, Transactions, Portfolio)
    path('api/', include(router.urls)),

    # 11. Hafta - Al/Sat İşlemleri
    path('api/trade/buy/', BuyAssetView.as_view(), name='trade_buy'),
    path('api/trade/sell/', SellAssetView.as_view(), name='trade_sell'),

    path('api/', include(router.urls)),
]