import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
      proxy: {
        '/geoserver': {
          target: 'https://geoserver-vfs.csgis.de',
          changeOrigin: true,
          secure: true, // If the WMS server uses a valid SSL certificate
          rewrite: (path) => path.replace(/^\/geoserver/, ''),
        }
      }
    }
  })
  