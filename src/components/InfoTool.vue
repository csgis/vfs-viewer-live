<template>
  <div v-if="active">
    <!-- Message Modal (for initial message or errors) -->
    <div 
      v-if="(!featureInfo.length && message) || isLoading" 
      class="fixed top-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50"
    >
      <div>
        <p>{{ message }}</p>
        <div v-if="isLoading" class="mt-2">
          <span class="inline-block animate-spin">⌛</span> Lade...
        </div>
      </div>
    </div>

    <!-- Results Modal (for showing feature info when available) -->
    <div 
  v-if="featureInfo.length > 0 && !isLoading" 
  class="fixed left-0 h-full w-1/4 bg-white shadow-lg z-50 border-right border-gray-700 flex flex-col"
>
  <!-- Header -->
  <div class="p-4 border-b border-gray-200">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">
        {{ currentFeatureLayerName }}
      </h3>
      <button 
        @click="closeFeatureInfo"
        class="text-gray-500 hover:text-gray-700 p-2"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto p-4">
    <div v-if="currentFeature">
      <div 
        v-for="(value, key) in currentFeature.properties" 
        :key="key" 
        class="border-b pb-2 mb-2"
      >
        <div class="font-medium text-gray-700">{{ formatKey(key) }}</div>
        <div v-html="formatValue(value)"></div>
      </div>
    </div>
  </div>

  <!-- Footer Navigation -->
  <div class="border-t border-gray-200 p-4 bg-white">
    <div class="flex justify-between items-center">
      <button 
        @click="prevFeature" 
        :disabled="currentIndex === 0"
        class="px-4 py-2 text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:text-gray-400"
      >
        weiter
      </button>
      
      <span class="font-medium text-gray-700">
        {{ currentIndex + 1 }} / {{ featureInfo.length }}
      </span>
      
      <button 
        @click="nextFeature" 
        :disabled="currentIndex === featureInfo.length - 1"
        class="px-4 py-2 text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:text-gray-400"
      >
        zurück
      </button>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, toRaw, onMounted, onUnmounted } from 'vue';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { useUIStore } from '../stores/uiStore';
import { 
  Vector as VectorSource,
  ImageWMS, 
  TileWMS 
} from 'ol/source';

const props = defineProps({
  map: Object
});

const uiStore = useUIStore();

const featureInfo = ref([]);
const currentIndex = ref(0);
const active = ref(true);
const message = ref('Klicken Sie auf die Karte, um Informationen anzuzeigen');
const isLoading = ref(false);
const lastClickCoordinate = ref(null);

// Marker related state
let markerSource;
let markerLayer;

// Initialize marker layer
const initializeMarkerLayer = () => {
  console.log('Initializing marker layer'); // Debug log
  if (!props.map) {
    console.log('No map available'); // Debug log
    return;
  }
  
  markerSource = new VectorSource({
    wrapX: false
  });
  
  markerLayer = new VectorLayer({
    source: markerSource,
    style: new Style({
      image: new CircleStyle({
        radius: 24,
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.5)'  // Yellow with transparency
        }),
        stroke: new Stroke({
          color: '#000000',  // Black outline
          width: 3
        })
      })
    }),
    zIndex: 1000
  });
  
  props.map.addLayer(markerLayer);
  console.log('Marker layer added to map'); // Debug log
};

// Update marker position
const updateMarker = (coordinate) => {
  console.log('Updating marker at coordinate:', coordinate); // Debug log
  if (!markerSource || !coordinate) {
    console.log('No markerSource or coordinate'); // Debug log
    return;
  }
  
  // Clear existing markers
  markerSource.clear();
  
  try {
    // Create and add new marker
    const marker = new Feature({
      geometry: new Point(coordinate),
      name: 'Click marker'
    });
    
    markerSource.addFeature(marker);
    lastClickCoordinate.value = coordinate;
    console.log('Marker added successfully'); // Debug log
  } catch (error) {
    console.error('Error adding marker:', error); // Debug log
  }
};

// Remove marker
const removeMarker = () => {
  if (markerSource) {
    markerSource.clear();
    lastClickCoordinate.value = null;
  }
};

const layerNamesToQuery = ['vfs:kartiergebiete', '0'];

const currentFeature = computed(() => featureInfo.value[currentIndex.value]);

const layersQueried = [];

const currentFeatureLayerName = computed(() => {
  const feature = currentFeature.value;
  if (feature) {
    if (feature.layerName) {
      return feature.layerName;
    }
    const matchingLayer = layersQueried.find(layer => layer.layersParam);
    if (matchingLayer) {
      return matchingLayer.layersParam;
    }
  }
  return 'Kartiergebiet Information';
});

const formatKey = (key) => {
  return key.replace(/_/g, ' ').toUpperCase();
};

