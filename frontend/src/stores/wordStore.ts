import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWordStore = defineStore('word', () => {
  const displayMode = ref<'chinese' | 'english' | 'both'>('both')
  const autoPlay = ref(true)

  function setDisplayMode(mode: 'chinese' | 'english' | 'both') {
    displayMode.value = mode
  }

  return {
    displayMode,
    autoPlay,
    setDisplayMode,
  }
})
