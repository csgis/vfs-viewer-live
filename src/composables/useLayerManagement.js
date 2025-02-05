import { ref, watch } from 'vue'

import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import TileLayer from 'ol/layer/Tile'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useLayerStore } from '../stores/layerStore'

export function useLayerManagement(providedMap = null) {
  const layerStore = useLayerStore()
  const authStore = useAuthStore()
  const map = ref(providedMap)
  
  const { layers, legends, layerOpacities } = storeToRefs(layerStore)
  
  const wmsLayers = new Map()
  const initialized = ref(false)

  watch(() => layers.value, (newLayers) => {
    Object.entries(newLayers).forEach(([layerName, layerConfig]) => {
      const layer = wmsLayers.get(layerName)
      if (layer) {
        layer.setZIndex(layerConfig.zIndex)
      }
    })
  }, { deep: true })


  const cleanupLayer = (layerName) => {
    if (!map.value) return

    const layer = wmsLayers.get(layerName)
    if (layer) {
      map.value.removeLayer(layer)
      layer.dispose()
      wmsLayers.delete(layerName)
    }
  }



  const updateLayerOpacity = (layerName, value) => {
    layerStore.setLayerOpacity(layerName, value)
    const layer = wmsLayers.get(layerName)
    if (layer) {
      layer.setOpacity(value / 100)
    }
  }

  const getLegendUrl = (layerName) => {
    const layerConfig = layerStore.layers[layerName]
    const wmsConfig = layerStore.getLayerWmsConfig(layerName)

    if (!layerConfig || !wmsConfig) return null

    if (layerName === 'alkisParzellarkarte') {
      return 'https://geodaten.bayern.de/wms/legend/legende_alkis_parzellarkarte_umr.png'
    }

    const params = new URLSearchParams({
      REQUEST: 'GetLegendGraphic',
      VERSION: wmsConfig.version,
      FORMAT: 'image/png',
      LAYER: layerConfig.sourceLayer
    })

    if (layerConfig.style) {
      params.append('STYLE', layerConfig.style)
    }

    return `${wmsConfig.url}?${params.toString()}`
  }
  
  const loadLegend = async (layerName) => {
    if (!layers.value[layerName]) {
      layerStore.setLegendUrl(layerName, null)
      return
    }
  
    try {
      // If it's a protected layer and we need authentication
      if (layerStore.layerNeedsBearer(layerName) && authStore.isAuthenticated) {
        console.log('Fetching protected legend for', layerName)
        
        const url = getLegendUrl(layerName)
        console.log('Legend URL:', url)
        
        // Use fetchWithAuth from authStore for protected layers
        const response = await fetch(url, {
          headers: authStore.authHeaders
        })
  
        if (!response.ok) {
          console.error('Failed to fetch legend:', response.status)
          throw new Error(`Failed to fetch legend: ${response.status}`)
        }
  
        // Convert the response to a blob and create an object URL
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        
        console.log('Setting legend URL to object URL:', objectUrl)
        layerStore.setLegendUrl(layerName, objectUrl)
      } else {
        // For non-protected layers, use the regular URL
        const url = getLegendUrl(layerName)
        console.log('Setting regular legend URL for', layerName, ':', url)
        layerStore.setLegendUrl(layerName, url)
      }
    } catch (error) {
      console.error('Error loading legend:', error)
      layerStore.setLegendUrl(layerName, null)
    }
  }

// In useLayerManagement.js
const toggleLayer = (layerName) => {
  if (!map.value) {
    console.warn(`Cannot toggle layer ${layerName}: no map available`)
    return
  }

  if (layerStore.isLayerProtected(layerName) && !authStore.isAuthenticated) {
    console.log('Cannot toggle protected layer - user not authenticated')
    return
  }

  const currentlyActive = layers.value[layerName]?.visible ?? false
  const newVisibility = !currentlyActive
  
  console.log(`Toggling ${layerName} from ${currentlyActive} to ${newVisibility}`)

  layerStore.setLayerVisibility(layerName, newVisibility)
  
  const mapLayers = map.value.getLayers()
  const style = layerStore.getLayerStyle(layerName)
  const sourceLayer = layerStore.getLayerSource(layerName)
  const layerKey = style ? `${sourceLayer}_${style}` : sourceLayer
  
  const existingLayer = mapLayers.getArray().find(layer => 
    layer.get('name') === layerName && 
    layer.get('layerKey') === layerKey
  )

  if (!newVisibility && existingLayer) {
    map.value.removeLayer(existingLayer)
    wmsLayers.delete(layerName)
    layerStore.setLegendUrl(layerName, null)
  } else if (newVisibility) {
    if (existingLayer) {
      map.value.removeLayer(existingLayer)
      wmsLayers.delete(layerName)
    }
    
    const newLayer = createWMSLayer(layerName)
    wmsLayers.set(layerName, newLayer)

    // Find proper insertion position based on zIndex
    const layerArray = mapLayers.getArray()
    const insertionIndex = layerArray.findIndex(layer => {
      // Get zIndex, defaulting to 0 if not set
      const layerZIndex = layer.getZIndex() || 0
      return layerZIndex > newLayer.getZIndex()
    })

    if (insertionIndex === -1) {
      mapLayers.push(newLayer)
    } else {
      mapLayers.insertAt(insertionIndex, newLayer)
    }

    loadLegend(layerName)
  }
}

// Update the createWMSLayer function to ensure zIndex is set correctly
const createWMSLayer = (layerName) => {
  const layerConfig = layerStore.layers[layerName]
  const wmsConfig = layerStore.getLayerWmsConfig(layerName)
  
  let sourceConfig = {
    url: wmsConfig.url,
    params: {
      'LAYERS': layerConfig.sourceLayer,
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'VERSION': wmsConfig.version
    },
    crossOrigin: 'anonymous',
    ratio: 1,
    wrapX: false
  }

  if (layerConfig.style) {
    sourceConfig.params['STYLES'] = layerConfig.style
  }

  if (layerStore.layerNeedsBearer(layerName)) {
    sourceConfig = {
      ...sourceConfig,
      imageLoadFunction: (image, src) => {
        fetch(src, {
          headers: authStore.authHeaders,
          credentials: 'include'
        })
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob)
            image.getImage().src = url
          })
          .catch(error => {
            console.error('Error loading WMS image:', error)
          })
      }
    }
  }

  const layer = new ImageLayer({
    source: new ImageWMS(sourceConfig),
    // Use the zIndex directly from the store
    zIndex: layerConfig.zIndex,
    opacity: layerOpacities.value[layerName] / 100,
    properties: {
      name: layerName,
      layerKey: layerConfig.style ? `${layerConfig.sourceLayer}_${layerConfig.style}` : layerConfig.sourceLayer
    }
  })

  return layer
}

  
  const initializeLayers = () => {
    // Only proceed if map is provided and not already initialized
    if (!map.value || initialized.value) {
      console.warn('Skipping initialization - no map or already initialized')
      return
    }
    
    console.warn('Initializing layers...')
    
    // Preserve existing layers instead of removing them
    const existingLayers = map.value.getLayers().getArray()
    
    // Identify and preserve background layer
    const backgroundLayer = existingLayers.find(layer => 
      layer instanceof TileLayer && 
      (layer.get('type') === 'background' || layer.get('name') === 'background')
    )
  
    // Remove only WMS layers that are not the background layer
    existingLayers.forEach(layer => {
      if (layer.getSource() instanceof ImageWMS && layer !== backgroundLayer) {
        console.warn('Removing existing WMS layer')
        map.value.removeLayer(layer)
      }
    })
    
    wmsLayers.clear()
  
    // Add active layers from store
    Object.entries(layers.value).forEach(([layerName, layerConfig]) => {
      console.warn(`Checking layer ${layerName}, active: ${layerConfig.visible}`)
      if (layerConfig.visible) {
        console.warn(`Creating layer ${layerName}`)
        const layer = createWMSLayer(layerName)
        wmsLayers.set(layerName, layer)
        
        // Only add if not already on the map
        if (!existingLayers.includes(layer)) {
          map.value.addLayer(layer)
        }
        
        loadLegend(layerName)
      }
    })
  
    // Ensure background layer is added if not already present
    if (backgroundLayer && !existingLayers.includes(backgroundLayer)) {
      map.value.addLayer(backgroundLayer)
    }
  
    initialized.value = true
    console.warn('Initialization complete. Current layers:', [...wmsLayers.keys()])
  }








  const cleanup = () => {
    initialized.value = false
    if (map.value) {
      const mapLayers = map.value.getLayers().getArray()
      mapLayers.forEach(layer => {
        if (layer.getSource() instanceof ImageWMS) {
          map.value.removeLayer(layer)
        }
      })
      wmsLayers.forEach((layer, layerName) => {
        cleanupLayer(layerName)
      })
      wmsLayers.clear()
    }
  }


  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      console.log('Auth state changed:', isAuthenticated);
      
      // Update layer visibility based on auth state
      if (isAuthenticated) {
        layerStore.setLayerVisibility('kartiergebiete', false);
        layerStore.setLayerVisibility('standorte', true);
      } else {
        layerStore.setLayerVisibility('kartiergebiete', true);
        layerStore.setLayerVisibility('standorte', false);
      }
      
      // Reinitialize layers to reflect the changes
      cleanup();
      initializeLayers();
    },
    { immediate: true }
  );


  return {
    layers,
    legends,
    getLayerLabel: layerStore.getLayerLabel,
    toggleLayer,
    wmsLayers,
    layerOpacities,
    updateLayerOpacity,
    getLegendUrl,
    isLayerAvailable: (layerName) => !layerStore.isLayerProtected(layerName) || authStore.isAuthenticated,
    cleanup,
    initializeLayers,
    map
  }
}