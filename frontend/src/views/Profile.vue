<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <el-avatar
              :size="64"
              :src="profileForm.avatar ? getAvatarUrl(profileForm.avatar) : ''"
              :style="{
                background: profileForm.avatar
                  ? 'transparent'
                  : `linear-gradient(135deg, ${themeStore.themeColor}, ${themeStore.themeColor}88)`,
                fontSize: '24px',
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
                <el-input v-model="profileForm.username" disabled size="large">
                  <template #prefix
                    ><el-icon><User /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" disabled size="large">
                  <template #prefix
                    ><el-icon><Message /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="profileForm.phone" disabled size="large">
                  <template #prefix
                    ><el-icon><Phone /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-form-item label="昵称">
                <el-input
                  v-model="profileForm.nickname"
                  placeholder="设置一个昵称"
                  size="large"
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

          <el-card shadow="never" class="profile-card password-card">
            <template #header>
              <div class="card-header">
                <div class="card-title">
                  <el-icon :size="16"><Lock /></el-icon>
                  <span>修改密码</span>
                </div>
                <el-tag size="small" type="info" effect="plain"
                  >安全设置</el-tag
                >
              </div>
            </template>
            <div class="password-content">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-position="top"
                class="password-form"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                    size="large"
                  >
                    <template #prefix
                      ><el-icon><Key /></el-icon
                    ></template>
                  </el-input>
                </el-form-item>

                <el-form-item
                  label="新密码"
                  prop="newPassword"
                  class="new-password-item"
                >
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码（至少6位）"
                    show-password
                    size="large"
                    @input="checkPasswordStrength"
                  >
                    <template #prefix
                      ><el-icon><Unlock /></el-icon
                    ></template>
                  </el-input>

                  <!-- 密码要求提示 -->
                  <div class="password-requirements">
                    <div
                      class="requirement-item"
                      :class="{ met: passwordForm.newPassword.length >= 6 }"
                    >
                      <el-icon :size="14" class="req-icon">
                        <CircleCheck
                          v-if="passwordForm.newPassword.length >= 6"
                        />
                        <CircleClose v-else />
                      </el-icon>
                      <span>至少6个字符</span>
                      <span
                        class="strength-text-inline"
                        :class="strengthTextClass"
                        v-if="passwordForm.newPassword"
                      >
                        {{ strengthText }}
                      </span>
                    </div>
                  </div>
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                    size="large"
                  >
                    <template #prefix
                      ><el-icon><CircleCheck /></el-icon
                    ></template>
                  </el-input>
                </el-form-item>

                <el-form-item class="password-actions">
                  <el-button
                    type="primary"
                    @click="handleChangePassword"
                    :loading="changingPassword"
                    size="large"
                    class="change-password-btn"
                  >
                    <el-icon><Check /></el-icon>
                    修改密码
                  </el-button>
                  <el-button
                    @click="resetPasswordForm"
                    size="large"
                    class="reset-btn"
                  >
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>

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
              <el-divider style="margin: 8px 0" />
              <div class="theme-row">
                <div class="theme-label">
                  <span class="label">暗黑模式</span>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useThemeStore } from "../stores/theme";
import {
  User,
  Message,
  Phone,
  EditPen,
  Check,
  Coin,
  MagicStick,
  Plus,
  Moon,
  Sunny,
  CircleCheck,
  CircleClose,
  Camera,
  Lock,
  Key,
  Unlock,
} from "@element-plus/icons-vue";
import api from "../utils/api";

const themeStore = useThemeStore();
const router = useRouter();
const saving = ref(false);
const uploadingAvatar = ref(false);
const changingPassword = ref(false);
const passwordFormRef = ref();
const passwordStrength = ref(0);

const profileForm = ref({
  id: 0,
  username: "",
  email: "",
  phone: "",
  nickname: "",
  role: "user",
  storageUsed: 0,
  storageQuota: 0,
  avatar: "",
});

