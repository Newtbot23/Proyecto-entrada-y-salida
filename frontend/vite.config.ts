import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En producción (build) usamos el subdirectorio /acces-control/
  // En desarrollo local usamos la raíz /
  base: command === 'build' ? '/acces-control/' : '/',
}))