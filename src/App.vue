<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Main Sidebar -->
    <div v-show="shouldShowMainSidebar" class="w-80 bg-white shadow-lg flex flex-col">
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
          @click="navigateTo('/fachschalen')"
          class="w-full text-left p-3 rounded-lg text-black hover:bg-gray-300 transition-colors"
          :class="{ 'bg-gray-300 text-black-200': currentPath === '/fachschalen' }"
        >
          <div class="flex items-center">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Fachschalen
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

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Computed properties for route-based conditions
const currentPath = computed(() => route.path)
const shouldShowMainSidebar = computed(() => !route.path.startsWith('/karte'))

// Navigation function
const navigateTo = (path) => {
  router.push(path)
}
</script>