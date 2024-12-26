<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Fachschalen</h1>
    <div class="bg-white rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(item.status)">
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()
uiStore.setShowMainSidebar();

const items = ref([
  { id: 1, name: 'Fachschale 1', type: 'Type A', status: 'Active' },
  { id: 2, name: 'Fachschale 2', type: 'Type B', status: 'Inactive' },
  { id: 3, name: 'Fachschale 3', type: 'Type A', status: 'Active' },
])

const getStatusClass = (status) => {
  return status === 'Active' 
    ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
    : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
}
</script>