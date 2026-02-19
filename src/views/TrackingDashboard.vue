<script setup>
import TransactionList from '../component/TransactionList.vue'
import AddTransaction from '../component/AddTransaction.vue'
import PieChart from '../component/PieChart.vue'
import { ref, computed } from 'vue';
import { getTransactions } from '@/api/trackingService'

// Sayfayı yenileme (refresh) mekanizması için bir ref tanımlıyoruz.
// Bu, yeni bir işlem eklendiğinde listenin otomatik güncellenmesini sağlar.
const refreshKey = ref(0);
const transactions = ref([]);

const handleTransactionAdded = () => {
  // İşlem eklendiğinde refreshKey'i artırarak listeyi yeniden yüklemeye zorlarız
  refreshKey.value += 1;
  fetchTransactions();
}

const fetchTransactions = async () => {
  try {
    const response = await getTransactions();
    const data = response.data;
    transactions.value = Array.isArray(data) ? data : (data?.results || []);
  } catch (error) {
    console.error('İşlemleri çekme hatası:', error);
  }
}

// Toplam gelir, gider ve net durum hesaplamaları
const totalIncome = computed(() => {
  return transactions.value
    .filter(t => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
});

const totalExpense = computed(() => {
  return transactions.value
    .filter(t => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
});

const netBalance = computed(() => {
  return totalIncome.value - totalExpense.value;
});

// Pasta grafiği için veri hesaplama
const chartData = computed(() => {
  return {
    labels: ['Gelir', 'Gider'],
    datasets: [{
      data: [totalIncome.value, totalExpense.value],
      backgroundColor: ['#10b981', '#ef4444'],
      borderColor: ['#059669', '#dc2626'],
      borderWidth: 2
    }]
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          return `${label}: ${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;
        }
      }
    }
  }
};

// Component mount edildiğinde işlemleri çek
fetchTransactions();
</script>

<template>
  <div class="tracking-dashboard">
    <!-- Modern Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">💰 Harcama Takip Modülü</h1>
        <p class="page-subtitle">Gelir ve giderlerinizi takip edin, bütçenizi yönetin</p>
      </div>
    </div>

    <!-- Özet Kartlar ve Pasta Grafik -->
    <div class="summary-section">
      <div class="stats-cards">
        <div class="stat-card income-card">
          <div class="stat-icon">💰</div>
          <div class="stat-details">
            <p class="stat-label">Toplam Gelir</p>
            <p class="stat-value">{{ totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} TL</p>
          </div>
        </div>
        
        <div class="stat-card expense-card">
          <div class="stat-icon">💸</div>
          <div class="stat-details">
            <p class="stat-label">Toplam Gider</p>
            <p class="stat-value">{{ totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} TL</p>
          </div>
        </div>
        
        <div class="stat-card balance-card" :class="{ 'positive': netBalance >= 0, 'negative': netBalance < 0 }">
          <div class="stat-icon">{{ netBalance >= 0 ? '📈' : '📉' }}</div>
          <div class="stat-details">
            <p class="stat-label">Net Durum</p>
            <p class="stat-value">{{ netBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }} TL</p>
          </div>
        </div>
      </div>
      
      <!-- Pasta Grafiği -->
      <div class="chart-card">
        <h3 class="chart-title">📊 Gelir / Gider Dağılımı</h3>
        <div class="chart-wrapper">
          <PieChart :chartData="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="grid-container">
      <div class="add-transaction-section">
        <AddTransaction @transaction-added="handleTransactionAdded" />
      </div>

      <div class="transaction-list-section">
        <TransactionList :key="refreshKey" /> 
      </div>
    </div>
  </div>
</template>

<style scoped>
.tracking-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

/* Modern Header */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  animation: slideDown 0.6s ease-out;
}

.header-content {
  text-align: center;
}

.page-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 300;
}

/* Grid Layout */
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Özet Kartlar ve Pasta Grafik */
.summary-section {
  display: grid;
  gap: 25px;
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 3rem;
  line-height: 1;
}

.stat-details {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.income-card {
  border-left: 4px solid #10b981;
}

.expense-card {
  border-left: 4px solid #ef4444;
}

.balance-card.positive {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.balance-card.negative {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

/* Pasta Grafiği Kartı */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.chart-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  text-align: center;
}

.chart-wrapper {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Desktop görünümü */
@media (min-width: 992px) {
  .grid-container {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 30px;
  }
  
  .summary-section {
    grid-template-columns: 2fr 1fr;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .summary-section {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    max-width: 350px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }
  .page-subtitle {
    font-size: 0.9rem;
  }
  .dashboard-header {
    padding: 25px 20px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    font-size: 2.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .chart-wrapper {
    max-width: 300px;
  }
  
  .chart-title {
    font-size: 1.2rem;
  }
}
</style>