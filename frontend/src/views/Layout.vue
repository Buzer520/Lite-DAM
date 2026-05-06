<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <el-icon :size="20"><Files /></el-icon>
          </div>
          <span class="logo-text">Lite-DAM</span>
        </div>
      </div>
      <el-menu :default-active="activeMenu" router class="sidebar-menu">
        <el-menu-item index="/" class="menu-item">
          <el-icon><Files /></el-icon>
          <span>素材管理</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/users" class="menu-item">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item v-if="isSuperAdmin" index="/audit" class="menu-item">
          <el-icon><Document /></el-icon>
          <span>审计日志</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="storage-info">
          <div class="storage-label">
            <el-icon><Coin /></el-icon>
            <span>存储使用</span>
          </div>
          <el-progress
            :percentage="storagePercent"
            :stroke-width="6"
            :status="storagePercent > 90 ? 'exception' : undefined"
          />
          <div class="storage-text">
            {{ formatSize(user.storageUsed || 0) }} /
            {{ formatSize(user.storageQuota || 0) }}
          </div>
        </div>
      </div>
    </el-aside>
    <el-container class="main-wrapper">
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div
            class="icon-btn"
            @click="toggleTheme"
            :title="themeStore.darkMode ? '切换亮色模式' : '切换暗黑模式'"
          >
            <el-icon :size="18"
              ><component :is="themeStore.darkMode ? 'Moon' : 'Sunny'"
            /></el-icon>
          </div>
          <div class="icon-btn" @click="handleNotification" title="通知">
            <el-badge :value="0" :hidden="true">
              <el-icon :size="18"><Bell /></el-icon>
            </el-badge>
          </div>
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-dropdown">
              <el-avatar
                :size="34"
                :style="{
                  background: `linear-gradient(135deg, ${themeStore.themeColor}, ${themeStore.themeColor}88)`,
                }"
              >
                {{ user.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="user-meta">
                <span class="user-name">{{
                  user.nickname || user.username
                }}</span>
                <span class="user-role">{{ getRoleLabel(user.role) }}</span>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useThemeStore } from "../stores/theme";
import api from "../utils/api";
import {
  Files,
  User,
  Document,
  Coin,
  Bell,
  ArrowDown,
  SwitchButton,
  Moon,
  Sunny,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();

const user = ref({
  id: 0,
  username: "",
  role: "user",
  nickname: "",
  storageUsed: 0,
  storageQuota: 0,
});

const activeMenu = computed(() => route.path);
const isAdmin = computed(
  () => user.value.role === "admin" || user.value.role === "super_admin",
);
const isSuperAdmin = computed(() => user.value.role === "super_admin");

const storagePercent = computed(() => {
  if (!user.value.storageQuota) return 0;
  const percent =
    ((user.value.storageUsed || 0) / user.value.storageQuota) * 100;
  if (percent > 0 && percent < 0.01) {
    return 0.01;
  }
  return Math.min(parseFloat(percent.toFixed(2)), 100);
});

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/": "素材管理",
    "/users": "用户管理",
    "/audit": "审计日志",
    "/profile": "个人中心",
  };
  return titles[route.path] || "首页";
});

onMounted(async () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    user.value = JSON.parse(userData);
  }

  try {
    const response: any = await api.get("/users/profile");
    user.value = { ...user.value, ...response };
    localStorage.setItem("user", JSON.stringify(user.value));
  } catch (error) {
    console.error("Failed to fetch user profile");
  }

  const savedTheme = localStorage.getItem("themeColor");
  if (savedTheme) {
    themeStore.setThemeColor(savedTheme);
  }

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("user-updated", handleUserUpdated as EventListener);
});

const handleUserUpdated = (event: Event) => {
  const customEvent = event as CustomEvent;
  user.value = { ...user.value, ...customEvent.detail };
};

const handleStorageChange = (event: StorageEvent) => {
  if (event.key === "user" && event.newValue) {
    user.value = JSON.parse(event.newValue);
  }
};

watch(
  () => themeStore.themeColor,
  (newColor) => {
    document.documentElement.style.setProperty("--primary-color", newColor);
    localStorage.setItem("themeColor", newColor);
  },
);

const toggleTheme = () => {
  themeStore.toggleDarkMode();
};

const handleNotification = () => {
  ElMessage.info("暂无新通知");
};

const handleCommand = async (command: string) => {
  if (command === "logout") {
    await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    ElMessage.success("已退出登录");
    router.push("/login");
  } else if (command === "profile") {
    router.push("/profile");
  }
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    user: "普通用户",
    admin: "管理员",
    super_admin: "超级管理员",
  };
  return labels[role] || "未知";
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background: var(--bg-color);
}

.sidebar {
  background: var(--card-bg);
  border-right: 0.5px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background var(--transition-normal);
}

.sidebar::after {
  content: "";
  position: absolute;
  top: 64px;
  right: -0.5px;
  width: 0.5px;
  height: calc(100% - 64px);
  background: var(--border-color);
}

.sidebar-header {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-dark)
  );
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  font-size: 18px;
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

.sidebar-menu {
  flex: 1;
  padding: 16px 10px;
  border-top: 0.5px solid var(--border-color);
}

.sidebar-menu .menu-item {
  border-radius: 10px !important;
  margin-bottom: 4px;
  height: 44px;
  transition: all var(--transition-fast) !important;
}

.sidebar-menu .menu-item:hover {
  background: var(--primary-light) !important;
  color: white !important;
}

.sidebar-menu .menu-item.is-active {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-dark)
  ) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.storage-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.storage-text {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
  text-align: center;
}

.main-wrapper {
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  transition:
    background var(--transition-normal),
    border-color var(--transition-normal);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
  user-select: none;
}

.icon-btn:hover {
  background: var(--bg-color);
  color: var(--text-primary);
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
  transition: background var(--transition-fast);
  user-select: none;
}

.user-dropdown:hover {
  background: var(--bg-color);
}

.user-meta {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.2;
}

.dropdown-arrow {
  color: var(--text-secondary);
  font-size: 12px;
}

.main-content {
  background: var(--bg-color);
  padding: 24px;
  transition: background var(--transition-normal);
}

:deep(.el-menu) {
  background: transparent !important;
  border-right: none !important;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
}
</style>
