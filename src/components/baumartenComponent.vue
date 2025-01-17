<template>
  <div class="p-12 overflow-auto h-screen">
    <h1 class="text-2xl font-bold mb-4">Baumarten-Eignungstabelle</h1>
    
    <!-- Controls -->
    <div class="mb-4 flex justify-between items-center">
      <div class="flex space-x-4 w-2/3">
        <!-- Kartiergebiet Filter -->
        <div class="w-72 relative">
          <Combobox 
            v-model="selectedKartiergebiet"
            as="div"
            data-combobox="kartiergebiet"
            :disabled="isKartiergebietDisabled"
          >
            <div class="relative">
              <ComboboxInput
                class="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :displayValue="(item) => item?.kartiergebiet_name"
                @change="handleKartiergebietInput"
                @focus="handleComboboxOpen('kartiergebiet')"
                placeholder="Kartiergebiet auswählen..."
                :disabled="isKartiergebietDisabled"
              />
              <ComboboxButton 
                class="absolute inset-y-0 right-0 flex items-center pr-2"
                :class="{ 'opacity-50 cursor-not-allowed': isKartiergebietDisabled }"
              >
                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
              </ComboboxButton>
            </div>

            <Teleport to="body">
              <ComboboxOptions 
                v-if="activeCombobox === 'kartiergebiet' && !isKartiergebietDisabled"
                :style="[
                  {
                    position: 'fixed',
                    zIndex: 100,
                    backgroundColor: 'white',
                    width: '288px',
                    maxHeight: '15rem',
                    overflow: 'auto',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  },
                  comboboxPositions.kartiergebiet
                ]"
                class="py-1"
              >
                <ComboboxOption
                  v-slot="{ active, selected }"
                  :value="null"
                  class="relative cursor-pointer select-none py-2 pl-10 pr-4"
                  :class="[active ? 'bg-blue-100' : '', selected ? 'bg-blue-50' : '']"
                >
                  <span class="block truncate">Alle Kartiergebiete</span>
                  <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
                <ComboboxOption
                  v-for="kartiergebiet in kartiergebiete"
                  :key="kartiergebiet.kartiergebiet_id"
                  :value="kartiergebiet"
                  v-slot="{ active, selected }"
                  class="relative cursor-pointer select-none py-2 pl-10 pr-4"
                  :class="[active ? 'bg-blue-100' : '', selected ? 'bg-blue-50' : '']"
                >
                  <span class="block truncate">{{ kartiergebiet.kartiergebiet_name }}</span>
                  <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                  </span>
                </ComboboxOption>
              </ComboboxOptions>
            </Teleport>
          </Combobox>
        </div>

        <!-- Standort Filter -->
        <!-- Standort Filter -->
<div class="w-72 relative">
  <Combobox 
    v-model="selectedStandorte"
    multiple
    as="div"
    data-combobox="standort"
    :disabled="isStandortDisabled"
  >
    <div class="relative">
      <div class="w-full min-h-[38px] px-3 py-1 text-sm border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white flex flex-wrap gap-1 items-center"
           :class="{ 'bg-gray-100 cursor-not-allowed': isStandortDisabled }"
      >
        <!-- Selected Tags -->
        <span 
          v-for="standort in selectedStandorte" 
          :key="standort.sto_ges"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800"
        >
          {{ standort.sto_ges }}
          <button
            type="button"
            @click.prevent.stop="removeStandort(standort)"
            class="hover:text-blue-500"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>

        <!-- Input -->
        <ComboboxInput
          class="flex-1 outline-none min-w-[60px] bg-transparent disabled:cursor-not-allowed"
          :displayValue="() => standortQuery"
          @change="handleStandortInput"
          @focus="handleComboboxOpen('standort')"
          placeholder="Standort suchen..."
          :disabled="isStandortDisabled"
        />
      </div>

      <ComboboxButton 
        class="absolute inset-y-0 right-0 flex items-center pr-2"
        :class="{ 'opacity-50 cursor-not-allowed': isStandortDisabled }"
      >
        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>
    </div>

    <Teleport to="body">
      <ComboboxOptions 
        v-if="activeCombobox === 'standort' && !isStandortDisabled"
        :style="[
          {
            position: 'fixed',
            zIndex: 100,
            backgroundColor: 'white',
            width: '288px',
            maxHeight: '15rem',
            overflow: 'auto',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          },
          comboboxPositions.standort
        ]"
        class="py-1"
      >
        <ComboboxOption
          v-for="standort in filteredStandorte"
          :key="standort.sto_ges"
          :value="standort"
          v-slot="{ active, selected }"
          class="relative cursor-pointer select-none py-2 px-4 text-sm"
          :class="[active ? 'bg-blue-100' : '', selected ? 'bg-blue-50 font-medium' : '']"
        >
          {{ standort.sto_ges }}
        </ComboboxOption>
        <div 
          v-if="filteredStandorte.length === 0" 
          class="relative cursor-default select-none py-2 px-4 text-sm text-gray-700"
        >
          Keine Ergebnisse gefunden.
        </div>
      </ComboboxOptions>
    </Teleport>
  </Combobox>
