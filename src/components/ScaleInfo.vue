<template>
  <div 
    :class="`fixed bottom-3 bg-white bg-opacity-75 px-2 py-1 text-xs text-gray-600 rounded shadow transition-all duration-300`"
    :style="{ left: calculateLeftPosition }"
  >
    <div class="flex items-center gap-2">
      Maßstab: 1:
      <template v-if="isEditing">
        <input
          ref="inputRef"
          type="text"
          v-model="inputScale"
          @blur="handleBlur"
          @keyup.enter="handleSubmit"
          class="w-24 px-1 bg-white rounded border border-gray-300 focus:outline-none focus:border-blue-500"
          @click.stop
        />
      </template>
      <template v-else>
        <span 
          @click="startEditing"
          class="cursor-pointer hover:text-blue-600"
        >
          {{ scale.toLocaleString('de-DE') }}
        </span>
      </template>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useUIStore } from '../stores/uiStore';

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
});

const uiStore = useUIStore();
const scale = ref(100000);
const isEditing = ref(false);
const inputScale = ref('');
const inputRef = ref(null);

const INCHES_PER_METER = 39.37;
const DEFAULT_DPI = 72;

const calculateLeftPosition = computed(() => {
  const mapSidebarWidth = uiStore.isMapSidebarVisible 
    ? (uiStore.mapSidebarExpanded ? 'calc(25% + 3rem + 0.75rem)' : 'calc(6rem + 0.75rem)') 
    : 'calc(3rem + 0.75rem)';
  
  return mapSidebarWidth;
});

const calculateScale = (resolution) => {
  const view = props.map.getView();
  const projection = view.getProjection();
  const metersPerUnit = projection.getMetersPerUnit(); // Important for different projections

  // Convert resolution to scale
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.round(resolution * metersPerUnit * INCHES_PER_METER * DEFAULT_DPI * pixelRatio);
};

const scaleToResolution = (scale) => {
  const view = props.map.getView();
  const projection = view.getProjection();
  const metersPerUnit = projection.getMetersPerUnit();

  const pixelRatio = window.devicePixelRatio || 1;
  return scale / (metersPerUnit * INCHES_PER_METER * DEFAULT_DPI * pixelRatio);
};

const updateScale = () => {
  const resolution = props.map.getView().getResolution();
  scale.value = calculateScale(resolution);
};

const startEditing = () => {
  inputScale.value = scale.value.toString();
  isEditing.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleBlur = () => {
  handleSubmit();
};

const handleSubmit = () => {
  const newScale = parseInt(inputScale.value.replace(/\D/g, ''));
  if (newScale && !isNaN(newScale)) {
    const view = props.map.getView();
    const resolution = scaleToResolution(newScale);

    view.setResolution(resolution); // Use setResolution for more precision
  }
  isEditing.value = false;
};

const handleMoveEnd = () => {
  updateScale();
};

onMounted(() => {
  if (props.map) {
    props.map.on('moveend', handleMoveEnd);
    updateScale();
  }
});

onUnmounted(() => {
  if (props.map) {
    props.map.un('moveend', handleMoveEnd);
  }
});
</script>
