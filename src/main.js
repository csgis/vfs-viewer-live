import './assets/main.css'
import 'ol/ol.css'
import './assets/ol-overrides.css'

import App from './App.vue'
import { createApp } from 'vue'
import router from './router'

// Add this after OpenLayers CSS


const app = createApp(App)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})