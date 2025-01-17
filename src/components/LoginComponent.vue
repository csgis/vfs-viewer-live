// Login.vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Anmelden
        </h2>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- Error Alert -->
        <div v-if="error" class=" bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div class=" shadow-sm -space-y-px">
          <!-- Username Field -->
          <div>
            <label for="username" class="sr-only">Benutzername</label>
            <input 
              id="username" 
              name="username" 
              type="text" 
              v-model="username"
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
              placeholder="Benutzername"
              :disabled="isLoading"
            >
          </div>
          <!-- Password Field -->
          <div>
            <label for="password" class="sr-only">Passwort</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              v-model="password"
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
              placeholder="Passwort"
              :disabled="isLoading"
            >
          </div>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center">
          <input 
            id="remember-me" 
            name="remember-me" 
            type="checkbox" 
            v-model="rememberMe"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          >
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Angemeldet bleiben
          </label>
        </div>

        <!-- Submit Button -->
        <div>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium  text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- Loading Spinner -->
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Anmeldung läuft...' : 'Anmelden' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const result = await authStore.login({
      username: username.value,
      password: password.value,
      rememberMe: rememberMe.value
    })

    // Check for map_extent in the response
    if (result.data.map_extent) {
      console.log('Map extent received:', result.data.map_extent)
    } else {
      console.log('No map extent provided by server')
    }

    router.push('/')
  } catch (error) {
    console.error('Login error details:', error)
    error.value = error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
  } finally {
    isLoading.value = false
  }
}
</script>