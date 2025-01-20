import { defineStore } from 'pinia'
import { useAuthStore } from './authStore';

export const useLayerStore = defineStore({
  id: 'layer',
  state: () => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated

    return {
      layers: {
        flurkartenSchnitt: {
          visible: false,
          sourceLayer: 'admin_boundaries:flurkarte'
        },
        regierungsbezirk: {
          visible: false,
          sourceLayer: 'admin_boundaries:regierungsbezirke'
        },
        landkreis: {
          visible: false,
          sourceLayer: 'admin_boundaries:landkreise'
        },
        gemeinde: {
          visible: false,
          sourceLayer: 'admin_boundaries:gemeinden'
        },
        kartiergebiete: {
          visible: !isAuthenticated,
          sourceLayer: 'vfs:kartiergebiete'
        },
        trinkwasser: {
          visible: false,
          sourceLayer: 'schutzgebiete:twsg'
        },
        landschaftsschutz: {
          visible: false,
          sourceLayer: 'schutzgebiete:landschafts'
        },
        naturschutz: {
          visible: false,
          sourceLayer: 'schutzgebiete:natur'
        },
        soilNutrients: {
          visible: false,
          sourceLayer: '0',
          protected: true,
          needsBearer: false
        },
        alkisParzellarkarte: {
          visible: false,
          sourceLayer: 'by_alkis_parzellarkarte_farbe'
        },
        standorte: {
          visible: isAuthenticated,
          sourceLayer: 'vfs:standorte',
          protected: true,
          needsBearer: true
        },
        bergahorn: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_bergahorn',
          protected: true,
          needsBearer: true
        },
        buche: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_buche',
          protected: true,
          needsBearer: true
        },
        douglasie: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_douglasie',
          protected: true,
          needsBearer: true
        },
        eiche: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_eiche',
          protected: true,
          needsBearer: true
        },
        ela: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_ela',
          protected: true,
          needsBearer: true
        },
        esche: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_esche',
          protected: true,
          needsBearer: true
        },
        fichte: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_fichte',
          protected: true,
          needsBearer: true
        },
        kiefer: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_kiefer',
          protected: true,
          needsBearer: true
        },
        kirsche: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_kirsche',
          protected: true,
          needsBearer: true
        },
        schwarzerle: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_schwarzerle',
          protected: true,
          needsBearer: true
        },
        stieleiche: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_stieleiche',
          protected: true,
          needsBearer: true
        },
        tanne: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_tanne',
          protected: true,
          needsBearer: true
        },
        traubeneiche: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_traubeneiche',
          protected: true,
          needsBearer: true
        },
        winterlinde: { 
          visible: false,
          sourceLayer: 'vfs:standorte',
          style: 'standorte_winterlinde',
          protected: true,
          needsBearer: true
        },
      },

      protectedLayers: ['soilNutrients', 'standorte', 'vfs:standorte'],
      layerNeedsBearerToken: ['standorte', 'vfs:standorte'],
      legends: {},
      layerOrder: [
        'standorte',
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
        'winterlinde',
        'kartiergebiete',
        'soilNutrients',
        'gemeinde',
        'landkreis',
        'regierungsbezirk'
      ],
      layerOpacities: {},
      expandedLegends: {},
      legendSizes: {}
    }
  },

  actions: {
    setLayerVisibility(layerName, isVisible) {
      if (this.layers[layerName]) {
        // Create new object to ensure reactivity
        this.layers[layerName] = {
          ...this.layers[layerName],
          visible: isVisible
        }
        console.log(`Layer ${layerName} visibility set to:`, this.layers[layerName].visible)
      }
    },

    cleanup() {
      const authStore = useAuthStore()
      const isAuthenticated = authStore.isAuthenticated
      
      // Create new objects for affected layers
      this.layers = {
        ...this.layers,
        kartiergebiete: {
          ...this.layers.kartiergebiete,
          visible: !isAuthenticated
        },
        standorte: {
          ...this.layers.standorte,
          visible: isAuthenticated
        }
      }

      // Reset other state
      this.legends = {}
      this.layerOpacities = {}
      this.expandedLegends = {}
      this.legendSizes = {}
    },
    
    setLegendUrl(layerName, url) {
      this.legends[layerName] = url;
    },

    updateLayerOrder(newOrder) {
      this.layerOrder = newOrder;
    },

    setLayerOpacity(layerName, opacity) {
      this.layerOpacities[layerName] = opacity;
    },

    setLegendSize(layerName, size) {
      this.legendSizes[layerName] = size;
    },

    toggleExpandedLegend(layerName) {
      this.expandedLegends[layerName] = !this.expandedLegends[layerName];
    }
  },

  getters: {
    visibleLayers: (state) => {
      return Object.entries(state.layers)
        .filter(([, layer]) => layer && layer.visible === true)
        .map(([name]) => name);
    },  
    isLayerProtected: (state) => (layerName) => {
      return state.layers[layerName]?.protected || state.protectedLayers.includes(layerName);
    },
    layerNeedsBearer: (state) => (layerName) => {
      return state.layers[layerName]?.needsBearer || state.layerNeedsBearerToken.includes(layerName);
    },
    getLayerSource: (state) => (layerName) => {
      return state.layers[layerName]?.sourceLayer || layerName;
    },
    getLayerStyle: (state) => (layerName) => {
      return state.layers[layerName]?.style || null;
    }
  }
});