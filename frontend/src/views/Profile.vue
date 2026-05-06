<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar
              :size="80"
              :src="profileForm.avatar ? getAvatarUrl(profileForm.avatar) : ''"
              :style="{
                background: profileForm.avatar
                  ? 'transparent'
                  : `linear-gradient(135deg, ${themeStore.themeColor}, ${themeStore.themeColor}88)`,
                fontSize: '28px',
                border: '3px solid rgba(255,255,255,0.8)',
              }"
            >
              {{ profileForm.username?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <el-upload
              class="avatar-uploader"
              name="avatar"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
              :before-upload="beforeAvatarUpload"
              accept="image/jpeg,image/png,image/gif,image/webp"
            >
              <div class="avatar-edit-overlay">
                <el-icon><Camera /></el-icon>
              </div>
            </el-upload>
          </div>
        </div>
        <div class="user-header-info">
          <div class="display-name-row">
            <h2 class="display-name">
              {{ profileForm.nickname || profileForm.username }}
            </h2>
            <el-tag
              :type="getRoleType(profileForm.role)"
              effect="dark"
              size="small"
              class="role-badge"
              >{{ getRoleLabel(profileForm.role) }}</el-tag
            >
          </div>
          <p class="user-handle">@{{ profileForm.username }}</p>
        </div>
      </div>
    </div>

    <div class="profile-body">
      <div class="profile-grid">
        <!-- Left column -->
        <div class="profile-left">
          <el-card shadow="never" class="profile-card">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <el-icon :size="16"><User /></el-icon>
                  <span>基本信息</span>
                </div>
              </div>
            </template>
            <el-form
              :model="profileForm"
              label-position="top"
              class="info-form"
            >
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled>
                  <template #prefix
                    ><el-icon><User /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" disabled>
                  <template #prefix
                    ><el-icon><Message /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-form-item label="昵称">
                <el-input
                  v-model="profileForm.nickname"
                  placeholder="设置一个昵称"
                >
                  <template #prefix
                    ><el-icon><EditPen /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="updateProfile"
                  :loading="saving"
                  class="save-btn"
                >
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- Right column -->
        <div class="profile-right">
          <el-card shadow="never" class="profile-card">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <el-icon :size="16"><Coin /></el-icon>
                  <span>存储使用</span>
                </div>
              </div>
            </template>
            <div class="storage-content">
              <div class="storage-summary">
                <div class="summary-info">
                  <span class="summary-label">存储使用</span>
                  <span class="summary-percent">{{ storagePercentage }}%</span>
                </div>
                <div class="summary-bar">
                  <div
                    class="bar-fill"
                    :style="{ width: storagePercentage + '%' }"
                    :class="{
                      warning: storagePercentage > 80,
                      danger: storagePercentage > 90,
                    }"
                  ></div>
                </div>
              </div>
              <div class="storage-grid">
                <div class="storage-card-item used">
                  <div class="card-icon">
                    <el-icon><HardDrive /></el-icon>
                  </div>
                  <div class="card-content">
                    <span class="card-value">{{
                      formatFileSize(profileForm.storageUsed || 0)
                    }}</span>
                    <span class="card-label">已用空间</span>
                  </div>
                </div>
                <div class="storage-card-item total">
                  <div class="card-icon">
                    <el-icon><Database /></el-icon>
                  </div>
                  <div class="card-content">
                    <span class="card-value">{{
                      formatFileSize(profileForm.storageQuota || 0)
                    }}</span>
                    <span class="card-label">总配额</span>
                  </div>
                </div>
                <div class="storage-card-item remaining">
                  <div class="card-icon">
                    <el-icon><TrendingUp /></el-icon>
                  </div>
                  <div class="card-content">
                    <span class="card-value">{{
                      formatFileSize(
                        (profileForm.storageQuota || 0) -
                          (profileForm.storageUsed || 0),
                      )
                    }}</span>
                    <span class="card-label">剩余空间</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <el-card shadow="never" class="profile-card theme-card">
        <template #header>
          <div class="card-header">
            <div class="card-title">
              <el-icon :size="16"><MagicStick /></el-icon>
              <span>个性化设置</span>
            </div>
          </div>
        </template>
        <div class="theme-section">
          <div class="theme-row">
            <div class="theme-label">
              <span class="label">主题颜色</span>
              <p class="description">选择你喜欢的系统主色调</p>
            </div>
            <div class="theme-colors">
              <div
                v-for="color in presetColors"
                :key="color"
                class="color-dot"
                :style="{
                  background: color,
                  boxShadow:
                    themeForm.color === color
                      ? `0 0 0 3px ${color}44, 0 0 10px ${color}33`
                      : 'none',
                }"
                @click="handleColorChange(color)"
              >
                <el-icon
                  v-if="themeForm.color === color"
                  :size="14"
                  color="white"
                  ><Check
                /></el-icon>
              </div>
              <el-tooltip content="自定义颜色" placement="top">
                <el-color-picker
                  v-model="themeForm.color"
                  @change="handleColorChange"
                  size="default"
                  show-alpha
                  class="custom-picker"
                >
                  <template #default="{ color }">
                    <div
                      class="color-dot custom-dot"
                      :style="{ background: color?.value || '#fff' }"
                    >
                      <el-icon :size="12"><Plus /></el-icon>
                    </div>
                  </template>
                </el-color-picker>
              </el-tooltip>
            </div>
          </div>
          <el-divider />
          <div class="theme-row">
            <div class="theme-label">
              <span class="label">暗黑模式</span>
              <p class="description">切换深色主题保护眼睛</p>
            </div>
            <el-switch v-model="themeStore.darkMode" size="large">
              <template #active-action
                ><el-icon :size="14"><Moon /></el-icon
              ></template>
              <template #inactive-action
                ><el-icon :size="14"><Sunny /></el-icon
              ></template>
            </el-switch>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useThemeStore } from "../stores/theme";
