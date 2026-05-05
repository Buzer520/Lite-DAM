<template>
  <div class="register-container">
    <div class="bg-animation">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
      <div class="bg-circle circle-4"></div>
    </div>
    <transition name="fade" appear>
      <el-card class="register-card" shadow="never">
        <div class="register-header">
          <router-link to="/login" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回登录</span>
          </router-link>
          <div class="logo-wrapper">
            <div class="logo-icon">
              <el-icon :size="24"><UserFilled /></el-icon>
            </div>
            <h1 class="register-title">创建账号</h1>
          </div>
          <p class="register-subtitle">注册后即可使用素材管理系统</p>
        </div>
        <el-form @submit.prevent="handleRegister" :model="form" label-position="top" class="register-form">
          <el-form-item>
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input v-model="form.username" placeholder="用户名" size="large" clearable />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="input-wrapper">
              <el-icon class="input-icon"><Message /></el-icon>
              <el-input v-model="form.email" type="email" placeholder="邮箱地址" size="large" clearable />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input v-model="form.password" type="password" placeholder="设置密码" size="large" show-password />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" show-password @keyup.enter="handleRegister" />
            </div>
          </el-form-item>
          <el-form-item class="submit-item">
            <el-button type="primary" @click="handleRegister" size="large" :loading="loading" class="submit-btn">
              <span v-if="!loading">注 册</span>
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, User, Message, Lock, ArrowLeft } from '@element-plus/icons-vue'
import api from '../utils/api'

const router = useRouter()
const loading = ref(false)
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleRegister = async () => {
  if (!form.value.username || !form.value.email || !form.value.password) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (form.value.password.length < 6) {
    ElMessage.warning('密码长度至少6位')
    return
  }
  loading.value = true
  try {
    const response: any = await api.post('/auth/register', {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    })
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    ElMessage.success('注册成功，欢迎加入！')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
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
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(20px, 30px) scale(1.02); }
}

.register-card {
  width: 440px;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 20px !important;
  padding: 8px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 20px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #6366f1;
}

.register-header {
  text-align: center;
  padding: 10px 0 24px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.register-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.register-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.register-form {
  padding: 0 10px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
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
}

.submit-item {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: 12px !important;
}
</style>
