<template>
  <div class="w-full">
    <!-- Legend Modal -->
    <div v-if="showLegendModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      @click="closeLegendModal"
    >
      <div class="bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-auto" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedLegendTitle }}</h3>
          <button @click="closeLegendModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <img 
          :src="selectedLegendUrl" 
          :alt="'Legend for ' + selectedLegendTitle"
          class="max-w-full"
        />
      </div>
    </div>

    <!-- Layer Groups -->
    <div class="space-y-2">
      <!-- Map Contents -->

      <!-- Waldbodeninformationen (Forest Soil Information) -->
      <div 
    class="border overflow-hidden rounded-lg"
    :class="{ 
      'bg-zinc-100': openSections.forestInfo,
      'opacity-75': !authStore.isAuthenticated
    }"
  >
    <button 
      @click="toggleSection('forestInfo')"
      class="w-full p-3 flex justify-between items-center hover:bg-zinc-200 rounded-lg relative"
    >
      <span class="font-medium">Waldbodeninformationen</span>
      
      <!-- Lock icon to indicate some content is locked -->
      <div v-if="!authStore.isAuthenticated" 
           class="absolute right-12 top-1/2 transform -translate-y-1/2"
      >
        <svg 
          class="w-4 h-4 text-gray-500" 
          fill="none" 
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

      <svg 
        class="w-5 h-5 transform transition-transform"
        :class="{ 'rotate-180': openSections.forestInfo }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="openSections.forestInfo" 
         class="border-t border-gray-300 max-h-96 overflow-y-auto ps-2 py-2"
    >
      <draggable 
        v-model="layerOrder"
        v-bind="dragOptions"
        item-key="name"
        class="space-y-2"
        @change="handleLayerOrderChange"
      >
        <template #item="{ element: layerName }">
          <div 
            v-if="[
              'standorte', 
              'fichte', 
              'bergahorn',
              'buche',
              'douglasie',
              'eiche',
              'ela',
              'esche',
              'fichte',
              'kiefer',
              'kirsche',
              'schwarzerle',
              'stieleiche',
              'tanne',
              'traubeneiche',
              'winterlinde'
        ].includes(layerName)"
            class="space-y-1 p-2 hover:bg-gray-100 rounded transition-colors relative"
            :class="{ 
              'bg-blue-100 hover:bg-blue-100': layers[layerName]?.visible,
              'opacity-75': !authStore.isAuthenticated 
            }"
          >
            <div class="flex flex-col space-y-2">
              <!-- Main Layer Controls -->
              <div class="flex items-center">
                <div class="drag-handle cursor-grab p-1">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                
                <!-- Checkbox and Label -->
                <div class="flex-1 flex items-center min-w-0">
                  <input 
                    type="checkbox" 
                    :checked="layers[layerName]?.visible ?? false"
                    @change="toggleLayer(layerName)"
                    :disabled="!authStore.isAuthenticated"
                    class="mr-2"
                    :class="{ 'cursor-not-allowed': !authStore.isAuthenticated }"
                  >
                  <span class="flex-1 truncate mr-2">{{ getLayerLabel(layerName) }}</span>
                  
                  <!-- Lock icon for each locked layer -->
                  <svg 
                    v-if="!authStore.isAuthenticated"
                    class="w-4 h-4 text-gray-500 mr-2" 
                    fill="none" 
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

                <!-- Info Icon -->
                <div>
                  <svg 
                    class="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    @mouseenter="updateTooltipPosition($event, layerName)"
                    @mouseleave="hoveredLayer = null"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <!-- Controls when layer is active -->
              <div v-if="layers[layerName]?.visible && authStore.isAuthenticated" class="pl-7">
                <!-- Opacity Slider -->
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-xs text-gray-500 w-8">0%</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="layerOpacities[layerName]" 
                    @input="updateLayerOpacity(layerName)"
                    class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  >
                  <span class="text-xs text-gray-500 w-8">{{ layerOpacities[layerName] }}%</span>
                </div>

                <!-- Legend Display -->
                <div v-if="legends[layerName]">
  <div class="relative">
    <div :class="{'max-h-32 overflow-hidden': isLegendLarge(layerName) && !expandedLegends[layerName]}">
      <img 
        :src="legends[layerName]" 
        :alt="'Legend for ' + getLayerLabel(layerName)"
        class="max-w-full cursor-pointer"
        @click="openLegendModal(layerName)"
        @load="checkLegendSize($event, layerName)"
      />
    </div>
    <div class="flex space-x-2 mt-1">
      <button 
        v-if="isLegendLarge(layerName)"
        @click="toggleLegend(layerName)"
        class="text-sm text-blue-400 hover:text-blue-300"
      >
        {{ expandedLegends[layerName] ? 'Zeige weniger' : 'Zeige mehr' }}
      </button>
      <button 
        v-if="isLegendLarge(layerName)"
        @click="openLegendModal(layerName)"
        class="text-sm text-blue-400 hover:text-blue-300"
      >
        Vergrößern
      </button>
    </div>
  </div>
