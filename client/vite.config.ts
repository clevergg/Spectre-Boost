/**
 * vite.config.ts — обновлённый с API proxy.
 *
 * ПРОБЛЕМА:
 * Фронт на tunnel-5173, бэк на tunnel-3000 — разные домены.
 * Chrome считает cookie от бэка "third-party" и блокирует их (CHIPS).
 * Это ломает refresh token и восстановление сессии.
 *
 * РЕШЕНИЕ:
 * Vite proxy. Запросы /api/* идут на тот же домен что и фронт,
 * а Vite dev server проксирует их на бэкенд.
 * Для браузера это same-origin запросы — cookie работают нормально.
 *
 * Фронт делает:  fetch('/api/auth/refresh')
 * Браузер видит:  https://tunnel-5173/api/auth/refresh (same-origin!)
 * Vite перенаправляет на:  http://localhost:3000/api/auth/refresh
 *
 * В .env фронтенда:  VITE_API_URL=/api  (без домена!)
 */

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react({}), tailwindcss()],
  build: {
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@modules": path.resolve(__dirname, "./src/modules"),
    },
  },
  server: {
    proxy: {
      // Все запросы /api/* проксируются на бэкенд
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
