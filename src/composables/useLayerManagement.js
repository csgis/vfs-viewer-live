import { ref, watch } from 'vue'

import { API_BASE_URL } from '../config/api'
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

  const layerSources = {
    flurkartenSchnitt: 'admin_boundaries:flurkarte',
    regierungsbezirk: 'admin_boundaries:regierungsbezirke',
    landkreis: 'admin_boundaries:landkreise',
    gemeinde: 'admin_boundaries:gemeinden',
    kartiergebiete: 'vfs:kartiergebiete',
    trinkwasser: 'schutzgebiete:twsg',
    landschaftsschutz: 'schutzgebiete:landschafts',
    naturschutz: 'schutzgebiete:natur',
    soilNutrients: '0',
    alkisParzellarkarte: 'by_alkis_parzellarkarte_farbe',
    standorte: 'vfs:standorte'
  }

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
      naturschutz: 'Naturschutzgebiete',
      alkisParzellarkarte: 'ALKIS Parzellarkarte',
      standorte: 'Standorte',
    }
    return labels[layerName] || layerName
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


  Object.keys(layers.value).forEach(layerName => {
    if (layerOpacities.value[layerName] === undefined) {
      layerStore.setLayerOpacity(layerName, 100)
    }
  })

  const createWMSLayer = (layerName) => {
    const wmsConfig = {
      default: {
        url: 'https://geoserver-vfs.csgis.de/geoserver/wms',
        version: '1.3.0'
      },
      soilNutrients: {
        url: 'https://services.bgr.de/wms/boden/buek1000de/',
        version: '1.3.0'
      },
      alkisParzellarkarte: { 
        url: 'https://geoservices.bayern.de/od/wms/alkis/v1/parzellarkarte',
        version: '1.3.0'
      },
      standorte: {
        url: `${API_BASE_URL}/api/geoserver/wms`,
        version: '1.3.0'
      }
    }
  
    // z-index of layers on start
    const zIndexMap = {
      soilNutrients: 4,
      regierungsbezirk: 1,
      landkreis: 2,
      gemeinde: 3,
      flurkartenSchnitt: 8,
      kartiergebiete: 5,
      alkisParzellarkarte: 7,
      standorte: 6 
    }
  
    const config = wmsConfig[layerName] || wmsConfig.default
    const zIndex = zIndexMap[layerName] || 5
  
    // Add auth headers for protected layers
    let sourceConfig = {
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
    }
  
    // Add auth headers for protected layers
    if (layerStore.isLayerProtected(layerName) && authStore.isAuthenticated  && layerStore.layerNeedsBearer(layerName)) {
      console.log(`fetching secured layer ${layerName} with auth header ${authStore.authHeaders}`)
      sourceConfig = {
        ...sourceConfig,
        imageLoadFunction: (image, src) => {

          // Add authorization header to image request
          fetch(src, {
            headers: authStore.authHeaders,
            credentials: 'include'
          })
            .then(response => response.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              image.getImage().src = url;
            })
            .catch(error => {
              console.error('Error loading WMS image:', error);
            });
        }
      }
    }
  
    const layer = new ImageLayer({
      source: new ImageWMS(sourceConfig),
      zIndex: zIndex,
      opacity: layerOpacities.value[layerName] / 100
    })
  
    return layer
  }

  const vectorStyles = {
    vectorColor: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json',
    vectorRelief: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json',
    vectorGrey: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json'
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
    if (layerName === 'alkisParzellarkarte') {
      return 'https://geodaten.bayern.de/wms/legend/legende_alkis_parzellarkarte_umr.png'
    }
  
    const needsAuth = layerStore.isLayerProtected(layerName) && layerStore.layerNeedsBearer(layerName) 
    
    const wmsConfig = {
      default: {
        url: 'https://geoserver-vfs.csgis.de/geoserver/wms',
        version: '1.3.0'
      },
      soilNutrients: {
        url: 'https://services.bgr.de/wms/boden/buek1000de/',
        version: '1.3.0'
      },
      alkisParzellarkarte: {
        url: 'https://geoservices.bayern.de/od/wms/alkis/v1/parzellarkarte',
        version: '1.3.0'
      }
    }
  
    const baseUrl = needsAuth
      ? `${API_BASE_URL}/api/geoserver/wms`
      : (wmsConfig[layerName]?.url || wmsConfig.default.url)

    const version = wmsConfig[layerName]?.version || wmsConfig.default.version
    const layerSource = layerSources[layerName]
    
    return `${baseUrl}?REQUEST=GetLegendGraphic&VERSION=${version}&FORMAT=image/png&LAYER=${layerSource}`
  }
  
  const loadLegend = async (layerName) => {
    if (!layers.value[layerName]) {
      layerStore.setLegendUrl(layerName, null)
      return
    }
  
    try {
      // If it's a protected layer and we need authentication
      if (layerStore.isLayerProtected(layerName) && authStore.isAuthenticated) {
        console.log('Fetching protected legend for', layerName)
        
        // Use fetchWithAuth from authStore for protected layers
        const response = await fetch(getLegendUrl(layerName), {
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

    console.log(`Toggle called for ${layerName}`)

    if (layerStore.isLayerProtected(layerName) && !authStore.isAuthenticated) {
      console.log('Cannot toggle protected layer - user not authenticated')
      return
    }

    const currentlyActive = layers.value[layerName]
    
    // Update store first
    layerStore.setLayerVisibility(layerName, !currentlyActive)
    
    // Check all layers on the map to ensure no duplicates
    const mapLayers = map.value.getLayers().getArray()
    console.log('All map layers:', mapLayers.length)
    
    mapLayers.forEach(layer => {
      const source = layer.getSource()
      if (source instanceof ImageWMS) {
        const params = source.getParams()
        console.log('Layer params:', params)
        if (params.LAYERS === layerSources[layerName]) {
          console.log('Found matching layer, removing it')
          map.value.removeLayer(layer)
        }
      }
    })

    // If we're turning the layer on, create a new one
    if (!currentlyActive) {
      console.log('Creating new layer')
      const layer = createWMSLayer(layerName)
      wmsLayers.set(layerName, layer)
      map.value.addLayer(layer)
      loadLegend(layerName)
    } else {
      // If we're turning it off, clean up references
      wmsLayers.delete(layerName)
      layerStore.setLegendUrl(layerName, null)
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
    Object.entries(layers.value).forEach(([layerName, isActive]) => {
      console.warn(`Checking layer ${layerName}, active: ${isActive}`)
      if (isActive) {
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



  const isLayerAvailable = (layerName) => {
    return !layerStore.isLayerProtected(layerName) || authStore.isAuthenticated
  }

  const updateLayerZIndices = () => {
    const protectedLayers = layerOrder.value.filter(name => 
      ['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name)
    )
    
    const nonProtectedLayers = layerOrder.value.filter(name => 
      !['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name)
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
    getLayerLabel,
    toggleLayer,
    changeBackground,
    updateLayerZIndices,
    wmsLayers,
    activeBackgroundLayer,
    layerSources,
    layerOpacities,
    updateLayerOpacity,
    getLegendUrl,
    vectorStyles,
    isLayerAvailable,
    cleanup,
    initializeLayers,
    map
  }
}