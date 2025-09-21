import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        host: true,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
            '/media': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    }
})