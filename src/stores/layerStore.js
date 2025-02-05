import { API_BASE_URL, GEOSERVER_URL } from '../config'

import { defineStore } from 'pinia'
import { useAuthStore } from './authStore';

const layerDefinitions = {
  flurkartenSchnitt: {
    visible: false,
    sourceLayer: 'admin_boundaries:flurkarte',
    label: 'Flurkartenschnitt 1:5.000',
    description: 'Quelle: © Bayerische Vermessungsverwaltung',
    zIndex: 7,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  regierungsbezirk: {
    visible: false,
    sourceLayer: 'admin_boundaries:regierungsbezirke', 
    label: 'Regierungsbezirk',
    description: 'Quelle: VFS-München; Regierungsbezirke',
    zIndex: 1,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  landkreis: {
    visible: false,
    sourceLayer: 'admin_boundaries:landkreise',
    label: 'Landkreis',
    description: 'Quelle: VFS-München; Landkreise',
    zIndex: 2,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  gemeinde: {
    visible: false,
    sourceLayer: 'admin_boundaries:gemeinden',
    label: 'Gemeinde',
    description: 'Quelle: VFS-München; Gemeinden',
    zIndex: 3,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  kartiergebiete: {
    visible: false,
    sourceLayer: 'vfs:kartiergebiete',
    label: 'Kartiergebiete des VfS',
    description: 'Quelle: VFS-München; Übersichtslayer zum Kartiergebiet',
    zIndex: 5,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  trinkwasser: {
    visible: false,
    sourceLayer: 'schutzgebiete:twsg',
    label: 'Trinkwasserschutzgebiete',
    description: 'Quelle: VFS-München; Trinkwasserschutz Gebiete',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`, 
      version: '1.3.0'
    }
  },
  landschaftsschutz: {
    visible: false,
    sourceLayer: 'schutzgebiete:landschafts',
    label: 'Landschaftsschutzgebiete',
    description: 'Quelle: VFS-München; Landschaftsschutz Gebiete',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  naturschutz: {
    visible: false,
    sourceLayer: 'schutzgebiete:natur',
    label: 'Naturschutzgebiete',
    description: 'Quelle: VFS-München; Naturschutz Gebiete',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0' 
    }
  },
  vogel: {
    visible: false,
    sourceLayer: 'schutzgebiete:vogel',
    label: 'Vogelschutzgebiete',
    description: 'Quelle: VFS-München; Vogelschutz Gebiete',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  ffh: {
    visible: false,
    sourceLayer: 'schutzgebiete:ffh',
    label: 'Fauna-Flora-Habitat',
    description: 'Quelle: VFS-München; Fauna-Flora-Habitat-Gebiet',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  naturparke: {
    visible: false,
    sourceLayer: 'schutzgebiete:naturparke',
    label: 'Naturparke',
    description: 'Quelle: VFS-München; Naturparke',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: `${GEOSERVER_URL}/wms`,
      version: '1.3.0'
    }
  },
  soilNutrients: {
    visible: false,
    sourceLayer: '0',
    label: 'Boden Typ',
    description: 'Quelle: BGR; Bodenkarte',
    zIndex: 4,
    protected: true,
    needsBearer: false,
    wmsConfig: {
      url: 'https://services.bgr.de/wms/boden/buek1000de/',
      version: '1.3.0'
    }
  },
  alkisParzellarkarte: {
    visible: false,
    sourceLayer: 'by_alkis_parzellarkarte_farbe',
    label: 'ALKIS Parzellarkarte',
    description: 'Quelle: https://geodatenonline.bayern.de; Der ALKIS®-Parzellarkarte-WMS ist nach dem Vorbild der ALKIS®-Flurkarte gebaut, beinhaltet aber Objekte der Flurkarte ohne Flurstücksnummern, ohne Grenzzeichen und ohne Unterscheidung der Grenzen, mit Gebäuden, Lagebezeichnungen und TN-Objekten.',
    zIndex: 6,
    protected: false,
    needsBearer: false,
    wmsConfig: {
      url: 'https://geoservices.bayern.de/od/wms/alkis/v1/parzellarkarte',
      version: '1.3.0'
    }
  },
  standorte: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Standorte',
    description: 'Quelle: VFS-München; Detaillayer zu einzelnen Waldbesitzer Standorten',
    zIndex: 19,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  bergahorn: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Bergahorn',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_bergahorn',
    zIndex: 8,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  buche: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Buche',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_buche',
    zIndex: 9,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  douglasie: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Douglasie',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_douglasie',
    zIndex: 10,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  eiche: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Eiche',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_eiche',
    zIndex: 11,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  ela: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Europäische Lärche',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_ela',
    zIndex: 12,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  esche: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Esche',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_esche',
    zIndex: 13,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  fichte: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Fichte',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_fichte',
    zIndex: 14,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  kiefer: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Kiefer',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_kiefer', 
    zIndex: 15,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  kirsche: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Kirsche',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_kirsche',
    zIndex: 16,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  schwarzerle: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Schwarzerle',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_schwarzerle',
    zIndex: 17,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  tanne: {
    visible: false, 
    sourceLayer: 'vfs:standorte',
    label: 'Tanne',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_tanne',
    zIndex: 18,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  winterlinde: {
    visible: false,
    sourceLayer: 'vfs:standorte',
    label: 'Winterlinde',
    description: 'Quelle: VFS-München; Detailansicht der Baumart',
    style: 'standorte_winterlinde',
    zIndex: 18,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  },
  digitale_flurkarte: {
    visible: false,
    sourceLayer: 'vfs-baselayers:by_alkis_flurkarte_umr_gelb',
    label: 'Digitale Flurkarte',
    description: 'Quelle: https://geodatenonline.bayern.de; Der Layer beinhaltet Flurstücke mit Flurstücksnummern und Grenzzeichen, Gebäude, Bauwerke und Bauteile ohne die Tatsächliche Nutzung. In der Gelb-Darstellung werden Flächen nicht ausgefüllt sondern nur Konturen in gelb dargestellt. Dieser Layer dient zur Überlagerung mit anderen Informationen. Die Darstellung ist für den Maßstab 1:1000 optimiert.',
    zIndex: 18,
    protected: true,
    needsBearer: true,
    wmsConfig: {
      url: `${API_BASE_URL}/api/geoserver/wms`,
      version: '1.3.0'
    }
  }
 }

 export const useLayerStore = defineStore({
  id: 'layer',
  state: () => {
    return {
      layers: layerDefinitions,
      legends: {},
      layerOrder: [
        'standorte',
        'digitale_flurkarte',
        'bergahorn',
        'buche',
        'douglasie',
        'eiche',
        'ela',
        'esche',
        'fichte',
        'kiefer',
        'kirsche',
        'schwarzerle',
        'tanne',
        'flurkartenSchnitt',
        'alkisParzellarkarte',
        'trinkwasser',
        'landschaftsschutz',
        'naturschutz',
        'ffh',
        'vogel',
        'naturparke',
        'winterlinde',
        'regierungsbezirk',
        'landkreis',
        'gemeinde',
        'kartiergebiete',
        'soilNutrients',
      ],
      layerOpacities: Object.fromEntries(
        Object.keys(layerDefinitions).map(layerName => [layerName, 100])
      ),
      expandedLegends: {},
      legendSizes: {}
    }
  },

  getters: {
    getLegendUrl: (state) => (layerName) => {
      const layer = state.layers[layerName];
      if (!layer) return null;
      
      const { wmsConfig, sourceLayer, style } = layer;
      if (!wmsConfig || !sourceLayer) return null;
  
      const params = {
        REQUEST: 'GetLegendGraphic',
        VERSION: wmsConfig.version,
        FORMAT: 'image/png',
        LAYER: sourceLayer,
        STYLE: style || '',
        TRANSPARENT: true
      };
  
      return `${wmsConfig.url}?${new URLSearchParams(params)}`;
    },
    getLayerLabel: (state) => (layerName) => state.layers[layerName]?.label || layerName,
    getLayerSource: (state) => (layerName) => state.layers[layerName]?.sourceLayer,
    getLayerWmsConfig: (state) => (layerName) => state.layers[layerName]?.wmsConfig,
    getLayerZIndex: (state) => (layerName) => state.layers[layerName]?.zIndex || 5,
    getLayerDescription: (state) => (layerName) => state.layers[layerName]?.description,
    isLayerProtected: (state) => (layerName) => state.layers[layerName]?.protected || false,
    layerNeedsBearer: (state) => (layerName) => state.layers[layerName]?.needsBearer || false,
    getLayerStyle: (state) => (layerName) => state.layers[layerName]?.style || null,
    visibleLayers: (state) => Object.entries(state.layers)
      .filter(([, layer]) => layer.visible === true)
      .map(([name]) => name)
  },

  actions: {
    setLayerVisibility(layerName, isVisible) {
      if (this.layers[layerName]) {
        this.layers[layerName] = {
          ...this.layers[layerName],
          visible: isVisible
        }
      }
    },

    setLegendUrl(layerName, url) {
      this.legends[layerName] = url
    },

    updateLayerOrder(newOrder) {
      this.layerOrder = newOrder
    },

    setLayerOpacity(layerName, opacity) {
      this.layerOpacities[layerName] = opacity
    },

    setLegendSize(layerName, size) {
      this.legendSizes[layerName] = size
    },

    toggleExpandedLegend(layerName) {
      this.expandedLegends[layerName] = !this.expandedLegends[layerName]
    },

    cleanup() {
      const authStore = useAuthStore()
      const isAuthenticated = authStore.isAuthenticated
      
      Object.keys(this.layers).forEach(layerName => {
        if (layerName === 'kartiergebiete') {
          this.setLayerVisibility(layerName, !isAuthenticated)
        } else if (layerName === 'standorte') {
          this.setLayerVisibility(layerName, isAuthenticated)
        }
      })

      this.legends = {}
      this.layerOpacities = {}
      this.expandedLegends = {}
      this.legendSizes = {}
    }
  }
})