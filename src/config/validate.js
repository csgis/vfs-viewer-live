// src/config/validate.js
export const validateConfig = () => {
    const required = ['VUE_APP_API_BASE_URL', 'VUE_APP_GEOSERVER_URL']
    
    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }