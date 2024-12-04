<template>
  <div>
    <!-- Controls -->
    <button 
      class="w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors border"
      @click="toggleMeasurement"
      :class="{
        'bg-white hover:bg-gray-50 border-gray-200': props.activeControl !== 'measure-area',
        'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white': props.activeControl === 'measure-area'
      }"
      title="Measure Area"
    >
      <img src="../assets/area.svg" style="height:24px">
    </button>

    <!-- Teleport the toast to the map container -->
    <Teleport to=".map-container">
      <div 
        v-if="showToast"
        class="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 flex items-center space-x-3 transition-all duration-300"
        :class="{ 'translate-y-0 opacity-100': showToast, 'translate-y-10 opacity-0': !showToast }"
      >
        <div class="bg-blue-100 rounded-full p-2">
          <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-900">Measured Area</p>
          <p class="text-sm text-gray-600">{{ formatArea(currentMeasurement) }}</p>
        </div>
        <button 
          @click="clearMeasurement"
          class="ml-2 text-gray-400 hover:text-gray-500"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, onBeforeUnmount, watch } from 'vue'
import { Draw } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Fill, Stroke } from 'ol/style'
import { getArea } from 'ol/sphere'

export default {
  name: 'MeasureArea',
  props: {
    map: {
      type: Object,
      required: true
    },
    activeControl: {
      type: String,
      default: ''
    }
  },
  emits: ['update:activeControl'],
  setup(props, { emit }) {
    const measurementActive = ref(false)
    const showToast = ref(false)
    const currentMeasurement = ref(0)
    let measureLayer = null
    let draw = null
    let toastTimeout = null

    const updateMapCursor = (isActive) => {
      if (props.map) {
        const mapElement = props.map.getTargetElement()
        if (mapElement) {
          mapElement.style.cursor = isActive ? 'crosshair' : 'grab'
        }
      }
    }

    const initializeMeasureLayer = () => {
      measureLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({
            color: 'rgba(59, 130, 246, 0.2)'
          }),
          stroke: new Stroke({
            color: '#3b82f6',
            width: 2
          })
        })
      })
      props.map.addLayer(measureLayer)
    }

    const initializeDrawing = () => {
  if (!measureLayer) {
    initializeMeasureLayer()
  }

  if (draw) {
    props.map.removeInteraction(draw)
    draw = null
  }

  draw = new Draw({
  source: measureLayer.getSource(),
  type: 'Polygon', // 'Polygon' for MeasureArea.vue
  stopClick: true, // Prevent further clicks after drawing ends
});
  
  draw.on('drawend', handleDrawEnd)
  props.map.addInteraction(draw)
  updateMapCursor(true)
}



    const formatArea = (squareMeters) => {
      if (squareMeters >= 1000000) {
        return `${(squareMeters / 1000000).toFixed(2)} km²`
      } else if (squareMeters >= 10000) {
        return `${(squareMeters / 10000).toFixed(2)} ha`
      } else {
        return `${Math.round(squareMeters)} m²`
      }
    }

    const showMeasurement = () => {
      showToast.value = true
      if (toastTimeout) {
        clearTimeout(toastTimeout)
      }
      toastTimeout = setTimeout(() => {
        showToast.value = false
      }, 5000)
    }

    draw.on('drawend', (event) => {
      handleDrawEnd(event);
      props.map.removeInteraction(draw);
      draw = null;
    });

    const clearMeasurement = () => {
      if (measureLayer) {
        measureLayer.getSource().clear()
      }
      showToast.value = false
      if (toastTimeout) {
        clearTimeout(toastTimeout)
      }
    }

    const deactivateMeasurement = () => {
  measurementActive.value = false;
  if (draw) {
    props.map.removeInteraction(draw);
    draw = null;
  }
  if (measureLayer) {
    measureLayer.getSource().clear();
  }
  updateMapCursor(false);
  emit('update:activeControl', ''); // Deactivate control
};

const toggleMeasurement = () => {
  if (measurementActive.value) {
    deactivateMeasurement();
  } else {
    emit('update:activeControl', 'measure-area'); // 'measure-area' for MeasureArea.vue
  }
};



    watch(() => props.activeControl, (newValue) => {
      if (newValue === 'measure-area') {
        measurementActive.value = true
        initializeDrawing()
      } else {
        if (measurementActive.value) {
          deactivateMeasurement()
        }
      }
    }, { immediate: true })

    if (props.map) {
      initializeMeasureLayer()
      updateMapCursor(false)
    }

    onBeforeUnmount(() => {
      if (measureLayer) {
        props.map.removeLayer(measureLayer)
        measureLayer.dispose()
      }
      if (draw) {
        props.map.removeInteraction(draw)
      }
      if (toastTimeout) {
        clearTimeout(toastTimeout)
      }
      updateMapCursor(false)
    })

    return {
      measurementActive,
      showToast,
      currentMeasurement,
      toggleMeasurement,
      clearMeasurement,
      formatArea,
      props
    }
  }
}
</script>