import {
  User,
  Message,
  EditPen,
  Check,
  Coin,
  MagicStick,
  Plus,
  Moon,
  Sunny,
  Files,
  Collection,
  CircleCheck,
  Camera,
} from "@element-plus/icons-vue";
import api from "../utils/api";

const themeStore = useThemeStore();
const saving = ref(false);
const uploadingAvatar = ref(false);

const profileForm = ref({
  id: 0,
  username: "",
  email: "",
  nickname: "",
  role: "user",
  storageUsed: 0,
  storageQuota: 0,
  avatar: "",
});

const themeForm = ref({ color: "#6366f1" });

const uploadUrl = computed(() => "/api/users/avatar");
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
}));

const getAvatarUrl = (avatarPath: string) => {
  if (!avatarPath) return "";
  return avatarPath.startsWith("http") ? avatarPath : avatarPath;
};

const presetColors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
];

const storagePercentage = computed(() => {
  if (!profileForm.value.storageQuota) return 0;
  const percent =
    ((profileForm.value.storageUsed || 0) / profileForm.value.storageQuota) *
    100;
  if (percent > 0 && percent < 0.01) {
    return 0.01;
  }
  return Math.min(parseFloat(percent.toFixed(2)), 100);
});

const storageColors = computed(() => [
  { color: "#10b981", percentage: 60 },
  { color: "#f59e0b", percentage: 80 },
  { color: "#ef4444", percentage: 100 },
]);

onMounted(async () => {
  try {
    const response: any = await api.get("/users/profile");
    profileForm.value = response;
    if (response.themeColor) themeForm.value.color = response.themeColor;
    else themeForm.value.color = themeStore.themeColor || "#6366f1";
  } catch (error) {
    ElMessage.error("获取个人信息失败");
  }
});

const updateProfile = async () => {
  saving.value = true;
  try {
    await api.put("/users/profile", { nickname: profileForm.value.nickname });
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    userData.nickname = profileForm.value.nickname;
    localStorage.setItem("user", JSON.stringify(userData));
    window.dispatchEvent(
      new CustomEvent("user-updated", {
        detail: userData,
      }),
    );
    ElMessage.success("保存成功");
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || "更新失败");
  } finally {
    saving.value = false;
  }
};

const handleColorChange = async (color: string) => {
  themeForm.value.color = color;
  themeStore.setThemeColor(color);
  try {
    await api.put("/users/profile", { themeColor: color });
  } catch (error) {
    console.error("Failed to save theme color");
  }
};

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB!");
    return false;
  }
  uploadingAvatar.value = true;
  return true;
};

const handleAvatarSuccess = (response: any) => {
  uploadingAvatar.value = false;
  if (response && response.avatar) {
    profileForm.value.avatar = response.avatar;
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    userData.avatar = response.avatar;
    localStorage.setItem("user", JSON.stringify(userData));
    window.dispatchEvent(
      new CustomEvent("user-updated", {
        detail: userData,
      }),
    );
    ElMessage.success("头像上传成功");
  }
};

const handleAvatarError = (error: any) => {
  uploadingAvatar.value = false;
  ElMessage.error(error?.message || "头像上传失败");
};

const getRoleLabel = (role: string) =>
  ({ user: "普通用户", admin: "管理员", super_admin: "超级管理员" })[role] ||
  "未知";
const getRoleType = (role: string) =>
  ({ user: "info", admin: "warning", super_admin: "danger" })[role] || "";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
};
</script>

<style scoped>
.profile-page {
  width: 100%;
}

.profile-header {
  position: relative;
  padding: 32px 40px 28px;
  overflow: hidden;
  border-radius: 12px;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-dark) 50%,
    #7c3aed 100%
  );
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-wrapper :deep(.el-avatar) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.avatar-uploader {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.avatar-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--transition-fast);
  color: white;
  font-size: 24px;
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.user-header-info {
  flex: 1;
}

.display-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.display-name {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: white;
}

.role-badge {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.user-handle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
}

.profile-body {
  padding: 24px 0 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.profile-grid .profile-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.profile-left,
.profile-right {
  width: 100%;
}

.profile-card {
  border: 1px solid var(--border-color) !important;
}

.theme-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}

.info-form {
  max-width: 100%;
}

.save-btn {
  border-radius: 10px !important;
  height: 42px;
  padding: 0 28px;
  font-weight: 500;
}

