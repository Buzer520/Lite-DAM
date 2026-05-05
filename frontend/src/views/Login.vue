<template>
  <div class="login-container">
    <div class="bg-animation">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
      <div class="bg-circle circle-4"></div>
    </div>
    <transition name="fade" appear>
      <el-card class="login-card" shadow="never">
        <div class="login-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <el-icon :size="28"><Files /></el-icon>
            </div>
            <h1 class="login-title">Lite-DAM</h1>
          </div>
          <p class="login-subtitle">素材资产管理系统</p>
        </div>
        <el-form
          @submit.prevent="handleLogin"
          :model="form"
          label-position="top"
          class="login-form"
        >
          <el-form-item>
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input
                v-model="form.username"
                placeholder="用户名"
                size="large"
                clearable
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                size="large"
                show-password
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>
          <el-form-item class="submit-item">
            <el-button
              type="primary"
              @click="handleLogin"
              size="large"
              :loading="loading"
              class="submit-btn"
            >
              <span v-if="!loading">登 录</span>
            </el-button>
          </el-form-item>
          <div class="links">
            <span>还没有账号？</span>
            <router-link to="/register" class="link-primary"
              >立即注册</router-link
            >
          </div>
        </el-form>
        <div class="login-footer">
          <p>默认超管账户：admin / admin123</p>
        </div>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Files, User, Lock } from "@element-plus/icons-vue";
import api from "../utils/api";

const router = useRouter();
const loading = ref(false);
const form = ref({
  username: "",
  password: "",
});

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning("请填写用户名和密码");
    return;
  }
  loading.value = true;
  try {
    const response: any = await api.post("/auth/login", form.value);
    localStorage.setItem("token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));
    ElMessage.success("登录成功，欢迎回来！");
    router.push("/");
  } catch (error: any) {
    ElMessage.error(
      error.response?.data?.message || "登录失败，请检查账号密码",
    );
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
  position: relative;
  overflow: hidden;
}

.bg-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  bottom: -50px;
  left: -50px;
  animation-delay: -5s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #10b981, #34d399);
  top: 50%;
  left: 20%;
  animation-delay: -10s;
}

.circle-4 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  bottom: 20%;
  right: 20%;
  animation-delay: -15s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(20px, 30px) scale(1.02);
  }
}

.login-card {
  width: 420px;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 20px !important;
  padding: 0;
}

.login-header {
  text-align: center;
  padding: 20px 0 30px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.login-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.login-form {
  padding: 0 32px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  z-index: 1;
  font-size: 18px;
}

.input-wrapper :deep(.el-input__wrapper) {
  padding-left: 44px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.submit-item {
  margin-top: 24px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: 12px !important;
}

.links {
  text-align: center;
  margin-top: 20px;
  color: #64748b;
  font-size: 14px;
}

.link-primary {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
}

.link-primary:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.login-footer {
  text-align: center;
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  margin-top: 10px;
}

.login-footer p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}
</style>
