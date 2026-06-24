<template>
  <div class="story-detail">
    <van-nav-bar :title="story.title || '故事详情'" left-arrow @click-left="back">
      <template #right>
        <van-icon name="share-o" size="20" @click="shareStory" />
      </template>
    </van-nav-bar>
    
    <van-loading v-if="loading" class="loading-center" />
    
    <template v-else>
      <!-- 文章头部 -->
      <div class="story-header">
        <van-tag :type="getCategoryType(story.category)" size="medium">
          {{ getCategoryLabel(story.category) }}
        </van-tag>
        <h1 class="story-title">{{ story.title }}</h1>
        <div class="story-meta">
          <span>
            <van-icon name="user-o" size="14" />
            {{ story.author_name || '匿名' }}
          </span>
          <span>{{ story.created_at?.slice(0, 10) }}</span>
        </div>
      </div>
      
      <!-- 文章内容 -->
      <div class="story-content">
        <div class="content-text" v-html="story.content"></div>
        
        <!-- 配图 -->
        <div v-if="story.photos && story.photos.length > 0" class="story-photos">
          <van-image 
            v-for="(photo, index) in story.photos" 
            :key="index"
            :src="photo"
            fit="cover"
            width="100%"
            style="margin-bottom: 12px; border-radius: 8px;"
            @click="previewPhoto(index)"
          />
        </div>
      </div>
      
      <!-- 互动区域 -->
      <div class="interaction-bar">
        <van-button plain size="small" @click="likeStory">
          <van-icon :name="isLiked ? 'like' : 'like-o'" :color="isLiked ? '#f44' : ''" />
          {{ story.likes || 0 }}
        </van-button>
        <van-button plain size="small" @click="showComments = true">
          <van-icon name="comment-o" />
          {{ comments.length }}
        </van-button>
        <van-button plain size="small" @click="collectStory">
          <van-icon :name="isCollected ? 'star' : 'star-o'" :color="isCollected ? '#ff9800' : ''" />
          收藏
        </van-button>
      </div>
    </template>
    
    <van-empty v-if="!loading && !story.id" description="故事不存在" />
    
    <!-- 评论弹窗 -->
    <van-popup v-model:show="showComments" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="评论区" />
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-author">{{ comment.author_name }}</div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-time">{{ comment.created_at?.slice(0, 10) }}</div>
          </div>
        </div>
        <van-empty v-else description="暂无评论" />
        
        <div class="comment-input">
          <van-field
            v-model="newComment"
            placeholder="写下你的评论..."
            :border="false"
          >
            <template #button>
              <van-button size="small" type="primary" @click="submitComment">发送</van-button>
            </template>
          </van-field>
        </div>
      </van-cell-group>
    </van-popup>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { storyApi } from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const storyId = route.params.storyId
const familyId = route.params.id

const loading = ref(true)
const activeTabbar = ref(1)
const showComments = ref(false)
const isLiked = ref(false)
const isCollected = ref(false)
const newComment = ref('')

const story = ref({})
const comments = ref([])

function back() {
  router.back()
}

function getCategoryLabel(cat) {
  const map = { origin: '起源', biography: '传记', memoir: '回忆录', fun: '趣事', photo: '照片' }
  return map[cat] || '故事'
}

function getCategoryType(cat) {
  const map = { origin: 'warning', biography: 'primary', memoir: 'success', fun: 'default', photo: 'danger' }
  return map[cat] || 'default'
}

function shareStory() {
  showToast('分享功能开发中')
}

async function likeStory() {
  try {
    await storyApi.like(storyId)
    isLiked.value = !isLiked.value
    if (isLiked.value) {
      story.value.likes = (story.value.likes || 0) + 1
      showToast('已点赞')
    } else {
      story.value.likes = (story.value.likes || 1) - 1
    }
  } catch (e) {
    showToast('操作失败')
  }
}

async function collectStory() {
  try {
    await storyApi.collect(storyId)
    isCollected.value = !isCollected.value
    showToast(isCollected.value ? '已收藏' : '已取消收藏')
  } catch (e) {
    showToast('操作失败')
  }
}

function previewPhoto(index) {
  showImagePreview({ images: story.value.photos || [], startPosition: index })
}

async function submitComment() {
  if (!newComment.value.trim()) {
    showToast('请输入评论内容')
    return
  }
  try {
    const res = await storyApi.addComment(storyId, { content: newComment.value })
    comments.value.unshift(res.data)
    newComment.value = ''
    showToast('评论成功')
  } catch (e) {
    showToast('评论失败')
  }
}

async function loadStory() {
  loading.value = true
  try {
    const res = await storyApi.get(storyId)
    story.value = res.data
    
    // 加载评论
    const commentsRes = await storyApi.getComments(storyId)
    comments.value = commentsRes.data || []
    
    // 检查是否已点赞/收藏
    const statusRes = await storyApi.getStatus(storyId)
    isLiked.value = statusRes.data?.liked || false
    isCollected.value = statusRes.data?.collected || false
  } catch (e) {
    console.error('加载故事失败:', e)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadStory())
</script>

<style scoped>
.story-detail {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}

.story-header {
  background: #fff;
  padding: 16px;
}

.story-title {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0;
  color: #333;
}

.story-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.story-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.story-content {
  background: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 8px;
}

.content-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.content-text p {
  margin-bottom: 12px;
  text-indent: 2em;
}

.story-photos {
  margin-top: 16px;
}

.interaction-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  position: sticky;
  bottom: 50px;
}

.comments-list {
  padding: 12px 0;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-author {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.comment-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.comment-input {
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>