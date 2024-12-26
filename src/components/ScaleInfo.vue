//ScaleInfo.vue
<template>
    <div 
      :class="`fixed bottom-3 bg-white bg-opacity-75 px-2 py-1 text-xs text-gray-600 rounded shadow transition-all duration-300 ${
        uiStore.isSidebarExpanded ? 'left-[calc(25%_+_0.75rem)]' : 'left-16'
      }`"
    >
      Maßstab: 1:{{ scale.toLocaleString('de-DE') }}
    </div>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUIStore } from '../stores/uiStore';

const props = defineProps({
    map: {
        type: Object,
        required: true
    }
});

const uiStore = useUIStore();
const scale = ref(100000);

const updateScale = () => {
    const resolution = props.map.getView().getResolution();
    const dpi = 25.4 / 0.28;  // OpenLayers assumes 96 DPI
    const mpu = props.map.getView().getProjection().getMetersPerUnit();
    const calculatedScale = resolution * mpu * 39.37 * dpi;
    scale.value = Math.round(calculatedScale);
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