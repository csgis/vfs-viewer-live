import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
// useLayerManagement.js
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLayerStore } from '../stores/layerStore'
import { useUIStore } from '../stores/uiStore'

export function useLayerManagement(map) {
  const layerStore = useLayerStore()
  const uiStore = useUIStore()
  
  const { layers, legends, layerOrder, layerOpacities } = storeToRefs(layerStore)
  
  const selectedBackground = ref('luftbilder')
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
    soilNutrients: '0',
    alkisParzellarkarte: 'by_alkis_parzellarkarte_farbe'
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
    if (layerOpacities.value[layerName] === undefined) {
      layerStore.setLayerOpacity(layerName, 100);
    }
  });

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
      opacity: layerOpacities.value[layerName] / 100
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
      layerStore.setLegendUrl(layerName, null)
      return
    }
    const url = getLegendUrl(layerName)
    layerStore.setLegendUrl(layerName, url)
  }

  const toggleLayer = (layerName) => {
    if (!map) return

    // Get current state
    const currentlyActive = layers.value[layerName];
    // Toggle state in store
    layerStore.setLayerVisibility(layerName, !currentlyActive);
    
    let layer = wmsLayers.get(layerName);
    
    if (!currentlyActive) { // If it was inactive, now it will be active
      if (!layer) {
        layer = createWMSLayer(layerName);
        wmsLayers.set(layerName, layer);
        map.addLayer(layer);
      } else {
        layer.setVisible(true);
      }
      loadLegend(layerName);
    } else { // If it was active, now it will be inactive
      if (layer) {
        layer.setVisible(false);
      }
      layerStore.setLegendUrl(layerName, null);
    }
  }

  const updateLayerZIndices = () => {
    // Separate layers into protected and non-protected groups
    const protectedLayers = layerOrder.value.filter(name => 
      ['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name)
    );
    
    const nonProtectedLayers = layerOrder.value.filter(name => 
      !['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(name)
    );

    // Update z-indices for non-protected layers (lower z-index range)
    nonProtectedLayers.forEach((layerName, index) => {
      const layer = wmsLayers.get(layerName);
      if (layer) {
        layer.setZIndex((nonProtectedLayers.length - index) * 10);
      }
    });

    // Update z-indices for protected layers (higher z-index range)
    protectedLayers.forEach((layerName, index) => {
      const layer = wmsLayers.get(layerName);
      if (layer) {
        // Use a higher base z-index for protected layers
        layer.setZIndex(1000 + (protectedLayers.length - index) * 10);
      }
    });

    layerStore.updateLayerOrder(layerOrder.value);
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
    getLegendUrl
  }
}