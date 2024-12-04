import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/HomeComponent.vue')
    },
    {
      path: '/karte',
      name: 'map',
      component: () => import('../components/MapViewer.vue')
    },
    {
      path: '/fachschalen',
      name: 'fachschalen',
      component: () => import('../components/FachschalenComponent.vue')
    }
  ]
})

export default router