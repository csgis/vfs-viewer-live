<template>
  <div class="relative h-full overflow-auto">
    <div class="fixed inset-0 z-0">
      <img 
        src="/img/forst.jpg" 
        alt="Forest Soil Survey" 
        class="w-full h-full object-cover filter opacity-20"
      />
      <div class="absolute inset-0 bg-green-900/60"></div>
    </div>
    
    <div class="container mx-auto px-12 py-8   relative z-10 mt-5 ">
      <div class="max-w-6xl mx-auto space-y-4">
        <!-- Header -->
        <div class="text-center text-white">
          <h1 class="text-4xl md:text-5xl font-semibold mb-4">
           Wald im Überblick
          </h1>
          <p class="text-xl md:text-2xl max-w-3xl mx-auto font-light text-gray-100 mb-8">
            Das Webportal des VfS für Waldbesitzer 
          </p>
        </div>

        <!-- Main Content Grid -->
        <div class="grid md:grid-cols-3 gap-4">
          <div class="md:col-span-3 bg-white/10 border border-white/20 p-8 text-white">
            <div class="grid md:grid-cols-3 gap-8">
              <!-- Main Text Section -->
              <div class="md:col-span-2">
                <h3 class="text-2xl font-bold text-white mb-4">
                  Ihr Waldboden ist unser Thema
                </h3>
                <div class="space-y-4">
                  <p class="text-white leading-relaxed">
                    Die Arbeit der Forstlichen Standortserkundung besteht aus einer Bodenfeinkartierung im Wald, die 
                    unter Berücksichtigung weiterer Standortsfaktoren wie Klima, Vegetation, Relief, Geologie
                    und menschliche Einflüsse eine Bewertung des Standorts im Hinblick auf die forstliche Nutzung 
                    vornimmt und in einer „Forstlichen Standortskarte" darstellt.
                  </p>
                  <p class="text-white leading-relaxed">
                    Ziel ist die Erstellung detaillierter Standortskarten und Baumarteneignungstabellen für eine nachhaltige Waldwirtschaft.
                  </p>
                </div>
              </div>

              <!-- Statistics Section with Divider -->
              <div class="md:col-span-1 md:border-l border-white/20 md:pl-8">
                <div class="space-y-4">
                  <div class="p-6 text-white flex items-center">
                    <component :is="DocumentIcon" class="w-12 h-12 mr-6 text-white-400 flex-shrink-0" />
                    <div>
                      <h3 class="text-xl font-semibold">1.000+</h3>
                      <p class="text-white-300">Kartierprojekte</p>
                    </div>
                  </div>
                  <div class="p-6 text-white flex items-center">
                    <component :is="MapPinIcon" class="w-12 h-12 mr-6 text-white-400 flex-shrink-0" />
                    <div>
                      <h3 class="text-xl font-semibold">1.000.000+</h3>
                      <p class="text-white-300">Kartierte Waldflächen (ha)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Viewer Options -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/20  p-6 border border-white/30">
            <h3 class="text-2xl font-bold text-white mb-4">VfS Viewer</h3>
            <p class="text-white mb-4">
              Der öffentlich zugängliche Bereich zeigt kartierte Waldflächen und gibt Auskunft über Zuständigkeitsbereiche.
            </p>
            <router-link 
              to="/karte" 
              class="inline-block  bg-white  text-green-900 px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Öffentliche Karte
            </router-link>
          </div>

          <div class="bg-white/20  p-6 border border-white/30">
            <h3 class="text-2xl font-bold text-white mb-4">VfS Viewer Plus</h3>
            <p class="text-white mb-4">
             Passwortgeschützter Bereich für Forstzusammenschlüsse und Waldbesitzer mit detaillierten Karten und Baumarten-Eignungstabelle.
            </p>
            <router-link 
              to="/login" 
              class="inline-block bg-white text-green-900 px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
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