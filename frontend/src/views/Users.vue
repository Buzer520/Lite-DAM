<template>
  <div class="users-page">
    <el-card shadow="never" class="page-header-card">
      <div class="page-header">
        <div class="page-title">
          <h2>用户管理</h2>
          <p class="page-subtitle">管理系统用户、角色和权限</p>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名或邮箱..."
            size="large"
            @input="handleSearch"
            clearable
          >
            <template #prefix
              ><el-icon><Search /></el-icon
            ></template>
          </el-input>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card" v-loading="loading">
      <el-table :data="users" style="width: 100%" class="users-table">
        <el-table-column label="用户" min-width="220">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar v-if="row.avatar" :size="42" :src="row.avatar" />
              <el-avatar
                v-else
                :size="42"
                :style="{
                  background: getAvatarGradient(row.id),
                  fontSize: '16px',
                }"
              >
                {{ row.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ row.username }}</div>
                <div class="user-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120">
          <template #default="{ row }">
            <span v-if="row.nickname">{{ row.nickname }}</span>
            <span v-else class="text-muted">未设置</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getRoleType(row.role)"
              effect="dark"
              size="small"
              class="role-tag"
            >
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <div
              class="status-badge"
              :class="row.isActive ? 'active' : 'inactive'"
            >
              <span class="status-dot"></span>
              {{ row.isActive ? "正常" : "封禁" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="存储使用" width="140">
          <template #default="{ row }">
            <div class="storage-cell">
              <el-progress
                :percentage="getStoragePercent(row)"
                :stroke-width="4"
                :show-text="false"
                :status="getStoragePercent(row) > 90 ? 'exception' : undefined"
              />
              <span class="storage-text">{{
                formatFileSize(row.storageUsed || 0)
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">{{
            formatDate(row.createdAt)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                text
                size="small"
                @click="handleToggleRole(row)"
                v-if="user.role === 'super_admin'"
                class="action-text-btn"
              >
                <el-icon><Refresh /></el-icon>
                <span>{{ row.role === "user" ? "提拔" : "降级" }}</span>
              </el-button>
              <el-button
                text
                size="small"
                :type="row.isActive ? 'warning' : 'success'"
                @click="handleToggleActive(row)"
                v-if="user.role === 'super_admin'"
                class="action-text-btn"
              >
                <el-icon
                  ><component :is="row.isActive ? 'Lock' : 'Unlock'"
                /></el-icon>
                <span>{{ row.isActive ? "封禁" : "解封" }}</span>
              </el-button>
              <el-button
                text
                size="small"
                type="info"
                @click="handleResetPassword(row)"
                v-if="user.role === 'super_admin'"
                class="action-text-btn"
              >
                <el-icon><Key /></el-icon>
                <span>重置密码</span>
              </el-button>
              <el-button
                text
                size="small"
                type="danger"
                @click="handleDelete(row)"
                v-if="user.role === 'super_admin'"
                class="action-text-btn delete-text-btn"
              >
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="fetchUsers"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Lock,
  Unlock,
  Key,
  Delete,
} from "@element-plus/icons-vue";
import api from "../utils/api";

const users = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const user = computed(() => JSON.parse(localStorage.getItem("user") || "{}"));

onMounted(() => {
  fetchUsers();
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response: any = await api.get("/users", {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        search: searchQuery.value,
      },
    });
    users.value = response.users || [];
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

const handleToggleRole = async (row: any) => {
  try {
    const newRole = row.role === "user" ? "admin" : "user";
    const action = newRole === "admin" ? "提拔为管理员" : "降级为普通用户";
    await ElMessageBox.confirm(
      `确定要${action}「${row.username}」吗？`,
      "确认操作",
      { type: "warning" },
    );
    await api.put(`/users/${row.id}/role`, { role: newRole });
    ElMessage.success(`${action}成功`);
    fetchUsers();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("操作失败");
  }
};

const handleToggleActive = async (row: any) => {
  try {
    const action = row.isActive ? "封禁" : "解封";
    await ElMessageBox.confirm(
      `确定要${action}用户「${row.username}」吗？`,
      "确认操作",
      { type: "warning" },
    );
    await api.put(`/users/${row.id}/toggle-active`);
    ElMessage.success(`${action}成功`);
    fetchUsers();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("操作失败");
  }
};

const handleResetPassword = async (row: any) => {
  try {
    const { value: newPassword } = await ElMessageBox.prompt(
      "请输入新密码",
      "重置密码",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputType: "password",
        inputPattern: /.{6,}/,
        inputErrorMessage: "密码长度至少6位",
      },
    );
    await api.post(`/users/${row.id}/reset-password`, { newPassword });
    ElMessage.success("密码重置成功");
  } catch (error) {
    if (error !== "cancel") ElMessage.error("重置密码失败");
  }
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户「${row.username}」吗？此操作不可恢复。`,
      "确认删除",
      { type: "error", confirmButtonText: "删除", cancelButtonText: "取消" },
    );
    await api.delete(`/users/${row.id}`);
    ElMessage.success("删除成功");
    fetchUsers();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("删除失败");
  }
};

const getRoleLabel = (role: string) =>
  ({ user: "普通用户", admin: "管理员", super_admin: "超管" })[role] || "未知";
const getRoleType = (role: string) =>
  ({ user: "info", admin: "warning", super_admin: "danger" })[role] || "";
const getAvatarGradient = (id: number) => {
  const colors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  ];
  return colors[id % colors.length];
};
const getStoragePercent = (row: any) =>
  row.storageQuota
    ? Math.round(((row.storageUsed || 0) / row.storageQuota) * 100)
    : 0;
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
};
const formatDate = (d: string) => new Date(d).toLocaleDateString("zh-CN");
</script>

<style scoped>
.users-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header-card {
  margin-bottom: 20px;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}
.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}
.search-box {
  width: 300px;
}

.table-card {
  border: none !important;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}
.user-email {
  font-size: 12px;
  color: var(--text-secondary);
}

.text-muted {
  color: var(--text-secondary);
  font-size: 13px;
}

.role-tag {
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}
.status-badge.active {
  color: #10b981;
}
.status-badge.inactive {
  color: #ef4444;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-badge.active .status-dot {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}
.status-badge.inactive .status-dot {
  background: #ef4444;
}

.storage-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.storage-text {
  font-size: 11px;
  color: var(--text-secondary);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.action-text-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-text-btn:hover {
  background: var(--bg-color);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.action-text-btn .el-icon {
  font-size: 14px;
}

.action-text-btn.delete-text-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.15);
}

.action-text-btn[type="warning"]:hover {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
  border-color: rgba(245, 158, 11, 0.15);
}

.action-text-btn[type="success"]:hover {
  color: #10b981;
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.15);
}

.action-text-btn[type="info"]:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
  border-color: rgba(99, 102, 241, 0.15);
}

:deep(.users-table .el-table__header-wrapper th) {
  background: var(--bg-color) !important;
}

.dark .table-card {
  background: var(--card-bg) !important;
  border-color: var(--border-color) !important;
}

.dark .action-text-btn {
  color: rgba(255, 255, 255, 0.5);
}

.dark .action-text-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.dark .action-text-btn.delete-text-btn:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}
</style>
