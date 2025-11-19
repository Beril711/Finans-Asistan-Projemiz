<script setup>
import TransactionList from '../component/TransactionList.vue'
import AddTransaction from '../component/AddTransaction.vue'
import { ref } from 'vue';

// Sayfayı yenileme (refresh) mekanizması için bir ref tanımlıyoruz.
// Bu, yeni bir işlem eklendiğinde listenin otomatik güncellenmesini sağlar.
const refreshKey = ref(0);

const handleTransactionAdded = () => {
  // İşlem eklendiğinde refreshKey'i artırarak listeyi yeniden yüklemeye zorlarız
  refreshKey.value += 1;
}
</script>

<template>
  <div class="tracking-dashboard">
    <h1 class="page-title">Harcama Takip Modülü</h1>

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
.page-title {
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

/* Mobile-First: Tüm içerik tek sütunda */
.grid-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Desktop görünümü için Media Query */
@media (min-width: 992px) {
  .grid-container {
    display: grid;
    /* Masaüstünde iki sütun: Form için küçük, Liste için büyük */
    grid-template-columns: 350px 1fr; 
    gap: 40px;
  }
}
</style>