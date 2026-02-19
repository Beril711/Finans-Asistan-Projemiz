<script setup>
import { ref, watch, onMounted } from 'vue';
import { getTransactions, deleteTransaction } from '@/api/trackingService'; // Servis fonksiyonlarını içeri aktar

// Tanımlamalar
const transactions = ref([]);
const isLoading = ref(true);
const errorMsg = ref(null);
const netAmount = ref(0);
const netStatus = ref('neutral'); // 'profit' | 'loss' | 'neutral'
const totalIncome = ref(0);
const totalExpense = ref(0);

// Parent component'ten gelen refreshKey prop'unu alıyoruz
const props = defineProps({
  key: Number, // TrackingDashboard'dan gelen key prop'u
});

// İşlemleri API'den çeken fonksiyon
const fetchTransactions = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    const response = await getTransactions();
    const data = response.data;
    // Gelen veri dizi değilse güvenli biçime çevir
    const list = Array.isArray(data) ? data : (data?.results || []);
    // En yeni işlemi en üstte göstermek için ters çeviriyoruz
    transactions.value = list.reverse(); 

    // Net tutarı hesapla: gelirler - giderler
    totalIncome.value = transactions.value
      .filter(t => t.transaction_type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    totalExpense.value = transactions.value
      .filter(t => t.transaction_type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    netAmount.value = Number((totalIncome.value - totalExpense.value).toFixed(2));
    netStatus.value = netAmount.value > 0 ? 'profit' : (netAmount.value < 0 ? 'loss' : 'neutral');
  } catch (error) {
    console.error("İşlemleri çekme hatası:", error.response?.data || error);
    errorMsg.value = (error.response?.data && typeof error.response.data === 'object')
      ? Object.values(error.response.data).join(' | ')
      : (error.response?.data || "İşlemler yüklenirken hata oluştu.");
  } finally {
    isLoading.value = false;
  }
};

// İşlem silme fonksiyonu
const handleDelete = async (id) => {
  if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
    return;
  }
  
  try {
    await deleteTransaction(id);
    // Silme başarılı olursa listeyi yeniden çek
    fetchTransactions(); 
  } catch (error) {
    console.error("İşlem silme hatası:", error);
    alert('Silme işlemi başarısız oldu.');
  }
};

// Tüm işlemleri toplu silme
const handleDeleteAll = async () => {
  if (transactions.value.length === 0) {
    alert('Silinecek işlem bulunamadı.');
    return;
  }
  if (!confirm(`Listedeki ${transactions.value.length} işlemi silmek istediğinizden emin misiniz?`)) {
    return;
  }
  isLoading.value = true;
  try {
    // Paralel silme işlemleri
    const ids = transactions.value.map(t => t.id);
    await Promise.all(ids.map(id => deleteTransaction(id)));
    await fetchTransactions();
  } catch (error) {
    console.error('Toplu silme hatası:', error.response?.data || error);
    alert('Toplu silme sırasında hata oluştu.');
  } finally {
    isLoading.value = false;
  }
};

// 1. Durum: Bileşen yüklendiğinde işlemleri çek
onMounted(fetchTransactions);

// 2. Durum: Parent component (TrackingDashboard), yeni işlem eklendiğinde key'i güncellediğinde listeyi yeniden çek
watch(() => props.key, () => {
  fetchTransactions();
});

// Yardımcı Fonksiyon: Tipi için renk ve metin döndürür
const getTypeText = (type) => {
  return type === 'EXPENSE' 
    ? { text: 'GİDER', class: 'type-expense' } 
    : { text: 'GELİR', class: 'type-income' };
};

// Tarih formatlama fonksiyonu
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};
</script>

