<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Main Sidebar -->
    <MainSidebar />

    <!-- Main Content -->
    <div 
      class="flex-1 h-screen overflow-hidden relative"
      :class="{ 'ml-[25%]': uiStore.getMainSidebarVisibility }"
    >
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import MainSidebar from './components/MainSidebar.vue'
import { useUIStore } from './stores/uiStore'

const uiStore = useUIStore();
uiStore.hideMapSidebar();
</script>