</div>
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <!-- Login hint message -->

    </div>
  </div>

      <div 
      class="border overflow-hidden rounded-lg" 
      :class="{ 'bg-zinc-100': openSections.mapContents }"
      >
        <button 
          @click="toggleSection('mapContents')"
          class="w-full p-3 flex justify-between items-center hover:bg-zinc-200 rounded-lg"
        >
          <span class="font-medium">Karteninhalte</span>
          <svg 
            class="w-5 h-5 transform transition-transform"
            :class="{ 'rotate-180': openSections.mapContents }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openSections.mapContents" class="border-t border-gray-300 max-h-96 overflow-y-auto ps-2 py-2">
          <draggable 
            v-model="layerOrder"
            v-bind="dragOptions"
            item-key="name"
            class="space-y-2"
            @change="handleLayerOrderChange"
          >

          <template #item="{ element: layerName }">
            <div 
            v-if="['flurkartenSchnitt', 'alkisParzellarkarte','kartiergebiete', 'gemeinde', 'landkreis', 'regierungsbezirk'].includes(layerName)"
            class="space-y-1 p-2 hover:bg-gray-100 rounded transition-colors"
  :class="{ 'bg-blue-100 hover:bg-blue-100': layers[layerName]?.visible }"
>
  <div class="flex flex-col space-y-2">
    <!-- Main Layer Controls -->
    <div class="flex items-center">
      <div class="drag-handle cursor-grab p-1">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <!-- Checkbox and Label with v-model -->
      <div class="flex-1 flex items-center min-w-0">
  <input 
    type="checkbox" 
    :checked="layers[layerName]?.visible ?? false"
    @change="toggleLayer(layerName)"
    :disabled="!isLayerAvailable(layerName)"
    class="mr-2"
    :class="{ 'cursor-not-allowed': !isLayerAvailable(layerName) }"
  >
  <span 
    class="flex-1 truncate mr-2" 
    :class="{ 'text-gray-400': !isLayerAvailable(layerName) }"
  >
    {{ getLayerLabel(layerName) }}
  </span>
  
  <!-- Lock icon for protected layers -->
  <svg 
    v-if="!isLayerAvailable(layerName)"
    class="w-4 h-4 text-gray-500 mr-2" 
    fill="none" 
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
      <!-- Info Icon -->
      <div>
        <svg 
          class="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          @mouseenter="updateTooltipPosition($event, layerName)"
          @mouseleave="hoveredLayer = null"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    
    <!-- Controls when layer is active -->
    <div v-show="layers[layerName]?.visible" class="pl-7">
      <!-- Opacity Slider -->
      <div class="flex items-center space-x-2 mb-2">
        <span class="text-xs text-gray-500 w-8">0%</span>
        <input 
          type="range" 
          min="0" 
          max="100" 
          v-model="layerOpacities[layerName]" 
          @input="updateLayerOpacity(layerName)"
          class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        >
        <span class="text-xs text-gray-500 w-8">{{ layerOpacities[layerName] }}%</span>
      </div>


        <!-- Legend Display -->
        <div v-if="legends[layerName]">
          <div class="relative">
            <div :class="{'max-h-32 overflow-hidden': isLegendLarge(layerName) && !expandedLegends[layerName]}">
              <img 
                :src="legends[layerName]" 
                :alt="'Legend for ' + getLayerLabel(layerName)"
                class="max-w-full cursor-pointer"
                @click="openLegendModal(layerName)"
                @load="checkLegendSize($event, layerName)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
          

          </draggable>
        </div>
      </div>

      <!-- Protected Areas -->
      <div class="border overflow-hidden rounded-lg"
      :class="{ 'bg-zinc-100': openSections.protectedAreas }"
      >
        <button 
          @click="toggleSection('protectedAreas')"
          class="w-full p-3 flex justify-between items-center hover:bg-zinc-200"
        >
          <span class="font-medium">Schutzgebiete</span>
          <svg 
            class="w-5 h-5 transform transition-transform"
            :class="{ 'rotate-180': openSections.protectedAreas }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openSections.protectedAreas" class="border-t border-gray-300 max-h-96 overflow-y-auto px-2 py-2">
          <draggable 
            v-model="layerOrder"
            v-bind="dragOptions"
            item-key="name"
            class="space-y-2"
            @change="handleLayerOrderChange"
          >
            <template #item="{ element: layerName }">
              <div 
                v-if="['trinkwasser', 'landschaftsschutz', 'naturschutz'].includes(layerName)"
                class="space-y-1 p-2 bg-white hover:bg-gray-100 rounded transition-colors"
              >
                <div class="flex flex-col space-y-2">
                  <!-- Main Layer Controls -->
                  <div class="flex items-center">
                    <!-- Drag Handle -->
                    <div class="drag-handle cursor-grab p-1">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    
                    <!-- Checkbox and Label -->
                    <div class="flex-1 flex items-center min-w-0">
                      <input 
                        type="checkbox" 
                        :checked="layers[layerName]?.visible ?? false"
                        @change="toggleLayer(layerName)"
                        class="mr-2"
                        :disabled="!isLayerAvailable(layerName)"
                      >
                      <span class="flex-1 truncate mr-2">{{ getLayerLabel(layerName) }}</span>
                    </div>

                    <!-- Info Icon -->
                    <div>
                      <svg 
                        class="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        @mouseenter="updateTooltipPosition($event, layerName)"
                        @mouseleave="hoveredLayer = null"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <!-- Controls when layer is active -->
                  <div v-if="layers[layerName]?.visible" class="pl-7">
                    <!-- Opacity Slider -->
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="text-xs text-gray-500 w-8">0%</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        v-model="layerOpacities[layerName]" 
                        @input="updateLayerOpacity(layerName)"
                        class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      >
                      <span class="text-xs text-gray-500 w-8">{{ layerOpacities[layerName] }}%</span>
                    </div>

                    <!-- Legend Display -->
                    <div v-if="legends[layerName]">
                      <div class="relative">
                        <div :class="{'max-h-32 overflow-hidden': isLegendLarge(layerName) && !expandedLegends[layerName]}">
                          <img 
                            :src="legends[layerName]" 
                            :alt="'Legend for ' + getLayerLabel(layerName)"
                            class="max-w-full cursor-pointer"
                            @click="openLegendModal(layerName)"
                            @load="checkLegendSize($event, layerName)"
                          />
                        </div>
                        <div class="flex space-x-2 mt-1" v-if="isLegendLarge(layerName)">
                          <button 
                            @click="toggleLegend(layerName)"
                            class="text-sm text-blue-400 hover:text-blue-300"
                          >
                            {{ expandedLegends[layerName] ? 'Zeige weniger' : 'Zeige mehr' }}
                          </button>
                          <button 
                            @click="openLegendModal(layerName)"
                            class="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Vergrößern
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Background -->

      <!-- Background section of LayerAccordion.vue -->
      <div class="border overflow-hidden rounded-lg"
      :class="{ 'bg-zinc-100': openSections.background }"
      >
        <button 
          @click="toggleSection('background')"
          class="w-full p-3 flex justify-between items-center hover:bg-zinc-300"
        >
          <span class="font-medium">Hintergrund</span>
          <svg 
            class="w-5 h-5 transform transition-transform"
            :class="{ 'rotate-180': openSections.background }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-show="openSections.background" class="p-3 border-t border-gray-300 px-3 py-3">
          <div class="space-y-2">
            <!-- Existing background options -->
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="none" v-model="selectedBackground" @change="changeBackground">
              <span>Kein Hintergrund</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="luftbilder" v-model="selectedBackground" @change="changeBackground">
              <span>Luftbilder WMS DOP 20</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="osm" v-model="selectedBackground" @change="changeBackground">
              <span>Open Street Map</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="terrain" v-model="selectedBackground" @change="changeBackground">
              <span>Stadiamaps Terrain</span>
            </label>
            
            <!-- Vector tile options -->
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="vectorColor" v-model="selectedBackground" @change="changeBackground">
              <span>Basemap.de Vektor (Farbe)</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="vectorRelief" v-model="selectedBackground" @change="changeBackground">
              <span>Basemap.de Vektor (Relief)</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="background" value="vectorGrey" v-model="selectedBackground" @change="changeBackground">
              <span>Basemap.de Vektor (Grau)</span>
            </label>
          </div>
        </div>
      </div>

      </div>
    </div>

  <!-- Teleported tooltip -->
  <Teleport to="body">
    <div 
      v-if="hoveredLayer"
      class="fixed bg-gray-900 text-white text-sm p-2 rounded shadow-lg max-w-96 z-[100]"
      :style="tooltipStyle"
    >
      {{ getLayerInfo(hoveredLayer) }}
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted, defineProps } from 'vue'
import { useLayerManagement } from '../composables/useLayerManagement'
import draggable from 'vuedraggable'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
})