<template>
  <div class="transaction-list-container">
    <div class="list-header">
      <h2>📊 Son İşlemler</h2>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchTransactions" :disabled="isLoading">
        {{ isLoading ? 'Yenileniyor...' : '⟳ Yenile' }}
        </button>
        <button class="delete-all-btn" @click="handleDeleteAll" :disabled="isLoading || transactions.length === 0">
          🗑️ Tümünü Sil
        </button>
      </div>
      <div v-if="!isLoading && transactions.length > 0" class="transaction-count">
        {{ transactions.length }} işlem
      </div>
    </div>

    <div class="summary-row" v-if="!isLoading">
      <div class="summary-card income">
        <div class="label">Toplam Gelir</div>
        <div class="value">{{ totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} TL</div>
      </div>
      <div class="summary-card expense">
        <div class="label">Toplam Gider</div>
        <div class="value">{{ totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} TL</div>
      </div>
      <div class="summary-card" :class="netStatus">
        <div class="label">Net Durum</div>
        <div class="value">{{ netAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} TL</div>
        <div class="status-text">{{ netAmount > 0 ? '📈 Kârda' : (netAmount < 0 ? '📉 Zararda' : '⚖️ Dengede') }}</div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>İşlemler yükleniyor...</p>
    </div>

    <!-- Hata mesajı kullanıcı talebiyle gizlendi -->

    <div v-else-if="transactions.length === 0" class="no-data">
      <div class="no-data-icon">📝</div>
      <h3>Henüz işlem yok</h3>
      <p>Soldaki formu kullanarak ilk işleminizi ekleyin!</p>
    </div>

    <div v-else class="transactions-grid">
      <div v-for="t in transactions" :key="t.id" class="transaction-card" :class="t.transaction_type === 'EXPENSE' ? 'expense-card' : 'income-card'">
        <div class="card-header">
          <span class="transaction-type-badge" :class="t.transaction_type === 'EXPENSE' ? 'badge-expense' : 'badge-income'">
            {{ t.transaction_type === 'EXPENSE' ? '💸 Gider' : '💰 Gelir' }}
          </span>
          <span class="transaction-date">{{ formatDate(t.date) }}</span>
        </div>
        
        <div class="card-body">
          <div class="transaction-category">{{ t.category_name }}</div>
          <div class="transaction-description">{{ t.description || 'Açıklama yok' }}</div>
        </div>
        
        <div class="card-footer">
          <div class="transaction-amount" :class="t.transaction_type === 'EXPENSE' ? 'amount-expense' : 'amount-income'">
            {{ t.transaction_type === 'EXPENSE' ? '-' : '+' }}{{ Number(t.amount).toFixed(2) }} TL
          </div>
          <button @click="handleDelete(t.id)" class="delete-btn">
            <span>🗑️</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-list-container {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 3px solid #667eea;
}
.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}

.summary-card .label {
  font-size: 0.85rem;
  color: #64748b;
}

.summary-card .value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1f2937;
}

.summary-card.income {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.summary-card.expense {
  background: #fef2f2;
  border-color: #fecaca;
}

.summary-card.profit {
  background: #d1fae5;
  border-color: #34d399;
  color: #065f46;
}

.summary-card.loss {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #7f1d1d;
}

.summary-card.neutral {
  background: #e5e7eb;
  border-color: #cbd5e1;
  color: #374151;
}

.summary-card .status-text {
  margin-top: 6px;
  font-weight: 700;
}

.list-header h2 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.transaction-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.refresh-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: #edf2f7;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
  margin-right: 10px;
}

.refresh-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-all-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 10px;
  background: #fee2e2;
  color: #7f1d1d;
  font-weight: 700;
  cursor: pointer;
}

.delete-all-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* No Data State */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-data h3 {
  color: #4a5568;
  margin-bottom: 10px;
}

.no-data p {
  font-size: 0.95rem;
}

/* Transaction Cards Grid */
.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.transaction-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  border: 2px solid;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideUp 0.4s ease-out;
}

.expense-card {
  border-color: #fc8181;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.income-card {
  border-color: #68d391;
  background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
}

.transaction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.transaction-type-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  color: white;
}

.badge-expense {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.badge-income {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.transaction-date {
  color: #718096;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Card Body */
.card-body {
  margin-bottom: 15px;
}

.transaction-category {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 5px;
}

.transaction-description {
  color: #718096;
  font-size: 0.9rem;
  font-style: italic;
}

/* Card Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.transaction-amount {
  font-size: 1.4rem;
  font-weight: 800;
}

.amount-expense {
  color: #e53e3e;
}

.amount-income {
  color: #38a169;
}

.delete-btn {
  background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(229, 62, 62, 0.3);
}

.delete-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(229, 62, 62, 0.4);
}

.delete-btn span {
  display: block;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .transactions-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>