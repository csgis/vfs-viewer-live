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
          class="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center contrast:bg-contrast-primary contrast:text-contrast-primary contrast-hover:bg-contrast-hover"
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
        @click="exportXLSX"
        class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center contrast:bg-contrast-primary contrast:text-contrast-primary contrast-hover:bg-contrast-hover"
        :disabled="isXlSExporting"
      >
        <ArrowPathIcon 
          v-if="isXlSExporting" 
          class="h-4 w-4 mr-1 animate-spin" 
          aria-hidden="true" 
        />
        Excel Export
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
              <td class="px-3 py-1 text-xs whitespace-nowrap font-medium">
                {{ item.sto_ges }}
              </td>
              <td class="px-3 py-2 text-xs w-96">
                <div class="break-words">{{ item.sto_name }}</div>
              </td>
              <td v-for="column in treeColumns" :key="column" 
                @click="openEditDialog(item, column)"
                :class="getCellClass(item[column.toLowerCase()], uiStore.accessibilityMode)"
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
import ExcelJS from 'exceljs';


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
const isXlSExporting = ref(false)
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
    console.log("Starting fetchData");
    const endpoint = selectedKartiergebiet.value 
      ? `/api/baumarten/filtered/${selectedKartiergebiet.value.kartiergebiet_id}`
      : '/api/baumarten/base';
      
    console.log("Using endpoint:", endpoint);
    const response = await authStore.fetchWithAuth(endpoint);
    
    baumarten.value = response;
    kartiergebiete.value = getUniqueKartiergebiete(response);
    standorte.value = getUniqueStandorte(response);
    
    console.log("Processed data:", {
      baumarten: baumarten.value.length,
      kartiergebiete: kartiergebiete.value.length,
      standorte: standorte.value.length
    });
  } catch (error) {
    console.error('Error fetching baumarten:', error);
  }
}

