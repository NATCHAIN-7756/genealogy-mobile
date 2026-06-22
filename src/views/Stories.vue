<template>
  <div class="stories">
    <van-nav-bar title="家族故事" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showCreate = true" />
      </template>
    </van-nav-bar>
    
    <van-tabs v-model:active="activeCategory" sticky>
      <van-tab title="全部" />
      <van-tab title="传记" />
      <van-tab title="回忆录" />
      <van-tab title="趣事" />
    </van-tabs>
    
    <van-list v-model:loading="loading" :finished="finished" @load="loadStories">
      <div v-for="story in stories" :key="story.id" class="story-card" @click="goStory(story)">
        <div class="story-header">
          <van-tag type="primary">{{ story.category || '故事' }}</van-tag>
          <span class="story-date">{{ story.created_at?.slice(0,10) }}</span>
        </div>
        <div class="story-title">{{ story.title }}</div>
        <div class="story-excerpt">{{ story.content?.slice(0,100) }}...</div>
        <div class="story-meta">
          <span><van-icon name="user-o" /> {{ story.author_name || '匿名' }}</span>
        </div>
      </div>
    </van-list>
    
    <van-empty v-if="!loading && stories.length === 0" description="暂无故事" />
    
    <van-popup v-model:show="showCreate" position="bottom" round style="height: 70%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="投稿故事" />
        <van-field v-model="newStory.title" label="标题" placeholder="请输入标题" required />
        <van-cell title="分类">
          <template #value>
            <van-radio-group v-model="newStory.category" direction="horizontal">
              <van-radio name="biography">传记</van-radio>
              <van-radio name="memoir">回忆录</van-radio>
              <van-radio name="fun">趣事</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        <van-field v-model="newStory.content" type="textarea" rows="6" label="内容" placeholder="请输入故事内容..." />
        <div style="padding: 16px">
          <van-button type="primary" block :loading="submitting" @click="submitStory">提交审核</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeCategory = ref(0)
const loading = ref(false)
const finished = ref(false)
const showCreate = ref(false)
const submitting = ref(false)
const activeTabbar = ref(1)

const stories = ref([])
const newStory = ref({ title: '', category: 'memoir', content: '' })

const token = localStorage.getItem('token')

function back() { router.back() }
function goStory(story) { router.push(`/family/${familyId}/story/${story.id}`) }

async function loadStories() {
  loading.value = true
  try {
    const res = await axios.get(`http://45.207.215.95/api/stories/family/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    stories.value = res.data
    finished.value = true
  } catch (e) {
    console.error('加载故事失败:', e)
    showToast('加载失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

async function submitStory() {
  if (!newStory.value.title || !newStory.value.content) {
    showToast('请填写完整')
    return
  }
  submitting.value = true
  try {
    await axios.post(`http://45.207.215.95/api/stories/family/${familyId}`, newStory.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('提交成功')
    showCreate.value = false
    newStory.value = { title: '', category: 'memoir', content: '' }
    loadStories()
  } catch (e) {
    console.error('提交失败:', e)
    showToast('提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => { loadStories() })
</script>

<style scoped>
.stories { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.story-card { background: #fff; margin: 12px; padding: 16px; border-radius: 8px; }
.story-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.story-date { font-size: 12px; color: #999; }
.story-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
.story-excerpt { font-size: 14px; color: #666; line-height: 1.5; }
.story-meta { margin-top: 12px; font-size: 12px; color: #999; display: flex; gap: 8px; }
</style>