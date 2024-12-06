// useLayerManagement.js
import { nextTick, ref, watch } from 'vue'

import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import { useUIStore } from '../stores/uiStore'

export function useLayerManagement(map) {
  const legends = ref({})
  const selectedBackground = ref('luftbilder')
  const wmsLayers = new Map()
  const backgroundLayers = ref({})
  const activeBackgroundLayer = ref(null)
  const visibleLayers = ref([])
  const layerOpacities = ref({})
  const uiStore = useUIStore()

  const layerOrder = ref([
    'soilNutrients',
    'regierungsbezirk',
    'landkreis',
    'gemeinde',
    'flurkartenSchnitt',
    'kartiergebiete',
    'trinkwasser',
    'landschaftsschutz',
    'naturschutz',
    'alkisParzellarkarte'
  ])

  const layers = ref({
    flurkartenSchnitt: false,
    regierungsbezirk: false,
    landkreis: false,
    gemeinde: false,
    kartiergebiete: true,
    trinkwasser: false,
    landschaftsschutz: false,
    naturschutz: false,
    soilNutrients: false,
    alkisParzellarkarte: false,
  })

  const getAttributionForBackground = (type) => {
    const attributions = {
      none: '',
      osm: '© OpenStreetMap contributors',
      webatlas: '© GeoBasis-DE/BKG',
      luftbilder: '© Bayerische Vermessungsverwaltung',
      terrain: '© tiles.stadiamaps.com'
    }
    return attributions[type] || ''
  }

  // Initialize layer opacities
  Object.keys(layers.value).forEach(layerName => {
    layerOpacities.value[layerName] = 100
  })

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
    alkisParzellarkarte: 'by_alkis_parzellarkarte_umr_schwarz'
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
      alkisParzellarkarte: 'ALKIS Parzellarkarte'
    }
    return labels[layerName] || layerName
  }

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
      }
    }

    const zIndexMap = {
      soilNutrients: 1,
      regierungsbezirk: 2,
      landkreis: 3,
      gemeinde: 4,
      flurkartenSchnitt: 5,
      kartiergebiete: 10,
      alkisParzellarkarte: 6
    }

    const config = wmsConfig[layerName] || wmsConfig.default
    const zIndex = zIndexMap[layerName] || 5

    const layer = new ImageLayer({
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
      zIndex: zIndex,
      opacity: layerOpacities.value[layerName] / 100 // Set initial opacity
    })

    return layer
  }

  const createBackgroundLayer = (type) => {
    if (type === 'none') return null
  
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
      visible: true
    })
  }

  const updateLayerOpacity = (layerName) => {
    const opacity = layerOpacities.value[layerName] / 100
    const layer = wmsLayers.get(layerName)
    if (layer) {
      layer.setOpacity(opacity)
    }
  }

  const getLegendUrl = (layerName) => {
    // Special case for ALKIS Parzellarkarte
    if (layerName === 'alkisParzellarkarte') {
      return 'https://geodaten.bayern.de/wms/legend/legende_alkis_parzellarkarte_umr.png'
    }
  
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
  
    const config = wmsConfig[layerName] || wmsConfig.default
    const layerSource = layerSources[layerName]
    return `${config.url}?REQUEST=GetLegendGraphic&VERSION=${config.version}&FORMAT=image/png&LAYER=${layerSource}`
  }

  const loadLegend = async (layerName) => {
    if (!layers.value[layerName]) {
      legends.value[layerName] = null
      return
    }
    legends.value[layerName] = getLegendUrl(layerName)
  }

  const toggleLayer = (layerName) => {
    if (!map) return

    const isActive = layers.value[layerName]
    let layer = wmsLayers.get(layerName)
    
    if (isActive) {
      if (!layer) {
        layer = createWMSLayer(layerName)
        wmsLayers.set(layerName, layer)
        map.addLayer(layer)
      } else {
        layer.setVisible(true)
      }
      loadLegend(layerName)
    } else {
      if (layer) {
        layer.setVisible(false)
      }
      legends.value[layerName] = null
    }
    updateVisibleLayers()
  }

  const updateVisibleLayers = () => {
    visibleLayers.value = Object.keys(layers.value).filter((layer) => layers.value[layer])
    nextTick(() => {
      console.log('Visible Layers Content:', visibleLayers.value)
    })
  }

  const updateLayerZIndices = () => {
    layerOrder.value.forEach((layerName, index) => {
      const layer = wmsLayers.get(layerName)
      if (layer) {
        layer.setZIndex((layerOrder.value.length - index) * 10)
      }
    })
  }

  const unloadAllBackgroundLayers = () => {
    map.getLayers().getArray()
      .filter(layer => layer instanceof TileLayer)
      .forEach(layer => map.removeLayer(layer))

    if (activeBackgroundLayer.value) {
      activeBackgroundLayer.value = null
    }
    backgroundLayers.value = {}
  }

  const changeBackground = () => {
    unloadAllBackgroundLayers()

    // Update attribution in the store
    uiStore.setMapAttribution(getAttributionForBackground(selectedBackground.value))

    if (selectedBackground.value !== 'none') {
      const layer = createBackgroundLayer(selectedBackground.value)
      if (layer) {
        backgroundLayers.value[selectedBackground.value] = layer
        activeBackgroundLayer.value = layer
        map.addLayer(layer)
      }
    }
  }


  // Initialize active layers when map is provided
  if (map) {
    Object.entries(layers.value).forEach(([layerName, isActive]) => {
      if (isActive) {
        const layer = createWMSLayer(layerName)
        wmsLayers.set(layerName, layer)
        map.addLayer(layer)
        loadLegend(layerName)
      }
    })
  }

  watch(() => wmsLayers.size, () => {
    updateLayerZIndices()
  })

  watch(selectedBackground, () => {
    changeBackground()
  })

  watch(
    layers,
    (newLayers) => {
      console.log('Layers changed:', newLayers)
      updateVisibleLayers()
    },
    { deep: true }
  )

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
    visibleLayers,
    layerOpacities,
    updateLayerOpacity
  }
}