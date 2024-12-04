import { ref, shallowRef } from 'vue'

import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'

export function useMapLayers() {
  // Single source of truth for active background
  const activeBackgroundType = ref('luftbilder') // Start with luftbilder
  const activeBackgroundLayer = shallowRef(null)
  
  // Cache for layer instances
  const layerCache = new Map()
  const wmsLayers = new Map()

  const createBackgroundLayer = (type) => {
    // Return cached layer if it exists
    if (layerCache.has(type)) {
      return layerCache.get(type)
    }

    let layer = null
    
    switch(type) {
      case 'osm':
        layer = new TileLayer({
          source: new OSM({
            crossOrigin: 'anonymous',
            wrapX: false,
          }),
          zIndex: 0,
          visible: false
        })
        break
      case 'webatlas':
        layer = new TileLayer({
          source: new TileWMS({
            url: 'https://sgx.geodatenzentrum.de/wms_basemapde',
            params: {
              'LAYERS': 'de_basemapde_web_raster_farbe',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
              'TILED': true
            },
            crossOrigin: 'anonymous',
            wrapX: false
          }),
          zIndex: 0,
          visible: false
        })
        break
      case 'luftbilder':
        layer = new TileLayer({
          source: new TileWMS({
            url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20',
            params: {
              'LAYERS': 'by_dop20c',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0',
              'TILED': true
            },
            wrapX: false
          }),
          zIndex: 0,
          visible: false
        })
        break
    }

    if (layer) {
      layerCache.set(type, layer)
    }

    return layer
  }

  // WMS layer management
  const layerSources = {
    flurkartenSchnitt: 'admin_boundaries:flurkarte',
    regierungsbezirk: 'admin_boundaries:regierungsbezirke',
    landkreis: 'admin_boundaries:landkreise',
    gemeinde: 'admin_boundaries:gemeinden',
    kartiergebiete: 'vfs:kartiergebiete',
    trinkwasser: 'schutzgebiete:twsg',
    landschaftsschutz: 'schutzgebiete:landschafts',
    naturschutz: 'schutzgebiete:natur'
  }

  const createWMSLayer = (layerName) => {
    return new ImageLayer({
      source: new ImageWMS({
        url: 'https://geoserver-vfs.csgis.de/geoserver/wms',
        params: {
          'LAYERS': layerSources[layerName],
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
          'VERSION': '1.3.0'
        },
        ratio: 1,
        serverType: 'geoserver'
      }),
      zIndex: 1
    })
  }

  const toggleWMSLayer = (layerName, visible, map) => {
    if (!map) return

    let layer = wmsLayers.get(layerName)
    
    if (visible) {
      if (!layer) {
        layer = createWMSLayer(layerName)
        wmsLayers.set(layerName, layer)
        map.addLayer(layer)
      }
      layer.setVisible(true)
    } else if (layer) {
      layer.setVisible(false)
    }
  }

  const setBackground = (type, map) => {
    if (!map) return

    if (activeBackgroundLayer.value) {
      activeBackgroundLayer.value.setVisible(false)
    }

    if (type === 'none') {
      activeBackgroundType.value = 'none'
      return
    }

    const newLayer = createBackgroundLayer(type)
    if (newLayer) {
      if (!map.getLayers().getArray().includes(newLayer)) {
        map.addLayer(newLayer)
      }
      
      newLayer.setVisible(true)
      activeBackgroundLayer.value = newLayer
      activeBackgroundType.value = type
    }
  }

  const initializeBackground = (map) => {
    if (map) {
      setBackground('luftbilder', map)
    }
  }

  const cleanup = (map) => {
    if (map) {
      layerCache.forEach(layer => {
        map.removeLayer(layer)
        layer.dispose()
      })
      layerCache.clear()

      wmsLayers.forEach(layer => {
        map.removeLayer(layer)
        layer.dispose()
      })
      wmsLayers.clear()
    }
  }

  return {
    activeBackgroundType,
    activeBackgroundLayer,
    setBackground,
    initializeBackground,
    cleanup,
    toggleWMSLayer,
    layerSources
  }
}