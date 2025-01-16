<template>
  <div class="relative group">
    <button
      :class="buttonClass"
      :disabled="disabled"
      @click="$emit('click', $event)"
    >
      <slot></slot>
    </button>
    <!-- Tooltip -->
    <div 
      v-if="tooltip"
      :class="[
        'absolute -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'z-[9999]',  
        tooltipClass,
        position === 'right' ? 'right-full mr-2 top-1/2' : 'left-full ml-2 top-1/2'
      ]"
      style="pointer-events: none;" 
    >
      <div class="bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap shadow-lg">
        {{ tooltip }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tooltip: {
    type: String,
    default: ''
  },
  buttonClass: {
    type: [String, Array, Object],
    default: ''
  },
  tooltipClass: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
/* Ensure tooltips are always on top */
.group:hover > div {
  z-index: 9999;
}
</style>