</div>
      </div>
      
      <!-- Export Buttons -->
      <div class="space-x-2">
        <button
          @click="exportPDF"
          class="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center"
          :disabled="isPdfExporting"
        >
          <ArrowPathIcon 
            v-if="isPdfExporting" 
            class="h-4 w-4 mr-1 animate-spin" 
            aria-hidden="true" 
          />
          PDF Export
        </button>
        <button
          @click="exportCSV"
          class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center"
          :disabled="isCsvExporting"
        >
          <ArrowPathIcon 
            v-if="isCsvExporting" 
            class="h-4 w-4 mr-1 animate-spin" 
            aria-hidden="true" 
          />
          CSV Export
        </button>
      </div>
    </div>

    <!-- Table Content -->
    <div v-if="baumarten.length === 0" class="text-gray-500 text-center py-4">
      Lade Daten...
    </div>
    <div v-else-if="filteredData.length === 0" class="text-gray-500 text-center py-4">
      Keine Ergebnisse gefunden.
    </div>
    <div v-else class="bg-white rounded-lg shadow">
      <div>
        <table class="w-full divide-y divide-gray-200 text-xs">
          <thead class="bg-gray-50 sticky top-0 z-10 [&.is-sticky]:shadow-md">
            <tr>
              <th class="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Standort
              </th>
              <th class="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">
                Bezeichnung
              </th>
              <th v-for="column in treeColumns" :key="column" 
                  class="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in filteredData" :key="item.sto_ges" class="hover:bg-gray-50">
              <td class="px-3 py-2 text-xs whitespace-nowrap font-medium">
                {{ item.sto_ges }}
              </td>
              <td class="px-3 py-2 text-xs w-96">
                <div class="break-words">{{ item.sto_name }}</div>
              </td>
              <td v-for="column in treeColumns" :key="column" 
                  @click="openEditDialog(item, column)"
                  :class="getCellClass(item[column.toLowerCase()])"
                  class="px-3 py-2 text-xs whitespace-nowrap cursor-pointer group relative">
                <span>{{ item[column.toLowerCase()] }}</span>
                <div class="absolute z-50 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 min-w-max">
                  {{ getTooltipText(column, item[column.toLowerCase()]) }}
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 
                              border-l-8 border-l-transparent 
                              border-r-8 border-r-transparent 
                              border-t-8 border-gray-900"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Dialog -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-96">
        <h2 class="text-xl font-bold mb-4">Wert ändern</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Neuer Wert für {{ currentEdit.column }}
          </label>
          <input
            v-model="newValue"
            class="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. 1/3"
          />
        </div>
        <div class="flex justify-end space-x-2">
          <button
            @click="closeEditDialog"
            class="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100"
          >
            Abbrechen
          </button>
          <button
            @click="saveEdit"
            class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { 
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption 
} from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon, ArrowPathIcon } from '@heroicons/vue/20/solid'
import html2pdf from 'html2pdf.js'

const authStore = useAuthStore()
const uiStore = useUIStore()
uiStore.hideMapSidebar()

// Data
const baumarten = ref([])
const kartiergebiete = ref([])
const standorte = ref([])
const selectedKartiergebiet = ref(null)
const selectedStandorte = ref([])
const showEditDialog = ref(false)
const currentEdit = ref({ item: null, column: null })
const newValue = ref('')
const isPdfExporting = ref(false)
const isCsvExporting = ref(false)
const activeCombobox = ref(null)
const standortQuery = ref('')

// Combobox positioning styles
const comboboxPositions = ref({ 
  kartiergebiet: { top: 0, left: 0 },
  standort: { top: 0, left: 0 }
})

