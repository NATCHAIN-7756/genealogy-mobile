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
            <div class="user-name">{{ user.name || user.nickname || '未设置' }}</div>
          </template>
          <template #label>
            <div class="user-id">{{ user.phone }} · {{ roleText }}</div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset style="margin: 12px" title="个人信息">
        <van-cell title="姓名" :value="user.name || '未设置'" icon="user-o" />
        <van-cell title="性别" :value="user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未设置'" />
        <van-cell title="出生日期" :value="user.birth_date || '未设置'" />
        <van-cell title="手机号" :value="user.phone" />
        <van-cell title="更多信息" is-link to="/infocard" value="编辑" />
      </van-cell-group>

      <van-cell-group inset style="margin: 12px" title="家庭信息">
        <van-cell title="查看家庭信息" icon="home-o" is-link @click="goMyFamily" />
      </van-cell-group>

      <van-cell-group inset style="margin: 12px" title="家谱投稿">
        <van-cell title="我的投稿" icon="edit" is-link to="/my-submissions" />
      </van-cell-group>

      <van-cell-group inset style="margin: 12px" title="功能">
        <van-cell title="我的家族" icon="cluster" is-link to="/" />
        <van-cell title="我的图书" icon="bookmark-o" is-link to="/books" />
        <van-cell title="族委会" icon="friends-o" is-link to="/committee" v-if="showCommittee" />
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

    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const activeTabbar = ref(3)
const user = ref({})

const isLoggedIn = computed(() => !!user.value.phone)
const roleIcon = computed(() => user.value.role === 'admin' ? '管' : user.value.role === 'committee' ? '组' : '成')
const roleText = computed(() => ({ admin: '管理员', committee: '族委会', member: '成员' }[user.value.role] || '成员'))
const showCommittee = computed(() => user.value.role === 'admin' || user.value.role === 'committee')

const token = localStorage.getItem('token')
const myFamily = ref(null)

async function loadUser() {
  try {
    const res = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
  } catch (e) {
    console.error('加载用户信息失败:', e)
  }
}

async function loadMyFamily() {
  try {
    const res = await api.get('/api/families', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.length > 0) {
      myFamily.value = res.data[0]
    }
  } catch (e) {
    console.error('加载家族失败:', e)
  }
}

function goMyFamily() {
  if (myFamily.value) {
    router.push(`/family/${myFamily.value.id}/contemporary/${myFamily.value.id}`)
  } else {
    showDialog({ title: '提示', message: '暂无家庭信息' })
  }
}

function goLogin() {
  router.push('/login')
}

function onLogout() {
  showDialog({
    title: '提示',
    message: '确定退出登录？'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = {}
    router.push('/login')
  })
}

onMounted(async () => {
  if (!token) {
    router.replace('/login')
    return
  }

  const stored = localStorage.getItem('user')
  if (stored) {
    try {
      user.value = JSON.parse(stored)
    } catch (e) {}
  }

  await loadUser()
  await loadMyFamily()
})
</script>

<style scoped>
.profile { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.user-name { font-size: 18px; font-weight: bold; }
.user-id { font-size: 12px; color: #999; margin-top: 4px; }
.login-prompt { padding-top: 100px; }
</style>
