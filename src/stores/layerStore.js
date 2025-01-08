// stores/layerStore.js
import { defineStore } from 'pinia'

export const useLayerStore = defineStore({
  id: 'layer',  // Make sure to provide an id
  state: () => ({
    layers: {
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
    },
    protectedLayers: ['soilNutrients'],
    legends: {},
    layerOrder: [
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
    ],
    layerOpacities: {},
    expandedLegends: {},
    legendSizes: {}
  }),

  actions: {
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
    }
  }
});