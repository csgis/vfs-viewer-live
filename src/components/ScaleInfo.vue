<template>
    <div 
      :class="`fixed bottom-3 bg-white bg-opacity-75 px-2 py-1 text-xs text-gray-600 rounded shadow transition-all duration-300`"
      :style="{
        left: calculateLeftPosition
      }"
    >
      Maßstab: 1:{{ scale.toLocaleString('de-DE') }}
    </div>
  </template>
    
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useUIStore } from '../stores/uiStore';
  
  const props = defineProps({
      map: {
          type: Object,
          required: true
      }
  });
  
  const uiStore = useUIStore();
  const scale = ref(100000);
  
  // Compute left position based on sidebar states
  const calculateLeftPosition = computed(() => {
    const mapSidebarWidth = uiStore.isMapSidebarVisible 
      ? (uiStore.mapSidebarExpanded ? 'calc(25% + 3rem + 0.75rem)' : 'calc(6rem + 0.75rem)') 
      : 'calc(3rem + 0.75rem)';
    
    return mapSidebarWidth;
  });
  
  const updateScale = () => {
      const resolution = props.map.getView().getResolution();
      scale.value = Math.round(resolution * 39.37 * 72);
  };
  
  // Event handlers
  const handleMoveEnd = () => {
      updateScale();
  };
  
  onMounted(() => {
      if (props.map) {
          props.map.on('moveend', handleMoveEnd);
          // Initial scale calculation
          updateScale();
      }
  });
  
  onUnmounted(() => {
      if (props.map) {
          props.map.un('moveend', handleMoveEnd);
      }
  });
  </script>