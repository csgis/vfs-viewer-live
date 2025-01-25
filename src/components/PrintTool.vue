<template>
    <div v-if="active">
      <div class="fixed top-4 right-4 bg-yellow-200 text-black p-4 rounded-lg shadow-lg z-50 animate-slide-in-top  contrast:bg-contrast-primary contrast:text-contrast-primary">
        {{ message }}
      </div>
  
      <div v-if="showSettings" class="fixed right-4 top-24 bg-white rounded-lg shadow-lg z-50 w-96 animate-slide-in-top  contrast:bg-contrast-accent">
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Druckeinstellungen</h3>
            <button 
              @click="handleClose"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 ">Titel</label>
              <input 
                v-model="title"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kartenausschnitt"
              >
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 ">Format</label>
              <select 
                v-model="format"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="a4">A4</option>
                <option value="a3">A3</option>
              </select>
            </div>

            <div>
              <label class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  v-model="includeLegends"
                  class="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                >
                <span class="text-sm text-gray-700">Legende auf zweiter Seite</span>
              </label>
            </div>
  
            <div class="pt-4">
              <button
                @click="generateAndDownloadPDF"
                class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 contrast:bg-contrast-primary contrast:text-contrast-primary"
              >
                PDF erstellen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import jsPDF from 'jspdf';
import { useLayerStore } from '../stores/layerStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia';

const layerStore = useLayerStore();
const { layers } = storeToRefs(layerStore);

const props = defineProps({
  map: {
    type: Object,
    required: true
  },
  active: Boolean
});

const showSettings = ref(true);
const message = ref('Konfigurieren Sie die Druckeinstellungen');
const title = ref('Kartenausschnitt');
const format = ref('a4');
const includeLegends = ref(true);
const authStore = useAuthStore()

// Get layer management functions and state
const uiStore = useUIStore();

const handleClose = () => {
  showSettings.value = false;
  uiStore.clearActiveControl();
};



