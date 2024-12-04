<!-- ZoomHome.vue -->
 <template><div></div></template>
<script setup>
import { fromLonLat } from 'ol/proj';
import { defineProps, defineExpose } from 'vue';

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
});

const zoomToHome = () => {
  if (props.map) {
    const view = props.map.getView();
    view.animate({
      center: fromLonLat([11.4, 48.7]),
      zoom: 8,
      duration: 750,
      easing: (t) => t * (2 - t),
    });
  }
};

defineExpose({ zoomToHome });
</script>