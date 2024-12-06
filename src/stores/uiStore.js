// stores/uiStore.js
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isInfoPanelVisible: false,
    isSidebarExpanded: true,
    activeControl: null,
    mapAttribution: 'OpenStreetMap contributors'
  }),
  
  actions: {
    setInfoPanelVisibility(isVisible) {
      this.isInfoPanelVisible = isVisible
      if (!isVisible) {
        this.activeControl = null
      }
    },

    toggleSidebar() {
      this.isSidebarExpanded = !this.isSidebarExpanded
    },

    toggleControl(control) {
      this.activeControl = this.activeControl === control ? null : control
    },

    clearActiveControl() {
      this.activeControl = null
    },

    setMapAttribution(attribution) {
        this.mapAttribution = attribution
      }

  },
  
  getters: {
    isHandleVisible: (state) => !state.isInfoPanelVisible
  }
})