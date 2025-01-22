// stores/authStore.js

import { API_BASE_URL } from '@/config'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    tokenExpiry: localStorage.getItem('tokenExpiry'),
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
    }),
    username: (state) => state.user?.username || ''
  },

  actions: {
    async login({ username, password, rememberMe }) {
      try {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)
        
        console.log('Sending login request with:', {
          url: `${API_BASE_URL}/api/auth/token`,
          body: formData.toString(),
          credentials: 'include'
        })
    
        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
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
    
        const { access_token, refresh_token, map_extent } = responseData
        this.token = access_token
        this.refreshToken = refresh_token

        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 14) // Refresh 1 minute before expiry
        this.tokenExpiry = expiry.getTime()
        
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
          localStorage.setItem('refreshToken', refresh_token)
          localStorage.setItem('tokenExpiry', this.tokenExpiry)
        }

        this.startRefreshTimer()
    
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

    

    getAuthToken() {
      return this.token 
    },

    logout() {
      // Import and use layerStore inside the action to avoid circular dependency
      const { useLayerStore } = require('./layerStore')
      const layerStore = useLayerStore()
      
      // Reset layer store
      layerStore.$reset()
      

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
      }
      
      // Clear auth state
      this.token = null
      this.user = null
      this.mapExtent = null
      this.refreshToken = null
      this.tokenExpiry = null

      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('mapExtent')
      localStorage.removeItem('transformedMapExtent')
      localStorage.removeItem('userPreferences')
      localStorage.removeItem('mapSettings')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiry') 

    },

    startRefreshTimer() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
      }
      
      const now = new Date().getTime()
      const timeUntilRefresh = this.tokenExpiry - now
      
      if (timeUntilRefresh > 0) {
        this.refreshTimer = setTimeout(() => this.refreshAccessToken(), timeUntilRefresh)
      }
    },

    async refreshAccessToken() {
      console.log("refreshing access token")
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.refreshToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Token refresh failed')
        }

        const { access_token } = await response.json()
        this.token = access_token
        
        // Update expiry
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 14)
        this.tokenExpiry = expiry.getTime()
        
        if (localStorage.getItem('token')) {
          localStorage.setItem('token', access_token)
          localStorage.setItem('tokenExpiry', this.tokenExpiry)
        }
        
        // Start new refresh timer
        this.startRefreshTimer()
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.logout()
      }
    },

    async fetchUserInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
      // Check if token needs refresh before making request
      const now = new Date().getTime()
      if (this.tokenExpiry && now >= this.tokenExpiry) {
        await this.refreshAccessToken()
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...this.authHeaders,
          ...options.headers
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token on 401
          try {
            await this.refreshAccessToken()
            // Retry the original request with new token
            return this.fetchWithAuth(url, options)
          } catch (refreshError) {
            this.logout()
            throw new Error('Session expired')
          }
        }
        const error = await response.json()
        throw new Error(error.detail || 'API Anfrage fehlgeschlagen')
      }

      return response.json()
    }
  }
})