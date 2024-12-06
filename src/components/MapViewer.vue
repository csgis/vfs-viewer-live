<template>
  <div class="relative h-full w-full">
    <!-- Map Container -->
    <div 
      ref="mapElement" 
      :class="`absolute inset-0 transition-all duration-300 ${
        uiStore.isSidebarExpanded ? 'ml-[25%]' : 'ml-12'
      }`"
    ></div>

    <!-- Map Sidebar - Positioned absolutely -->
    <div 
      :class="`fixed left-0 top-0 bg-white shadow-lg flex flex-col z-50 h-full transition-all duration-300  ${
        uiStore.isSidebarExpanded ? 'w-1/4' : 'w-12'
      }`"
    >
      <!-- Toggle Button - Absolute positioned on the right edge -->
          <button 
            @click="uiStore.toggleSidebar"
            class="absolute right-0 translate-x-full top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white rounded-r-lg shadow-md flex items-center justify-center border border-l-0 border-gray-400 z-50"
            aria-label="Toggle sidebar"
            :class="{ 'hidden': !uiStore.isHandleVisible }"
          >
        <svg 
          class="w-4 h-4 text-gray-400 transform transition-transform duration-300"
          :class="uiStore.isSidebarExpanded ? 'rotate-0' : 'rotate-180'"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Header -->
      <div class="p-4 border-b border-slate-600" :class="{ 'hidden': !uiStore.isSidebarExpanded }">
        <img 
          src="img/logo2.svg" 
          alt="Logo" 
          class="h-8 object-contain"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto" :class="{ 'hidden': !uiStore.isSidebarExpanded }">
        <div class="p-4 text-black">
          <LayerAccordion 
            v-if="map"
            :map="map" 
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-black" :class="{ 'hidden': !uiStore.isSidebarExpanded }">
        <button 
          @click="navigateBack"
          class="w-full p-3 flex items-center text-black hover:bg-gray-100 rounded-lg"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück
        </button>
      </div>
    </div>
  
    <!-- Control Buttons Panel -->
    <div v-show="map" class="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
      <!-- Home button -->
      <TooltipButton
        tooltip="Startansicht"
        buttonClass="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-rose-300 transition-colors border border-gray-300"
        @click="zoomHomeRef.zoomToHome()"
      >
        <img src="../assets/home.svg" class="h-6 w-6" alt="Home">
      </TooltipButton>

      <TooltipButton
          tooltip="Stadt suchen"
          :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
            uiStore.activeControl !== 'city-search' 
              ? 'bg-white hover:bg-rose-300 border-gray-300' 
              : 'bg-rose-300 hover:bg-rose-400 bg-rose-300 text-white'
          }`"
          @click="toggleControl('city-search')"
        >
        <img src="../assets/search.svg" class="h-6 w-6" alt="Help">
      </TooltipButton>

      <!-- Help Button -->
      <TooltipButton
        tooltip="Hilfe öffnen"
        buttonClass="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-rose-300 transition-colors border border-gray-300"
        @click="helpRef.openHelp()"
      >
        <img src="../assets/help.svg" class="h-6 w-6" alt="Help">
      </TooltipButton>

      <!-- Navigate Back Button -->
      <TooltipButton
        tooltip="Zurück zur vorherigen Ansicht"
        :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          navigateBackRef?.hasHistory
            ? 'bg-rose-300 hover:bg-rose-400 border-gray-300' 
            : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
        }`"
        :disabled="!navigateBackRef?.hasHistory"
        @click="navigateBackRef?.goBack"
      >
        <div class="absolute bottom-0 left-0 text-xs bg-white p-1 rounded hidden">
          ref: {{!!navigateBackRef}} | 
          hasHistory: {{!!navigateBackRef?.hasHistory}} |
          raw: {{navigateBackRef}}
        </div>
        <img src="../assets/back.svg" class="h-6 w-6" alt="Back">
      </TooltipButton>

      <!-- Zoom to Extent Button -->
      <TooltipButton
        tooltip="Bereich auswählen"
        :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
            uiStore.activeControl !== 'zoom-extent' 
            ? 'bg-white hover:bg-rose-300 border-gray-300' 
            : 'bg-rose-300 hover:bg-rose-400 bg-rose-400 text-white'
        }`"
        @click="toggleControl('zoom-extent')"
      >
        <img src="../assets/extent.svg" class="h-6 w-6" alt="Extent">
      </TooltipButton>

      <!-- Measure Line Button -->
      <TooltipButton
        tooltip="Strecke messen"
        :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.activeControl !== 'measure-line' 
            ? 'bg-white hover:bg-rose-300 border-gray-3000' 
            : 'bg-rose-300 hover:bg-rose-400 border-rose-400 text-white'
        }`"
        @click="toggleControl('measure-line')"
      >
        <img src="../assets/line.svg" class="h-6 w-6" alt="Measure Line">
      </TooltipButton>

      <!-- Measure Area Button -->
      <TooltipButton
        tooltip="Fläche messen"
        :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.activeControl !== 'measure-area' 
            ? 'bg-white hover:bg-rose-300 border-gray-300' 
            : 'bg-rose-300 hover:bg-rose-400 border-rose-400 text-white'
        }`"
        @click="toggleControl('measure-area')"
      >
        <img src="../assets/area.svg" class="h-6 w-6" alt="Measure Area">
      </TooltipButton>

      <!-- Info Button -->
      <TooltipButton
        tooltip="Karteninhalte abfragen"
        :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.activeControl !== 'info' 
            ? 'bg-white hover:bg-rose-300 border-gray-300' 
            : 'bg-rose-300 hover:bg-rose-400 border-rose-400 text-white'
        }`"
        @click="uiStore.toggleControl('info')"
      >
        <img src="../assets/info.svg" class="h-6 w-6" alt="Info">
      </TooltipButton>

      <!-- Print Button -->
      <TooltipButton
        tooltip="Karte drucken"
        :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.activeControl !== 'print' 
            ? 'bg-white hover:bg-rose-300 border-gray-300' 
            : 'bg-rose-300 hover:bg-rose-400 border-rose-400 text-white'
        }`"
        @click="toggleControl('print')"
      >
        <img src="../assets/print.svg" class="h-6 w-6" alt="Print">
      </TooltipButton>

    </div>
  

      <!-- Map Attribution -->
      <MapAttribution />

    <!-- Hidden Components -->
    <HelpLink ref="helpRef" />
    <NavigateBack ref="navigateBackRef" :map="map" v-if="map" />
    <ZoomToExtent
      v-if="uiStore.activeControl === 'zoom-extent' && map"
      :map="map"
      :active="true"
      @close="toggleControl(null)"
    />
    <ZoomHome ref="zoomHomeRef" :map="map" v-if="map" />

    <CitySearch
      v-if="uiStore.activeControl === 'city-search' && map"
      :map="map"
      :active="true"
      @close="toggleControl(null)"
    />

    <!-- Tool Components -->
    <MeasureLine
      v-if="uiStore.activeControl === 'measure-line' && map"
      :map="map"
      :active="true"
      @close="toggleControl(null)"
    />
    <MeasureArea
      v-if="uiStore.activeControl === 'measure-area' && map"
      :map="map"
      :active="true"
      @close="toggleControl(null)"
    />
    <InfoTool
      v-if="uiStore.activeControl === 'info' && map"
      :map="map"
      :active="true"
      @close="uiStore.clearActiveControl()"
    />
    <PrintTool
      v-if="uiStore.activeControl === 'print' && map"
      :map="map"
      :active="true"
      @close="toggleControl(null)"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { useMapLayers } from '../composables/useMapLayers';
