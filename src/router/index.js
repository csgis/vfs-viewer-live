import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/HomeComponent.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/karte',
      name: 'map',
      component: () => import('../components/MapViewer.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/fachschalen',
      name: 'fachschalen',
      component: () => import('../components/FachschalenComponent.vue'),
      meta: { requiresAuth: true }  // Protected route
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/LoginComponent.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath } // Store the intended destination
      })
      return
    }
    
    // Verify token is still valid
    const isValid = await authStore.checkAuth()
    if (!isValid) {
      next({ 
        path: '/login', 
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // Prevent authenticated users from accessing login page
  if (to.name === 'login' && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router