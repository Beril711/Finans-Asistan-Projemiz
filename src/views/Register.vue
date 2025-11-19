<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const errorMsg = ref(null)
const successMsg = ref(null)
const isLoading = ref(false)

const handleRegister = async () => {
  errorMsg.value = null
  successMsg.value = null
  isLoading.value = true

  try {
    // Pinia Store içindeki register aksiyonunu çağır
    await authStore.register(username.value, password.value)

    // Kayıt başarılı: Kullanıcıyı login sayfasına yönlendir
    successMsg.value = "Kayıt başarılı! Lütfen giriş yapın."
    router.push('/login')

  } catch (error) {
    isLoading.value = false
    
    // Django backend'den gelen spesifik hataları yakalama (örn: 'Bu kullanıcı adı zaten alınmış')
    if (error.response && error.response.data) {
        // Kullanıcı adı hatası gibi özel alan hatalarını göster
        if (error.response.data.username) {
             errorMsg.value = `Kullanıcı Adı Hatası: ${error.response.data.username.join(' ')}`
        } else {
             errorMsg.value = "Kayıt başarısız oldu. Lütfen bilgileri kontrol edin."
        }
    } else {
      errorMsg.value = "Bir sunucu hatası oluştu."
    }
  }
}
</script>

<template>
  <div class="register-container">
    <h1 class="page-title">Kayıt Ol</h1>

    <div v-if="successMsg" class="alert success">{{ successMsg }}</div>
    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="username">Kullanıcı Adı</label>
        <input 
          id="username" 
          type="text" 
          v-model="username" 
          required 
          :disabled="isLoading"
        >
      </div>

      <div class="form-group">
        <label for="password">Şifre</label>
        <input 
          id="password" 
          type="password" 
          v-model="password" 
          required 
          :disabled="isLoading"
        >
      </div>
      
      <button type="submit" :disabled="isLoading" class="primary-btn">
        {{ isLoading ? 'Kaydolunuyor...' : 'Hesap Oluştur' }}
      </button>
    </form>
    
    <div class="footer-link">
      Zaten hesabınız var mı? 
      <router-link to="/login">Giriş Yap</router-link>
    </div>
  </div>
</template>

<style scoped>
/* Login.vue ile aynı stiller, temizlik için */
.register-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
}
.page-title {
  text-align: center;
  margin-bottom: 25px;
  color: #2d3748;
}
.auth-form {
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
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-sizing: border-box; 
  font-size: 1em;
}
.primary-btn {
  background-color: #38a169; /* Kayıt için yeşil renk */
  color: white;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
.primary-btn:hover:not(:disabled) {
  background-color: #276749;
}
.primary-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-weight: bold;
}
.error {
  background-color: #fed7d7;
  color: #c53030;
  border: 1px solid #c53030;
}
.success {
  background-color: #c6f6d5;
  color: #2f855a;
  border: 1px solid #2f855a;
}
.footer-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9em;
  color: #718096;
}
.footer-link a {
  color: #38a169;
  text-decoration: none;
}
</style>