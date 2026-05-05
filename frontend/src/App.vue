<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useThemeStore } from './stores/theme'
import { watch, onMounted } from 'vue'

const themeStore = useThemeStore()

onMounted(() => {
  const savedTheme = localStorage.getItem('themeColor')
  const savedDarkMode = localStorage.getItem('darkMode') === 'true'
  
  if (savedTheme) {
    themeStore.setThemeColor(savedTheme)
  }
  if (savedDarkMode) {
    themeStore.setDarkMode(true)
  }
})

watch(() => themeStore.themeColor, (newColor) => {
  document.documentElement.style.setProperty('--el-color-primary', newColor)
  localStorage.setItem('themeColor', newColor)
})

watch(() => themeStore.darkMode, (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', String(isDark))
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
