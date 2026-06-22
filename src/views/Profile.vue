<template>
  <div class="profile">
    <van-nav-bar title="我的" />
    
    <!-- 已登录 -->
    <template v-if="isLoggedIn">
      <van-cell-group inset style="margin: 12px">
        <van-cell center>
          <template #icon>
            <van-image round width="60" height="60" style="background: #e8f3ff; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px; color: #1989fa">{{ roleIcon }}</span>
            </van-image>
          </template>
          <template #title>
            <div class="user-name">{{ user.nickname || '未设置' }}</div>
          </template>
          <template #label>
            <div class="user-id">{{ user.phone }} · {{ roleText }}</div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset style="margin: 12px" title="个人信息">
        <van-cell title="信息卡片" icon="idcard" is-link to="/infocard" />
      </van-cell-group>
      
      <van-cell-group inset style="margin: 12px" title="家谱投稿">
        <van-cell title="我的投稿" icon="edit" is-link to="/my-submissions" />
      </van-cell-group>
      
      <van-cell-group inset style="margin: 12px" title="功能">
        <van-cell title="我的家族" icon="cluster" is-link to="/" />
        <van-cell title="我的图书" icon="bookmark-o" is-link to="/books" />
        <van-cell title="组委会" icon="friends-o" is-link to="/committee" v-if="showCommittee" />
      </van-cell-group>
      
      <van-cell-group inset style="margin: 12px" title="设置">
        <van-cell title="退出登录" icon="sign-out" @click="onLogout" is-link />
      </van-cell-group>
    </template>
    
    <!-- 未登录 -->
    <div v-else class="login-prompt">
      <van-empty description="请先登录">
        <van-button type="primary" @click="goLogin">去登录</van-button>
      </van-empty>
    </div>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api'

const router = useRouter()
const activeTabbar = ref(3)
const user = ref({})

const isLoggedIn = computed(() => !!user.value.phone)
const roleIcon = computed(() => user.value.role === 'admin' ? '管' : user.value.role === 'committee' ? '组' : '成')
const roleText = computed(() => ({ admin: '管理员', committee: '组委会', member: '成员' }[user.value.role] || '成员'))
const showCommittee = computed(() => user.value.role === 'admin' || user.value.role === 'committee')

function goLogin() {
  router.push('/login')
}

function onLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = {}
  router.push('/login')
}

onMounted(() => {
  const stored = localStorage.getItem('user')
  console.log('Profile mounted, stored user:', stored)
  
  if (stored) {
    try {
      user.value = JSON.parse(stored)
      console.log('User loaded:', user.value)
    } catch (e) {
      console.error('Parse user error:', e)
      router.push('/login')
    }
  } else {
    console.log('No user data, redirect to login')
    router.push('/login')
  }
})
</script>

<style scoped>
.profile { padding-bottom: 50px; }
.user-name { font-size: 18px; font-weight: 600; }
.user-id { font-size: 12px; color: #999; }
.login-prompt { padding: 60px 20px; text-align: center; }
</style>
