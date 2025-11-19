import { defineStore } from 'pinia'
import axios from 'axios' // Axios'u hemen kuracağız

// Backend API'mizin kök URL'si
const API_URL = 'http://localhost:8000/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Token, localStorage'dan alınmaya çalışılır. Yoksa null olur.
    accessToken: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token'), // Token varsa true
    user: null, // Kullanıcı bilgisi (Gelecekte genişletilebilir)
  }),
  
  actions: {
    // A. Yeni Tokenı Kaydetme Fonksiyonu
    saveToken(token) {
      this.accessToken = token
      this.isAuthenticated = true
      localStorage.setItem('access_token', token)
    },

    // B. Giriş İşlemi (POST /api/token/)
    async login(username, password) {
      try {
        const response = await axios.post(`${API_URL}/token/`, {
          username,
          password
        })
        
        // Başarılı olursa tokenı kaydet
        this.saveToken(response.data.access)
        return true // Başarılı giriş
      } catch (error) {
        // Hata durumunda (401 vb.)
        this.logout() // Her ihtimale karşı temizle
        throw error // Hatayı yakalaması için bileşene geri fırlat
      }
    },

    // C. Kayıt İşlemi (POST /api/register/)
    async register(username, password) {
      // Backend'deki register endpoint'inin yapısına uygun olarak sadece username ve password gönderilir
      await axios.post(`${API_URL}/register/`, {
        username,
        password
      })
      // Kayıt başarılıysa, kullanıcıyı otomatik olarak giriş yapmaya yönlendiririz
    },

    // D. Çıkış İşlemi
    logout() {
      this.accessToken = null
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('access_token')
      // Uygulama çıkışta /login sayfasına yönlendirilebilir (Vue Router ile)
    }
  }
})