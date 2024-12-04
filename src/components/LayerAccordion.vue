<template>
  <div class="w-full">
    <!-- Back Button -->
    <button 
      @click="$emit('back')"
      class="w-full mb-4 p-3 flex items-center text-black-800 hover:bg-gray-700 rounded-lg"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Zurück
    </button>

    <!-- Layer Groups -->
    <div class="space-y-2">
      <!-- Map Contents -->
      <div class="border border-gray-700 rounded-lg overflow-hidden">
        <button 
          @click="toggleSection('mapContents')"
          class="w-full p-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700"
        >
          <span class="font-medium">Karteninhalte</span>
          <svg 
            class="w-5 h-5 transform transition-transform"
            :class="{ 'rotate-180': openSections.mapContents }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openSections.mapContents" class="p-3 bg-gray-700 border-t border-gray-600 max-h-96 overflow-y-auto">
          <div class="space-y-2">
            <!-- Map Layers -->
            <div 
              v-for="layerName in layerOrder.filter(name => !['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name))" 
              :key="layerName"
              class="space-y-1 p-2 cursor-move bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              :class="{
                'opacity-50': dragTarget === layerName,
                'border-t-2 border-blue-500': dragTarget === layerName
              }"
              draggable="true"
              @dragstart="handleDragStart($event, layerName)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @dragenter="handleDragEnter($event, layerName)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, layerName)"
            >
              <label class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
                <input type="checkbox" v-model="layers[layerName]" @change="toggleLayer(layerName)">
                <span>{{ getLayerLabel(layerName) }}</span>
              </label>
              <div v-if="layers[layerName] && legends[layerName]" class="pl-6 mt-1">
                <img 
                  :src="legends[layerName]" 
                  :alt="'Legend for ' + getLayerLabel(layerName)"
                  class="max-w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Protected Areas -->
      <div class="border border-gray-700 rounded-lg overflow-hidden">
        <button 
          @click="toggleSection('protectedAreas')"
          class="w-full p-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700"
        >
          <span class="font-medium">Schutzgebiete</span>
          <svg 
            class="w-5 h-5 transform transition-transform"
            :class="{ 'rotate-180': openSections.protectedAreas }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openSections.protectedAreas" class="p-3 bg-gray-700 border-t border-gray-600 max-h-96 overflow-y-auto">
          <div class="space-y-2">
            <!-- Protected Area Layers -->
            <div 
              v-for="layerName in layerOrder.filter(name => ['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name))"
              :key="layerName"
              class="space-y-1 p-2 cursor-move bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              :class="{
                'opacity-50': dragTarget === layerName,
                'border-t-2 border-blue-500': dragTarget === layerName
              }"
              draggable="true"
              @dragstart="handleDragStart($event, layerName)"
              @dragend="handleDragEnd"
              @dragover="handleDragOver"
              @dragenter="handleDragEnter($event, layerName)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, layerName)"
            >
              <label class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
                <input type="checkbox" v-model="layers[layerName]" @change="toggleLayer(layerName)">
                <span>{{ getLayerLabel(layerName) }}</span>
              </label>
              <div v-if="layers[layerName] && legends[layerName]" class="pl-6 mt-1">
                <img 
                  :src="legends[layerName]" 
                  :alt="'Legend for ' + getLayerLabel(layerName)"
                  class="max-w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Background -->
      <div class="border border-gray-700 rounded-lg overflow-hidden">
        <button 
          @click="toggleSection('background')"
          class="w-full p-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700"
        >
          <span class="font-medium">Hintergrund</span>
          <svg 
            class="w-5 h-5 transform transition-transform"
            :class="{ 'rotate-180': openSections.background }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openSections.background" class="p-3 bg-gray-700 border-t border-gray-600">
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="none" v-model="selectedBackground" @change="changeBackground">
              <span>Kein Hintergrund</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="osm" v-model="selectedBackground" @change="changeBackground">
              <span>OSM</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="webatlas" v-model="selectedBackground" @change="changeBackground">
              <span>WebAtlasDe.light</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="luftbilder" v-model="selectedBackground" @change="changeBackground">
              <span>Luftbilder WMS DOP 20</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

  <script>