const generateAndDownloadPDF = async () => {
 document.body.style.cursor = 'progress';
 message.value = 'Erstelle PDF...';

 try {
   // Store original background layer visibility and z-index
   const backgroundLayers = props.map.getLayers().getArray()
    .filter(layer => layer.get('isBackground'));
    const backgroundLayer = backgroundLayers[0];
   const originalZIndex = backgroundLayer?.getZIndex()
   const originalVisibility = backgroundLayer?.getVisible()

   // Ensure background layer is visible and has proper z-index for capture
   if (backgroundLayer) {
     backgroundLayer.setZIndex(0)  // Make sure background is at bottom
     backgroundLayer.setVisible(true)
   }


   // Add small delay to ensure layers are rendered
   await new Promise(resolve => setTimeout(resolve, 500));

   const mapCanvas = document.querySelector('.ol-layer canvas');
   if (!mapCanvas) {
     throw new Error('Map canvas not found');
   }


   
   // Create PDF
   const pdf = new jsPDF('landscape', 'mm', format.value);
   
   const imgData = mapCanvas.toDataURL('image/png', 1.0);
   const imgProps = pdf.getImageProperties(imgData);
   const pdfWidth = pdf.internal.pageSize.getWidth();
   const pdfHeight = pdf.internal.pageSize.getHeight();

   // Margins and spacing (in mm)
   const sideMargin = 10;
   const bottomMargin = 30; // 3cm bottom margin
   const topMargin = 10;
   const borderWidth = 0.5;

   // Calculate available space for map
   const availableWidth = pdfWidth - (2 * sideMargin);
   const availableHeight = pdfHeight - topMargin - bottomMargin;
   
   // Calculate scale to fit map within margins
   const scale = Math.min(
     availableWidth / imgProps.width,
     availableHeight / imgProps.height
   );

   // Calculate centered position for map
   const mapWidth = imgProps.width * scale;
   const mapHeight = imgProps.height * scale;
   const mapX = sideMargin + (availableWidth - mapWidth) / 2;
   const mapY = topMargin + (availableHeight - mapHeight) / 2;

   // Draw black border rectangle
   pdf.setLineWidth(borderWidth);
   pdf.setDrawColor(0);
   pdf.rect(mapX - 1, mapY - 1, mapWidth + 2, mapHeight + 2);

   // Add map image
   pdf.addImage(
     imgData,
     'PNG',
     mapX,
     mapY,
     mapWidth,
     mapHeight
   );

   // Add title in bottom margin
   pdf.setFontSize(12);
   pdf.setTextColor(0);
   const titleY = pdfHeight - (bottomMargin / 2);
   pdf.text(title.value || 'Kartenausschnitt', sideMargin, titleY);

   // Calculate map scale
   const mapResolution = props.map.getView().getResolution();
   const mapScale = Math.round(mapResolution * 39.37 * 72);
   const scaleText = `1:${mapScale.toLocaleString('de-DE')}`;

   // Format current date
   const currentDate = new Date().toLocaleDateString('de-DE', {
     day: '2-digit',
     month: '2-digit',
     year: 'numeric'
   });

   // Add scale and date to bottom right
   const infoText = `${scaleText} | ${currentDate}`;
   const infoWidth = pdf.getStringUnitWidth(infoText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
   pdf.text(infoText, pdfWidth - sideMargin - infoWidth, titleY);

   // Add legends page if enabled

   if (includeLegends.value) {
    const visibleLayers = Object.entries(layers.value)
    .filter(([, layer]) => layer.visible === true)
    .map(([name]) => ({
      name,
      url: layerStore.getLegendUrl(name), // Use store method
      label: layerStore.getLayerLabel(name)
    }));

  if (visibleLayers.length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Legende', sideMargin, 20);
    
    let currentY = 30;
    const maxHeight = pdfHeight - 20;
    for (const layer of visibleLayers) {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          const loadImage = () => {
            img.onload = resolve;
            img.onerror = reject;
            img.crossOrigin = 'anonymous';
          };

          if (layerStore.layerNeedsBearer(layer.name)) {
            fetch(layer.url, {
              headers: authStore.authHeaders,
              credentials: 'include'
            })
              .then(response => response.blob())
              .then(blob => {
                loadImage();
                img.src = URL.createObjectURL(blob);
              })
              .catch(reject);
          } else {
            loadImage();
            img.src = layer.url;
          }
        });

        pdf.setFontSize(12);
        pdf.text(layer.label, sideMargin, currentY);
        currentY += 8;

        const pxToMm = 25.4 / 96;
        const widthMm = img.width * pxToMm;
        const heightMm = img.height * pxToMm;
        const maxWidthMm = pdfWidth - (2 * sideMargin);

        let finalWidth = widthMm;
        let finalHeight = heightMm;
        if (widthMm > maxWidthMm) {
          const scale = maxWidthMm / widthMm;
          finalWidth = maxWidthMm;
          finalHeight = heightMm * scale;
        }

        if (currentY + finalHeight > maxHeight) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.addImage(img, 'PNG', sideMargin, currentY, finalWidth, finalHeight);
        currentY += finalHeight + 15;
      } catch (error) {
        console.error(`Error processing legend for ${layer.name}:`, error);
      }
    }
  }
}

   // Save PDF and restore background layer state
   pdf.save(`${title.value || 'map'}.pdf`);
   message.value = 'PDF wurde erstellt';

   if (backgroundLayer) {
     backgroundLayer.setZIndex(originalZIndex)
     backgroundLayer.setVisible(originalVisibility)
   }

 } catch (error) {
   console.error('Error generating PDF:', error);
   message.value = 'Fehler beim Erstellen der PDF';
 } finally {
   document.body.style.cursor = 'auto';
   setTimeout(() => {
     message.value = 'Konfigurieren Sie die Druckeinstellungen';
   }, 2000);
 }
};
</script>