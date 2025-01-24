import { ref, watch } from 'vue'

import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import { apply as applyMapboxStyle } from 'ol-mapbox-style'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useLayerStore } from '../stores/layerStore'
import { useUIStore } from '../stores/uiStore'

export function useLayerManagement(providedMap = null) {
  const layerStore = useLayerStore()
  const uiStore = useUIStore()
  const authStore = useAuthStore()
  const map = ref(providedMap)
  
  const { layers, legends, layerOrder, layerOpacities } = storeToRefs(layerStore)
  
  const selectedBackground = ref('luftbilder')
  const wmsLayers = new Map()
  const backgroundLayers = ref({})
  const activeBackgroundLayer = ref(null)
  const initialized = ref(false)

  const vectorStyles = {
    vectorColor: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json',
    vectorRelief: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json',
    vectorGrey: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json'
  }

  const getAttributionForBackground = (type) => {
    const attributions = {
      none: '',
      osm: '© OpenStreetMap contributors',
      luftbilder: '© Bayerische Vermessungsverwaltung',
      terrain: '© tiles.stadiamaps.com'
    }
    return attributions[type] || ''
  }

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

  const createBackgroundLayer = async (type) => {
    if (type === 'none') return null

    if (vectorStyles[type]) {
      try {
        const dummyLayer = new TileLayer({
          source: new OSM(),
          visible: false
        })
        
        await applyMapboxStyle(map.value, vectorStyles[type])
        return dummyLayer
      } catch (error) {
        console.error('Error creating vector tile layer:', error)
        return null
      }
    }

    const sources = {
      osm: () => new OSM({
        crossOrigin: 'anonymous',
        wrapX: false,
      }),
      terrain: () => new XYZ({
        url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous',
        maxZoom: 18
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

    if (!sources[type]) return null

    return new TileLayer({
      source: sources[type](),
      zIndex: 0,
      visible: true,
      properties: {
        type: 'background',
        name: type
      }
    })
  }

  const updateLayerOpacity = (layerName) => {
    layerStore.setLayerOpacity(layerName, layerOpacities.value[layerName])
    const layer = wmsLayers.get(layerName)
    if (layer) {
      layer.setOpacity(layerOpacities.value[layerName] / 100)
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

  const unloadAllBackgroundLayers = () => {
    if (!map.value) {
      console.warn('No map available to unload background layers')
      return
    }
    
    const layers = map.value.getLayers()
    const layersArray = layers.getArray()
    for (let i = layersArray.length - 1; i >= 0; i--) {
      const layer = layersArray[i]
      if (layer instanceof TileLayer) {
        map.value.removeLayer(layer)
      }
    }
  
    if (activeBackgroundLayer.value) {
      activeBackgroundLayer.value = null
    }
    backgroundLayers.value = {}
  }

  const changeBackground = async () => {
    try {
      unloadAllBackgroundLayers()
      uiStore.setMapAttribution(getAttributionForBackground(selectedBackground.value))

      if (selectedBackground.value !== 'none') {
        const layer = await createBackgroundLayer(selectedBackground.value)
        if (layer) {
          backgroundLayers.value[selectedBackground.value] = layer
          activeBackgroundLayer.value = layer
          map.value.addLayer(layer)
        }
      }
    } catch (error) {
      console.error('Error changing background:', error)
    }
  }



  const cleanup = () => {
    initialized.value = false
    
    // Only try to remove layers if map exists
    if (map.value) {
      // Remove all layers from the map
      const mapLayers = map.value.getLayers().getArray()
      mapLayers.forEach(layer => {
        map.value.removeLayer(layer)
      })
      
      // Clean up WMS layers
      wmsLayers.forEach((layer, layerName) => {
        cleanupLayer(layerName)
      })
      wmsLayers.clear()
      
      // Reset background layers
      try {
        unloadAllBackgroundLayers()
      } catch (error) {
        console.warn('Error unloading background layers:', error)
      }
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
    selectedBackground,
    getLayerLabel: layerStore.getLayerLabel,
    toggleLayer,
    changeBackground,
    updateLayerZIndices,
    wmsLayers,
    activeBackgroundLayer,
    layerOpacities,
    updateLayerOpacity,
    getLegendUrl,
    vectorStyles,
    isLayerAvailable: (layerName) => !layerStore.isLayerProtected(layerName) || authStore.isAuthenticated,
    cleanup,
    initializeLayers,
    map
  }
}