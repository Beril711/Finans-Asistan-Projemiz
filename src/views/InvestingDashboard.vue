<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { getPortfolio, getAssets, createInvestment, getHoldings, getInvestments, resetPortfolio } from '@/api/investmentService'

// State
const portfolio = ref({ balance: 10000 })
const assets = ref([])
const holdings = ref([])
const investments = ref([])
const selectedAsset = ref(null)
const transactionType = ref('BUY')
const quantity = ref(null)
const isLoading = ref(false)
const errorMsg = ref(null)
const successMsg = ref(null)
const activeTab = ref('market') // market, portfolio, history
const lastUpdate = ref(new Date())
let priceUpdateInterval = null

// Computed
const selectedAssetData = computed(() => {
  if (!selectedAsset.value) return null
  return assets.value.find(a => a.id === selectedAsset.value)
})

const totalCost = computed(() => {
  if (!selectedAssetData.value || !quantity.value) return 0
  return (selectedAssetData.value.current_price * quantity.value).toFixed(2)
})

const totalHoldingsValue = computed(() => {
  return holdings.value.reduce((sum, h) => sum + h.current_value, 0).toFixed(2)
})

const totalProfitLoss = computed(() => {
  return holdings.value.reduce((sum, h) => sum + h.profit_loss, 0).toFixed(2)
})

// Methods
const fetchData = async () => {
  try {
    const [portfolioRes, assetsRes, holdingsRes, investmentsRes] = await Promise.all([
      getPortfolio(),
      getAssets(),
      getHoldings(),
      getInvestments()
    ])
    
    portfolio.value = portfolioRes.data[0] || portfolioRes.data
    assets.value = assetsRes.data
    holdings.value = holdingsRes.data
    investments.value = investmentsRes.data
    
    if (assets.value.length > 0) {
      selectedAsset.value = assets.value[0].id
    }
  } catch (error) {
    console.error('Veri yükleme hatası:', error)
    errorMsg.value = 'Veriler yüklenirken hata oluştu'
  }
}

const handleTransaction = async () => {
  if (!selectedAsset.value || !quantity.value || quantity.value <= 0) {
    errorMsg.value = 'Lütfen geçerli bir miktar girin'
    return
  }

  errorMsg.value = null
  successMsg.value = null
  isLoading.value = true

  try {
    await createInvestment({
      asset: selectedAsset.value,
      transaction_type: transactionType.value,
      quantity: quantity.value
    })

    successMsg.value = `${transactionType.value === 'BUY' ? 'Alım' : 'Satım'} işlemi başarılı!`
    quantity.value = null
    await fetchData()
  } catch (error) {
    console.error('İşlem hatası:', error)
    errorMsg.value = error.response?.data?.error || 'İşlem başarısız oldu'
  } finally {
    isLoading.value = false
  }
}

const handleResetPortfolio = async () => {
  if (!confirm('Portföy sıfırlanacak. Tüm alım/satım geçmişi ve varlıklar temizlenecek. Devam edilsin mi?')) {
    return
  }
  isLoading.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    await resetPortfolio()
    successMsg.value = 'Portföy başarıyla sıfırlandı.'
    await fetchData()
  } catch (error) {
    console.error('Portföy sıfırlama hatası:', error)
    errorMsg.value = error.response?.data?.error || 'Portföy sıfırlanamadı'
  } finally {
    isLoading.value = false
  }
}

const getAssetTypeIcon = (type) => {
  const icons = {
    'CRYPTO': '₿',
    'STOCK': '📈',
    'FOREX': '💱'
  }
  return icons[type] || '💰'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Canlı fiyat güncellemesi (simülasyon)
const simulatePriceUpdate = () => {
  assets.value = assets.value.map(asset => {
    // Her varlık için %0.5 ile %2 arası rastgele değişim
    const changePercent = (Math.random() * 3.5 - 1.5) / 100
    const newPrice = asset.current_price * (1 + changePercent)
    return {
      ...asset,
      current_price: Math.max(newPrice, 0.01), // Minimum 0.01 TL
      priceChange: changePercent > 0 ? 'up' : 'down'
    }
  })
  
  // Holdings değerlerini güncelle
  holdings.value = holdings.value.map(holding => {
    const asset = assets.value.find(a => a.symbol === holding.asset_symbol)
    if (asset) {
      const currentValue = holding.quantity * asset.current_price
      const profitLoss = currentValue - (holding.quantity * holding.average_price)
      return {
        ...holding,
        current_price: asset.current_price,
        current_value: currentValue,
        profit_loss: profitLoss
      }
    }
    return holding
  })
  
  lastUpdate.value = new Date()
}

const startPriceUpdates = () => {
  // Her 3 saniyede bir fiyatları güncelle
  priceUpdateInterval = setInterval(simulatePriceUpdate, 3000)
}

const stopPriceUpdates = () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval)
  }
}

