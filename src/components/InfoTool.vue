<template>
    <div v-if="active">
      <!-- Instructions Modal -->
      <div class="fixed top-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50">
        {{ message }}
      </div>
  
      <!-- Results Modal - Moved to bottom left -->
      <div 
        v-if="featureInfo" 
        class="fixed left-4 bottom-4 bg-white rounded-lg shadow-lg z-50 max-w-md"
      >
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Kartiergebiet Information</h3>
            <button 
              @click="closeFeatureInfo"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-3">
            <div v-if="featureInfo.kartiergebiet" class="border-b pb-2">
              <div class="font-medium text-gray-700">Kartiergebiet</div>
              <div>{{ featureInfo.kartiergebiet }}</div>
            </div>
  
            <div class="grid grid-cols-2 gap-4">
              <div v-if="featureInfo.waldbesitzer">
                <div class="font-medium text-gray-700">Waldbesitzer</div>
                <a 
                  :href="featureInfo.waldbesitzer_url" 
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800"
                >
                  {{ featureInfo.waldbesitzer }}
                </a>
              </div>
  
              <div v-if="featureInfo.aelf">
                <div class="font-medium text-gray-700">AELF</div>
                <a 
                  :href="featureInfo.aelf_url" 
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800"
                >
                  {{ featureInfo.aelf }}
                </a>
              </div>
            </div>
  
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div v-if="featureInfo.pw_ha != null">
                <div class="font-medium text-gray-700">Privatwald</div>
                <div>{{ featureInfo.pw_ha }} ha</div>
              </div>
              <div v-if="featureInfo.kw_ha != null">
                <div class="font-medium text-gray-700">Körperwald</div>
                <div>{{ featureInfo.kw_ha }} ha</div>
              </div>
              <div v-if="featureInfo.gis_ha != null">
                <div class="font-medium text-gray-700">GIS Fläche</div>
                <div>{{ Math.round(featureInfo.gis_ha * 100) / 100 }} ha</div>
              </div>
            </div>
  
            <div v-if="featureInfo.year" class="mt-2">
              <div class="font-medium text-gray-700">Jahr</div>
              <div>{{ formatDate(featureInfo.year) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onUnmounted } from 'vue'
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    map: {
      type: Object,
      required: true
    },
    active: Boolean
  })
  
  defineEmits(['close'])
  
  const message = ref('Klicken Sie auf die Karte, um Informationen abzufragen')
  const featureInfo = ref(null)
  let mapClickListener = null
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }
  
  const closeFeatureInfo = () => {
    featureInfo.value = null
  }
  
  const makeGetFeatureInfoRequest = async (evt) => {
    const coordinate = evt.coordinate
    const projection = props.map.getView().getProjection().getCode()
    
    // Get pixel coordinates
    const pixel = props.map.getPixelFromCoordinate(coordinate)
    
    // Calculate viewport size
    const size = props.map.getSize()
    
    // Build WMS GetFeatureInfo URL
    const url = new URL('https://geoserver-vfs.csgis.de/geoserver/wms')
    const params = {
      'SERVICE': 'WMS',
      'VERSION': '1.3.0',
      'REQUEST': 'GetFeatureInfo',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'QUERY_LAYERS': 'vfs:kartiergebiete',
      'LAYERS': 'vfs:kartiergebiete',
      'INFO_FORMAT': 'application/json',
      'I': Math.round(pixel[0]),
      'J': Math.round(pixel[1]),
      'WIDTH': size[0],
      'HEIGHT': size[1],
      'CRS': projection,
      'BBOX': props.map.getView().calculateExtent().join(',')
    }
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        featureInfo.value = data.features[0].properties
        message.value = 'Klicken Sie erneut auf die Karte für weitere Informationen'
      } else {
        message.value = 'Keine Informationen an dieser Stelle verfügbar'
        featureInfo.value = null
      }
    } catch (error) {
      console.error('GetFeatureInfo request failed:', error)
      message.value = 'Fehler beim Abrufen der Informationen'
      featureInfo.value = null
    }
  }
  
  const initializeClickListener = () => {
    if (!mapClickListener) {
      mapClickListener = props.map.on('singleclick', makeGetFeatureInfoRequest)
    }
    const mapElement = props.map.getTargetElement()
    if (mapElement) {
      mapElement.style.cursor = 'pointer'  // Changed to pointer
    }
  }
  
  const cleanup = () => {
    if (mapClickListener) {
      props.map.un('singleclick', makeGetFeatureInfoRequest)
      mapClickListener = null
    }
    
    const mapElement = props.map.getTargetElement()
    if (mapElement) {
      mapElement.style.cursor = ''
    }
    
    featureInfo.value = null
    message.value = 'Klicken Sie auf die Karte, um Informationen abzufragen'
  }
  
  // Watch for active state changes
  watch(() => props.active, (newValue) => {
    if (newValue) {
      cleanup()
      initializeClickListener()
    } else {
      cleanup()
    }
  }, { immediate: true })
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  </script>