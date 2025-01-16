// stores/layerStore.js
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore';

export const useLayerStore = defineStore({
  id: 'layer',
  state: () => {
    // Need to create a state function that returns the object directly
    return {
      layers: (() => {
        const authStore = useAuthStore()
        return {
          flurkartenSchnitt: false,
          regierungsbezirk: false,
          landkreis: false,
          gemeinde: false,
          kartiergebiete: !authStore.isAuthenticated,
          trinkwasser: false,
          landschaftsschutz: false,
          naturschutz: false,
          soilNutrients: false,
          alkisParzellarkarte: false,
          standorte: authStore.isAuthenticated,
        }
      })(),
      protectedLayers: ['soilNutrients', 'standorte', 'vfs:standorte'],
      layerNeedsBearerToken: ['standorte', 'vfs:standorte'],
      legends: {},
      layerOrder: [
        'flurkartenSchnitt',
        'alkisParzellarkarte',
        'trinkwasser',
        'landschaftsschutz',
        'naturschutz',
        'standorte',
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

    cleanup() {
      const authStore = useAuthStore()
      // Update the layers based on authentication status
      this.layers = {
        ...this.layers,
        kartiergebiete: !authStore.isAuthenticated,
        standorte: authStore.isAuthenticated
      }
      // Reset other state
      this.legends = {}
      this.layerOpacities = {}
      this.expandedLegends = {}
      this.legendSizes = {}
    },
    setLayerVisibility(layerName, isVisible) {
      this.layers[layerName] = isVisible;
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
        .filter(([, isVisible]) => isVisible)
        .map(([name]) => name);
    },
    isLayerProtected: (state) => (layerName) => {
      return state.protectedLayers.includes(layerName)
    },
    layerNeedsBearer: (state) => (layerName) => {
      return state.layerNeedsBearerToken.includes(layerName)
    }
  }
});