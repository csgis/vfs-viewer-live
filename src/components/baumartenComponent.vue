<template>
  <div class="p-6 overflow-auto">
    <h1 class="text-2xl font-bold mb-4">Baumarten-Eignungstabelle</h1>
    
    <!-- Controls -->
    <div class="mb-4 flex justify-between items-center">
      <div class="flex space-x-4 w-2/3">
<!-- Kartiergebiet Filter -->
<div class="w-72 relative">
  <Combobox v-model="selectedKartiergebiet">
    <div class="relative">
      <ComboboxInput
        class="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :displayValue="(item) => item?.kartiergebiet_name"
        @change="handleKartiergebietInput"
        placeholder="Kartiergebiet auswählen..."
      />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>
    </div>
    <ComboboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
      <ComboboxOption
        v-slot="{ active, selected }"
        :key="null"
        :value="null"
        class="relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-blue-50"
        :class="[
          active ? 'bg-blue-100' : '',
          selected ? 'bg-blue-50' : ''
        ]"
      >
        <div class="flex items-center">
          <span class="absolute left-3 flex items-center">
            <CheckIcon 
              class="h-4 w-4" 
              :class="selected ? 'text-blue-600 visible' : 'invisible'"
            />
          </span>
          <span class="block truncate" :class="selected ? 'font-semibold' : 'font-normal'">
            Alle Kartiergebiete
          </span>
        </div>
      </ComboboxOption>
      <ComboboxOption
        v-for="kartiergebiet in kartiergebiete"
        :key="kartiergebiet.kartiergebiet_id"
        :value="kartiergebiet"
        v-slot="{ active, selected }"
        class="relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-blue-50"
        :class="[
          active ? 'bg-blue-100' : '',
          selected ? 'bg-blue-50' : ''
        ]"
      >
        <div class="flex items-center">
          <span class="absolute left-3 flex items-center">
            <CheckIcon 
              class="h-4 w-4" 
              :class="selected ? 'text-blue-600 visible' : 'invisible'"
            />
          </span>
          <span class="block truncate" :class="selected ? 'font-semibold' : 'font-normal'">
            {{ kartiergebiet.kartiergebiet_name }}
          </span>
        </div>
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</div>

<!-- Standort Filter (same changes) -->
<div class="w-72 relative">
  <Combobox v-model="selectedStandort">
    <div class="relative">
      <ComboboxInput
        class="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        :displayValue="(item) => item?.sto_ges"
        @change="handleStandortInput"
        placeholder="Standort auswählen..."
      />
      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
      </ComboboxButton>
    </div>
    <ComboboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
      <ComboboxOption
        v-slot="{ active, selected }"
        :key="null"
        :value="null"
        class="relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-blue-50"
        :class="[
          active ? 'bg-blue-100' : '',
          selected ? 'bg-blue-50' : ''
        ]"
      >
        <div class="flex items-center">
          <span class="absolute left-3 flex items-center">
            <CheckIcon 
              class="h-4 w-4" 
              :class="selected ? 'text-blue-600 visible' : 'invisible'"
            />
          </span>
          <span class="block truncate" :class="selected ? 'font-semibold' : 'font-normal'">
            Alle Standorte
          </span>
        </div>
      </ComboboxOption>
      <ComboboxOption
        v-for="standort in standorte"
        :key="standort.sto_ges"
        :value="standort"
        v-slot="{ active, selected }"
        class="relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-blue-50"
        :class="[
          active ? 'bg-blue-100' : '',
          selected ? 'bg-blue-50' : ''
        ]"
      >
        <div class="flex items-center">
          <span class="absolute left-3 flex items-center">
            <CheckIcon 
              class="h-4 w-4" 
              :class="selected ? 'text-blue-600 visible' : 'invisible'"
            />
          </span>
          <span class="block truncate" :class="selected ? 'font-semibold' : 'font-normal'">
            {{ standort.sto_ges }}
          </span>
        </div>
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</div>
      </div>
      
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

<!-- Table -->
<div class="bg-white rounded-lg shadow ">
  <div>
    <table class="w-full divide-y divide-gray-200 text-xs">
      <thead class="bg-gray-50 sticky top-0">
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
              class="px-3 py-2 text-xs whitespace-nowrap cursor-pointer">
            {{ item[column.toLowerCase()] }}
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
import { ref, onMounted, computed } from 'vue'
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
uiStore.setShowMainSidebar()

// Data
const baumarten = ref([])
const kartiergebiete = ref([])
const standorte = ref([])
const selectedKartiergebiet = ref(null)
const selectedStandort = ref(null)
const showEditDialog = ref(false)
const currentEdit = ref({ item: null, column: null })
const newValue = ref('')
const isPdfExporting = ref(false)
const isCsvExporting = ref(false)

const treeColumns = [
  'FICHTE', 'TANNE', 'ELA', 'DOUGLASIE', 'KIEFER', 'BUCHE', 
  'BERGAHORN', 'ESCHE', 'WINTERLINDE', 'SCHWARZERLE', 
  'TRAUBENEICHE', 'STIELEICHE', 'EICHE', 'KIRSCHE'
]

// Fetch data
const fetchData = async () => {
  try {
    const response = await authStore.fetchWithAuth('/api/baumarten/all')
    baumarten.value = response
    kartiergebiete.value = getUniqueKartiergebiete(response)
    standorte.value = getUniqueStandorte(response)
    
    // Debug logging
    console.log('Data loaded:', {
      baumartenCount: baumarten.value.length,
      kartiergebiete: kartiergebiete.value,
      standorte: standorte.value
    })
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

  if (selectedStandort.value) {
    filtered = filtered.filter(item => 
      item.sto_ges === selectedStandort.value.sto_ges
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

const handleStandortInput = (event) => {
  if (!event.target.value) {
    selectedStandort.value = null
  }
}

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
      column_name: currentEdit.value.column.toLowerCase(), // Convert to lowercase here
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
    cell.style.verticalAlign = 'middle'  // Add vertical centering
    cell.style.height = '20px'  // Set a consistent height for all cells
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

// Initialize
onMounted(() => {
  fetchData()
})
</script>