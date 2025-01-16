<template>
  <div class="hidden">
    <!-- Debug info -->
    <div>History available: {{canGoBack}}</div>
  </div>
</template>

<script setup>
import { defineProps, defineExpose, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMapHistory } from '../composables/useMapHistory'

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
})

const route = useRoute()
const canGoBack = ref(false)

console.log('NavigateBack setup - Initial canGoBack:', canGoBack.value)

const { goToPreviousExtent, updateMapFromURL, hasHistory } = useMapHistory(props.map)

watch(hasHistory, (newValue) => {
  canGoBack.value = newValue
}, { immediate: true })

watch(
  () => route.query,
  () => {
    updateMapFromURL()
  }
)

// Make sure we expose a simple structure
defineExpose({
  hasHistory: canGoBack,  // expose ref directly
  goBack: goToPreviousExtent
})
</script>