import LayerAccordion from './LayerAccordion.vue';
import ZoomHome from './ZoomHome.vue';
import HelpLink from './HelpLink.vue';
import NavigateBack from './NavigateBack.vue';
import ZoomToExtent from './ZoomToExtent.vue';
import MeasureLine from './MeasureLine.vue';
import MeasureArea from './MeasureArea.vue';
import InfoTool from './InfoTool.vue';
import PrintTool from './PrintTool.vue';
import TooltipButton from './TooltipButton.vue';
import { useRoute } from 'vue-router';
import CitySearch from './CitySearch.vue';
import { useUIStore } from '../stores/uiStore'
import MapAttribution from './MapAttribution.vue'

export default {
  name: 'MapViewer',
  components: {
    LayerAccordion,
    ZoomHome,
    HelpLink,
    NavigateBack,
    ZoomToExtent,
    MeasureLine,
    MeasureArea,
    InfoTool,
    PrintTool,
    TooltipButton,
    CitySearch,
    MapAttribution
  },

  setup() {
    const uiStore = useUIStore()
    const router = useRouter();
    const mapElement = ref(null);
    const map = ref(null);
    const zoomHomeRef = ref(null);
    const helpRef = ref(null);
    const navigateBackRef = ref(null);
    const zoomToExtentRef = ref(null);
    const route = useRoute();
    const { initializeBackground, cleanup } = useMapLayers();

    const handleResize = () => {
      if (map.value) {
        requestAnimationFrame(() => {
          map.value.updateSize();
        });
      }
    };

    watch(() => uiStore.isSidebarExpanded, () => {
      setTimeout(updateZoomControlPosition, 300);
    });

    // Update the zoom control position function
    const updateZoomControlPosition = () => {
      const zoomControl = document.querySelector('.ol-zoom');
      if (zoomControl) {
        if (uiStore.isSidebarExpanded) {
          zoomControl.style.setProperty('left', 'calc(25vw + 0.5rem)', 'important');
        } else {
          zoomControl.style.setProperty('left', '4rem', 'important');
        }
      }
    };

  // Also update position when map is initialized
  watch(() => map.value, (newMap) => {
    if (newMap) {
      // Wait a brief moment for the controls to be rendered
      setTimeout(updateZoomControlPosition, 100);
    }
  });

  // Update position on component mount
  onMounted(() => {
    setTimeout(updateZoomControlPosition, 100);
  });


  watch(() => map.value, async (newMap) => {
    if (newMap) {
      await nextTick();
      console.log('Map updated, checking navigateBackRef:', {
        ref: navigateBackRef.value,
        hasHistory: navigateBackRef.value?.hasHistory,
      });
    }
  });

  const cleanupMap = () => {
    console.log('Cleaning up map...');
    if (map.value) {
      cleanup(map.value);
      map.value.setTarget(null);
      map.value = null;
    }
    uiStore.activeControl = null;
    window.removeEventListener('resize', handleResize);
  };
    const initializeMap = () => {
      console.log('Initializing map...');
      
      cleanupMap();

      let center = fromLonLat([11.4, 48.7]); // Default Bavaria center
      let zoom = 8; // Default zoom

      // Check if we have extent and zoom in URL
      if (route.query.extent && route.query.zoom) {
        try {
          const [centerX, centerY] = route.query.extent.split(',').map(Number);
          zoom = Number(route.query.zoom);

          // Only use URL values if they are valid numbers
          if (!isNaN(centerX) && !isNaN(centerY) && !isNaN(zoom)) {
            center = [centerX, centerY];
            console.log('Using URL parameters for map initialization:', { center, zoom });
          } else {
            console.log('Invalid URL parameters, using defaults');
          }
        } catch (error) {
          console.warn('Error parsing URL parameters:', error);
        }
      }

      const view = new View({
        center: center,
        zoom: zoom,
        minZoom: 7,
        maxZoom: 19,
        constrainResolution: true,
        smoothResolutionConstraint: true,
        smoothExtentConstraint: true,
      });

      map.value = new Map({
        target: mapElement.value,
        layers: [],
        controls: defaultControls({
          zoom: true,
          attribution: false
        }),
        view: view,
        pixelRatio: 1,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
      });

      initializeBackground(map.value);
      window.addEventListener('resize', handleResize);
    };

    const toggleControl = (control) => {
      uiStore.toggleControl(control);
    };

    const navigateBack = () => {
      cleanupMap();
      router.push('/');
    };

    onMounted(() => {
      console.log('Component mounted');
      console.log('MapViewer mounted - navigateBackRef:', navigateBackRef.value)
      initializeMap();
    });

    onUnmounted(() => {
      console.log('Component unmounted');
      cleanupMap();
    });

    onActivated(() => {
      console.log('Component activated');
      if (!map.value) {
        initializeMap();
      }
    });

    onDeactivated(() => {
      console.log('Component deactivated');
      cleanupMap();
    });

    return {
      mapElement,
      map,
      toggleControl,
      navigateBack,
      helpRef,
      navigateBackRef,
      zoomToExtentRef,
      zoomHomeRef,
      uiStore,
    };
  }
};
</script>