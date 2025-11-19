import { fileURLToPath, URL } from 'node:url' // Bu import'un mevcut olduğundan emin olun!
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  
  // VİTE'A KISAYOLU TANITAN BLOK:
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})