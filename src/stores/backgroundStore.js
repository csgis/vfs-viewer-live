import MVT from 'ol/format/MVT'
// store/backgroundStore.js
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import XYZ from 'ol/source/XYZ'
import { applyStyle } from 'ol-mapbox-style'
import { defineStore } from 'pinia'

export const useBackgroundStore = defineStore('background', {
    state: () => ({
      selectedBackground: 'luftbilder',
      activeLayers: new Map(),
      backgroundDefinitions: {
        none: {
          label: 'Kein Hintergrund',
          attribution: '',
          type: 'none'
        },
        osm: {
          label: 'Open Street Map',
          attribution: '© OpenStreetMap contributors',
          type: 'tile',
          source: () => new OSM({
            crossOrigin: 'anonymous', 
            wrapX: false,
          })
        },
        luftbilder: {
          label: 'Luftbilder WMS DOP 20',
          attribution: '© Bayerische Vermessungsverwaltung',
          type: 'wms',
          source: () => new TileWMS({
            url: 'https://geoservices.bayern.de/od/wms/dop/v1/dop20',
            params: {
              'LAYERS': 'by_dop20c',
              'FORMAT': 'image/png',
              'VERSION': '1.3.0'
            },
            crossOrigin: 'anonymous',
            wrapX: false
          })
        },
        terrain: {
          label: 'Gelände',
          attribution: '© tiles.stadiamaps.com',
          type: 'xyz',
          source: () => new XYZ({
            url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
            crossOrigin: 'anonymous',
            maxZoom: 18
          })
        },
        vectorRelief: {
            label: 'Basemap.de Vektor (Höhenlinien)',
            attribution: '© Basemap.de | Bundesamt für Kartographie und Geodäsie',
            type: 'vector',
            sources: [
              {
                url: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/tiles/v1/bm_web_hl_de_3857/{z}/{x}/{y}.pbf',
                maxZoom: 14,
                styleUrl: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json'
              },
              {
                url: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/tiles/v1/bm_web_de_3857/{z}/{x}/{y}.pbf',
                maxZoom: 14,
                styleUrl: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json'
              }
            ]
          },
          vectorColor: {
            label: 'Basemap.de Vektor (Farbe)',
            attribution: '© Basemap.de | Bundesamt für Kartographie und Geodäsie',
            type: 'vector', 
            url: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/tiles/v1/bm_web_de_3857/{z}/{x}/{y}.pbf',
            maxZoom: 14,
            styleUrl: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json'
          },
          vectorGrey: {
            label: 'Basemap.de Vektor (Grau)',
            attribution: '© Basemap.de | Bundesamt für Kartographie und Geodäsie',
            type: 'vector', 
            url: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/tiles/v1/bm_web_de_3857/{z}/{x}/{y}.pbf',
            maxZoom: 14,
            styleUrl: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json'
          },
          vectorDark: {
            label: 'Basemap.de Vektor (Dunkel)',
            attribution: '© Basemap.de | Bundesamt für Kartographie und Geodäsie',
            type: 'vector',
            url: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/tiles/v1/bm_web_de_3857/{z}/{x}/{y}.pbf',
            maxZoom: 14,
            styleUrl: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_drk.json'
           }
       }
    }),
  
    actions: {
        async ensureBackground(map) {
            if (!map) return
            const hasBackground = map.getLayers().getArray().some(layer => layer.get('isBackground'))
            if (!hasBackground) {
              await this.changeBackground(this.selectedBackground, map)
            }
          },
          async changeBackground(type, map) {
            if (this.isChanging || !map) return
            
            this.isChanging = true
            try {
              const currentLayers = map.getLayers().getArray()
              const backgroundLayers = currentLayers.filter(layer => layer.get('isBackground'))
              
              await Promise.all(backgroundLayers.map(async layer => {
                return new Promise(resolve => {
                  requestAnimationFrame(() => {
                    map.removeLayer(layer)
                    layer.dispose()
                    resolve()
                  })
                })
              }))
           
              await new Promise(resolve => setTimeout(resolve, 100))
           
              if (type === 'none') return
           
              const def = this.backgroundDefinitions[type]
              if (!def) return
           
              this.currentAttribution = def?.attribution || ''
           
              if (def.type === 'vector') {
                if (def.sources) {
                    const layers = await Promise.all(def.sources.map(async source => {
                      const layer = new VectorTileLayer({
                        declutter: true,
                        source: new VectorTileSource({
                          format: new MVT(),
                          url: source.url,
                          maxZoom: source.maxZoom
                        })
                      });
                      await applyStyle(layer, source.styleUrl);
                      return layer;
                    }));
                    
                    layers.forEach((layer, index) => {
                        layer.set('isBackground', true);
                        // Insert heightlines (index 0) after base (index 1)
                        map.getLayers().insertAt(index === 0 ? 1 : 0, layer);
                      });
                  } else {
                  const layer = new VectorTileLayer({
                    source: new VectorTileSource({
                      format: new MVT(),
                      url: def.url,
                      maxZoom: def.maxZoom
                    })
                  });
                  await applyStyle(layer, def.styleUrl);
                  layer.set('isBackground', true);
                  map.getLayers().insertAt(0, layer);
                }
              } else {
                const layer = new TileLayer({
                  source: def.source()
                });
                layer.set('isBackground', true);
                map.getLayers().insertAt(0, layer);
              }
           
              this.selectedBackground = type
            } catch (error) {
              console.error('Background change failed:', error)
            } finally {
              this.isChanging = false
            }
           },
    
        cleanup(map) {
          if (!map) return
          const layers = map.getLayers().getArray()
          layers
            .filter(layer => layer.get('isBackground'))
            .forEach(layer => {
              map.removeLayer(layer)
              layer.dispose()
            })
        }
      }
    })