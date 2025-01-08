<template>

            <div 
                v-cloak
                v-show="showMainSidebar" 
                class="fixed top-0 left-0 w-1/4 bg-white shadow-lg flex flex-col h-screen z-[100]"
            >
                <!-- Header -->
            <div class="p-4 border-b border-gray-200">
                <img 
                src="img/logo2.svg" 
                alt="Logo" 
                class="h-8 object-contain"
                />
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 p-4">
                <button 
                @click="navigateTo('/')"
                class="w-full text-left mb-2 p-3 rounded-lg text-black hover:bg-gray-300 transition-colors"
                :class="{ 'bg-blue-900 text-blue-200': currentPath === '/' }"
                >
                <div class="flex items-center">
                    <img src="../assets/home.svg" class="w-5 h-5 mr-3" alt="Home"> Startseite
                </div>
                </button>
                <button 
                @click="navigateTo('/karte')"
                class="w-full text-left mb-2 p-3 rounded-lg text-black hover:bg-gray-300 transition-colors"
                :class="{ 'bg-blue-900 text-blue-200': currentPath === '/karte' }"
                >
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Karte
                </div>
                </button>
                <button 
                    @click="authStore.isAuthenticated ? navigateTo('/fachschalen') : null"
                    class="w-full text-left p-3 rounded-lg transition-colors"
                    :class="[
                        currentPath === '/fachschalen' ? 'bg-gray-300 text-black-200' : '',
                        authStore.isAuthenticated 
                        ? 'text-black hover:bg-gray-300' 
                        : 'text-gray-400 cursor-not-allowed'
                    ]"
                    >
                    <div class="flex items-center">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Fachschalen</span>
                        <!-- Optional: Add a lock icon for unauthenticated users -->
                        <svg 
                        v-if="!authStore.isAuthenticated" 
                        class="w-4 h-4 ml-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    </button>

                <button 
                @click="navigateTo('/login')"
                class="w-full text-left p-3 rounded-lg text-black hover:bg-gray-300 transition-colors"
                :class="{ 'bg-gray-300 text-black-200': currentPath === '/login' }"
                >
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {{ authStore.isAuthenticated ? 'Abmelden' : 'Anmelden' }}
                </div>
                </button>

            </nav>
        
            <!-- Footer -->
            <div class="p-4 border-t border-black">
                <p class="text-center text-sm text-gray-600">
                © powered by csgis
                </p>
            </div>
            </div>
  </template>
  <script setup>
    import { computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useUIStore } from '../stores/uiStore'
    import { useAuthStore } from '../stores/authStore'
  
    const uiStore = useUIStore()
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    // Get the sidebar visibility from the store
    const showMainSidebar = computed(() => uiStore.getMainSidebarVisibility)
    
    // Computed properties for route-based conditions
    const currentPath = computed(() => route.path)
    
    // Navigation function
    const navigateTo = (path) => {
    if (path === '/login' && authStore.isAuthenticated) {
        authStore.logout()
        router.push('/')
    } else {
        router.push(path)
        if (path === '/karte') {
        uiStore.hideMainSidebar()
        }
    }
    }
  </script>
