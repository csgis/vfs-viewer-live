// stores/uiStore.js
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isInfoPanelVisible: false,
    isSidebarExpanded: true,
    activeControl: null,
    mapAttribution: 'OpenStreetMap contributors',
    shouldShowMainSidebar: false,
    isMapSidebarVisible: true  // New state to track map sidebar visibility
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
      this.isMapSidebarVisible = false  // Hide map sidebar when main sidebar is shown
    },

    hideMainSidebar() {
      this.shouldShowMainSidebar = false
      this.isMapSidebarVisible = true   // Show map sidebar when main sidebar is hidden
    }
  },
  
  getters: {
    isHandleVisible: (state) => !state.isInfoPanelVisible && state.isMapSidebarVisible,
    getMainSidebarVisibility: (state) => state.shouldShowMainSidebar
  }
})