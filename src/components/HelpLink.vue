<template><div></div></template>

<script setup>
import { ref } from 'vue';
import { useLayerManagement } from '../composables/useLayerManagement';
import { useLayerStore } from '../stores/layerStore';
import { useUIStore } from '../stores/uiStore';
import { storeToRefs } from 'pinia';

const props = defineProps({
  map: {
    type: Object,
    required: true
  },
  active: Boolean
});

const showSettings = ref(true);
const message = ref('Konfigurieren Sie die Druckeinstellungen');
const title = ref('Kartenausschnitt');
const format = ref('a4');
const includeLegends = ref(true);
const layerStore = useLayerStore();
const uiStore = useUIStore();
const { layers } = storeToRefs(layerStore);

const handleClose = () => {
  showSettings.value = false;
  uiStore.clearActiveControl();
};

const { 
    getLayerLabel, 
    getLegendUrl, 
    activeBackgroundLayer 
  } = useLayerManagement()

  const backgroundLayer = activeBackgroundLayer.value


const openHelp = () => {
  // window.open('https://example.com/help', '_blank');

  console.warn("--------------------------------")

console.warn(backgroundLayer)

console.warn("--------------------------------")

  console.log(    getLayerLabel, 
    getLegendUrl, 
    activeBackgroundLayer )

    console.log( showSettings, getLegendUrl, activeBackgroundLayer , message, title, format, includeLegends, props, layers, handleClose )
};

defineExpose({ openHelp });
</script>