import { ref, watch, onUnmounted } from 'vue'
import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import OSM from 'ol/source/OSM'
import TileWMS from 'ol/source/TileWMS'
import { useMapLayers } from '../composables/useMapLayers'
export default {
  name: 'LayerAccordion',
  props: {
    map: {
      type: Object,
      required: true
    }
  },
  emits: ['back'],
  setup(props) {

    // In LayerAccordion setup
    const { activeBackgroundType, setBackground } = useMapLayers()

    const legends = ref({})
    // Replace selectedBackground with activeBackgroundType
    const selectedBackground = activeBackgroundType

    // Replace changeBackground with
    const changeBackground = () => {
    setBackground(selectedBackground.value, props.map)
    }

    const dragTarget = ref(null)

    const layerOrder = ref([
        'soilNutrients',
        'regierungsbezirk',
        'landkreis',
        'gemeinde',
        'flurkartenSchnitt',
        'kartiergebiete',
        'trinkwasser',           // Added protected areas
        'landschaftsschutz',     // Added protected areas
        'naturschutz'           // Added protected areas
      ])


      const getLayerLabel = (layerName) => {
        const labels = {
          flurkartenSchnitt: 'Flurkartenschnitt 1:5.000',
          regierungsbezirk: 'Regierungsbezirk',
          landkreis: 'Landkreis',
          gemeinde: 'Gemeinde',
          kartiergebiete: 'Kartiergebiete des VFS',
          soilNutrients: 'Boden Typ',
          trinkwasser: 'Trinkwasserschutzgebiete',
          landschaftsschutz: 'Landschaftsschutzgebiete',
          naturschutz: 'Naturschutzgebiete'
        }
        return labels[layerName] || layerName
      }

    const handleDragEnter = (e, layerName) => {
      e.preventDefault()
      dragTarget.value = layerName
    }

    const handleDragLeave = (e) => {
      e.preventDefault()
      dragTarget.value = null
    }

    const updateLayerZIndices = () => {
      layerOrder.value.forEach((layerName, index) => {
        const layer = wmsLayers.get(layerName)
        if (layer) {
          // Add 1 to index to ensure no negative z-indices
          // Multiply by 10 to leave room for fine-tuning if needed
          layer.setZIndex((layerOrder.value.length - index) * 10)
        }
      })
    }


    const handleDragStart = (e, layerName) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', layerName)
  e.target.classList.add('opacity-50')
}

const handleDragEnd = (e) => {
  e.target.classList.remove('opacity-50')
}

const handleDragOver = (e) => {
  if (e.preventDefault) {
    e.preventDefault()
  }
  e.dataTransfer.dropEffect = 'move'
  return false
}

const handleDrop = (e, targetLayerName) => {
  e.stopPropagation()
  e.preventDefault()
  
  const sourceLayerName = e.dataTransfer.getData('text/plain')
  
  if (sourceLayerName === targetLayerName) {
    return
  }
  
  // Update order
  const newOrder = [...layerOrder.value]
  const sourceIndex = newOrder.indexOf(sourceLayerName)
  const targetIndex = newOrder.indexOf(targetLayerName)
  
  newOrder.splice(sourceIndex, 1)
  newOrder.splice(targetIndex, 0, sourceLayerName)
  
  layerOrder.value = newOrder
  updateLayerZIndices()
  dragTarget.value = null  // Clear drag target
}


    const getLegendUrl = (layerName) => {
        const wmsConfig = {
          default: {
            url: 'https://geoserver-vfs.csgis.de/geoserver/wms',
            version: '1.3.0'
          },
          soilNutrients: {
            url: 'https://services.bgr.de/wms/boden/buek1000en/',
            version: '1.3.0'
          }
        }

        const config = wmsConfig[layerName] || wmsConfig.default
        const layerSource = layerSources[layerName]

        return `${config.url}?REQUEST=GetLegendGraphic&VERSION=${config.version}&FORMAT=image/png&LAYER=${layerSource}`
      }

      const loadLegend = async (layerName) => {
        if (!layers.value[layerName]) {
          legends.value[layerName] = null
          return
        }

        const legendUrl = getLegendUrl(layerName)
        legends.value[layerName] = legendUrl
      }

    const openSections = ref({
      mapContents: true,
      protectedAreas: false,
      background: false
    })

    const layers = ref({
      flurkartenSchnitt: false,
      regierungsbezirk: false,
      landkreis: false,
      gemeinde: false,
      kartiergebiete: true,
      trinkwasser: false,
      landschaftsschutz: false,
      naturschutz: false,
      soilNutrients: false
    })

    const wmsLayers = new Map()
    const backgroundLayers = ref({})
    const activeBackgroundLayer = ref(null)

    const layerSources = {
      flurkartenSchnitt: 'admin_boundaries:flurkarte',
      regierungsbezirk: 'admin_boundaries:regierungsbezirke',
      landkreis: 'admin_boundaries:landkreise',
      gemeinde: 'admin_boundaries:gemeinden',
      kartiergebiete: 'vfs:kartiergebiete',
      trinkwasser: 'schutzgebiete:twsg',
      landschaftsschutz: 'schutzgebiete:landschafts',
      naturschutz: 'schutzgebiete:natur',
      soilNutrients: '0'
    }

    const createBackgroundLayer = (type) => {
      if (type === 'none') return null;

      const sources = {
        osm: () => new OSM({
          crossOrigin: 'anonymous',
          wrapX: false,
        }),
        webatlas: () => new TileWMS({
          url: 'https://sgx.geodatenzentrum.de/wms_basemapde',
          params: {
            'LAYERS': 'de_basemapde_web_raster_farbe',
            'FORMAT': 'image/png',
            'VERSION': '1.3.0'
          },
          crossOrigin: 'anonymous',
          wrapX: false
        }),
        luftbilder: () => new TileWMS({
          url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20',
          params: {
            'LAYERS': 'by_dop20c',
            'FORMAT': 'image/png',
            'VERSION': '1.3.0'
          },
          crossOrigin: 'anonymous',
          wrapX: false
        })
      }

      if (!sources[type]) return null;

      return new TileLayer({
        source: sources[type](),
        zIndex: 0,
        visible: true
      })
    }

    const initializeBackgroundLayers = () => {
      if (selectedBackground.value !== 'none') {
        const layer = createBackgroundLayer(selectedBackground.value)
        if (layer) {
          backgroundLayers.value[selectedBackground.value] = layer
          activeBackgroundLayer.value = layer
          props.map.addLayer(layer)
        }
      }
    }

    const toggleSection = (section) => {
      openSections.value[section] = !openSections.value[section]
    }

    const createWMSLayer = (layerName) => {
      const wmsConfig = {
        default: {
          url: 'https://geoserver-vfs.csgis.de/geoserver/wms',
          version: '1.3.0'
        },
        soilNutrients: {
          url: 'https://services.bgr.de/wms/boden/buek1000en/',
          version: '1.3.0'
        }
      }

      // Define zIndex for each layer type
      const zIndexMap = {
        soilNutrients: 1,           // BGR soil layer at bottom
        regierungsbezirk: 2,        // Administrative boundaries in the middle
        landkreis: 3,
        gemeinde: 4,
        flurkartenSchnitt: 5,
        kartiergebiete: 10          // VFS Kartiergebiete always on top
      }

      const config = wmsConfig[layerName] || wmsConfig.default
      const zIndex = zIndexMap[layerName] || 5 // Default zIndex if not specified

      return new ImageLayer({
        source: new ImageWMS({
          url: config.url,
          params: {
            'LAYERS': layerSources[layerName],
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': config.version
          },
          crossOrigin: 'anonymous',
          ratio: 1,
          wrapX: false
        }),
        zIndex: zIndex
      })
    }


    const toggleLayer = (layerName) => {
  if (!props.map) return

  const isActive = layers.value[layerName]
  let layer = wmsLayers.get(layerName)
  
  if (isActive) {
    if (!layer) {
      layer = createWMSLayer(layerName)
      wmsLayers.set(layerName, layer)
      props.map.addLayer(layer)
    } else {
      layer.setVisible(true)
    }
    // Load legend when layer is activated
    loadLegend(layerName)
  } else {
    if (layer) {
      layer.setVisible(false)
    }
    // Clear legend when layer is deactivated
    legends.value[layerName] = null
  }
}



    // Watch for map availability
    watch(() => props.map, (newMap) => {
      if (newMap) {
        console.log('Map available, initializing layers')
        initializeBackgroundLayers()
        
        // Initialize default layers
        if (layers.value.kartiergebiete) {
          toggleLayer('kartiergebiete')
        }
      }
    }, { immediate: true })

    // Watch for background changes
    watch(() => selectedBackground.value, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        changeBackground()
      }
    })

    // Watch for layer changes to update z-indices
    watch(() => wmsLayers.size, () => {
      updateLayerZIndices()
    })

    // Watch for layer changes
    watch(layers, (newLayers) => {
      Object.entries(newLayers).forEach(([layerName, isActive]) => {
        const currentLayer = wmsLayers.get(layerName)
        if (isActive && !currentLayer) {
          toggleLayer(layerName)
        } else if (!isActive && currentLayer) {
          toggleLayer(layerName)
        }
      })
    }, { deep: true })

    // Cleanup on unmount
    onUnmounted(() => {
      console.log("Unmounted");

      // In this case, we don't need to manually remove layers from the map as it's destroyed in App.vue
      if (props.map) {
        if (activeBackgroundLayer.value) {
          props.map.removeLayer(activeBackgroundLayer.value);
        }
        wmsLayers.forEach(layer => {
          props.map.removeLayer(layer);
        });

        // In case the map is not being destroyed by parent, make sure we clear it properly here.
        props.map.setTarget(null); // Optional if we want to make sure it is detached
      }
    });

    return {
      openSections,
      layers,
      legends,
      selectedBackground,
      toggleSection,
      toggleLayer,
      changeBackground,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      layerOrder,
      dragTarget,
      getLayerLabel
    }
  }
}
  </script>