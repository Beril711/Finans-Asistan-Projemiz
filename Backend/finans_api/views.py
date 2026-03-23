# Backend/finans_api/views.py
from dotenv import load_dotenv
load_dotenv()
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer, UserSerializer
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
try:
    from PIL import Image
    import pytesseract
except ImportError:
    pytesseract = None
import re
from .models import Category, Transaction, Portfolio, Asset, Investment, Holding
from .serializers import (CategorySerializer, TransactionSerializer, 
                         PortfolioSerializer, AssetSerializer, InvestmentSerializer, HoldingSerializer)

from rest_framework import generics, permissions
import os
import anthropic

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

# Yatırım Simülatörü ViewSets

class PortfolioViewSet(viewsets.ModelViewSet):
    """Kullanıcı portföyü yönetimi"""
    serializer_class = PortfolioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)
    
    def list(self, request):
        """Kullanıcının portföyünü getir, yoksa oluştur"""
        portfolio, created = Portfolio.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def deposit(self, request):
        """Portföye bakiye yükle"""
        amount = request.data.get('amount')
        if not amount or float(amount) <= 0:
            return Response({'error': 'Geçerli bir miktar girin.'}, status=status.HTTP_400_BAD_REQUEST)
        portfolio, _ = Portfolio.objects.get_or_create(user=request.user)
        portfolio.balance += Decimal(str(amount))
        portfolio.save()
        serializer = self.get_serializer(portfolio)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def reset(self, request):
        """Portföyü sıfırla: bakiye varsayılan değere çek, tüm yatırımlar ve holdings temizlenir"""
        # Kullanıcının portföyünü getir/oluştur
        portfolio, _ = Portfolio.objects.get_or_create(user=request.user)

        # Yatırımlar ve Holdings kayıtlarını sil
        Investment.objects.filter(user=request.user).delete()
        Holding.objects.filter(user=request.user).delete()

        # Bakiyeyi varsayılan başlangıç değerine çek
        portfolio.balance = Decimal('10000.00')
        portfolio.save()

        serializer = self.get_serializer(portfolio)
        return Response(serializer.data, status=200)

class AssetViewSet(viewsets.ReadOnlyModelViewSet):
    """Yatırım yapılabilecek varlıklar - Fiyatlar gerçek API'lerden çekilir"""
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    queryset = Asset.objects.all()

    def get_real_prices(self):
        """Gerçek fiyatları dış API'lerden çek"""
        import requests
        import yfinance as yf

        prices = {}

        # 1. KRİPTO - CoinGecko (ücretsiz, key gerekmez)
        try:
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {
                "ids": "bitcoin,ethereum,binancecoin,ripple,solana",
                "vs_currencies": "try"
            }
            resp = requests.get(url, params=params, timeout=10)
            data = resp.json()
            crypto_map = {
                "bitcoin": "BTC",
                "ethereum": "ETH",
                "binancecoin": "BNB",
                "ripple": "XRP",
                "solana": "SOL",
            }
            for cg_id, symbol in crypto_map.items():
                if cg_id in data:
                    prices[symbol] = data[cg_id]["try"]
        except Exception as e:
            print(f"CoinGecko hatası: {e}")

        # 2. DÖVİZ - ExchangeRate API (ücretsiz)
        try:
            resp = requests.get("https://api.exchangerate-api.com/v4/latest/TRY", timeout=10)
            data = resp.json()
            rates = data.get("rates", {})
            if "USD" in rates and rates["USD"] != 0:
                prices["USD"] = round(1 / rates["USD"], 2)
            if "EUR" in rates and rates["EUR"] != 0:
                prices["EUR"] = round(1 / rates["EUR"], 2)
            if "GBP" in rates and rates["GBP"] != 0:
                prices["GBP"] = round(1 / rates["GBP"], 2)
        except Exception as e:
            print(f"ExchangeRate hatası: {e}")

        # 3. ALTIN ve BIST - Yahoo Finance
        try:
            tickers = yf.download(
                ["GC=F", "THYAO.IS", "GARAN.IS", "ASELS.IS"],
                period="1d", interval="1m", progress=False
            )
            close = tickers["Close"]
            # Altın (USD) → TRY çevir
            usd_try = prices.get("USD", 35.0)
            if "GC=F" in close.columns:
                gold_usd = float(close["GC=F"].dropna().iloc[-1])
                prices["GOLD"] = round(gold_usd * usd_try / 31.1, 2)  # ons → gram
            for symbol in ["THYAO.IS", "GARAN.IS", "ASELS.IS"]:
                short = symbol.replace(".IS", "")
                if symbol in close.columns:
                    prices[short] = round(float(close[symbol].dropna().iloc[-1]), 2)
        except Exception as e:
            print(f"Yahoo Finance hatası: {e}")

        return prices

    def list(self, request):
        """Varlıkları listele ve fiyatları gerçek API'den güncelle"""
        real_prices = self.get_real_prices()
        assets = Asset.objects.all()

        for asset in assets:
            symbol = asset.symbol.upper()
            if symbol in real_prices and real_prices[symbol] > 0:
                asset.current_price = Decimal(str(real_prices[symbol]))
                asset.save()
            else:
                # Gerçek fiyat alınamazsa küçük simülasyon yap
                change_percent = random.uniform(-0.5, 0.5) / 100
                new_price = float(asset.current_price) * (1 + change_percent)
                asset.current_price = Decimal(str(round(max(new_price, 0.01), 2)))
                asset.save()

        serializer = self.get_serializer(assets, many=True)
        return Response(serializer.data)