onMounted(() => {
  fetchData()
  startPriceUpdates()
})

onUnmounted(stopPriceUpdates)
</script>

<template>
  <div class="investment-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">📊 Yatırım Simülatörü</h1>
        <div class="live-indicator">
          <span class="pulse-dot"></span>
          <span class="live-text">Canlı - Son Güncelleme: {{ lastUpdate.toLocaleTimeString('tr-TR') }}</span>
        </div>
      </div>
      <div class="balance-card">
        <span class="balance-label">Toplam Bakiye</span>
        <span class="balance-amount">{{ Number(portfolio.balance).toLocaleString('tr-TR') }} TL</span>
        <button class="reset-btn" @click="handleResetPortfolio" :disabled="isLoading">🔄 Portföyü Sıfırla</button>
      </div>
    </div>

    <!-- Portfolio Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <div class="summary-label">Nakit</div>
          <div class="summary-value">{{ Number(portfolio.balance).toLocaleString('tr-TR') }} TL</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">📦</div>
        <div class="summary-content">
          <div class="summary-label">Portföy Değeri</div>
          <div class="summary-value">{{ Number(totalHoldingsValue).toLocaleString('tr-TR') }} TL</div>
        </div>
      </div>
      <div class="summary-card" :class="Number(totalProfitLoss) >= 0 ? 'profit' : 'loss'">
        <div class="summary-icon">{{ Number(totalProfitLoss) >= 0 ? '📈' : '📉' }}</div>
        <div class="summary-content">
          <div class="summary-label">Kar/Zarar</div>
          <div class="summary-value">{{ Number(totalProfitLoss) >= 0 ? '+' : '' }}{{ Number(totalProfitLoss).toLocaleString('tr-TR') }} TL</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button @click="activeTab = 'market'" :class="{ active: activeTab === 'market' }">
        🏪 Piyasa
      </button>
      <button @click="activeTab = 'portfolio'" :class="{ active: activeTab === 'portfolio' }">
        💼 Portföyüm
      </button>
      <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }">
        📜 İşlem Geçmişi
      </button>
    </div>

    <!-- Content -->
    <div class="content-area">
      <!-- Market Tab -->
      <div v-if="activeTab === 'market'" class="market-section">
        <div class="transaction-panel">
          <h2>Alım/Satım Yap</h2>

          <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>
          <div v-if="successMsg" class="alert success">{{ successMsg }}</div>

          <div class="form-group radio-group">
            <label>İşlem Tipi</label>
            <div>
              <input type="radio" id="buy" value="BUY" v-model="transactionType" class="radio-input">
              <label for="buy" class="radio-label buy">Alım</label>
              
              <input type="radio" id="sell" value="SELL" v-model="transactionType" class="radio-input">
              <label for="sell" class="radio-label sell">Satım</label>
            </div>
          </div>

          <div class="form-group">
            <label>Varlık Seçin</label>
            <select v-model="selectedAsset" :disabled="isLoading">
              <option v-for="asset in assets" :key="asset.id" :value="asset.id">
                {{ getAssetTypeIcon(asset.asset_type) }} {{ asset.symbol }} - {{ asset.name }} ({{ Number(asset.current_price).toLocaleString('tr-TR') }} TL)
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Miktar</label>
            <input 
              type="number" 
              step="0.0001" 
              v-model.number="quantity" 
              :disabled="isLoading"
              placeholder="Örn: 0.5"
            >
          </div>

          <div v-if="selectedAssetData && quantity" class="transaction-summary">
            <div class="summary-row">
              <span>Birim Fiyat:</span>
              <span>{{ Number(selectedAssetData.current_price).toLocaleString('tr-TR') }} TL</span>
            </div>
            <div class="summary-row total">
              <span>Toplam:</span>
              <span>{{ Number(totalCost).toLocaleString('tr-TR') }} TL</span>
            </div>
          </div>

          <button @click="handleTransaction" :disabled="isLoading || !quantity" class="transaction-btn">
            {{ isLoading ? 'İşlem Yapılıyor...' : (transactionType === 'BUY' ? '💰 Satın Al' : '💸 Sat') }}
          </button>
        </div>

        <div class="assets-list">
          <h2>🔴 Canlı Varlıklar</h2>
          <div class="assets-grid">
            <div v-for="asset in assets" :key="asset.id" class="asset-card" :class="asset.priceChange">
              <div class="asset-header">
                <span class="asset-icon">{{ getAssetTypeIcon(asset.asset_type) }}</span>
                <div>
                  <div class="asset-symbol">{{ asset.symbol }}</div>
                  <div class="asset-name">{{ asset.name }}</div>
                </div>
              </div>
              <div class="asset-price">
                {{ Number(asset.current_price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} TL
                <span v-if="asset.priceChange" class="price-indicator" :class="asset.priceChange">
                  {{ asset.priceChange === 'up' ? '↗' : '↘' }}
                </span>
              </div>
              <div class="asset-type">{{ asset.asset_type === 'CRYPTO' ? 'Kripto' : asset.asset_type === 'STOCK' ? 'Hisse' : 'Döviz' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio Tab -->
      <div v-if="activeTab === 'portfolio'" class="portfolio-section">
        <h2>Portföyüm</h2>
        <div v-if="holdings.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>Henüz varlığınız yok. Piyasa sekmesinden alım yapabilirsiniz!</p>
        </div>
        <div v-else class="holdings-grid">
          <div v-for="holding in holdings" :key="holding.id" class="holding-card">
            <div class="holding-header">
              <span class="holding-symbol">{{ holding.asset_symbol }}</span>
              <span class="holding-name">{{ holding.asset_name }}</span>
            </div>
            <div class="holding-details">
              <div class="detail-row">
                <span>Miktar:</span>
                <span>{{ Number(holding.quantity).toFixed(4) }}</span>
              </div>
              <div class="detail-row">
                <span>Ort. Fiyat:</span>
                <span>{{ Number(holding.average_price).toLocaleString('tr-TR') }} TL</span>
              </div>
              <div class="detail-row">
                <span>Güncel Fiyat:</span>
                <span>{{ Number(holding.current_price).toLocaleString('tr-TR') }} TL</span>
              </div>
              <div class="detail-row">
                <span>Toplam Değer:</span>
                <span class="value">{{ Number(holding.current_value).toLocaleString('tr-TR') }} TL</span>
              </div>
              <div class="detail-row">
                <span>Kar/Zarar:</span>
                <span :class="holding.profit_loss >= 0 ? 'profit' : 'loss'">
                  {{ holding.profit_loss >= 0 ? '+' : '' }}{{ Number(holding.profit_loss).toLocaleString('tr-TR') }} TL
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="history-section">
        <h2>İşlem Geçmişi</h2>
        <div v-if="investments.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>Henüz işlem geçmişiniz yok.</p>
        </div>
        <div v-else class="history-list">
          <div v-for="inv in investments" :key="inv.id" class="history-item" :class="inv.transaction_type.toLowerCase()">
            <div class="history-main">
              <div class="history-badge" :class="inv.transaction_type.toLowerCase()">
                {{ inv.transaction_type === 'BUY' ? '📥 ALIM' : '📤 SATIM' }}
              </div>
              <div class="history-details">
                <div class="history-asset">{{ inv.asset_symbol }} - {{ inv.asset_name }}</div>
                <div class="history-date">{{ formatDate(inv.date) }}</div>
              </div>
            </div>
            <div class="history-values">
              <div>{{ Number(inv.quantity).toFixed(4) }} adet</div>
              <div class="history-price">@ {{ Number(inv.price).toLocaleString('tr-TR') }} TL</div>
              <div class="history-total">{{ Number(inv.total).toLocaleString('tr-TR') }} TL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dashboard Ana */
.investment-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
}

/* Header */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.page-title {
  color: white;
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: #ff4757;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.live-text {
  font-weight: 500;
}

.balance-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 15px 30px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.balance-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.balance-amount {
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
}

.reset-btn {
  margin-top: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: #fff;
  color: #2d3748;
  font-weight: 700;
  cursor: pointer;
}

.reset-btn:hover:not(:disabled) {
  background: #f7fafc;
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.summary-card.profit {
  background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);
}

.summary-card.loss {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
}

.summary-icon {
  font-size: 2.5rem;
}

.summary-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d3748;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 15px;
  background: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.tabs button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Content Area */
.content-area {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Market Section */
.market-section {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 30px;
}

.transaction-panel, .assets-list {
  background: #f7fafc;
  border-radius: 15px;
  padding: 25px;
}

.transaction-panel h2, .assets-list h2 {
  margin-bottom: 20px;
  color: #2d3748;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
}

.radio-group > div {
  display: flex;
  gap: 10px;
}

.radio-input {
  display: none;
}

.radio-label {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  border: 2px solid;
  font-weight: 600;
  transition: all 0.3s ease;
}

.buy {
  border-color: #48bb78;
  color: #22543d;
  background: #f0fff4;
}

.sell {
  border-color: #f56565;
  color: #742a2a;
  background: #fff5f5;
}

.radio-input:checked + .radio-label.buy {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-color: transparent;
}

.radio-input:checked + .radio-label.sell {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: transparent;
}

.transaction-summary {
  background: white;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.summary-row.total {
  font-weight: 800;
  font-size: 1.1rem;
  padding-top: 10px;
  border-top: 2px solid #e2e8f0;
}

.transaction-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transaction-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.transaction-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Assets Grid */
.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.asset-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
  position: relative;
}

.asset-card.up {
  animation: priceUp 0.5s ease;
}

.asset-card.down {
  animation: priceDown 0.5s ease;
}

@keyframes priceUp {
  0%, 100% {
    background: white;
  }
  50% {
    background: #d4fc79;
  }
}

@keyframes priceDown {
  0%, 100% {
    background: white;
  }
  50% {
    background: #ffeaa7;
  }
}

.asset-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.asset-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.asset-icon {
  font-size: 2rem;
}

.asset-symbol {
  font-weight: 800;
  color: #2d3748;
}

.asset-name {
  font-size: 0.85rem;
  color: #718096;
}

.asset-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-indicator {
  font-size: 1.5rem;
  animation: bounce 1s ease infinite;
}

.price-indicator.up {
  color: #48bb78;
}

.price-indicator.down {
  color: #f56565;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.asset-type {
  font-size: 0.8rem;
  color: #a0aec0;
}

/* Holdings */
.holdings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.holding-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 20px;
}

.holding-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.holding-symbol {
  font-size: 1.5rem;
  font-weight: 800;
  display: block;
  margin-bottom: 5px;
}

.holding-name {
  font-size: 0.9rem;
  opacity: 0.9;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.detail-row .value {
  font-weight: 700;
  font-size: 1.1rem;
}

.detail-row .profit {
  color: #9ae6b4;
  font-weight: 700;
}

.detail-row .loss {
  color: #fc8181;
  font-weight: 700;
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid;
}

.history-item.buy {
  border-left-color: #48bb78;
}

.history-item.sell {
  border-left-color: #f56565;
}

.history-main {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-badge {
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
}

.history-badge.buy {
  background: #c6f6d5;
  color: #22543d;
}

.history-badge.sell {
  background: #fed7d7;
  color: #742a2a;
}

.history-asset {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 3px;
}

.history-date {
  font-size: 0.85rem;
  color: #718096;
}

.history-values {
  text-align: right;
}

.history-price {
  font-size: 0.9rem;
  color: #718096;
  margin: 3px 0;
}

.history-total {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

/* Alerts */
.alert {
  padding: 12px 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  font-weight: 600;
}

.alert.error {
  background: #fed7d7;
  color: #742a2a;
  border: 2px solid #fc8181;
}

.alert.success {
  background: #c6f6d5;
  color: #22543d;
  border: 2px solid #48bb78;
}

/* Responsive */
@media (max-width: 1024px) {
  .market-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .balance-card {
    align-items: center;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
