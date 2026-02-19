import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finans_api.settings')
django.setup()

from finans_api.models import Asset

# Örnek varlıklar
sample_assets = [
    {'symbol': 'BTC', 'name': 'Bitcoin', 'asset_type': 'CRYPTO', 'current_price': 95000.00},
    {'symbol': 'ETH', 'name': 'Ethereum', 'asset_type': 'CRYPTO', 'current_price': 3500.00},
    {'symbol': 'BNB', 'name': 'Binance Coin', 'asset_type': 'CRYPTO', 'current_price': 650.00},
    {'symbol': 'SOL', 'name': 'Solana', 'asset_type': 'CRYPTO', 'current_price': 220.00},
    {'symbol': 'AAPL', 'name': 'Apple Inc.', 'asset_type': 'STOCK', 'current_price': 195.00},
    {'symbol': 'MSFT', 'name': 'Microsoft', 'asset_type': 'STOCK', 'current_price': 380.00},
    {'symbol': 'GOOGL', 'name': 'Google', 'asset_type': 'STOCK', 'current_price': 140.00},
    {'symbol': 'TSLA', 'name': 'Tesla', 'asset_type': 'STOCK', 'current_price': 245.00},
    {'symbol': 'USD/TRY', 'name': 'Dolar/TL', 'asset_type': 'FOREX', 'current_price': 34.50},
    {'symbol': 'EUR/TRY', 'name': 'Euro/TL', 'asset_type': 'FOREX', 'current_price': 37.20},
    {'symbol': 'GOLD', 'name': 'Altın', 'asset_type': 'FOREX', 'current_price': 2050.00},
]

for asset_data in sample_assets:
    asset, created = Asset.objects.get_or_create(
        symbol=asset_data['symbol'],
        defaults=asset_data
    )
    if created:
        print(f"✅ {asset.symbol} - {asset.name} eklendi")
    else:
        print(f"⚠️  {asset.symbol} zaten mevcut")

print("\n🎉 Örnek varlıklar başarıyla eklendi!")
