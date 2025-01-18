import { defineConfig, loadEnv } from 'vite'

import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/geoserver': {
          target: env.VITE_GEOSERVER_URL,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/geoserver/, ''),
        }
      }
    }
  }
})