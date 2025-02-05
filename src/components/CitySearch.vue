<template>
    <div v-if="active">
        <div class="fixed top-4 right-4 bg-yellow-200 text-black p-4 rounded-lg shadow-lg z-50 animate-slide-in-top w-96  contrast:bg-contrast-primary">
        <div class="relative">
          <!-- Search Input -->
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Adresse suchen..."
            class="w-full p-2 border border-gray-300  pr-10"
          />
          
          <!-- Clear/Close Button -->
          <button 
            @click="clearSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <!-- Search Results -->
        <div v-if="results.length > 0" class="mt-2 max-h-60 overflow-y-auto contrast:text-contrast-primary contrast-hover:!bg-contrast-hover">
          <div 
            v-for="result in results" 
            :key="result.place_id"
            class="p-2 hover:bg-gray-100 cursor-pointer rounded contrast:text-contrast-primary contrast-hover:!bg-contrast-hover"
            @click="selectLocation(result)"
          >
            {{ result.display_name }}
          </div>
        </div>
  
        <!-- Loading State -->
        <div v-if="isLoading" class="mt-2 text-gray-600 text-center">
          Suche läuft...
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { defineProps } from 'vue'
  import { fromLonLat } from 'ol/proj'
  
  const props = defineProps({
    map: {
      type: Object,
      required: true
    },
    active: Boolean
  })
  
 
  const searchQuery = ref('')
  const results = ref([])
  const isLoading = ref(false)
  let debounceTimeout = null
  
  // Search function with debounce
  const searchCity = async (query) => {
    if (!query.trim()) {
      results.value = []
      return
    }
  
    isLoading.value = true
    try {
      const encodedQuery = encodeURIComponent(query)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=5&countrycodes=de`
      )
      const data = await response.json()
      results.value = data
    } catch (error) {
      console.error('Error searching for city:', error)
      results.value = []
    } finally {
      isLoading.value = false
    }
  }
  
  // Debounced search
  watch(searchQuery, (newQuery) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      searchCity(newQuery)
    }, 300) // 300ms debounce
  })
  
  // Select a location and zoom to it
  const selectLocation = (location) => {
    const { lat, lon } = location
    const view = props.map.getView()
    
    // Convert coordinates from EPSG:4326 to the map's projection (usually EPSG:3857)
    const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)])
    
    view.animate({
      center: coordinates,
      zoom: 13,
      duration: 1000
    })
  
    clearSearch()
  }
  
  // Clear search and close
  const clearSearch = () => {
    searchQuery.value = ''
    results.value = []
  }
  
  // Cleanup on component unmount
  watch(() => props.active, (newValue) => {
    if (!newValue) {
      clearSearch()
    }
  })
  </script>