// Computed
const filteredData = computed(() => {
  let filtered = baumarten.value;
  
  if (selectedStandorte.value.length > 0) {
    filtered = filtered.filter(item => {
      const matches = selectedStandorte.value.some(s => s.sto_ges === item.sto_ges);
      console.log("Standorte filter:", {
        rowStoGes: item.sto_ges, 
        selectedStoGes: selectedStandorte.value.map(s => s.sto_ges),
        matches
      });
      return matches;
    });
  }
  
  return filtered;
});

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
  // Only include standorte for the selected kartiergebiet, or all if none selected
  const relevantData = selectedKartiergebiet.value 
    ? data.filter(item => item.kartiergebiet_id === selectedKartiergebiet.value.kartiergebiet_id)
    : data;
    
  relevantData.forEach(item => {
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
const getCellClass = (value, mode) => {
  if (!value || value === '-') return 'bg-gray-100';
  
  if (mode === 'highContrast') {
    const highContrast = {
      '1/1': 'bg-white border-1 border-black',
      '1/2': 'bg-white border-1 border-black',
      '2/1': 'bg-gray-300',
      '1/3': 'bg-gray-200',
      '2/2': 'bg-gray-500 text-white',
      '3/1': 'bg-gray-400 text-white',
      '2/3': 'bg-gray-600 text-white',
      '3/2': 'bg-gray-700 text-white',
      '3/3': 'bg-black text-white'
    };
    return highContrast[value] || '';
  }

  // Default color mode
  switch(value) {
    case '1/1':
    case '1/2':
    case '2/1': return 'bg-green hover:bg-green-hover';
    case '1/3':
    case '2/2':
    case '3/1': return 'bg-yellow hover:bg-yellow-hover';
    case '2/3':
    case '3/2': return 'bg-orange hover:bg-orange-hover';
    case '3/3': return 'bg-red text-white hover:bg-red-hover';
    default: return '';
  }
};

// Edit functionality
const openEditDialog = (item, column) => {
  console.log(item, column)
  return false;
  // currentEdit.value = { item, column }
  // newValue.value = item[column.toLowerCase()]
  // showEditDialog.value = true
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
const shortenTreeName = (name) => {
  const shortNames = {
    'FICHTE': 'Fi',
    'TANNE': 'Ta',
    'ELA': 'ELa',
    'DOUGLASIE': 'Do',
    'KIEFER': 'Ki',
    'BUCHE': 'Bu',
    'BERGAHORN': 'BAh',
    'ESCHE': 'Es',
    'WINTERLINDE': 'WLi',
    'SCHWARZERLE': 'SEr',
    'EICHE': 'Ei',
    'kiefer': 'Ki',
    'TRAUBENEICHE': 'TEi',
    'STIELEICHE': 'SEi'
  };
  return shortNames[name] || name;
};

const exportPDF = async () => {
  isPdfExporting.value = true;
  
  try {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('de-DE').replace(/\./g, '-');
    const timeStr = currentDate.toLocaleTimeString('de-DE').replace(/:/g, '-');
    const filename = `baumarten_${authStore.user?.username || 'unknown'}_${dateStr}_${timeStr}.pdf`;

    const tableHTML = `
      <div style="font-family: helvetica">
        <h1 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">Baumarten</h1>
        <div style="font-size: 9px; margin-bottom: 16px;">
          <div>Benutzer: ${authStore.user?.username || 'Unbekannt'}</div>
          <div>Datum: ${currentDate.toLocaleDateString('de-DE')}</div>
        </div>
        <table style="width: 100%; font-size: 8px; border-collapse: collapse; page-break-inside: auto;">
          <thead style="background-color: #f9fafb;">
            <tr>
              <th style="text-align: left; padding: 4px; border: 1px solid #ddd; vertical-align: middle; font-weight: 500;">Standort</th>
              <th style="text-align: left; padding: 4px; border: 1px solid #ddd; font-weight: 500;">Bezeichnung</th>
              ${treeColumns.map(col => 
                `<th style="text-align: left; padding: 4px; border: 1px solid #ddd; font-weight: 500;">${shortenTreeName(col)}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${filteredData.value.map(item => `
              <tr style="page-break-inside: avoid;">
                <td style="padding: 4px; border: 1px solid #ddd;">${item.sto_ges}</td>
                <td style="padding: 4px; border: 1px solid #ddd;">${item.sto_name}</td>
                ${treeColumns.map(col => {
                  const value = item[col.toLowerCase()];
                  const bgColor = getCellBackgroundColor(value);
                  const textColor = value === '3/3' ? '#ffffff' : '#000000';
                  return `<td style="padding: 4px; border: 1px solid #ddd; background-color: ${bgColor}; color: ${textColor};">${value || '-'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin: [10, 5, 10, 5],
      filename: filename,
      html2canvas: { 
        scale: 2,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape',
        compress: true,
        fontSize: 8,
        putOnlyUsedFonts: true
      },
      pagebreak: { 
        mode: 'avoid-all',
        before: '.page-break'
      }
    };

    const element = document.createElement('div');
    element.innerHTML = tableHTML;
    document.body.appendChild(element);

    await html2pdf().set(opt).from(element).save();
    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    isPdfExporting.value = false;
  }
};


const getCellBackgroundColor = (value) => {
  if (!value || value === '-') return '#f3f4f6';
  
  switch(value) {
    case '1/1':
    case '1/2':
    case '2/1':
      return '#56FF02'; // green

    case '1/3':
    case '2/2':
    case '3/1':
      return 'yellow'; // yellow

    case '2/3':
    case '3/2':
      return '#FFAB00'; // orange

    case '3/3':
      return '#AB2A15'; // red

    default:
      return '#ffffff';
  }
};


const exportXLSX = async () => {
  isXlSExporting.value = true;
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Baumarten');
    
    // Headers
    worksheet.columns = [
      { header: 'Standort', width: 15 },
      { header: 'Bezeichnung', width: 40 },
      ...treeColumns.map(() => ({ width: 8 }))
    ];

    // Add data
    filteredData.value.forEach(item => {
      const row = worksheet.addRow([
        item.sto_ges,
        item.sto_name,
        ...treeColumns.map(col => item[col.toLowerCase()] || '-')
      ]);

      // Apply cell styles
      row.eachCell((cell, colNumber) => {
        if (colNumber > 2) {
          const value = cell.value;
          if (!value || value === '-') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF3F4F6' }
            };
          } else {
            switch(value) {
              case '1/1':
              case '1/2':
              case '2/1':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FF56FF02' }
                };
                break;
              case '1/3':
              case '2/2':
              case '3/1':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFFF00' }
                };
                break;
              case '2/3':
              case '3/2':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFFAB00' }
                };
                break;
              case '3/3':
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFAB2A15' }
                };
                cell.font = {
                  color: { argb: 'FFFFFFFF' }
                };
                break;
            }
          }
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('de-DE').replace(/\./g, '-');
    const timeStr = currentDate.toLocaleTimeString('de-DE').replace(/:/g, '-');
    const filename = `baumarten_${authStore.user?.username || 'unknown'}_${dateStr}_${timeStr}.xlsx`;

    // Write to buffer and create blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (error) {
    console.error('Error generating XLSX:', error);
  } finally {
    isXlSExporting.value = false;
  }
};

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

watch(selectedKartiergebiet, (newValue) => {
  if (newValue !== null) {
    resetSelections('kartiergebiet');
  }
  fetchData();
}, { deep: true });




// Lifecycle hooks
onMounted(() => {
  console.log("table Component mounted");
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