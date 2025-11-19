<script setup>
import { ref, onMounted } from 'vue'
import { getCategories, addTransaction } from '@/api/trackingService' // Servis fonksiyonlarını içeri aktar

// Olay yayınlama (parent component'e haber verme)
const emit = defineEmits(['transaction-added'])

// Reaktif veriler
const categories = ref([])
const selectedCategory = ref(null)
const amount = ref(null)
const description = ref('')
const transactionType = ref('EXPENSE') // Varsayılan olarak Gider
const date = ref(new Date().toISOString().split('T')[0]) // Bugünün tarihi (YYYY-MM-DD formatında)

const errorMsg = ref(null)
const isLoading = ref(false)

// Kategorileri API'den çeken fonksiyon
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
    // Varsayılan olarak ilk kategoriyi seç
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0].id
    }
  } catch (error) {
    console.error("Kategori çekme hatası:", error)
    errorMsg.value = "Kategoriler yüklenemedi. Lütfen tekrar deneyin."
  }
}

// Bileşen yüklendiğinde kategorileri çek
onMounted(fetchCategories)


// Yeni işlemi API'ye gönderen fonksiyon
const handleAddTransaction = async () => {
  if (!selectedCategory.value || !amount.value) {
    errorMsg.value = "Miktar ve kategori boş bırakılamaz."
    return
  }
  
  errorMsg.value = null
  isLoading.value = true

  try {
    const transactionData = {
      category: selectedCategory.value,
      transaction_type: transactionType.value,
      amount: amount.value,
      date: date.value,
      description: description.value,
    }

    await addTransaction(transactionData)
    
    // İşlem başarılı: Formu temizle ve listenin yenilenmesi için ana bileşene haber ver
    amount.value = null
    description.value = ''
    isLoading.value = false
    emit('transaction-added') 

  } catch (error) {
    isLoading.value = false
    console.error("İşlem ekleme hatası:", error.response || error)
    errorMsg.value = "İşlem eklenirken bir hata oluştu."
  }
}
</script>

<template>
  <div class="add-transaction-card">
    <h2>Yeni İşlem Ekle</h2>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <form @submit.prevent="handleAddTransaction" class="transaction-form">
      
      <div class="form-group radio-group">
        <label>İşlem Tipi</label>
        <div>
          <input type="radio" id="expense" value="EXPENSE" v-model="transactionType" class="radio-input">
          <label for="expense" class="radio-label expense">Gider</label>
          
          <input type="radio" id="income" value="INCOME" v-model="transactionType" class="radio-input">
          <label for="income" class="radio-label income">Gelir</label>
        </div>
      </div>

      <div class="form-group">
        <label for="category">Kategori Seçin</label>
        <select id="category" v-model="selectedCategory" required :disabled="isLoading">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }} ({{ cat.transaction_type === 'EXPENSE' ? 'Gider' : 'Gelir' }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="amount">Miktar (TL)</label>
        <input 
          id="amount" 
          type="number" 
          step="0.01" 
          v-model.number="amount" 
          required 
          :disabled="isLoading"
          placeholder="Örn: 75.50"
        >
      </div>

      <div class="form-group">
        <label for="date">Tarih</label>
        <input 
          id="date" 
          type="date" 
          v-model="date" 
          required 
          :disabled="isLoading"
        >
      </div>

      <div class="form-group">
        <label for="description">Açıklama (Opsiyonel)</label>
        <input 
          id="description" 
          type="text" 
          v-model="description" 
          :disabled="isLoading"
          placeholder="Akşam yemeği, fatura vb."
        >
      </div>

      <button type="submit" :disabled="isLoading" class="primary-btn">
        {{ isLoading ? 'Ekleniyor...' : 'İşlemi Kaydet' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
/* Mobile-First Tasarım Stilleri */
.add-transaction-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 0.9em;
  color: #4a5568;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-sizing: border-box; 
  font-size: 1em;
}

/* Radio Button Grubu Stili */
.radio-group {
  margin-top: 10px;
}
.radio-group > div {
  display: flex;
  gap: 15px;
}
.radio-input {
  display: none; /* Gerçek radyo butonunu gizle */
}
.radio-label {
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9em;
  border: 2px solid;
  transition: all 0.2s;
}
.expense {
  border-color: #c53030;
  color: #c53030;
}
.income {
  border-color: #38a169;
  color: #38a169;
}
.radio-input:checked + .radio-label.expense {
  background-color: #c53030;
  color: white;
}
.radio-input:checked + .radio-label.income {
  background-color: #38a169;
  color: white;
}

.primary-btn {
  background-color: #3182ce;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
.primary-btn:hover:not(:disabled) {
  background-color: #2c5282;
}
.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-weight: bold;
  background-color: #fed7d7;
  color: #c53030;
  border: 1px solid #c53030;
}
</style>