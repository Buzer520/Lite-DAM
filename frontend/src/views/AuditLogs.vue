<template>
  <div class="audit-page">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div class="page-title">
          <h2>审计日志</h2>
          <p class="page-subtitle">查看系统操作记录和安全审计信息</p>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="timeline-card" v-loading="loading">
      <el-timeline>
        <el-timeline-item
          v-for="log in logs"
          :key="log.id"
          :type="getActionType(log.action)"
          :icon="getActionIcon(log.action)"
          size="large"
          class="timeline-item"
        >
          <div class="log-content">
            <div class="log-header">
              <span class="log-action">{{ getActionLabel(log.action) }}</span>
              <el-tag size="small" effect="plain">{{ log.targetType || '系统' }}</el-tag>
            </div>
            <div class="log-details">
              <div class="log-user">
                <el-avatar :size="24" :style="{ background: getAvatarGradient(log.userId), fontSize: '11px' }">
                  {{ log.user?.username?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <span>{{ log.user?.username || log.user?.nickname || '未知用户' }}</span>
              </div>
              <span class="log-detail-text">{{ log.details }}</span>
            </div>
            <div class="log-footer">
              <span class="log-time">{{ formatDateTime(log.timestamp) }}</span>
              <span class="log-ip" v-if="log.ipAddress">IP: {{ log.ipAddress }}</span>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" layout="total, prev, pager, next, jumper" @current-change="fetchLogs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Edit, Delete, Document } from '@element-plus/icons-vue'
import api from '../utils/api'

const logs = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

onMounted(() => { fetchLogs() })

const fetchLogs = async () => {
  loading.value = true
  try {
    const response: any = await api.get('/audit', { params: { page: currentPage.value, limit: pageSize.value } })
    logs.value = response.logs || []
    total.value = response.total || 0
  } catch (error) {
    ElMessage.error('获取审计日志失败')
  } finally {
    loading.value = false
  }
}

const getActionLabel = (action: string) => ({ UPLOAD: '上传', UPDATE: '更新', DELETE: '删除', LOGIN: '登录', REGISTER: '注册' }[action] || action)
const getActionType = (action: string) => ({ UPLOAD: 'success', UPDATE: 'warning', DELETE: 'danger', LOGIN: 'info', REGISTER: 'success' }[action] || 'info')
const getActionIcon = (action: string) => {
  const icons: Record<string, any> = { UPLOAD: Upload, UPDATE: Edit, DELETE: Delete, LOGIN: Document, REGISTER: Document }
  return icons[action] || Document
}
const getAvatarGradient = (id: number) => {
  const colors = ['linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)', 'linear-gradient(135deg, #4facfe, #00f2fe)']
  return colors[(id || 0) % colors.length]
}
const formatDateTime = (d: string) => new Date(d).toLocaleString('zh-CN')
</script>

<style scoped>
.audit-page { 
  max-width: 1000px; 
  margin: 0 auto; 
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.page-header-card { 
  margin-bottom: 20px; 
  border: none !important; 
  background: transparent !important; 
  box-shadow: none !important; 
  flex-shrink: 0;
}
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-title h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary); }
.page-subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-secondary); }

.timeline-card { 
  border: none !important; 
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 220px);
}

.timeline-card :deep(.el-card__body) {
  padding: 20px 0;
}

.timeline-item { padding-bottom: 24px; }

.log-content {
  background: var(--bg-color);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.log-content:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.log-action {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-primary);
}

.log-details {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.log-detail-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.log-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.log-time { display: flex; align-items: center; gap: 4px; }
.log-ip { opacity: 0.7; }

.pagination-wrapper { 
  display: flex; 
  justify-content: flex-end; 
  padding: 20px 0; 
  flex-shrink: 0;
}

:deep(.el-timeline-item__tail) { border-left: 2px dashed var(--border-color) !important; }
:deep(.el-timeline-item__node) { width: 14px !important; height: 14px !important; }
</style>