const themeForm = ref({ color: "#6366f1" });

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const passwordRules = {
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
};

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

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    if (profileForm.value.role === "super_admin") {
      const { ElMessageBox } = await import("element-plus");
      try {
        await ElMessageBox.prompt(
          "超级管理员修改密码需要安全验证，请输入答案：一筐什么蛋？",
          "安全验证",
          {
            confirmButtonText: "验证",
            cancelButtonText: "取消",
            inputPlaceholder: "请输入答案",
            inputValidator: (value: string) => {
              if (!value || value.trim() === "") {
                return "请输入答案";
              }
              if (value !== "一筐大卤蛋") {
                return "答案不正确，请重新输入";
              }
              return true;
            },
          },
        );
      } catch (error: any) {
        if (error === "cancel" || error === "close") {
          return;
        }
      }
    }

    changingPassword.value = true;
    try {
      await api.put("/users/change-password", {
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword,
      });
      ElMessage.success("密码修改成功，请重新登录");
      passwordForm.value = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      passwordStrength.value = 0;
      passwordFormRef.value.resetFields();

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || "密码修改失败");
    } finally {
      changingPassword.value = false;
    }
  });
};

const checkPasswordStrength = () => {
  const password = passwordForm.value.newPassword;
  if (!password) {
    passwordStrength.value = 0;
    return;
  }

  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) strength++;

  passwordStrength.value = Math.min(strength, 3);
};

const strengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "弱";
    case 2:
      return "中";
    case 3:
      return "强";
    default:
      return "";
  }
});

const strengthTextClass = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return "weak";
    case 2:
      return "medium";
    case 3:
      return "strong";
    default:
      return "";
  }
});

const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
  passwordStrength.value = 0;
  passwordFormRef.value?.resetFields();
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
  padding: 20px 32px 18px;
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
  gap: 14px;
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
  width: 52px !important;
  height: 52px !important;
  font-size: 20px !important;
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
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.role-badge {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.user-handle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.profile-body {
  padding: 10px 0 0;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px;
  margin-bottom: 10px;
}

.profile-grid .profile-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.profile-left,
.profile-right {
  display: contents;
  width: 100%;
}

.profile-card {
  border: 1px solid var(--border-color) !important;
}

.password-card {
}

.password-content {
  padding: 8px 0;
}

.password-form {
  max-width: 100%;
}

.password-divider {
  margin: 12px 0;
}

.new-password-item {
  margin-bottom: 12px !important;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--bg-color);
  border-radius: 8px;
}

.strength-bars {
  display: flex;
  gap: 6px;
  flex: 1;
}

.strength-bar {
  height: 5px;
  flex: 1;
  background: var(--border-color);
  border-radius: 3px;
  transition: all var(--transition-fast);
}

.strength-bar.active.weak {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.strength-bar.active.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.strength-bar.active.strong {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.strength-text {
  font-size: 13px;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
}

.password-requirements {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.requirement-item.met {
  color: #10b981;
}

.strength-text-inline {
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
}

.strength-text-inline.weak {
  color: #ef4444;
}

.strength-text-inline.medium {
  color: #f59e0b;
}

.strength-text-inline.strong {
  color: #10b981;
}

.req-icon {
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.requirement-item.met .req-icon {
  color: #10b981;
}

.password-actions {
  margin-top: 18px;
  margin-bottom: 0 !important;
}

.change-password-btn {
  border-radius: 10px !important;
  height: 34px;
  padding: 0 24px;
  font-weight: 500;
  font-size: 13px;
}

.reset-btn {
  border-radius: 10px !important;
  height: 34px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 13px;
  margin-left: 10px;
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

.info-form .el-form-item:last-child {
  margin-top: 18px !important;
}

.save-btn {
  border-radius: 10px !important;
  height: 34px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 13px;
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
  gap: 8px;
  padding: 2px 0;
}

.storage-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-size: 20px;
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
  gap: 8px;
}

.storage-card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: var(--bg-color);
  border-radius: 10px;
  transition: all var(--transition-fast);
}

.storage-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 6px;
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
  font-size: 12px;
  color: var(--text-primary);
}

.card-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.theme-section {
  padding: 0 4px;
}

.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
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
  padding: 8px 14px !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-card__body) {
  padding: 10px 14px !important;
}

:deep(.el-form-item__label) {
  font-weight: 500 !important;
  color: var(--text-secondary) !important;
  font-size: 12px !important;
  margin-bottom: 3px !important;
}

:deep(.el-form-item__content) {
  margin-top: 2px !important;
}

:deep(.el-form-item) {
  margin-bottom: 6px !important;
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
}
</style>
