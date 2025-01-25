<template>
    <div v-if="active">
      <div class="fixed top-4 right-4 bg-yellow-200 text-black p-4 rounded-lg shadow-lg z-50 animate-slide-in-top  contrast:bg-contrast-primary contrast:text-contrast-primary">
        {{ message }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onUnmounted } from 'vue'
  import { defineProps, defineExpose } from 'vue'
  import { DragBox } from 'ol/interaction'
  import { Style, Stroke } from 'ol/style'
  import { always } from 'ol/events/condition'

  const props = defineProps({
    map: {
      type: Object,
      required: true
    },
    active: Boolean
  })
  
 
  const message = ref('Klicken und ziehen Sie auf der Karte, um einen Bereich zu definieren')
  const dragBox = ref(null)
  
  // Initialize dragbox interaction
  const initializeDragBox = () => {
    dragBox.value = new DragBox({
      condition: always, // This removes the shift key requirement
      style: new Style({
        stroke: new Stroke({
          color: '#0ea5e9',
          width: 3
        })
      })
    })
  
    // Handle dragbox end event
    dragBox.value.on('boxend', () => {
      const extent = dragBox.value.getGeometry().getExtent()
      props.map.getView().fit(extent, {
        duration: 500,
        padding: [50, 50, 50, 50]
      })
      message.value = 'Klicken und ziehen Sie erneut, um einen anderen Bereich zu wählen'
    })
  
    // Handle dragbox start event
    dragBox.value.on('boxstart', () => {
      message.value = 'Loslassen, um in den gewählten Bereich zu zoomen'
    })
  
    props.map.addInteraction(dragBox.value)
  
    // Set cursor style
    const mapElement = props.map.getTargetElement()
    if (mapElement) {
      mapElement.style.cursor = 'crosshair'
    }
  }
  
  // Cleanup function
  const cleanup = () => {
    if (dragBox.value) {
      props.map.removeInteraction(dragBox.value)
      dragBox.value = null
    }
    
    // Reset cursor
    const mapElement = props.map.getTargetElement()
    if (mapElement) {
      mapElement.style.cursor = ''
    }
  
    message.value = 'Klicken und ziehen Sie auf der Karte, um einen Bereich zu definieren'
  }
  
  // Method for direct zooming to extent (button click)
  const zoomToExtent = () => {
    if (props.map) {
      // Example extent - replace with your actual extent
      const defaultExtent = props.map.getView().calculateExtent();
      props.map.getView().fit(defaultExtent, {
        duration: 1000,
        padding: [50, 50, 50, 50]
      });
    }
  }
  
  // Watch for active state changes
  watch(() => props.active, (newValue) => {
    if (newValue) {
      cleanup() // Clean up existing interaction first
      initializeDragBox()
    } else {
      cleanup()
    }
  }, { immediate: true })
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  // Expose methods to parent
  defineExpose({
    zoomToExtent
  })
  </script>