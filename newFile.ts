import type react from '@vitejs/plugin-react';
import type path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'src': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:8000',
            '/health': 'http://localhost:8000',
            '/metrics': 'http://localhost:8000',
        },
    },
});
