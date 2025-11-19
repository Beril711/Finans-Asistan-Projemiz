import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

// Yeni: Axios'u içeri aktar
import axios from 'axios'
// Yeni: Auth Store'u içeri aktar
import { useAuthStore } from './stores/auth' 


const app = createApp(App)

app.use(createPinia())

// Yeni: Axios'a Interceptor Ekleme
// Bu, her API isteği gönderilmeden önce token'ı alıp Authorization başlığına ekler.
axios.interceptors.request.use(config => {
  const authStore = useAuthStore() // Pinia store'a erişim
  const token = authStore.accessToken
  
  if (token) {
    // JWT Token'ı Başlığa Ekle
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})
// Yeni Kod Sonu

app.use(router)

app.mount('#app')