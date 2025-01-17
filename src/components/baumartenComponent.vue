const ComboboxStyles = {
  options: {
    position: 'fixed',
    zIndex: 100,
    backgroundColor: 'white',
    width: '288px', // Same as w-72
    maxHeight: '15rem',
    overflow: 'auto',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }
};

export default function BaumartenTable() {
  // ... existing imports ...

  // Add state for selected standorte (now an array)
  const selectedStandorte = ref([])
  // Add state to track which combobox is open
  const activeCombobox = ref(null)

  // Modified standort filter function
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

  // Add handlers for combobox state
  const handleComboboxOpen = (name) => {
    activeCombobox.value = name
  }

  const handleComboboxClose = () => {
    activeCombobox.value = null
  }

  // Modified template for comboboxes:
  <div class="flex space-x-4 w-2/3">
    <!-- Kartiergebiet Filter -->
    <div class="w-72 relative">
      <Combobox 
        v-model="selectedKartiergebiet"
        @open="handleComboboxOpen('kartiergebiet')"
        @close="handleComboboxClose"
      >
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
        <Teleport to="body">
          <ComboboxOptions 
            v-if="activeCombobox === 'kartiergebiet'"
            :style="{ ...ComboboxStyles.options, top: '120px' }"
          >
            <!-- Existing kartiergebiet options -->
          </ComboboxOptions>
        </Teleport>
      </Combobox>
    </div>

    <!-- Standort Filter (now with multiple selection) -->
    <div class="w-72 relative">
      <Combobox 
        v-model="selectedStandorte"
        multiple
        @open="handleComboboxOpen('standort')"
        @close="handleComboboxClose"
      >
        <div class="relative">
          <ComboboxInput
            class="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :displayValue="(items) => items.map(i => i.sto_ges).join(', ')"
            @change="handleStandortInput"
            placeholder="Standorte auswählen..."
          />
          <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>
        </div>
        <Teleport to="body">
          <ComboboxOptions 
            v-if="activeCombobox === 'standort'"
            :style="{ ...ComboboxStyles.options, top: '120px' }"
          >
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
        </Teleport>
      </Combobox>
    </div>
  </div>

  // Updated input handlers
  const handleStandortInput = (event) => {
    if (!event.target.value) {
      selectedStandorte.value = []
    }
  }

  // Add cleanup on unmount
  onUnmounted(() => {
    handleComboboxClose()
  })

  // Style updates
  <style>
  thead {
    transition: box-shadow 0.2s ease;
    z-index: 20;
  }

  thead.is-sticky {
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1), 0 1px 0 rgb(0 0 0 / 0.1);
  }

  .combobox-options {
    position: fixed;
    z-index: 100;
  }
  </style>