import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Конфигурация Vite для корректной сборки React-приложения.
 * Параметр base необходим для правильной работы ссылок на GitHub Pages.
 */
export default defineConfig({
  plugins: [react()],
  // Замени на '/f1-fan-site/', если имя твоего репозитория отличается
  base: '/f1-fan-site/', 
})