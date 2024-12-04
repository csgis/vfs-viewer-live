<script setup>
import { defineExpose } from 'vue'
const openHelp = () => {
  window.open('https://example.com/help', '_blank');
};

defineExpose({ openHelp });
</script>