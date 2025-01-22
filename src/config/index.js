// src/config/index.js

// Environment detection helpers
const getEnvironmentType = () => {
  const env = process.env.NODE_ENV || 'development'
  const isProductionBuild = process.env.NODE_ENV === 'production'
  const isStagingMode = isProductionBuild && process.env.VUE_APP_MODE === 'staging'
  
  return {
      current: env,
      isDevelopment: env === 'development',
      isStaging: isStagingMode,
      isProduction: isProductionBuild && !isStagingMode
  }
}

const environment = getEnvironmentType()

// Base configuration object
export const config = {
  // Environment
  env: environment.current,
  isDevelopment: environment.isDevelopment,
  isStaging: environment.isStaging,
  isProduction: environment.isProduction,

  // API Configuration
  API_BASE_URL: process.env.VUE_APP_API_BASE_URL,
  GEOSERVER_URL: process.env.VUE_APP_GEOSERVER_URL,

  // Auth related settings
  auth: {
      tokenKey: 'atlas_token',
      refreshTokenKey: 'atlas_refresh_token',
      expiresKey: 'atlas_token_expires'
  },

  // API endpoints
  endpoints: {
      auth: {
          login: '/auth/token',
          refresh: '/auth/refresh',
          me: '/auth/me'
      },
      fachschalen: '/fachschalen',
      geoserver: '/geoserver',
      baumarten: '/baumarten'
  },

  // Default request settings
  api: {
      timeout: 30000,
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
  },

  // Map configuration
  map: {
      defaultZoom: 13,
      maxZoom: 19,
      minZoom: 5
  }
}

// Environment helper exports
export const isDevelopment = environment.isDevelopment
export const isStaging = environment.isStaging
export const isProduction = environment.isProduction

// Backwards compatibility exports
export const API_BASE_URL = config.API_BASE_URL
export const GEOSERVER_URL = config.GEOSERVER_URL

// Debug logging in development
if (isDevelopment) {
  console.log('Current configuration:', {
      environment: config.env,
      API_BASE_URL: config.API_BASE_URL,
      GEOSERVER_URL: config.GEOSERVER_URL
  })
}

// Validate required environment variables
const requiredVars = ['VUE_APP_API_BASE_URL', 'VUE_APP_GEOSERVER_URL']
const missing = requiredVars.filter(key => !process.env[key])
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

export default config