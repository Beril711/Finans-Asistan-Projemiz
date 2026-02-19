<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getCategories, addTransaction, addCategory } from '@/api/trackingService' // Servis fonksiyonlarını içeri aktar

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

// Kategori ekleme modal
const showCategoryModal = ref(false)
const newCategoryName = ref('')
const newCategoryType = ref('EXPENSE')
const categoryError = ref(null)
const isCategoryLoading = ref(false)

// İşlem tipine göre filtrelenmiş kategoriler
const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.type === transactionType.value)
})

// Kategorileri API'den çeken fonksiyon
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
    // Varsayılan olarak filtrelenmiş ilk kategoriyi seç
    if (filteredCategories.value.length > 0) {
      selectedCategory.value = filteredCategories.value[0].id
    }
  } catch (error) {
    console.error("Kategori çekme hatası:", error)
    errorMsg.value = "Kategoriler yüklenemedi. Lütfen tekrar deneyin."
  }
}

// Bileşen yüklendiğinde kategorileri çek
onMounted(fetchCategories)

// İşlem tipi değiştiğinde ilk kategoriyi seç
watch(transactionType, () => {
  if (filteredCategories.value.length > 0) {
    selectedCategory.value = filteredCategories.value[0].id
  } else {
    selectedCategory.value = null
  }
})

// Yeni kategori ekleme
const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) {
    categoryError.value = "Kategori adı boş olamaz."
    return
  }
  
  categoryError.value = null
  isCategoryLoading.value = true

  try {
    const categoryData = {
      name: newCategoryName.value,
      type: newCategoryType.value
    }

    await addCategory(categoryData)
    
    // Başarılı: Kategorileri yeniden yükle ve modalı kapat
    await fetchCategories()
    newCategoryName.value = ''
    showCategoryModal.value = false
    isCategoryLoading.value = false

  } catch (error) {
    isCategoryLoading.value = false
    console.error("Kategori ekleme hatası:", error.response || error)
    categoryError.value = "Kategori eklenirken bir hata oluştu."
  }
}

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
    console.error("İşlem ekleme hatası:", error.response?.data || error)
    errorMsg.value = (error.response?.data && typeof error.response.data === 'object')
      ? Object.values(error.response.data).join(' | ')
      : (error.response?.data || "İşlem eklenirken bir hata oluştu.")
  }
}
</script>

<template>
  <div class="add-transaction-card">
    <h2>Yeni İşlem Ekle</h2>

    <!-- Hata mesajı kullanıcı talebiyle gizlendi -->

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
        <div class="category-header">
          <label for="category">Kategori Seçin</label>
          <button type="button" @click="showCategoryModal = true" class="add-category-btn">
            + Yeni Kategori
          </button>
        </div>
        <select id="category" v-model="selectedCategory" required :disabled="isLoading">
          <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
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

    <!-- Kategori Ekleme Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="showCategoryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Yeni Kategori Ekle</h3>
          <button @click="showCategoryModal = false" class="close-btn">✕</button>
        </div>

        <div v-if="categoryError" class="alert error">{{ categoryError }}</div>

        <form @submit.prevent="handleAddCategory" class="category-form">
          <div class="form-group">
            <label for="newCategoryName">Kategori Adı</label>
            <input 
              id="newCategoryName" 
              type="text" 
              v-model="newCategoryName" 
              required 
              :disabled="isCategoryLoading"
              placeholder="Örn: Tatil, Hobi vb."
            >
          </div>

          <button type="submit" :disabled="isCategoryLoading" class="primary-btn">
            {{ isCategoryLoading ? 'Ekleniyor...' : 'Kategori Ekle' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-transaction-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
  position: sticky;
  top: 20px;
}

.add-transaction-card h2 {
  color: #2d3748;
  font-size: 1.5rem;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 3px solid #667eea;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95em;
  color: #4a5568;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 1em;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Radio Button Grubu */
.radio-group {
  margin-top: 5px;
}

.radio-group > div {
  display: flex;
  gap: 10px;
  width: 100%;
}

.radio-input {
  display: none;
}

.radio-label {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95em;
  border: 2px solid;
  transition: all 0.3s ease;
  text-align: center;
}

.expense {
  border-color: #fc8181;
  color: #c53030;
  background: #fff5f5;
}

.income {
  border-color: #68d391;
  color: #2f855a;
  background: #f0fff4;
}

.radio-input:checked + .radio-label.expense {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: transparent;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
}

.radio-input:checked + .radio-label.income {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-color: transparent;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.primary-btn:active:not(:disabled) {
  transform: translateY(0);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 12px 15px;
  margin-bottom: 20px;
  border-radius: 10px;
  font-weight: 600;
  background: linear-gradient(135deg, #fed7d7 0%, #fc8181 20%);
  color: #742a2a;
  border: 2px solid #fc8181;
  animation: shake 0.5s;
}

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

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

/* Kategori Header */
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.add-category-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-category-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 10px rgba(79, 172, 254, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  font-size: 1.3rem;
  margin: 0;
}

.close-btn {
  background: #fc8181;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e53e3e;
  transform: rotate(90deg);
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>