const updateComboboxPosition = (name) => {
  nextTick(() => {
    const button = document.querySelector(`[data-combobox="${name}"]`)
    if (button) {
      const rect = button.getBoundingClientRect()
      comboboxPositions.value[name] = {
        top: `${rect.bottom + window.scrollY + 5}px`,
        left: `${rect.left + window.scrollX}px`
      }
    }
  })
}

const treeColumns = [
  'FICHTE', 'TANNE', 'ELA', 'DOUGLASIE', 'KIEFER', 'BUCHE', 
  'BERGAHORN', 'ESCHE', 'WINTERLINDE', 'SCHWARZERLE', 
  'EICHE', 'kiefer', 'TRAUBENEICHE', 'STIELEICHE', 
]

// Combobox handlers
const handleComboboxOpen = (name) => {
  activeCombobox.value = name
  updateComboboxPosition(name)
}

const handleComboboxClose = () => {
  activeCombobox.value = null
}

const getTooltipText = (column, value) => {
  if (!value || value === '-') return `${column}: Keine Bewertung`
  
  const [suitability] = value.split('/')
  let suitabilityText = ''
  
  switch(suitability) {
    case '1':
      suitabilityText = 'geeignet'
      break
    case '2':
      suitabilityText = 'möglich'
      break
    case '3':
      suitabilityText = 'wenig geeignet'
      break
    default:
      suitabilityText = 'keine Bewertung'
  }
  
  return `${column}: ${suitabilityText} (${value})`
}

// Fetch data
const fetchData = async () => {
  try {
    const response = await authStore.fetchWithAuth('/api/baumarten/all')
    baumarten.value = response
    kartiergebiete.value = getUniqueKartiergebiete(response)
    standorte.value = getUniqueStandorte(response)
  } catch (error) {
    console.error('Error fetching baumarten:', error)
  }
}

// Computed
const filteredData = computed(() => {
  let filtered = baumarten.value

  if (selectedKartiergebiet.value) {
    filtered = filtered.filter(item => 
      item.kartiergebiet_id === selectedKartiergebiet.value.kartiergebiet_id
    )
  }

  if (selectedStandorte.value.length > 0) {
    filtered = filtered.filter(item => 
      selectedStandorte.value.some(s => s.sto_ges === item.sto_ges)
    )
  }

  return filtered
})

// Helper functions
const getUniqueKartiergebiete = (data) => {
  const unique = new Map()
  data.forEach(item => {
    if (item.kartiergebiet_id && !unique.has(item.kartiergebiet_id)) {
      unique.set(item.kartiergebiet_id, {
        kartiergebiet_id: item.kartiergebiet_id,
        kartiergebiet_name: item.kartiergebiet_name
      })
    }
  })
  return Array.from(unique.values())
}

const getUniqueStandorte = (data) => {
  const unique = new Map()
  data.forEach(item => {
    if (item.sto_ges && !unique.has(item.sto_ges)) {
      unique.set(item.sto_ges, {
        sto_ges: item.sto_ges,
        sto_name: item.sto_name
      })
    }
  })
  return Array.from(unique.values())
}

const handleKartiergebietInput = (event) => {
  if (!event.target.value) {
    selectedKartiergebiet.value = null
  }
}

// Standort filtering and selection
const filteredStandorte = computed(() => {
  const query = standortQuery.value.toLowerCase().trim()
  return standorte.value.filter(standort => 
    !selectedStandorte.value.some(s => s.sto_ges === standort.sto_ges) &&
    standort.sto_ges.toLowerCase().includes(query)
  )
})


const handleStandortInput = (event) => {
  standortQuery.value = event.target.value
}

// Also update the display formatter to show exactly what the user types

const removeStandort = (standortToRemove) => {
  selectedStandorte.value = selectedStandorte.value.filter(
    s => s.sto_ges !== standortToRemove.sto_ges
  )
}

const isKartiergebietDisabled = computed(() => selectedStandorte.value.length > 0)
const isStandortDisabled = computed(() => selectedKartiergebiet.value !== null)

// Cell formatting
const getCellClass = (value) => {
  if (!value || value === '-') return 'bg-gray-100'
  const [suitability] = value.split('/')
  
  switch(suitability) {
    case '1': return 'bg-green-200 hover:bg-green-300'
    case '2': return 'bg-yellow-200 hover:bg-yellow-300'
    case '3': return 'bg-red-200 hover:bg-red-300'
    default: return ''
  }
}