const {
  layers,
  legends,
  layerOrder,
  selectedBackground,
  getLayerLabel,
  toggleLayer,
  changeBackground,
  updateLayerZIndices,
  wmsLayers,
  activeBackgroundLayer,
  layerOpacities,
  updateLayerOpacity,
  isLayerAvailable
} = useLayerManagement(props.map)

const authStore = useAuthStore()

// Draggable configuration
const dragOptions = {
  animation: 200,
  handle: '.drag-handle',
  ghostClass: 'opacity-50'
}

// Section management
const openSections = ref({
  mapContents: !authStore.isAuthenticated,
  protectedAreas: false,
  background: false,
  forestInfo: authStore.isAuthenticated
})

// Legend management
const showLegendModal = ref(false)
const selectedLegendUrl = ref('')
const selectedLegendTitle = ref('')
const expandedLegends = ref({})
const legendSizes = ref({})

// Tooltip management
const hoveredLayer = ref(null)
const tooltipStyle = ref({})

// Layer information texts
const layerInfo = {
  flurkartenSchnitt: 'Quelle: VFS-München; Flurkartenschnitt',
        regierungsbezirk: 'Quelle: VFS-München; Regierungsbezirke',
        landkreis: 'Quelle: VFS-München; Landkreise',
        gemeinde: 'Quelle: VFS-München; Gemeinden',
        kartiergebiete: 'Quelle: VFS-München; Übersichtslayer zum Kartiergebiet',
        trinkwasser: 'Quelle: VFS-München; Trinkwasserschutz Gebiete',
        landschaftsschutz: 'Quelle: VFS-München; Landschaftsschutz Gebiete',
        naturschutz: 'Quelle: VFS-München; Naturschutz Gebiete',
        soilNutrients: '',
        alkisParzellarkarte: 'Quelle: https://geodatenonline.bayern.de; Der ALKIS®-Parzellarkarte-WMS ist nach dem Vorbild der ALKIS®-Flurkarte gebaut, beinhaltet aber Objekte der Flurkarte ohne Flurstücksnummern, ohne Grenzzeichen und ohne Unterscheidung der Grenzen, mit Gebäuden, Lagebezeichnungen und TN-Objekten.',
        standorte: 'Quelle: VFS-München; Detaillayer zu einzelnen Waldbesitzer Standorten',
        bergahorn: 'Quelle: VFS-München; Detailansicht der Baumart',
        buche: 'Quelle: VFS-München; Detailansicht der Baumart',
        douglasie: 'Quelle: VFS-München; Detailansicht der Baumart',
        eiche: 'Quelle: VFS-München; Detailansicht der Baumart',
        ela: 'Quelle: VFS-München; Detailansicht der Baumart',
        esche: 'Quelle: VFS-München; Detailansicht der Baumart',
        fichte: 'Quelle: VFS-München; Detailansicht der Baumart',
        kiefer: 'Quelle: VFS-München; Detailansicht der Baumart',
        kirsche: 'Quelle: VFS-München; Detailansicht der Baumart',
        schwarzerle: 'Quelle: VFS-München; Detailansicht der Baumart',
        stieleiche: 'Quelle: VFS-München; Detailansicht der Baumart',
        tanne: 'Quelle: VFS-München; Detailansicht der Baumart',
        traubeneiche: 'Quelle: VFS-München; Detailansicht der Baumart',
        winterlinde: 'Quelle: VFS-München; Detailansicht der Baumart',
}

