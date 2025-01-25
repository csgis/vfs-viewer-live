<template>
  <div class="relative group">
    <button
      :class="[
        buttonClass,
        uiStore.accessibilityMode === 'highContrast' && !isActive && 'bg-white border-black hover:bg-gray-200 text-black',
        uiStore.accessibilityMode === 'highContrast' && isActive && 'bg-black border-black text-white hover:bg-gray-800'
      ]"
      :disabled="disabled"
      @click="$emit('click', $event)"
    >
      <slot></slot>
    </button>
    <div 
      v-if="tooltip"
      :class="[
        'absolute -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'z-[9999]',
        tooltipClass,
        position === 'right' ? 'right-full mr-2 top-1/2' : 'left-full ml-2 top-1/2',
        uiStore.accessibilityMode === 'highContrast' && 'contrast:bg-black contrast:text-white'
      ]"
      style="pointer-events: none;" 
    >
      <div :class="['px-2 py-1 rounded whitespace-nowrap shadow-lg', 
        uiStore.accessibilityMode === 'highContrast' ? 'bg-black text-white' : 'bg-gray-800 text-white']">
        {{ tooltip }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore';
const uiStore = useUIStore();

defineProps({
  tooltip: String,
  buttonClass: [String, Array, Object],
  tooltipClass: String,
  isActive: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  },
  disabled: Boolean
});

defineEmits(['click']);
</script>