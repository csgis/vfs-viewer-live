<template>
    <div 
      :class="`bg-white shadow-lg flex flex-col h-screen transition-all duration-300 ${
        isExpanded ? 'w-1/4' : 'w-12'
      }`"
      style="z-index: 40;"
    >
    <!-- Toggle Button -->
    <button 
    v-if="showToggleButton"
    @click="toggleSidebar"
    :class="`absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-white shadow-lg flex items-center justify-center border border-l-0 border-gray-400 rounded-r-lg z-[100] ${
        isExpanded ? 'left-[25%]' : 'left-12' 
    }`"
    >
    <svg 
        class="w-4 h-4 text-gray-400 transform transition-transform duration-300"
        :class="isExpanded ? 'rotate-0' : 'rotate-180'"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    </button>
  
      <!-- Header -->
      <div 
        :class="`border-b border-gray-200 transition-all duration-300 ${
          isExpanded ? 'p-4' : 'p-2'
        }`"
      >
        <img 
          :src="isExpanded ? 'img/vfs-logo-solo-lg.png' : 'img/vfs-logo-solo.png'"
          alt="Logo" 
          :class="`object-contain transition-all duration-300 ${
            isExpanded ? 'h-16 mx-2' : 'h-8 mx-1 mt-5'
          }`"
        />
      </div>
      
      <!-- Navigation -->
      <nav 
        :class="`flex-1 transition-all duration-300 ${
          isExpanded ? 'p-4' : 'p-2'
        }`"
      >


      <TooltipButton
    v-for="(item, index) in navigationItems" 
    :key="index"
    :tooltip="!isExpanded ? (typeof item.label === 'function' ? item.label() : item.label) : ''"
    @click="!item.requiresAuth || authStore.isAuthenticated ? handleNavigation(item) : null"
    :buttonClass="[
        'w-full text-left mb-2 rounded-lg text-black hover:bg-gray-300 hover:text-black transition-colors relative',
        currentPath === item.path ? 'bg-gray-300 text-gray-900' : '',
        isExpanded ? 'p-3' : 'p-2 flex justify-center',
        item.requiresAuth && !authStore.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    position="left"
    tooltipClass="z-[1000]"
    :disabled="item.requiresAuth && !authStore.isAuthenticated"
>
    <div 
        :class="[
            'flex items-center',
            !isExpanded && 'justify-center'
        ]"
    >
    <div class="relative flex items-center">
    <!-- Render the item's icon only if the user is authenticated -->
    <component 
        v-if="authStore.isAuthenticated || !item.requiresAuth"
        :is="typeof item.icon === 'function' ? item.icon() : item.icon"
        :class="[
            'w-5 h-5',
            isExpanded ? 'mr-3' : ''
        ]"
    />
    <!-- Conditional rendering for the lock icon -->
    <svg 
        v-if="item.requiresAuth && !authStore.isAuthenticated && item.showLock"
        :class="[
            'w-5 h-5',
            isExpanded ? 'mr-3' : ''
        ]"        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
    >
        <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
        />
    </svg>
</div>

        <!-- Render the label when expanded -->
        <span 
          v-if="isExpanded"
          class="transition-opacity duration-300"
        >
          {{ typeof item.label === 'function' ? item.label() : item.label }}
        </span>
    </div>
</TooltipButton>


      </nav>
  
      <!-- Footer -->
      <div 
        :class="`border-t border-black transition-all duration-300 ${
          isExpanded ? 'p-4' : 'hidden'
        }`"
      >
      <p class="text-sm text-gray-600">
        {{ isExpanded ? '© ' : '' }}
        <a 
            v-if="isExpanded" 
            href="https://csgis.de" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="hover:underline  text-gray-500"
        >
            csgis.de
        </a> & 
        <a 
            v-if="isExpanded" 
            href="http://www.vfs-muenchen.de/" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="hover:underline  text-gray-500"
        >
            vfs-muenchen.de
        </a> | 
        <router-link 
            v-if="isExpanded" 
              to="/dsgvo" 
            class="hover:underline text-gray-500"
            >
            DSGVO
          </router-link> 
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useUIStore } from '../stores/uiStore'
  import { useAuthStore } from '../stores/authStore'
  import { 
    HomeIcon, MapIcon, DocumentIcon, UserIcon, ArrowRightOnRectangleIcon
  } from '@heroicons/vue/24/outline'
  import TooltipButton from './TooltipButton.vue'
  
  const router = useRouter()
  const route = useRoute()
  const uiStore = useUIStore()
  const authStore = useAuthStore()

  // Compute initial expanded state based on route
    const isExpanded = computed(() => {
    if (isMapPage.value) {
        return false;  // Always collapsed on map page
    }
    return uiStore.mainSidebarExpanded;  // Use store state for other pages
    })
  
    const navigationItems = [
    {
        label: 'Startseite',
        path: '/',
        icon: HomeIcon,
        requiresAuth: false
    },
    {
        label: 'Karte',
        path: '/karte',
        icon: MapIcon,
        requiresAuth: false
    },
    {
        label: 'Baumarten Eignungstabelle',
        path: '/baumarteneignungstabelle',
        icon: DocumentIcon,
        requiresAuth: true,
        showLock: true
    },
    {
      label: () => authStore.isAuthenticated 
          ? `${authStore.username} Abmelden` 
          : 'Anmelden',
        path: '/login',
        icon: () => authStore.isAuthenticated 
        ? ArrowRightOnRectangleIcon 
        : UserIcon,
        requiresAuth: false
    }
    
];

  
  const currentPath = computed(() => route.path)
  
  const handleNavigation = (item) => {
  console.log('Navigation clicked:', item.path, 'Auth required:', item.requiresAuth, 'Is authenticated:', authStore.isAuthenticated)

  // If this is the login button and user is authenticated, handle logout
  if (item.path === '/login' && authStore.isAuthenticated) {
    console.log('Handling logout')
    authStore.logout()
    router.push('/')
    return
  }
  
  // If auth is required but user isn't authenticated, don't do anything
  if (item.requiresAuth && !authStore.isAuthenticated) {
    console.log('Auth required but user not authenticated')
    return
  }

  // For all other cases, immediately route
  console.log('Routing to:', item.path)
  router.push(item.path).then(() => {
    // Handle sidebar state after route change
    if (item.path === '/karte') {
      uiStore.showMapSidebar()
      uiStore.mainSidebarExpanded = false
    } else if (item.path === '/baumarteneignungstabelle'){
        uiStore.mainSidebarExpanded = false
    } else {
      uiStore.hideMapSidebar()
      uiStore.mainSidebarExpanded = true
    }
  })
}
  
    // Update these computed properties
    const isMapPage = computed(() => {
    return route.path === '/karte';
    });

    const showToggleButton = computed(() => {
    const shouldShow = route.path !== '/karte';
    return shouldShow;
    });

    // Also update the toggleSidebar function to add logging
    const toggleSidebar = () => {
    console.log('Toggle clicked, current path:', route.path);  // Debug log
    if (route.path !== '/karte') {
        uiStore.toggleMainSidebar();
    }
    };
  </script>