<template>
    <div class="relative group">
      <button
        :class="buttonClass"
      >
        <slot></slot>
      </button>
      <!-- Tooltip -->
      <div class="absolute right-full mr-2 top-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="bg-gray-900 text-white text-sm px-2 py-1 rounded whitespace-nowrap">
          {{ tooltip }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  defineProps({
    tooltip: {
      type: String,
      required: true
    },
    buttonClass: {
      type: String,
      required: true
    }
  });
  </script>