// Methods
const toggleSection = (section) => {
  openSections.value[section] = !openSections.value[section]
}

const handleLayerOrderChange = () => {
  updateLayerZIndices()
}

const isLegendLarge = (layerName) => {
  return legendSizes.value[layerName]?.height > 200
}

const checkLegendSize = (event, layerName) => {
  legendSizes.value[layerName] = {
    width: event.target.naturalWidth,
    height: event.target.naturalHeight
  }
}

const toggleLegend = (layerName) => {
  expandedLegends.value[layerName] = !expandedLegends.value[layerName]
}

const openLegendModal = (layerName) => {
  selectedLegendUrl.value = legends.value[layerName]
  selectedLegendTitle.value = getLayerLabel(layerName)
  showLegendModal.value = true
}

const closeLegendModal = () => {
  showLegendModal.value = false
  selectedLegendUrl.value = ''
  selectedLegendTitle.value = ''
}

const getLayerInfo = (layerName) => {
  return layerInfo[layerName] || "Information about this layer will be added soon."
}

const updateTooltipPosition = (event, layerName) => {
  hoveredLayer.value = layerName
  tooltipStyle.value = {
    top: `${event.clientY - 10}px`,
    left: `${event.clientX + 10}px`
  }
}

// Initialize layers when map is available
watch(() => props.map, (newMap) => {
  if (newMap && layers.value) {
    if (selectedBackground.value !== 'none') {
      changeBackground()
    }
  }
}, { immediate: true })

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    openSections.value.mapContents = !isAuthenticated
    openSections.value.forestInfo = isAuthenticated
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (props.map) {
    if (activeBackgroundLayer.value) {
      props.map.removeLayer(activeBackgroundLayer.value)
    }
    wmsLayers.forEach(layer => {
      props.map.removeLayer(layer)
    })
    props.map.setTarget(null)
  }
})
</script>

<style>
/* Custom styling for the range input */
input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  background-image: linear-gradient(#3b82f6, #3b82f6);
  background-repeat: no-repeat;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 0 2px 0 #555;
  transition: background .3s ease-in-out;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #2563eb;
}

input[type="range"]::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  box-shadow: none;
  border: none;
  background: transparent;
}
</style>