const formatValue = (value) => {
  if (!value) return 'N/A';
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // URL regex pattern
  const urlPattern = /^(https?:\/\/[^\s]+)$/;
  
  if (typeof value === 'string' && urlPattern.test(value)) {
    return `<a href="${value}" target="_blank" rel="noopener noreferrer" class="text-blue-700 hover:text-blue-900 underline">${value.replace(/\/$/, '')}</a>`;
  }

  return value;
};

const hardcodedFormats = {
  "https://services.bgr.de": "geo+json",
  "https://geoserver-vfs.csgis.de": "json",
  "else": "json",
};

const makeGetFeatureInfoRequest = async (evt) => {
  const coordinate = evt.coordinate;
  lastClickCoordinate.value = coordinate;
  
  isLoading.value = true;
  message.value = 'Lade Informationen...';
  featureInfo.value = [];
  currentIndex.value = 0;
  
  try {
    const projection = props.map.getView().getProjection().getCode();
    const queryPromises = [];

    props.map.getLayers().forEach((layer) => {
      const rawLayer = toRaw(layer);
      if (!rawLayer.getVisible()) return;

      const source = rawLayer.getSource();
      if (!source) return;
      
      // Check if it's either a TileWMS or ImageWMS source
      if (!(source instanceof TileWMS || source instanceof ImageWMS)) return;

      const layersParam = source.getParams()?.LAYERS;
      if (!layersParam) return;

      // Try different ways to get the URL from WMS source
      let url;
      if (source.urls && source.urls.length > 0) {
        url = source.urls[0];
      } else if (source.url_) {
        url = source.url_;
      } else {
        return;
      }

      const layerVersion = source.getParams()?.VERSION || '1.3.0';

      if (layerNamesToQuery.includes(layersParam)) {
        queryPromises.push(
          queryLayerForFeatureInfo(layer, coordinate, projection, url, layerVersion, layersParam)
        );
      }
    });

    // Wait for all queries to complete
    await Promise.all(queryPromises);

    // Update marker based on results
    if (featureInfo.value.length > 0) {
      updateMarker(coordinate);
      message.value = '';
    } else {
      removeMarker();
      message.value = 'Keine Informationen an dieser Stelle verfügbar';
    }
  } catch (error) {
    console.error('Error in makeGetFeatureInfoRequest:', error);
    message.value = 'Lade Informationen...';
    removeMarker();
  } finally {
    isLoading.value = false;
  }
};

const queryLayerForFeatureInfo = async (layer, coordinate, projection, layerUrl, layerVersion, layersParam) => {
  try {
    layersQueried.push({ layerUrl, layersParam, layerName: layersParam });

    const formatKey = Object.keys(hardcodedFormats).find(key => layerUrl.includes(key)) || "else";
    const infoFormat = `application/${hardcodedFormats[formatKey]}`;

    const pixel = props.map.getPixelFromCoordinate(coordinate);
    const size = props.map.getSize();

    const url = new URL(layerUrl);
    const params = {
      'SERVICE': 'WMS',
      'VERSION': layerVersion,
      'REQUEST': 'GetFeatureInfo',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'QUERY_LAYERS': layersParam,
      'LAYERS': layersParam,
      'INFO_FORMAT': infoFormat,
      'I': Math.round(pixel[0]),
      'J': Math.round(pixel[1]),
      'WIDTH': size[0],
      'HEIGHT': size[1],
      'CRS': projection,
      'BBOX': props.map.getView().calculateExtent().join(',')
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    const data = await response.json();

    if (data.features?.length > 0) {
      const featuresWithLayer = data.features.map(feature => ({
        ...feature,
        layerName: feature.layerName || layersParam
      }));
      featureInfo.value.push(...featuresWithLayer);
    }
    uiStore.setInfoPanelVisibility(true);

  } catch (error) {
    console.error('GetFeatureInfo request failed:', error);
    throw error;
  }
};

const prevFeature = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const nextFeature = () => {
  if (currentIndex.value < featureInfo.value.length - 1) {
    currentIndex.value++;
  }
};

const closeFeatureInfo = () => {
  featureInfo.value = [];
  
  // Clean up marker
  removeMarker();
  if (markerLayer) {
    props.map.removeLayer(markerLayer);
    markerLayer = null;
    markerSource = null;
  }

  active.value = false;
  uiStore.setInfoPanelVisibility(false);
};

onMounted(() => {
  if (props.map) {
    initializeMarkerLayer();
    props.map.on('click', makeGetFeatureInfoRequest);
  }
});

onUnmounted(() => {
  if (props.map) {
    props.map.un('click', makeGetFeatureInfoRequest);
    if (markerLayer) {
      removeMarker();
      props.map.removeLayer(markerLayer);
      markerLayer = null;
      markerSource = null;
    }
    uiStore.setInfoPanelVisibility(false);
  }
});
</script>