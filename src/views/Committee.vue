<template>
  <div class="committee">
    <van-nav-bar title="族委会" left-arrow @click-left="back" />
    
    <van-grid :column-num="3" :gutter="12" style="padding: 12px">
      <van-grid-item icon="friends-o" text="成员管理" to="/committee/members" />
      <van-grid-item icon="edit" text="故事审核" to="/committee/stories" />
      <van-grid-item icon="photo-o" text="照片审核" to="/committee/photos" />
      <van-grid-item icon="clock-o" text="大事记审核" to="/committee/events" />
      <van-grid-item icon="balance-list-o" text="赞助审核" to="/committee/sponsors" />
      <van-grid-item icon="user-o" text="待审成员" to="/committee/members/pending" />
    </van-grid>
    
    <van-cell-group inset style="margin: 12px" title="待办事项">
      <van-cell title="待审核故事" :value="pending.stories" is-link to="/committee/stories" />
      <van-cell title="待审核大事记" :value="pending.events" is-link to="/committee/events" />
      <van-cell title="待审核赞助" :value="pending.sponsors" is-link to="/committee/sponsors" />
    </van-cell-group>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const activeTabbar = ref(3)
const pending = ref({ stories: 0, events: 0, sponsors: 0 })

const token = localStorage.getItem('token')

function back() { router.back() }

async function loadPending() {
  try {
    const [stories, events, sponsors] = await Promise.all([
      axios.get('http://45.207.215.95/api/committee/pending/stories', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://45.207.215.95/api/committee/pending/events', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://45.207.215.95/api/committee/pending/sponsors', { headers: { Authorization: `Bearer ${token}` } })
    ])
    pending.value = {
      stories: stories.data.length || 0,
      events: events.data.length || 0,
      sponsors: sponsors.data.length || 0
    }
  } catch (e) {
    console.error('加载失败:', e)
  }
}

onMounted(() => loadPending())
</script>

<style scoped>
.committee { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
</style>