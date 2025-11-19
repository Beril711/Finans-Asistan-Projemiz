<template>
  <div class="home-container">
    <h1>Finans Asistanım</h1>
    [cite_start]<p>Harcamalarını Kontrol Altına Al, Geleceğini Planla! [cite: 17]</p>

    <router-link to="/tracking" class="module-card expense-tracker">
      <h2>💸 Harcamalarımı Takip Et</h2>
      <p>Gelir ve gider kayıtlarınızı yönetin.</p>
    </router-link>

    <router-link to="/investing" class="module-card investment-simulator">
      <h2>📈 Yatırım Simülatörü</h2>
      <p>Sanal bakiyenizle alım-satım yapın, portföyünüzü görün.</p>
    </router-link>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  /* Mobile-First Tasarım */
}
.module-card {
  width: 90%;
  max-width: 400px;
  padding: 20px;
  margin: 15px 0;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none; /* Link stilini kaldır */
  color: white; /* Kart içindeki yazı rengi */
}
.expense-tracker {
  background-color: #e53e3e; /* Kırmızı Ton (Harcama) */
}
.investment-simulator {
  background-color: #38a169; /* Yeşil Ton (Yatırım) */
}
</style>