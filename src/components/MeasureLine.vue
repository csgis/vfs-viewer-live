<template>
  <div v-if="active">
    <div class="fixed top-4 right-4 bg-yellow-200 text-black p-4 rounded-lg shadow-lg z-50 animate-slide-in-top">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { defineProps } from 'vue'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { Draw } from 'ol/interaction'
import { Style, Stroke } from 'ol/style'
import { getLength } from 'ol/sphere'

const props = defineProps({
  map: {
    type: Object,
    required: true
  },
  active: Boolean
})
 
const message = ref('Klicken Sie auf die Karte, um eine Linie zu zeichnen')
const source = ref(null)
const vector = ref(null)
const draw = ref(null)

// Create vector layer for measurements
const initializeVector = () => {
  source.value = new VectorSource()
  vector.value = new VectorLayer({
    source: source.value,
    style: [
      new Style({
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 6,
          lineDash: [10, 10],
          lineDashOffset: 0,
          lineJoin: 'round'
        })
      }),
      new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 4,
          lineDash: [10, 10],
          lineDashOffset: 0,
          lineJoin: 'round'
        })
      })
    ],
    zIndex: 999
  })
  
  props.map.addLayer(vector.value)
}

// Initialize draw interaction
const initializeDraw = () => {
  // Make sure source exists
  if (!source.value) {
    initializeVector()
  }

  draw.value = new Draw({
    source: source.value,
    type: 'LineString',
    style: [
      new Style({
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 6,
          lineDash: [10, 10],
          lineDashOffset: 0,
          lineJoin: 'round'
        })
      }),
      new Style({
        stroke: new Stroke({
          color: '#FF0000',
          width: 4,
          lineDash: [10, 10],
          lineDashOffset: 0,
          lineJoin: 'round'
        })
      })
    ]
  })

  // Listen for drawing start
  draw.value.on('drawstart', () => {
    message.value = 'Klicken Sie weiter für zusätzliche Punkte, Doppelklick zum Beenden'
  })

  // Listen for drawing end
  draw.value.on('drawend', (event) => {
    const geometry = event.feature.getGeometry()
    const length = getLength(geometry)
    
    // Format length
    let formattedLength
    if (length > 1000) {
      formattedLength = `${Math.round((length / 1000) * 100) / 100} km`
    } else {
      formattedLength = `${Math.round(length * 100) / 100} m`
    }
    
    message.value = `Gemessene Entfernung: ${formattedLength}`
  })

  // Add interaction to map
  props.map.addInteraction(draw.value)

  // Set cursor style
  const mapElement = props.map.getTargetElement()
  if (mapElement) {
    mapElement.style.cursor = 'crosshair'
  }
}

// Cleanup function
const cleanup = () => {
  if (draw.value) {
    props.map.removeInteraction(draw.value)
    draw.value = null
  }
  if (vector.value) {
    props.map.removeLayer(vector.value)
    vector.value = null
  }
  if (source.value) {
    source.value.clear()
    source.value = null
  }
  
  // Reset cursor
  const mapElement = props.map.getTargetElement()
  if (mapElement) {
    mapElement.style.cursor = ''
  }

  message.value = 'Klicken Sie auf die Karte, um eine Linie zu zeichnen'
}

// Watch for active state changes
watch(() => props.active, (newValue) => {
  if (newValue) {
    cleanup() // Clean up any existing drawings first
    initializeVector()
    initializeDraw()
  } else {
    cleanup()
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})
</script>

<style>
.ol-draw {
  cursor: crosshair;
}
</style>