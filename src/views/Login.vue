<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo-placeholder">族</div>
      <h2>家谱管理系统</h2>
    </div>
    
    <van-form @submit="onLogin" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
        />
      </van-cell-group>
      
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
      
      <div class="login-actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>
    
    <div class="login-footer">
      <p>测试账号：13800000001 / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    window.location.href = '/m/'
  }
})

async function onLogin() {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!phone.value || !password.value) {
    errorMsg.value = '请输入手机号和密码'
    return
  }
  
  loading.value = true
  
  try {
    const response = await api.post('/auth/login', {
      phone: phone.value,
      password: password.value
    })
    
    const data = response.data
    
    if (data && data.access_token) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      successMsg.value = '登录成功'
      loading.value = false
      
      // 直接跳转首页，使用window.location确保跳转
      window.location.href = '/m/'
    } else {
      errorMsg.value = '登录失败：服务器响应异常'
      loading.value = false
    }
  } catch (e) {
    console.error('Login error:', e)
    if (e.response && e.response.data && e.response.data.detail) {
      errorMsg.value = e.response.data.detail
    } else {
      errorMsg.value = '登录失败，请检查网络'
    }
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-header {
  text-align: center;
  margin-bottom: 40px;
}
.login-header h2 {
  color: white;
  margin-top: 16px;
  font-weight: 500;
}
.logo-placeholder {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #667eea;
  font-weight: bold;
  margin: 0 auto;
}
.login-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
}
.error-msg {
  color: #ee0a24;
  font-size: 14px;
  padding: 12px 16px;
  text-align: center;
}
.success-msg {
  color: #07c160;
  font-size: 14px;
  padding: 12px 16px;
  text-align: center;
}
.login-actions {
  margin-top: 24px;
  padding: 0 16px;
}
.login-footer {
  text-align: center;
  margin-top: 24px;
  color: rgba(255,255,255,0.8);
  font-size: 12px;
}
</style>