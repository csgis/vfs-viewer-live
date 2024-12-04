<template>
    <div v-if="active">
      <div class="fixed top-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50">
        {{ message }}
      </div>
  
      <div v-if="showSettings" class="fixed left-4 bottom-4 bg-white rounded-lg shadow-lg z-50">
        <div class="p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Druckeinstellungen</h3>
            <button 
              @click="showSettings = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Titel</label>
              <input 
                v-model="title"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kartenausschnitt"
              >
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700">Format</label>
              <select 
                v-model="format"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="a4">A4</option>
                <option value="a3">A3</option>
              </select>
            </div>
  
            <div class="pt-4">
              <button
                @click="generateAndDownloadPDF"
                class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
  import { ref, defineProps } from 'vue';
  import html2pdf from 'html2pdf.js'; // Import html2pdf
  
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
  
  const generateAndDownloadPDF = async (resolution = 72) => {
  const map = props.map;
  const dims = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148],
  };

  const dim = dims[format.value];
  const width = Math.round((dim[0] * resolution) / 25.4);
  const height = Math.round((dim[1] * resolution) / 25.4);
  const size = map.getSize();
  const viewResolution = map.getView().getResolution();

  document.body.style.cursor = 'progress';
  message.value = 'Erstelle PDF...';

  try {
    // Trigger map rendering
    map.setSize([width, height]);
    map.getView().setResolution(viewResolution * size[0] / width);

    console.log("Waiting for rendercomplete...");
    
    // Wait for rendercomplete with a timeout
    const renderComplete = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Render timeout')), 15000); // Timeout after 15 seconds
      map.once('rendercomplete', () => {
        clearTimeout(timeout);
        console.log('Render completed');
        resolve();
      });
    });

    await renderComplete;

    // Create canvas and copy map layers
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapContext = mapCanvas.getContext('2d');

    const layerCanvas = document.querySelectorAll('.ol-layer canvas');
    console.log('Number of layer canvases found:', layerCanvas.length);  // Debugging layer count

    Array.prototype.forEach.call(layerCanvas, (canvas) => {
      if (canvas.width > 0) {
        const opacity = canvas.parentNode.style.opacity || 1;
        mapContext.globalAlpha = Number(opacity);

        const transform = canvas.style.transform;
        const matrix = transform
          .match(/^matrix\(([^()]*)\)$/)[1]
          .split(',')
          .map(Number);

        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
        mapContext.drawImage(canvas, 0, 0);
      }
    });

    // Prepare pdf options
    const opt = {
      filename: `${title.value || 'map'}.pdf`,
      image: { type: 'image/png', quality: 1 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'mm', format: format.value, orientation: 'landscape' }
    };

    // Generate and download PDF
    html2pdf()
      .from(mapCanvas)
      .set(opt)
      .save()
      .then(() => {
        document.body.style.cursor = 'auto'; // Stop the spinner
        message.value = 'PDF wurde erstellt';
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        document.body.style.cursor = 'auto'; // Stop the spinner
        message.value = 'Fehler beim Erstellen der PDF';
      });

  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.style.cursor = 'auto'; // Stop the spinner
    message.value = 'Fehler beim Erstellen der PDF';
  } finally {
    // Restore map state
    map.setSize(size);
    map.getView().setResolution(viewResolution);
    document.body.style.cursor = 'auto';
    message.value = 'Konfigurieren Sie die Druckeinstellungen';
  }
};

  </script>
  
  