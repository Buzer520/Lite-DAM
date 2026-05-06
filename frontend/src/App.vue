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

.el-message-box {
  border: none !important;
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
}

.el-message-box__header {
  padding: 24px 24px 0 !important;
  border-bottom: none !important;
}

.el-message-box__title {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--text-primary, #1e293b) !important;
}

.el-message-box__headerbtn {
  top: 20px !important;
  right: 20px !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.el-message-box__headerbtn:hover {
  background: rgba(0, 0, 0, 0.05) !important;
}

.el-message-box__headerbtn .el-message-box__close {
  color: #94a3b8 !important;
  font-size: 18px !important;
}

.el-message-box__content {
  padding: 16px 24px 24px !important;
}

.el-message-box__container {
  gap: 12px !important;
}

.el-message-box__status {
  font-size: 22px !important;
  width: 22px !important;
  height: 22px !important;
}

.el-message-box__message {
  font-size: 15px !important;
  color: var(--text-secondary, #64748b) !important;
  line-height: 1.6 !important;
}

.el-message-box__btns {
  padding: 0 24px 24px !important;
  display: flex !important;
  gap: 12px !important;
  justify-content: flex-end !important;
}

.el-message-box__btns .el-button {
  min-width: 80px !important;
  height: 38px !important;
  border-radius: 10px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  padding: 0 20px !important;
  transition: all 0.2s ease !important;
}

.el-message-box__btns .el-button--default {
  background: var(--bg-color, #f8fafc) !important;
  border: 1px solid var(--border-color, #e2e8f0) !important;
  color: var(--text-primary, #475569) !important;
}

.el-message-box__btns .el-button--default:hover {
  background: var(--card-bg, #ffffff) !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
}

.el-message-box__btns .el-button--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35) !important;
}

.el-message-box__btns .el-button--primary:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45) !important;
  transform: translateY(-1px) !important;
}

.el-message-box__btns .el-button--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35) !important;
}

.el-message-box__btns .el-button--danger:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45) !important;
  transform: translateY(-1px) !important;
}

.el-message-box__btns .el-button--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35) !important;
}

.el-message-box__btns .el-button--warning:hover {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45) !important;
  transform: translateY(-1px) !important;
}

.el-message-box__wrapper {
  animation: msgbox-fade-in 0.2s ease-out !important;
}

@keyframes msgbox-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.el-overlay {
  background-color: rgba(15, 23, 42, 0.4) !important;
  backdrop-filter: blur(4px) !important;
}

.el-message {
  border: none !important;
  border-radius: 12px !important;
  padding: 14px 20px !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  min-width: 280px !important;
}

.el-message__content {
  font-size: 14px !important;
  font-weight: 500 !important;
}

.el-message--success {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5) !important;
  color: #065f46 !important;
}

.el-message--warning {
  background: linear-gradient(135deg, #fffbeb, #fef3c7) !important;
  color: #92400e !important;
}

.el-message--error {
  background: linear-gradient(135deg, #fef2f2, #fee2e2) !important;
  color: #991b1b !important;
}

.el-message--info {
  background: linear-gradient(135deg, #eff6ff, #dbeafe) !important;
  color: #1e40af !important;
}

.dark .el-message-box {
  background: var(--card-bg, #1e293b) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
}

.dark .el-message-box__title {
  color: #f1f5f9 !important;
}

.dark .el-message-box__message {
  color: #94a3b8 !important;
}

.dark .el-message-box__btns .el-button--default {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
}

.dark .el-message-box__btns .el-button--default:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.dark .el-message-box__headerbtn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.dark .el-message-box__headerbtn .el-message-box__close {
  color: #64748b !important;
}

.dark .el-overlay {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.dark .el-message--success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08)) !important;
  color: #6ee7b7 !important;
}

.dark .el-message--warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08)) !important;
  color: #fcd34d !important;
}

.dark .el-message--error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08)) !important;
  color: #fca5a5 !important;
}

.dark .el-message--info {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.08)) !important;
  color: #a5b4fc !important;
}
</style>
