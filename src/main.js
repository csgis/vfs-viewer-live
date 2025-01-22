// app/main.js
import './assets/main.css'
import 'ol/ol.css'
import './assets/ol-overrides.css'

import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { validateConfig } from './config/validate'

// environment handling
validateConfig()

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)

router.isReady().then(() => {
  app.mount('#app')
})