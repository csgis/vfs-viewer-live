// stores/authStore.js
import { defineStore } from 'pinia'

const API_URL = 'http://localhost:8000'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: null,
    mapExtent: localStorage.getItem('mapExtent') 
      ? JSON.parse(localStorage.getItem('mapExtent')) 
      : null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    
    authHeaders: (state) => ({
      'Authorization': `Bearer ${state.token}`,
      'Content-Type': 'application/json'
    })
  },

  actions: {
    async login({ username, password, rememberMe }) {
      try {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)
        
        console.log('Sending login request with:', {
          url: `${API_URL}/token`,
          body: formData.toString(),
          credentials: 'include'
        })
    
        const response = await fetch(`${API_URL}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: formData
        })
    
        console.log('Response status:', response.status)
        const responseData = await response.json()
        console.log('Response data:', responseData)
    
        if (!response.ok) {
          throw new Error(responseData.detail || 'Anmeldung fehlgeschlagen')
        }
    
        const { access_token, map_extent } = responseData
        this.token = access_token
        
        if (map_extent) {
          this.mapExtent = map_extent
          if (rememberMe) {
            localStorage.setItem('mapExtent', JSON.stringify(map_extent))
          }
        }
            
        // After getting the token, fetch the user info
        await this.fetchUserInfo()
    
        if (rememberMe) {
          localStorage.setItem('token', access_token)
        }
    
        return { 
          data: { 
            access_token, 
            user: this.user,
            map_extent: map_extent 
          } 
        }
      } catch (error) {
        console.error('Login error:', error)
        this.logout()
        throw error
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.mapExtent = null
      localStorage.removeItem('token')
      localStorage.removeItem('mapExtent')
    },

    // Other methods remain the same...
    async fetchUserInfo() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: this.authHeaders
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user info')
        }

        this.user = await response.json()
      } catch (error) {
        console.error('Error fetching user info:', error)
        throw error
      }
    },

    async checkAuth() {
      if (!this.token) {
        this.logout()
        return false
      }

      try {
        await this.fetchUserInfo()
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    async fetchWithAuth(url, options = {}) {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
          ...this.authHeaders,
          ...options.headers
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'API Anfrage fehlgeschlagen')
      }

      return response.json()
    }
  }
})