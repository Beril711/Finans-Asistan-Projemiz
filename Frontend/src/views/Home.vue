<template>
  <div class="home-container">
    <!-- Hero Bölümü -->
    <div class="hero-section">
      <h1 class="main-title">💰 Finans Asistanım</h1>
      <p class="subtitle">Harcamalarını kontrol et, geleceğini planla!</p>
      <div class="welcome-badge">Hoş Geldiniz</div>
    </div>

    <!-- Modül Kartları -->
    <div class="modules-grid">
      <router-link to="/tracking" class="module-card expense-tracker">
        <div class="card-icon">💸</div>
        <h2 class="card-title">Harcama Takibi</h2>
        <p class="card-description">Gelir ve giderlerinizi kolayca yönetin, kategorilere ayırın</p>
        <div class="card-arrow">→</div>
      </router-link>

      <router-link to="/investing" class="module-card investment-simulator">
        <div class="card-icon">📈</div>
        <h2 class="card-title">Yatırım Simülatörü</h2>
        <p class="card-description">Sanal portföyünüzle alım-satım yapın, deneyim kazanın</p>
        <div class="card-arrow">→</div>
      </router-link>
    </div>

    <!-- Özellikler Bölümü -->
    <div class="features-section">
      <div class="feature-item">
        <span class="feature-icon">📊</span>
        <span class="feature-text">Detaylı Raporlar</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🔒</span>
        <span class="feature-text">Güvenli Veri</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">⚡</span>
        <span class="feature-text">Hızlı İşlem</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

/* Hero Bölümü */
.hero-section {
  text-align: center;
  margin-bottom: 50px;
  animation: fadeInDown 0.8s ease-out;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 15px;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 20px;
  font-weight: 300;
}

.welcome-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 10px 25px;
  border-radius: 50px;
  color: white;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Modül Kartları */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto 50px;
  padding: 0 20px;
}

.module-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  transition: height 0.3s ease;
}

.expense-tracker::before {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.investment-simulator::before {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.module-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.module-card:hover::before {
  height: 100%;
  opacity: 0.1;
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 15px;
}

.card-description {
  color: #718096;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-arrow {
  font-size: 2rem;
  color: #667eea;
  font-weight: bold;
  opacity: 0;
  transition: all 0.3s ease;
  text-align: right;
}

.module-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(10px);
}

/* Özellikler Bölümü */
.features-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 600;
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-size: 1rem;
}

/* Animasyonlar */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Responsive Tasarım */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
  
  .features-section {
    flex-direction: column;
    gap: 20px;
  }
}
</style>