class InvestmentViewSet(viewsets.ModelViewSet):
    """Alım/Satım işlemleri"""
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Investment.objects.filter(user=self.request.user)
    
    def create(self, request):
        """Alım/Satım işlemi yap"""
        asset_id = request.data.get('asset')
        transaction_type = request.data.get('transaction_type')
        quantity = Decimal(str(request.data.get('quantity')))
        
        try:
            asset = Asset.objects.get(id=asset_id)
            portfolio, _ = Portfolio.objects.get_or_create(user=request.user)
            
            price = asset.current_price
            total = price * quantity
            
            if transaction_type == 'BUY':
                # Alım işlemi
                if portfolio.balance < total:
                    return Response({'error': 'Yetersiz bakiye!'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Bakiyeyi düş
                portfolio.balance -= total
                portfolio.save()
                
                # Holding güncelle
                holding, _ = Holding.objects.get_or_create(user=request.user, asset=asset)
                total_cost = (holding.average_price * holding.quantity) + total
                holding.quantity += quantity
                holding.average_price = total_cost / holding.quantity if holding.quantity > 0 else price
                holding.save()
                
            elif transaction_type == 'SELL':
                # Satım işlemi
                try:
                    holding = Holding.objects.get(user=request.user, asset=asset)
                    if holding.quantity < quantity:
                        return Response({'error': 'Yetersiz varlık!'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Bakiyeyi artır
                    portfolio.balance += total
                    portfolio.save()
                    
                    # Holding güncelle
                    holding.quantity -= quantity
                    if holding.quantity == 0:
                        holding.delete()
                    else:
                        holding.save()
                        
                except Holding.DoesNotExist:
                    return Response({'error': 'Bu varlığa sahip değilsiniz!'}, status=status.HTTP_400_BAD_REQUEST)
            
            # İşlemi kaydet
            investment = Investment.objects.create(
                user=request.user,
                asset=asset,
                transaction_type=transaction_type,
                quantity=quantity,
                price=price,
                total=total
            )
            
            serializer = self.get_serializer(investment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Asset.DoesNotExist:
            return Response({'error': 'Varlık bulunamadı!'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class HoldingViewSet(viewsets.ReadOnlyModelViewSet):
    """Kullanıcının elindeki varlıklar"""
    serializer_class = HoldingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Holding.objects.filter(user=self.request.user, quantity__gt=0)
    

def post(self, request, *args, **kwargs):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    file_obj = request.data['image']

    img = Image.open(file_obj)
    text = pytesseract.image_to_string(img)
    print("\n=== OCR METİN ===")
    print(text)
    print("=================\n")

    total_amount = 0.0

    # Önce TOPLAM satırını ara
    lines = text.split('\n')
    for line in lines:
        if 'TOPLAM' in line.upper() or 'TOTAL' in line.upper():
            # Boşlukları temizle, sayıyı bul
            clean_line = line.replace(' ', '')
            prices = re.findall(r'\d+[.,]\d{2}', clean_line)
            if prices:
                raw = prices[-1].replace(',', '.')
                try:
                    total_amount = float(raw)
                except:
                    pass
                break

    # TOPLAM bulunamazsa tüm fiyatlardan en büyüğünü al
    if total_amount == 0.0:
        clean_text = text.replace(' ', '')
        prices = re.findall(r'\d+[.,]\d{2}', clean_text)
        amounts = []
        for p in prices:
            try:
                amounts.append(float(p.replace(',', '.')))
            except:
                pass
        if amounts:
            total_amount = max(amounts)

    return Response({
        'success': True,
        'raw_text': text,
        'detected_total': total_amount
    })

class OCRScanView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        import anthropic
        import base64

        file_obj = request.data['image']
        img_bytes = file_obj.read()
        img_base64 = base64.standard_b64encode(img_bytes).decode('utf-8')

        content_type = file_obj.content_type or 'image/jpeg'

        client = anthropic.Anthropic(api_key="ANTHROPIC_API_KEY")

        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": content_type,
                                "data": img_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Bu bir Türk fişi veya faturasıdır. Sadece TOPLAM tutarını bul ve sadece sayıyı yaz, başka hiçbir şey yazma. Örnek: 3299.50"
                        }
                    ],
                }
            ],
        )

        raw_text = message.content[0].text.strip()

        try:
            clean = raw_text.replace(',', '.').replace(' ', '')
            total_amount = float(clean)
        except:
            total_amount = 0.0

        return Response({
            'success': True,
            'raw_text': raw_text,
            'detected_total': total_amount
        })