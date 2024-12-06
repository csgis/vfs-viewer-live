<template>
  <div class="h-full overflow-auto relative">
    <!-- Background Image Container with Overlay - now relative to component -->
    <div class="absolute inset-0 z-0">
      <img 
        src="/img/forst.jpg" 
        alt="Forest Background" 
        class="w-full h-full object-cover"
      />
      <!-- Overlay to make background lighter -->
      <div class="absolute inset-0 bg-white/90"></div>
    </div>
    
    <div class="container mx-auto px-6 py-12 relative z-10">
      <!-- Hero Section -->
      <div class="text-center mb-16 max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-4xl font-semibold text-black-700 mb-4 leading-tight tracking-tight">
          Waldinformationssystem
        </h1>
        <p class="text-lg md:text-xl text-black-800 max-w-2xl mx-auto font-normal leading-relaxed">
          Ihr Portal für die systematische Erfassung, Analyse und Verwaltung forstlicher Geodaten
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div class="bg-white/90 backdrop-blur rounded-lg p-6 shadow-md border">
          <div class="text-green-800 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-semibold text-black-900 mb-2">870.000 ha</h3>
          <p class="text-green-900">Erfasste Waldfläche</p>
        </div>

        <div class="bg-white/90 backdrop-blur rounded-lg p-6 shadow-md border">
          <div class="text-green-800 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-2xl font-semibold text-black-900 mb-2">250+</h3>
          <p class="text-green-900">Datenschichten</p>
        </div>

        <div class="bg-white/90 backdrop-blur rounded-lg p-6 shadow-md border">
          <div class="text-green-800 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-2xl font-semibold text-black-900 mb-2">45.000+</h3>
          <p class="text-green-900">Geschützte Gebiete</p>
        </div>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-5xl mx-auto">
        <div class="bg-white/90 backdrop-blur rounded-lg p-6 shadow-md border">
          <h3 class="text-xl font-semibold text-black-900 mb-4">Datenerfassung & Analyse</h3>
          <ul class="space-y-3 text-green-800">
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="leading-relaxed">Hochpräzise Waldbestandserhebung</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="leading-relaxed">Biotop- und Habitatkartierung</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="leading-relaxed">Standortspezifische Datenanalyse</span>
            </li>
          </ul>
        </div>

        <div class="bg-white/90 backdrop-blur rounded-lg p-6 shadow-md border">
          <h3 class="text-xl font-semibold text-black-900 mb-4">Technische Funktionen</h3>
          <ul class="space-y-3 text-green-800">
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="leading-relaxed">GIS-basierte Kartendarstellung</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="leading-relaxed">Räumliche Analysetools</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-800 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="leading-relaxed">Standardisierte Datenexporte</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center">
        <button 
          class="bg-green-800 text-white px-8 py-3 rounded-md text-base font-medium hover:bg-green-800 transition-colors shadow-sm"
        >
          Kartenansicht öffnen
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    name: 'HomeComponent',
  }
  </script>
  
  <style scoped>
  .pattern-grid-lg {
    background-image: radial-gradient(circle, #22c55e 1px, transparent 1px);
    background-size: 24px 24px;
  }
  
  @font-face {
    font-display: swap;
  }
  </style>