import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisualizerStore = defineStore('visualizer', () => {
  const isImageDrawerOpen = ref(false)

  const toggleImageDrawer = () =>
    (isImageDrawerOpen.value = !isImageDrawerOpen.value)

  const closeImageDrawer = () => (isImageDrawerOpen.value = false)

  const selectedIndex = ref(0)

  const setSelectedIndex = (index: number) => (selectedIndex.value = index)

  const incrementIndex = (imgsLen: number) => {
    if (selectedIndex.value >= imgsLen) {
      setSelectedIndex(0)
      return
    }

    setSelectedIndex(selectedIndex.value + 1)
  }

  const decrementIndex = (imgsLen: number) => {
    if (selectedIndex.value <= 0) {
      setSelectedIndex(imgsLen)
      return
    }

    setSelectedIndex(selectedIndex.value - 1)
  }

  return {
    isImageDrawerOpen,
    toggleImageDrawer,
    closeImageDrawer,
    selectedIndex,
    setSelectedIndex,
    incrementIndex,
    decrementIndex,
  }
})
