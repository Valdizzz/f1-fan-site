import { defineConfig } from 'vite'
import react from '@vitejs/react-webpack-plugin' // или @vitejs/plugin-react

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ЗАМЕНИ 'f1-fan-site' на название своего репозитория на GitHub!
  base: '/f1-fan-site/', 
})