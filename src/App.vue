<template>
  <div id="app">
    <header class="app-header">
      <router-link to="/" class="app-title">Finans Asistanım</router-link>
      <nav class="auth-nav">
        <router-link to="/login">Giriş</router-link>
        <router-link to="/register">Kayıt</router-link>
      </nav>
    </header>
    
    <main class="app-content">
      <router-view /> 
    </main>
  </div>
</template>

<style>
/* Basit Mobile-First Global CSS Stilini Sıfırlama */
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #f7fafc; 
}
#app {
  min-height: 100vh;
}
.app-header {
  background-color: #1a202c; /* Koyu arka plan */
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.app-title {
  color: white;
  text-decoration: none;
  font-size: 1.2em;
  font-weight: bold;
}
.auth-nav a {
  color: #a0aec0;
  text-decoration: none;
  margin-left: 15px;
}
.auth-nav a:hover {
  color: white;
}
.app-content {
  padding: 20px;
}
</style>