// Edit functionality
const openEditDialog = (item, column) => {
  currentEdit.value = { item, column }
  newValue.value = item[column.toLowerCase()]
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  currentEdit.value = { item: null, column: null }
  newValue.value = ''
}

const saveEdit = async () => {
  try {
    const updateData = {
      column_name: currentEdit.value.column.toLowerCase(),
      old_content: currentEdit.value.item[currentEdit.value.column.toLowerCase()],
      new_content: newValue.value,
      change_id: currentEdit.value.item.sto_ges,
      sto_name: currentEdit.value.item.sto_name
    }
    
    await authStore.fetchWithAuth('/api/baumarten/update', {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    
    await fetchData()
    closeEditDialog()
  } catch (error) {
    console.error('Error updating value:', error)
  }
}

// Export functionality
const exportPDF = async () => {
  isPdfExporting.value = true
  const element = document.querySelector('table')
  
  const currentDate = new Date()
  const dateStr = currentDate.toLocaleDateString('de-DE').replace(/\./g, '-')
  const timeStr = currentDate.toLocaleTimeString('de-DE').replace(/:/g, '-')
  const filename = `baumarten_${authStore.user?.username || 'unknown'}_${dateStr}_${timeStr}.pdf`
  
  const wrapper = document.createElement('div')
  wrapper.style.width = '100%'
  
  const header = document.createElement('div')
  header.innerHTML = `
    <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">Baumarten</h1>
    <div style="font-size: 10px; margin-bottom: 16px;">
      <div>Benutzer: ${authStore.user?.username || 'Unbekannt'}</div>
      <div>Datum: ${currentDate.toLocaleDateString('de-DE')}</div>
    </div>
  `
  
  wrapper.appendChild(header)
  const tableClone = element.cloneNode(true)
  
  tableClone.style.width = '100%'
  tableClone.style.fontSize = '8px'
  tableClone.style.borderCollapse = 'collapse'
  
  const cells = tableClone.querySelectorAll('td, th')
  cells.forEach(cell => {
    cell.style.border = '1px solid #ddd'
    cell.style.padding = '4px'
    cell.style.textAlign = 'left'
    cell.style.verticalAlign = 'middle'
    cell.style.height = '20px'
  })
  
  wrapper.appendChild(tableClone)

  const opt = {
    margin: [10, 5, 10, 5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      logging: false,
      windowWidth: wrapper.scrollWidth
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'landscape',
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  }
  
  try {
    await html2pdf().set(opt).from(wrapper).save()
  } catch (error) {
    console.error('Error generating PDF:', error)
  } finally {
    isPdfExporting.value = false
  }
}

const exportCSV = () => {
  isCsvExporting.value = true
  try {
    const currentDate = new Date()
    const dateStr = currentDate.toLocaleDateString('de-DE').replace(/\./g, '-')
    const timeStr = currentDate.toLocaleTimeString('de-DE').replace(/:/g, '-')
    const filename = `baumarten_${authStore.user?.username || 'unknown'}_${dateStr}_${timeStr}.csv`

    const headers = ['sto_ges', ...treeColumns.map(col => col.toLowerCase())]
    const csvContent = [
      headers.join(','),
      ...filteredData.value.map(item => 
        headers.map(header => item[header] || '').join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  } finally {
    isCsvExporting.value = false
  }
}

// State reset
const resetSelections = (except) => {
  if (except !== 'kartiergebiet') {
    selectedKartiergebiet.value = null
  }
  if (except !== 'standort') {
    selectedStandorte.value = []
    standortQuery.value = ''
  }
}

// Watchers
watch(selectedKartiergebiet, (newValue) => {
  if (newValue !== null) {
    resetSelections('kartiergebiet')
  }
}, { deep: true })

watch(selectedStandorte, () => {
  standortQuery.value = ''
})

// Lifecycle hooks
onMounted(() => {
  uiStore.hideMapSidebar()
  fetchData()

  const thead = document.querySelector('thead')
  const container = document.querySelector('.overflow-auto')

  if (container && thead) {
    container.addEventListener('scroll', () => {
      if (container.scrollTop > 0) {
        thead.classList.add('is-sticky')
      } else {
        thead.classList.remove('is-sticky')
      }
    })
  }
})

onUnmounted(() => {
  handleComboboxClose()
})
</script>

<style>
thead {
  transition: box-shadow 0.2s ease;
}

thead.is-sticky {
  box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1), 0 1px 0 rgb(0 0 0 / 0.1);
}
</style>