<template>
  <div class="relative h-full w-full">
    <!-- Map Container -->
    <div 
      ref="mapElement" 
      :class="`absolute inset-0 transition-all duration-300 ${
        !uiStore.isMapSidebarVisible ? 'ml-12' :  // just main nav (3rem)
        uiStore.mapSidebarExpanded ? 'ml-[calc(3rem+25%-3%)]' : ''  // Adjusted for exact alignment
      }`"
    ></div>

    <!-- Map Sidebar -->
    <div 
      :class="`fixed left-12 bg-white shadow-lg flex flex-col h-full transition-all duration-300 ${
        !uiStore.isMapSidebarVisible ? 'hidden' : 
        uiStore.mapSidebarExpanded ? 'w-1/4' : ''
      }`"
    >

      <!-- Toggle Button -->
      <button 
        @click="uiStore.toggleMapSidebar"
        class="absolute right-0 translate-x-full top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white rounded-r-lg shadow-md flex items-center justify-center border border-l-0 border-gray-400 z-50"
        aria-label="Toggle sidebar"
        :class="{ 'hidden': !uiStore.isHandleVisible }"
      >
        <svg 
          class="w-4 h-4 text-gray-400 transform transition-transform duration-300"
          :class="uiStore.mapSidebarExpanded ? 'rotate-0' : 'rotate-180'"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto" :class="{ 'hidden': !uiStore.mapSidebarExpanded }">
        <div class="p-4 text-black">
          <LayerAccordion 
            v-if="map"
            :map="map" 
          />
        </div>
      </div>


    </div>
  
    <!-- Control Buttons Panel -->
    <div v-show="map" class="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
      <!-- Home button -->
      <TooltipButton
        tooltip="Zeige gesamte Karte"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? '!bg-white !border-black hover:!bg-gray-200'
            : 'bg-white hover:bg-blue-300 border-gray-300'
        }`"
        @click="zoomHomeRef.zoomToHome()"
        >
        <img src="../assets/home.svg" class="h-6 w-6" alt="Home">
        </TooltipButton>

      <!-- City search -->
      <TooltipButton
        tooltip="Adresse suchen"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? uiStore.activeControl === 'city-search'
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-white !border-black hover:!bg-gray-200'
            : uiStore.activeControl !== 'city-search'
              ? 'bg-white hover:bg-blue-300 border-gray-300'
              : 'bg-blue-300 hover:bg-blue-400 bg-blue-300 text-white'
        }`"
        @click="toggleControl('city-search')"
        >
        <img 
          src="../assets/search.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'city-search' ? 'filter invert' : ''}`"
          alt="Search"
        >
        </TooltipButton>

      <!-- Help Button -->
      <TooltipButton
        tooltip="Hilfe Dokument"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? '!bg-white !border-black hover:!bg-gray-200'
            : 'bg-white hover:bg-blue-300 border-gray-300'
        }`"
        @click="helpRef.openHelp()"
        >
        <img src="../assets/help.svg" class="h-6 w-6" alt="Help">
        </TooltipButton>

      <!-- Navigate Back Button -->
      <TooltipButton
        tooltip="Schritt zurück"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? navigateBackRef?.hasHistory
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-gray-200 !border-black opacity-50 cursor-not-allowed'
            : navigateBackRef?.hasHistory
              ? 'bg-blue-300 hover:bg-blue-400 border-gray-300'
              : 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
        }`"
        :disabled="!navigateBackRef?.hasHistory"
        @click="navigateBackRef?.goBack"
        >
        <img 
          src="../assets/back.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && navigateBackRef?.hasHistory ? 'filter invert' : ''}`"
          alt="Back"
        >
        </TooltipButton>

      <!-- Zoom to Extent Button -->
      <TooltipButton
          tooltip="Kartenauschnitt vergrößern"
          :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
            uiStore.accessibilityMode === 'highContrast'
              ? uiStore.activeControl === 'zoom-extent'
                ? '!bg-black !text-white hover:!bg-gray-800'
                : '!bg-white !border-black hover:!bg-gray-200'
              : uiStore.activeControl !== 'zoom-extent'
                ? 'bg-white hover:bg-blue-300 border-gray-300'
                : 'bg-blue-300 hover:bg-blue-400 bg-blue-400 text-white'
          }`"
          @click="toggleControl('zoom-extent')"
          >
          <img 
            src="../assets/extent.svg" 
            :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'zoom-extent' ? 'filter invert' : ''}`"
            alt="Extent"
          >
          </TooltipButton>

      <!-- Measure Line Button -->
      <TooltipButton
        tooltip="Entfernung messen"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? uiStore.activeControl === 'measure-line'
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-white !border-black hover:!bg-gray-200'
            : uiStore.activeControl !== 'measure-line'
              ? 'bg-white hover:bg-blue-300 border-gray-300'
              : 'bg-blue-300 hover:bg-blue-400 border-blue-400 text-white'
        }`"
        @click="toggleControl('measure-line')"
        >
        <img 
          src="../assets/line.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'measure-line' ? 'filter invert' : ''}`"
          alt="Measure Line"
        >
        </TooltipButton>

      <!-- Measure Area Button -->
      <TooltipButton
        tooltip="Fläche messen"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? uiStore.activeControl === 'measure-area'
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-white !border-black hover:!bg-gray-200'
            : uiStore.activeControl !== 'measure-area'
              ? 'bg-white hover:bg-blue-300 border-gray-300'
              : 'bg-blue-300 hover:bg-blue-400 border-blue-400 text-white'
        }`"
        @click="toggleControl('measure-area')"
        >
        <img 
          src="../assets/area.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'measure-area' ? 'filter invert' : ''}`"
          alt="Measure Area"
        >
        </TooltipButton>

      <!-- Measure Radius Button -->
      <TooltipButton
        tooltip="Radius messen"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? uiStore.activeControl === 'measure-radius'
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-white !border-black hover:!bg-gray-200'
            : uiStore.activeControl !== 'measure-radius'
              ? 'bg-white hover:bg-blue-300 border-gray-300'
              : 'bg-blue-300 hover:bg-blue-400 border-blue-400 text-white'
        }`"
        @click="toggleControl('measure-radius')"
        >
        <img 
          src="../assets/radius.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'measure-radius' ? 'filter invert' : ''}`"
          alt="Measure Radius"
        >
        </TooltipButton>

      <!-- Info Button -->
      <TooltipButton
        tooltip="Rauminformationen"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? uiStore.activeControl === 'info'
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-white !border-black hover:!bg-gray-200'
            : uiStore.activeControl !== 'info'
              ? 'bg-white hover:bg-blue-300 border-gray-300'
              : 'bg-blue-300 hover:bg-blue-400 border-blue-400 text-white'
        }`"
        @click="uiStore.toggleControl('info')"
        >
        <img 
          src="../assets/info.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'info' ? 'filter invert' : ''}`"
          alt="Info"
        >
        </TooltipButton>

      <!-- Print Button -->
      <TooltipButton
        tooltip="PDF erzeugen"
        :buttonClass="`w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
          uiStore.accessibilityMode === 'highContrast'
            ? uiStore.activeControl === 'print'
              ? '!bg-black !text-white hover:!bg-gray-800'
              : '!bg-white !border-black hover:!bg-gray-200'
            : uiStore.activeControl !== 'print'
              ? 'bg-white hover:bg-blue-300 border-gray-300'
              : 'bg-blue-300 hover:bg-blue-400 border-blue-400 text-white'
        }`"
        @click="toggleControl('print')"
        >
        <img 
          src="../assets/print.svg" 
          :class="`h-6 w-6 ${uiStore.accessibilityMode === 'highContrast' && uiStore.activeControl === 'print' ? 'filter invert' : ''}`"
          alt="Print"
        >
        </TooltipButton>
    </div>
  
    <!-- Scale Info -->
    <ScaleInfo :map="map" v-if="map" />

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
    <MeasureRadius
      v-if="uiStore.activeControl === 'measure-radius' && map"
      :map="map"
      :active="true"
      @close="toggleControl(null)"
    />
  </div>
</template>

<script>import { ref, onMounted, onUnmounted, onActivated, onDeactivated, watch, nextTick, computed } from 'vue';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
// import { useMapLayers } from '../composables/useMapLayers';
import { useLayerManagement } from '../composables/useLayerManagement'; 
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
import CitySearch from './CitySearch.vue';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import MapAttribution from './MapAttribution.vue';
import ScaleInfo from './ScaleInfo.vue';
import MeasureRadius from './MeasureRadius.vue';
import { useRoute } from 'vue-router'
import { useBackgroundStore } from '../stores/backgroundStore'

const backgroundStore = useBackgroundStore()

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
    MapAttribution,
    ScaleInfo,
    MeasureRadius
  },

  setup() {
    const uiStore = useUIStore();
    const mapElement = ref(null);
    const map = ref(null);
    const zoomHomeRef = ref(null);
    const helpRef = ref(null);
    const navigateBackRef = ref(null);
    const zoomToExtentRef = ref(null);
    const { cleanup } = useLayerManagement();
    const authStore = useAuthStore();

    // Check if we have an extent
    if (authStore.hasMapExtent) {
      console.log('Map extent:', authStore.mapExtent);
    } else {
      console.log('No map extent available');
    }

    const handleResize = () => {
      if (map.value) {
        requestAnimationFrame(() => {
          map.value.updateSize();
        });
      }
    };

    // Update the zoom control position function
    const updateZoomControlPosition = () => {
      const zoomControl = document.querySelector('.ol-zoom');
      if (zoomControl) {
        const mainSidebarWidth = uiStore.mainSidebarExpanded ? '25vw' : '3rem';
        const mapSidebarWidth = uiStore.isMapSidebarVisible && uiStore.mapSidebarExpanded ? '25vw' : '1rem';
        const totalOffset = `calc(${mainSidebarWidth} + ${mapSidebarWidth} + 0.5rem)`;
        zoomControl.style.setProperty('left', totalOffset, 'important');
      }
    };

    // Watch both sidebars for changes
    watch([
      () => uiStore.mainSidebarExpanded,
      () => uiStore.mapSidebarExpanded,
      () => uiStore.isMapSidebarVisible
    ], () => {
      setTimeout(updateZoomControlPosition, 300);
      // Trigger a resize event to update the map size
      if (map.value) {
        map.value.updateSize();
      }
    });

    watch(() => map.value, async (newMap) => {
      if (newMap) {
        await nextTick();
        updateZoomControlPosition();
      }
    });

    // Watch for authentication changes
    watch(
      () => authStore.isAuthenticated,
      (isAuthenticated) => {
        if (!isAuthenticated) {
          cleanupMap()
        }
      }
    )

    

    const cleanupMap = () => {
    if (map.value) {
      cleanup(map.value)
      map.value.setTarget(null)
      map.value.dispose() // Properly dispose of the map
      map.value = null
    }
    uiStore.activeControl = null
    window.removeEventListener('resize', handleResize)
  }


    const calculateZoomToFitExtent = (map, extent) => {
  // Get the map's size
  const mapSize = map.getSize();
  
  if (!mapSize) {
    console.warn('Map size not available for zoom calculation');
    return 8; // Default zoom
  }

  // Calculate width and height of the extent
  const extentWidth = Math.abs(extent[2] - extent[0]);
  const extentHeight = Math.abs(extent[3] - extent[1]);

  // Get the map's width and height
  const [mapWidth, mapHeight] = mapSize;

  // Calculate zoom levels based on width and height
  const widthZoom = Math.floor(
    Math.log2(mapWidth / (extentWidth * 1.1)) // 1.1 adds a small padding
  );
  
  const heightZoom = Math.floor(
    Math.log2(mapHeight / (extentHeight * 1.1))
  );

  // Take the lower zoom level to ensure entire extent is visible
  const calculatedZoom = Math.min(widthZoom, heightZoom);

  // Constrain the zoom between min and max
  return Math.max(7, Math.min(calculatedZoom, 19));
};


const initializeMap = () => {
  cleanupMap();

  let center = fromLonLat([11.4, 48.9]); // Default Bavaria center
  let zoom = 8; // Default zoom
  let extent = null;

  // First, check URL parameters
  const route = useRoute();
  if (route.query.extent) {
    const [centerX, centerY, width, height] = route.query.extent.split(',').map(Number);
    const urlZoom = Number(route.query.zoom);

    if (!isNaN(centerX) && !isNaN(centerY) && !isNaN(urlZoom)) {
      console.log('Using URL extent:', route.query.extent);
      center = [centerX, centerY];
      zoom = urlZoom;
      extent = [
        centerX - width / 2, 
        centerY - height / 2, 
        centerX + width / 2, 
        centerY + height / 2
      ];
    }
  } 
  // If no URL extent, check user extent from auth store
  else if (authStore.mapExtent) {
    console.log('Found user extent:', authStore.mapExtent);
    const [minX, minY, maxX, maxY] = authStore.mapExtent;
    
    // Calculate center
    center = [
      (minX + maxX) / 2,
      (minY + maxY) / 2
    ];
    
    // Set extent
    extent = [minX, minY, maxX, maxY];
  }

  // Create map first to enable zoom calculation
  map.value = new Map({
    target: mapElement.value,
    layers: [],
    controls: defaultControls({
      zoom: true,
      attribution: false
    }),
    view: new View({
      center: center,
      zoom: zoom,
      minZoom: 7,
      maxZoom: 19,
      constrainResolution: true,
      smoothResolutionConstraint: true,
      smoothExtentConstraint: true,
    }),
    pixelRatio: 1,
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
  });

  // Calculate zoom if extent is available
  if (extent) {
    // Wait a bit to ensure map is fully initialized
    nextTick(() => {
      const calculatedZoom = calculateZoomToFitExtent(map.value, extent);
      console.log('Calculated zoom:', calculatedZoom);

      const view = map.value.getView();
      view.setCenter(center);
      view.setZoom(calculatedZoom);

      // Optionally fit the view
      view.fit(extent, {
        padding: [50, 50, 50, 50],
        constrainResolution: true
      });
    });
  }

  // Initialize layer management
  // const { initializeLayers } = useLayerManagement(map.value);
  // nextTick(() => {
  //   initializeLayers();
  // });

  // Set up resize handler
  window.addEventListener('resize', handleResize);
}
    
    const toggleControl = (control) => {
      uiStore.toggleControl(control);
    };

    const calculateMapMargin = computed(() => {

      const mapSidebarMargin = uiStore.isMapSidebarVisible 
    ? (uiStore.mapSidebarExpanded ? 'calc(25% + 3rem)' : '6rem') 
    : '3rem'

  return mapSidebarMargin
})

    const navigateBack = () => {
      uiStore.hideMapSidebar();
    };

    onMounted(() => {
      uiStore.showMapSidebar();
      initializeMap();
      setTimeout(updateZoomControlPosition, 10);
      backgroundStore.ensureBackground(map.value);
    });

    onUnmounted(() => {
      cleanupMap();
      backgroundStore.cleanup(map.value)
    });

    onActivated(() => {
      if (!map.value) {
        initializeMap();
      }
      backgroundStore.ensureBackground(map.value);
    });

    onDeactivated(() => {
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
      calculateMapMargin
    };
  }
};
</script>