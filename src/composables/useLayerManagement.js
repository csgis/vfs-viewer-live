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
  
  const { layers, legends, layerOrder, layerOpacities } = storeToRefs(layerStore)
  
  const wmsLayers = new Map()
  const initialized = ref(false)



  const cleanupLayer = (layerName) => {
    if (!map.value) return

    const layer = wmsLayers.get(layerName)
    if (layer) {
      map.value.removeLayer(layer)
      layer.dispose()
      wmsLayers.delete(layerName)
    }
  }

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

    return new ImageLayer({
      source: new ImageWMS(sourceConfig),
      zIndex: layerConfig.zIndex,
      opacity: layerOpacities.value[layerName] / 100,
      properties: {
        name: layerName,
        layerKey: layerConfig.style ? `${layerConfig.sourceLayer}_${layerConfig.style}` : layerConfig.sourceLayer
      }
    })
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

  const toggleLayer = (layerName) => {
    if (!map.value) {
      console.warn(`Cannot toggle layer ${layerName}: no map available`)
      return
    }
  
    if (layerStore.isLayerProtected(layerName) && !authStore.isAuthenticated) {
      console.log('Cannot toggle protected layer - user not authenticated')
      return
    }
  
    // Get current visibility state
    const currentlyActive = layers.value[layerName]?.visible ?? false
    const newVisibility = !currentlyActive
    
    console.log(`Toggling ${layerName} from ${currentlyActive} to ${newVisibility}`)
  
    // Update store visibility
    layerStore.setLayerVisibility(layerName, newVisibility)
    
    // Get all layers from the map
    const mapLayers = map.value.getLayers().getArray()
    
    // Find the specific layer using the layerKey
    const style = layerStore.getLayerStyle(layerName)
    const sourceLayer = layerStore.getLayerSource(layerName)
    const layerKey = style ? `${sourceLayer}_${style}` : sourceLayer
    
    const existingLayer = mapLayers.find(layer => 
      layer.get('name') === layerName && 
      layer.get('layerKey') === layerKey
    )
  
    if (!newVisibility && existingLayer) {
      // We're turning the layer off
      console.log('Removing layer from map:', layerName)
      map.value.removeLayer(existingLayer)
      wmsLayers.delete(layerName)
      layerStore.setLegendUrl(layerName, null)
    } else if (newVisibility) {
      // We're turning the layer on
      console.log('Creating new layer:', layerName)
      
      // Clean up existing layer if any
      if (existingLayer) {
        console.log('Removing existing layer before creating new one')
        map.value.removeLayer(existingLayer)
        wmsLayers.delete(layerName)
      }
      
      // Create and add new layer
      const newLayer = createWMSLayer(layerName)
      wmsLayers.set(layerName, newLayer)
      map.value.addLayer(newLayer)
      loadLegend(layerName)
    }
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




  const updateLayerZIndices = () => {
    const protectedLayers = layerOrder.value.filter(name => 
      ['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name)
    )
    
    const nonProtectedLayers = layerOrder.value.filter(name => 
      !['trinkwasser', 'landschaftsschutz', 'naturschutz', 'vogel','ffh','naturparke'].includes(name)
    )

    nonProtectedLayers.forEach((layerName, index) => {
      const layer = wmsLayers.get(layerName)
      if (layer) {
        layer.setZIndex((nonProtectedLayers.length - index) * 10)
      }
    })

    protectedLayers.forEach((layerName, index) => {
      const layer = wmsLayers.get(layerName)
      if (layer) {
        layer.setZIndex(1000 + (protectedLayers.length - index) * 10)
      }
    })

    layerStore.updateLayerOrder(layerOrder.value)
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
    layerOrder,
    getLayerLabel: layerStore.getLayerLabel,
    toggleLayer,
    updateLayerZIndices,
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