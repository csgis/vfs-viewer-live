import { getCenter, getHeight, getWidth } from 'ol/extent'
// useMapHistory.js
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useMapHistory(map) {
  const router = useRouter()
  const route = useRoute()
  const extentHistory = ref([])
  const currentIndex = ref(-1)
  const hasHistory = ref(false)
  let ignoreNextMoveEnd = false

  const isEquivalentExtent = (extent1, extent2) => {
    if (!extent1 || !extent2) return false
    return (
      Math.abs(extent1.center[0] - extent2.center[0]) < 0.000001 &&
      Math.abs(extent1.center[1] - extent2.center[1]) < 0.000001 &&
      Math.abs(extent1.width - extent2.width) < 0.000001 &&
      Math.abs(extent1.height - extent2.height) < 0.000001 &&
      extent1.zoom === extent2.zoom
    )
  }

  console.log('useMapHistory initialized - initial state:', {
    extentHistoryLength: extentHistory.value.length,
    currentIndex: currentIndex.value,
    hasHistory: hasHistory.value
  })

  const updateHistoryState = () => {
    const newHasHistory = currentIndex.value > 0 && extentHistory.value.length > 1
    console.log('updateHistoryState:', {
      currentIndex: currentIndex.value,
      extentHistoryLength: extentHistory.value.length,
      newHasHistory
    })
    hasHistory.value = newHasHistory
  }

  const updateURLFromView = () => {
    if (!map || ignoreNextMoveEnd) {
      ignoreNextMoveEnd = false
      return
    }

    console.log('updateURLFromView called')

    const view = map.getView()
    const extent = view.calculateExtent(map.getSize())
    const center = getCenter(extent)
    const width = getWidth(extent)
    const height = getHeight(extent)
    const zoom = view.getZoom()
    
    const extentState = {
      center: [center[0], center[1]],
      width,
      height,
      zoom
    }

    console.log('Current state:', {
      currentIndex: currentIndex.value,
      historyLength: extentHistory.value.length,
      newState: extentState
    })

    if (currentIndex.value === -1 || 
        !isEquivalentExtent(extentState, extentHistory.value[currentIndex.value])) {
      
      if (currentIndex.value < extentHistory.value.length - 1) {
        extentHistory.value = extentHistory.value.slice(0, currentIndex.value + 1)
      }
      
      extentHistory.value.push(extentState)
      currentIndex.value = extentHistory.value.length - 1
      
      console.log('History updated:', {
        newLength: extentHistory.value.length,
        newIndex: currentIndex.value
      })
      
      updateHistoryState()

      const newQuery = {
        ...route.query,
        extent: `${center[0]},${center[1]},${width},${height}`,
        zoom
      }
      
      router.replace({ query: newQuery }, { replace: true })
    }
  }

  const setupMapListeners = () => {
    if (!map) return
    console.log('Setting up map listeners')
    map.on('moveend', updateURLFromView)
  }
  
  const cleanupMapListeners = () => {
    if (!map) return
    console.log('Cleaning up map listeners')
    map.un('moveend', updateURLFromView)
  }
  
  onMounted(() => {
    console.log('useMapHistory mounted')
    setupMapListeners()
    updateHistoryState()
  })
  
  onUnmounted(() => {
    console.log('useMapHistory unmounted')
    cleanupMapListeners()
  })
  
  const goToPreviousExtent = () => {
    console.log('goToPreviousExtent called:', {
      currentIndex: currentIndex.value,
      historyLength: extentHistory.value.length
    })

    if (currentIndex.value <= 0) return
    
    currentIndex.value--
    const previousState = extentHistory.value[currentIndex.value]
    
    if (previousState) {
      console.log('Moving to previous state:', previousState)
      ignoreNextMoveEnd = true
      const view = map.getView()
      view.setCenter(previousState.center)
      view.setZoom(previousState.zoom)
      updateHistoryState()
    }
  }
  
  const updateMapFromURL = () => {
    if (!map || !route.query.extent) return
    
    console.log('updateMapFromURL called with query:', route.query)
    
    const [centerX, centerY, width, height] = route.query.extent.split(',').map(Number)
    const zoom = Number(route.query.zoom)
    
    if (!isNaN(centerX) && !isNaN(centerY) && !isNaN(width) && !isNaN(height) && !isNaN(zoom)) {
      ignoreNextMoveEnd = true
      const view = map.getView()
      view.setCenter([centerX, centerY])
      view.setZoom(zoom)
      
      if (extentHistory.value.length === 0) {
        const initialState = {
          center: [centerX, centerY],
          width,
          height,
          zoom
        }
        extentHistory.value.push(initialState)
        currentIndex.value = 0
        updateHistoryState()
      }
    }
  }
  
  // Watch for map changes
  watch(() => map, (newMap) => {
    console.log('Map changed:', newMap ? 'New map instance' : 'No map')
    if (newMap) {
      setupMapListeners()
      updateHistoryState()
    } else {
      cleanupMapListeners()
    }
  }, { immediate: true })

  return {
    goToPreviousExtent,
    updateMapFromURL,
    hasHistory
  }
}