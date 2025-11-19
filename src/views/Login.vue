<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Pinia Store'u içeri aktar

const router = useRouter()
const authStore = useAuthStore()

// Reaktif form verileri
const username = ref('testuser') // testuser ile önceden doldurulmuş
const password = ref('securepassword123') // securepassword123 ile önceden doldurulmuş
const errorMsg = ref(null) // Hata mesajı için
const isLoading = ref(false) // Yükleniyor durumu için

// Giriş işlemini gerçekleştiren fonksiyon
const handleLogin = async () => {
  errorMsg.value = null // Önceki hataları temizle
  isLoading.value = true

  try {
    // Pinia Store içindeki login aksiyonunu çağır
    await authStore.login(username.value, password.value)

    // Giriş başarılı: Kullanıcıyı ana sayfaya yönlendir
    router.push('/')

  } catch (error) {
    // Giriş başarısız: Hata mesajını göster
    isLoading.value = false
    
    // Backend'den gelen detaylı hata mesajını yakalama
    if (error.response && error.response.data.detail) {
      errorMsg.value = error.response.data.detail
    } else {
      errorMsg.value = "Giriş başarısız oldu. Lütfen kullanıcı adı ve şifrenizi kontrol edin."
    }
    
    // Yanlış şifre girildiğinde konsola da hata basarız
    console.error("Login Hata:", error.response || error)
  }
}
</script>

<template>
  <div class="login-container">
    <h1 class="page-title">Giriş Yap</h1>

    <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>

    <form @submit.prevent="handleLogin" class="auth-form">
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
        {{ isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
      </button>
    </form>
    
    <div class="footer-link">
      Hesabınız yok mu? 
      <router-link to="/register">Kayıt Ol</router-link>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-First Stil: Genel Form Yapısı */
.login-container {
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
  box-sizing: border-box; /* Padding'i genişliğe dahil et */
  font-size: 1em;
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
.footer-link {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9em;
  color: #718096;
}
.footer-link a {
  color: #3182ce;
  text-decoration: none;
}
</style>