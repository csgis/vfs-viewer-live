// src/services/api.js
import { config } from '@/config'

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('atlas_token')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      })

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('atlas_refresh_token')
          if (refreshToken) {
            // Try to refresh the token
            const newToken = await this.refreshToken(refreshToken)
            if (newToken) {
              // Retry the original request with new token
              headers.Authorization = `Bearer ${newToken}`
              const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
              })
              if (retryResponse.ok) {
                return retryResponse.json()
              }
            }
          }
          // If refresh failed or no refresh token, clear auth and redirect to login
          this.clearAuth()
          window.location.href = '/login'
        }

        const error = await response.json()
        throw new Error(error.detail || 'An error occurred')
      }

      return response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async get(endpoint) {
    return this.fetchWithAuth(endpoint)
  }

  async post(endpoint, data) {
    return this.fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data) {
    return this.fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.fetchWithAuth(endpoint, {
      method: 'DELETE'
    })
  }

  async login(username, password) {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const response = await fetch(`${this.baseURL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }

    return response.json()
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('atlas_token', data.access_token)
        return data.access_token
      }
      return null
    } catch {
      return null
    }
  }

  clearAuth() {
    localStorage.removeItem('atlas_token')
    localStorage.removeItem('atlas_refresh_token')
  }
}

// Create API instances
export const api = new ApiService(config.API_BASE_URL)
export const geoserver = new ApiService(config.GEOSERVER_URL)