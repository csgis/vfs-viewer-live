import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => {
    return {
      isInfoPanelVisible: false,
      mainSidebarExpanded: true,
      mapSidebarExpanded: true,
      activeControl: null,
      mapAttribution: 'OpenStreetMap contributors',
      isMapSidebarVisible: true
    }
  },

  actions: {
    setInfoPanelVisibility(isVisible) {
      this.isInfoPanelVisible = isVisible
      if (!isVisible) {
        this.activeControl = null
      }
    },

    toggleMainSidebar() {
      const isMapPage = window.location.pathname === '/karte'
      if (!isMapPage) {
        this.mainSidebarExpanded = !this.mainSidebarExpanded
      }
    },

    toggleMapSidebar() {
      this.mapSidebarExpanded = !this.mapSidebarExpanded
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

    showMapSidebar() {
      this.isMapSidebarVisible = true
      this.mainSidebarExpanded = false  // Force collapse main sidebar
    },

    hideMapSidebar() {
      this.isMapSidebarVisible = false
      const isMapPage = window.location.pathname === '/karte'
      if (!isMapPage) {
        this.mainSidebarExpanded = true
      }
    },
  },
  
  setMainSidebarState(expanded) {
    if (window.location.pathname !== '/karte') {
      this.mainSidebarExpanded = expanded
    }
  },

  getters: {
    isHandleVisible: (state) => !state.isInfoPanelVisible && state.isMapSidebarVisible,
    getEffectiveMainSidebarWidth: (state) => state.mainSidebarExpanded ? 'w-1/4' : 'w-12',
    getEffectiveMapSidebarWidth: (state) => state.mapSidebarExpanded ? 'w-1/4' : 'w-12'
  }
})