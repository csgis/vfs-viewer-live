<template>
  <div class="fixed bottom-3 right-3 bg-white bg-opacity-75 px-2 py-1 text-xs text-gray-600 rounded shadow">
    Hintergrundkarte: {{ backgroundStore.currentAttribution }}
  </div>
</template>

<script setup>
import { useBackgroundStore } from '../stores/backgroundStore'
const backgroundStore = useBackgroundStore()
</script>