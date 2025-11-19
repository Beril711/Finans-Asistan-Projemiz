import { createRouter, createWebHistory } from 'vue-router'

// Vue Router ile sayfa bileşenlerini içeri aktaracağız (şimdi oluşturacağız)
// 6. Hafta Görevleri:
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import { useAuthStore } from '@/stores/auth'

// 7. Hafta Görevleri:
import TrackingDashboard from '@/views/TrackingDashboard.vue'
// import InvestingDashboard from '@/views/InvestingDashboard.vue' // Şimdilik yoruma alıyoruz

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home // İki kartlı ana seçim ekranı [cite: 107]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login // Kullanıcı Giriş Sayfası [cite: 106]
  },
  {
    path: '/register',
    name: 'Register',
    component: Register // Kullanıcı Kayıt Sayfası [cite: 106]
  },
  {
    path: '/tracking',
    name: 'Tracking',
    component: TrackingDashboard, // Harcama Takip Modülü [cite: 117]
    meta: { requiresAuth: true } // Bu sayfa giriş yapılmasını gerektirir
  },
  {
    path: '/investing',
    name: 'Investing',
    // component: InvestingDashboard, // Yatırım Simülatörü Modülü 
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth // Rota meta bilgisinde requiresAuth: true var mı?

  if (requiresAuth && !authStore.isAuthenticated) {
    // Rota korumalı VE kullanıcı giriş yapmamışsa
    next('/login') // Giriş sayfasına yönlendir
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    // Kullanıcı giriş yapmışken tekrar Login veya Register sayfasına gitmeye çalışırsa
    next('/') // Ana sayfaya yönlendir
  } else {
    next() // Yönlendirmeye izin ver
  }
})
// YÖNLENDİRME KORUMASI SONU

export default router