.storage-section {
  display: flex;
  align-items: flex-end;
  gap: 32px;
  padding: 16px 0 12px;
}

.storage-visual {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 120px;
}

.storage-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.storage-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

.storage-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.summary-percent {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-dark)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.summary-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
  border-radius: 4px;
  transition: width var(--transition-normal);
}

.bar-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.bar-fill.danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.storage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.storage-card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: var(--bg-color);
  border-radius: 12px;
  transition: all var(--transition-fast);
}

.storage-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
}

.storage-card-item.used .card-icon {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.25),
    rgba(99, 102, 241, 0.1)
  );
  color: #4f46e5;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.storage-card-item.total .card-icon {
  background: linear-gradient(
    135deg,
    rgba(55, 65, 81, 0.25),
    rgba(55, 65, 81, 0.1)
  );
  color: #374151;
  box-shadow: 0 4px 12px rgba(55, 65, 81, 0.3);
}

.storage-card-item.remaining .card-icon {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.25),
    rgba(16, 185, 129, 0.1)
  );
  color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.card-value {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-primary);
}

.card-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.theme-section {
  padding: 0 10px;
}

.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.theme-label .label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.theme-label .description {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.theme-colors {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-dot:hover {
  transform: scale(1.12);
}

.custom-dot {
  border: 2px dashed rgba(255, 255, 255, 0.5);
}

:deep(.custom-picker .el-color-picker__trigger) {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
}

:deep(.el-card__header) {
  padding: 16px 20px !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-card__body) {
  padding: 20px !important;
}

:deep(.el-form-item__label) {
  font-weight: 500 !important;
  color: var(--text-secondary) !important;
  font-size: 13px !important;
}

:deep(.el-form-item__content) {
  margin-top: 6px !important;
}

.storage-visual :deep(.el-progress__text) {
  display: none !important;
}

:deep(.el-progress-dashboard) {
  width: 100px !important;
  height: 100px !important;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .storage-section {
    flex-direction: column;
    gap: 24px;
  }
}

.dark .profile-card {
  background: var(--card-bg) !important;
  border-color: var(--border-color) !important;
}

.dark .storage-card-item {
  background: #0b1120 !important;
}

.dark .storage-card-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.dark .storage-card-item.used .card-icon {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.3),
    rgba(99, 102, 241, 0.15)
  ) !important;
  color: #818cf8 !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2) !important;
}

.dark .storage-card-item.total .card-icon {
  background: linear-gradient(
    135deg,
    rgba(148, 163, 184, 0.25),
    rgba(148, 163, 184, 0.1)
  ) !important;
  color: #cbd5e1 !important;
  box-shadow: 0 4px 12px rgba(148, 163, 184, 0.15) !important;
}

.dark .storage-card-item.remaining .card-icon {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.3),
    rgba(16, 185, 129, 0.15)
  ) !important;
  color: #34d399 !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2) !important;
}

.dark :deep(.el-input__wrapper) {
  background-color: #0b1120 !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}

.dark :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-light) inset !important;
}

.dark :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--primary-color) inset !important;
}

.dark :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #0b1120 !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}

.dark :deep(.el-form-item__label) {
  color: var(--text-secondary) !important;
}

.dark .summary-bar {
  background: #0b1120 !important;
}

.dark .color-dot {
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.dark .custom-dot {
  border: 2px dashed rgba(255, 255, 255, 0.3);
}

.dark :deep(.el-card) {
  background: var(--card-bg) !important;
  border-color: var(--border-color) !important;
}

.dark :deep(.el-card__header) {
  background: var(--card-bg) !important;
  border-bottom-color: var(--border-color) !important;
}

.dark :deep(.el-card__body) {
  background: var(--card-bg) !important;
}

.dark :deep(.el-input__wrapper) {
  background-color: #0b1120 !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}

.dark :deep(.el-input__inner) {
  color: var(--text-primary) !important;
}

.dark :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #0b1120 !important;
  box-shadow: 0 0 0 1px var(--border-color) inset !important;
}

.dark :deep(.el-input.is-disabled .el-input__inner) {
  color: var(--text-secondary) !important;
  -webkit-text-fill-color: var(--text-secondary) !important;
}

.dark :deep(.el-form-item__label) {
  color: var(--text-secondary) !important;
}

.dark :deep(.el-button--primary) {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-dark)
  ) !important;
  border: none !important;
  color: #ffffff !important;
}

.dark :deep(.el-button--primary:hover) {
  background: linear-gradient(
    135deg,
    var(--primary-light),
    var(--primary-color)
  ) !important;
}

.dark :deep(.el-divider) {
  background-color: var(--border-color) !important;
}

.dark :deep(.el-switch) {
  --el-switch-off-color: #334155;
}

.dark :deep(.el-color-picker__trigger) {
  border-color: var(--border-color) !important;
}

.dark .summary-bar {
  background: #0b1120 !important;
}

.dark .color-dot {
  border: 2px solid rgba(255, 255, 255, 0.1);
}
.dark .avatar-edit-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.dark .avatar-wrapper :deep(.el-avatar) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
</style>
