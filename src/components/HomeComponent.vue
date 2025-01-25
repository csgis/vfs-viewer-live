<template>
  <div class="relative min-h-screen flex items-center overflow-auto">
    <div class="fixed inset-0 z-0">
      <!-- <img 
        src="/img/forst.jpg" 
        alt="Forest Soil Survey" 
        class="w-full h-full object-cover filter opacity-20"
      /> -->
      <div class="absolute inset-0 bg-gray-100"></div>
    </div>
    
    <div class="container mx-auto px-12 relative z-10 ">
      <div class="max-w-6xl mx-auto space-y-4">
        <!-- Header -->
        <div class="text-center ">
          <h1 class="text-4xl md:text-5xl font-semibold mb-2 text-gray-700">
           Wald im Überblick
          </h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 mb-8">
            Das Webportal des VfS für Waldbesitzer 
          </p>
        </div>

        <!-- Main Content Grid -->
        <div class="grid md:grid-cols-3 gap-2">
          <div class="md:col-span-3 bg-white/5 border border-black/30 p-8 ">
            <div class="grid md:grid-cols-3 gap-8">
              <!-- Main Text Section -->
              <div class="md:col-span-2">
                <h3 class="text-2xl font-bold  mb-4">
                  Ihr Waldboden ist unser Thema
                </h3>
                <div class="space-y-4">
                  <p class=" leading-relaxed">
                    Die forstliche Standortserkundung erstellt detaillierte Bodenkarten des Waldes. Dabei werden alle wichtigen Standortfaktoren berücksichtigt: Klima, Vegetation, Relief, Geologie sowie menschliche Einflüsse. Diese umfassende Analyse wird in der Forstlichen Standortskarte dokumentiert und dient als Grundlage für die nachhaltige Waldbewirtschaftung.
                  </p>
                  <p class=" leading-relaxed">
                    Ziel ist die Erstellung detaillierter Standortskarten und Baumarteneignungstabellen für eine nachhaltige Waldwirtschaft.
                  </p>
                </div>
              </div>

              <!-- Statistics Section with Divider -->
              <div class="md:col-span-1 md:border-l border-black/30 md:pl-8">
                <div class="space-y-4">
                  <div class="p-6  flex items-center">
                    <component :is="DocumentIcon" class="w-12 h-12 mr-6 -400 flex-shrink-0" />
                    <div>
                      <h3 class="text-xl font-semibold">1.000+</h3>
                      <p class="-300">Kartierprojekte</p>
                    </div>
                  </div>
                  
                  <div class="p-6  flex items-center">
                    <component :is="MapPinIcon" class="w-12 h-12 mr-6 -400 flex-shrink-0" />
                    <div>
                      <h3 class="text-xl font-semibold">1.000.000+&nbsp;ha</h3>
                      <p class="-300">kartierte Waldflächen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Viewer Options -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/5  p-6 border border-black/30">
            <h3 class="text-2xl font-bold  mb-4">VfS Viewer</h3>
            <p class=" mb-4">
              Der öffentlich zugängliche Bereich zeigt kartierte Waldflächen und gibt Auskunft über Zuständigkeitsbereiche.
            </p>
            <router-link 
              to="/karte" 
              class="inline-block  bg-gray-300  text-black-900 px-6 py-2 hover:bg-gray-400 transition-colors contrast:bg-contrast-primary contrast:text-contrast-primary contrast:text-contrast-primary contrast-hover:bg-contrast-hover"
            >
              Öffentliche Karte
            </router-link>
          </div>

          <div class="bg-white/5    p-6 border border-black/30">
            <div class="flex items-center gap-2">
            <h3 class="text-2xl font-bold text-green ">VfS Viewer Plus</h3>
            <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            class="w-6 h-6 text-green-600 contrast:bg-contrast-primary contrast:text-contrast-primary"
          >
            <path 
              fill-rule="evenodd" 
              d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
              clip-rule="evenodd" 
            />
          </svg>
          </div>
            <p class=" mb-4">
             Passwortgeschützter Bereich für Forstzusammenschlüsse und Waldbesitzer mit detaillierten Karten und Baumarten-Eignungstabelle.
            </p>
            <router-link 
              to="/login" 
              class="inline-block bg-gray-300  text-black-900  px-6 py-2 hover:bg-gray-400  transition-colors contrast:bg-contrast-primary contrast:text-contrast-primary contrast:text-contrast-primary contrast-hover:bg-contrast-hover"
            >
              Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  MapPinIcon, 
  DocumentIcon
} from '@heroicons/vue/24/outline'
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