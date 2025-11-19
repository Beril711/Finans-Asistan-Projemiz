<script setup>
import { ref, watch, onMounted } from 'vue';
import { getTransactions, deleteTransaction } from '@/api/trackingService'; // Servis fonksiyonlarını içeri aktar

// Tanımlamalar
const transactions = ref([]);
const isLoading = ref(true);
const errorMsg = ref(null);

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
    // En yeni işlemi en üstte göstermek için ters çeviriyoruz
    transactions.value = response.data.reverse(); 
  } catch (error) {
    console.error("İşlemleri çekme hatası:", error);
    errorMsg.value = "İşlemler yüklenirken hata oluştu.";
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
</script>

<template>
  <div class="transaction-list-container">
    <h2>Son İşlemler</h2>
    
    <div v-if="isLoading" class="loading-state">
      İşlemler yükleniyor...
    </div>

    <div v-else-if="errorMsg" class="alert error-list">
      {{ errorMsg }}
    </div>

    <div v-else-if="transactions.length === 0" class="no-data">
      Henüz bir işlem kaydınız yok. Lütfen soldaki formu kullanarak ekleyin!
    </div>

    <div v-else class="transaction-table-wrapper">
      <table class="transaction-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Açıklama</th>
            <th>Kategori</th>
            <th>Tip</th>
            <th>Miktar (TL)</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id">
            <td>{{ t.date }}</td>
            <td>{{ t.description || '-' }}</td>
            <td>{{ t.category_name }}</td> 
            <td><span :class="getTypeText(t.transaction_type).class">{{ getTypeText(t.transaction_type).text }}</span></td>
            <td :class="t.transaction_type === 'EXPENSE' ? 'expense-amount' : 'income-amount'">
              {{ t.amount.toFixed(2) }} TL
            </td>
            <td>
              <button @click="handleDelete(t.id)" class="delete-btn">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.transaction-list-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: auto; /* Küçük ekranlarda tablonun kaydırılmasını sağlar */
}
h2 {
  color: #2d3748;
  margin-bottom: 20px;
}
.loading-state, .no-data {
  text-align: center;
  padding: 30px;
  color: #718096;
}
.transaction-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Tablonun mobil görünümde bile okunur kalmasını sağlar */
}
.transaction-table th, .transaction-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #edf2f7;
}
.transaction-table th {
  background-color: #f7fafc;
  font-weight: bold;
  color: #4a5568;
}

/* Tip ve Miktar Stilleri */
.type-expense {
  color: #c53030;
  font-weight: bold;
}
.type-income {
  color: #38a169;
  font-weight: bold;
}
.expense-amount {
  color: #c53030;
  font-weight: bold;
}
.income-amount {
  color: #38a169;
  font-weight: bold;
}
.delete-btn {
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: background-color 0.2s;
}
.delete-btn:hover {
  background-color: #c53030;
}
</style>