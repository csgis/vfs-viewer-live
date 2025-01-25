<template>
  <div class="w-full bg-white shadow-md px-4 py-2 h-12">
    <img 
      src="../assets/headerLogo.gif" 
      alt="VFS" 
      class="h-1 object-contain"
      :class="{ 'high-contrast-image': uiStore.accessibilityMode === 'highContrast' }"
      style="height: 1rem;"
    >
  </div>
</template>

<script>
export default {
  name: 'LogoBar'
}
</script>