// stores/uiStore.js
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isInfoPanelVisible: false,
    isSidebarExpanded: true,
    activeControl: null,
    mapAttribution: 'OpenStreetMap contributors',
    shouldShowMainSidebar: false
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
      },

    setShowMainSidebar() {
        this.shouldShowMainSidebar = true
    },

    hideMainSidebar() {
        this.shouldShowMainSidebar = false
    }

  },
  
  getters: {
    isHandleVisible: (state) => !state.isInfoPanelVisible,
    getMainSidebarVisibility: (state) => state.shouldShowMainSidebar
  }
})