import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const themeColor = ref('#409EFF')
  const darkMode = ref(false)

  function setThemeColor(color: string) {
    themeColor.value = color
  }

  function setDarkMode(isDark: boolean) {
    darkMode.value = isDark
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  return {
    themeColor,
    darkMode,
    setThemeColor,
    setDarkMode,
    toggleDarkMode,
  }
})
