import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Must match CLIENT_URL in backend/.env (CORS). strictPort makes Vite
    // fail loudly instead of silently moving to a port the backend rejects.
    port: 3000,
    strictPort: true,
  },
})
