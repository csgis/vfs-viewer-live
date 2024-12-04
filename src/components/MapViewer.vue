<template>
    <div class="relative h-full w-full">
      <!-- Map Container -->
      <div 
        ref="mapElement" 
        class="absolute inset-0 w-full"
      ></div>
  
      <!-- Map Sidebar - Positioned absolutely -->
      <div class="fixed left-0 top-0 w-80 h-full bg-gray-800 shadow-lg overflow-y-auto z-50">
        <div class="p-4 text-gray-200">
          <LayerAccordion 
            v-if="map"
            :map="map" 
            @back="navigateBack" 
          />
        </div>
      </div>
  
      <!-- Control Buttons Panel -->
<!-- Control Buttons Panel -->
<div v-show="map" class="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">

  <!-- Home button -->
  <TooltipButton
    tooltip="Startansicht"
    buttonClass="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
    @click="zoomHomeRef.zoomToHome()"
  >
    <img src="../assets/home.svg" class="h-6 w-6" alt="Home">
  </TooltipButton>

  <!-- Help Button -->
  <TooltipButton
    tooltip="Hilfe öffnen"
    buttonClass="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
    @click="helpRef.openHelp()"
  >
    <img src="../assets/help.svg" class="h-6 w-6" alt="Help">
  </TooltipButton>

  <!-- Navigate Back Button -->
  <TooltipButton
    tooltip="Zurück zur vorherigen Ansicht"
    :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
      navigateBackRef?.hasHistory
        ? 'bg-white hover:bg-gray-50 border-gray-200' 
        : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
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
        activeControl !== 'zoom-extent' 
        ? 'bg-white hover:bg-gray-50 border-gray-200' 
        : 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white'
    }`"
    @click="toggleControl('zoom-extent')"
    >
    <img src="../assets/extent.svg" class="h-6 w-6" alt="Extent">
    </TooltipButton>

  <!-- Measure Line Button -->
  <TooltipButton
    tooltip="Strecke messen"
    :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
      activeControl !== 'measure-line' 
        ? 'bg-white hover:bg-gray-50 border-gray-200' 
        : 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white'
    }`"
    @click="toggleControl('measure-line')"
  >
    <img src="../assets/line.svg" class="h-6 w-6" alt="Measure Line">
  </TooltipButton>

  <!-- Measure Area Button -->
  <TooltipButton
    tooltip="Fläche messen"
    :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
      activeControl !== 'measure-area' 
        ? 'bg-white hover:bg-gray-50 border-gray-200' 
        : 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white'
    }`"
    @click="toggleControl('measure-area')"
  >
    <img src="../assets/area.svg" class="h-6 w-6" alt="Measure Area">
  </TooltipButton>

  <!-- Info Button -->
  <TooltipButton
    tooltip="Karteninhalte abfragen"
    :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
      activeControl !== 'info' 
        ? 'bg-white hover:bg-gray-50 border-gray-200' 
        : 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white'
    }`"
    @click="toggleControl('info')"
  >
    <img src="../assets/info.svg" class="h-6 w-6" alt="Info">
  </TooltipButton>

  <!-- Print Button -->
  <TooltipButton
    tooltip="Karte drucken"
    :buttonClass="`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border ${
      activeControl !== 'print' 
        ? 'bg-white hover:bg-gray-50 border-gray-200' 
        : 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white'
    }`"
    @click="toggleControl('print')"
  >
    <img src="../assets/print.svg" class="h-6 w-6" alt="Print">
  </TooltipButton>


</div>
  
      <!-- Hidden Components -->
      <HelpLink ref="helpRef" />
      <NavigateBack ref="navigateBackRef" :map="map" v-if="map" />
      <ZoomToExtent
        v-if="activeControl === 'zoom-extent' && map"
        :map="map"
        :active="true"
        @close="toggleControl(null)"
        />
      <ZoomHome ref="zoomHomeRef" :map="map" v-if="map" />
  
      <!-- Tool Components -->
      <MeasureLine
        v-if="activeControl === 'measure-line' && map"
        :map="map"
        :active="true"
        @close="toggleControl(null)"
      />
      <MeasureArea
        v-if="activeControl === 'measure-area' && map"
        :map="map"
        :active="true"
        @close="toggleControl(null)"
      />
      <InfoTool
        v-if="activeControl === 'info' && map"
        :map="map"
        :active="true"
        @close="toggleControl(null)"
      />
      <PrintTool
        v-if="activeControl === 'print' && map"
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
        TooltipButton
    },
  
    setup() {
      const router = useRouter();
      const mapElement = ref(null);
      const map = ref(null);
      const activeControl = ref(null);
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
        activeControl.value = null;
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
        activeControl.value = activeControl.value === control ? null : control;
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
        activeControl,
        toggleControl,
        navigateBack,
        helpRef,
        navigateBackRef,
        zoomToExtentRef,
        zoomHomeRef
      };
    }
  };
  </script>
  
