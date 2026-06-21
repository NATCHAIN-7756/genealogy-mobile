<template>
  <div class="committee-stories">
    <van-nav-bar title="待审核故事" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="story in stories" :key="story.id" is-link @click="showDetail(story)">
          <template #icon>
            <van-image v-if="story.cover" :src="story.cover" width="50" height="50" radius="4" fit="cover" style="margin-right: 8px" />
            <van-icon v-else name="comment-o" size="50" color="#eee" style="margin-right: 8px" />
          </template>
          <template #title>
            <div class="story-title">{{ story.title }}</div>
          </template>
          <template #label>
            <div class="story-meta">
              <span>{{ story.author }} · {{ story.submitDate }}</span>
              <div class="story-preview">{{ story.content.substring(0, 50) }}...</div>
            </div>
          </template>
          <template #value>
            <van-button size="small" type="primary" @click.stop="approve(story.id)">通过</van-button>
            <van-button size="small" type="default" @click.stop="reject(story.id)" style="margin-left: 4px">拒绝</van-button>
          </template>
        </van-cell>
      </van-list>
      <van-empty v-if="stories.length === 0 && !loading" description="暂无待审核故事" />
    </van-cell-group>
    
    <!-- 详情弹窗 -->
    <van-popup v-model:show="detailVisible" position="bottom" style="height: 70%">
      <div class="detail-popup">
        <van-nav-bar title="故事详情" left-arrow @click-left="detailVisible = false" />
        <div class="detail-content">
          <div class="detail-title">{{ currentStory.title }}</div>
          <div class="detail-meta">{{ currentStory.author }} · {{ currentStory.submitDate }}</div>
          <van-divider />
          <div class="detail-text">{{ currentStory.content }}</div>
          <div v-if="currentStory.photos?.length" class="photo-grid">
            <van-image v-for="(photo, i) in currentStory.photos" :key="i" :src="photo" width="100%" fit="contain" style="margin: 8px 0" />
          </div>
        </div>
        <div class="detail-actions">
          <van-field v-model="reviewComment" placeholder="审核意见（拒绝时填写）" />
          <van-button type="primary" block @click="approve(currentStory.id)">通过</van-button>
          <van-button type="danger" block @click="reject(currentStory.id)" style="margin-top: 8px">拒绝</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const loading = ref(false)
const finished = ref(true)
const detailVisible = ref(false)
const reviewComment = ref('')

const stories = ref([
  { id: 1, title: '爷爷的创业故事', author: '张三', submitDate: '2026-06-15', content: '爷爷李大福于1938年出生，年轻时在村里做小买卖...', cover: '', photos: [] },
  { id: 2, title: '家族迁徙史', author: '李四', submitDate: '2026-06-10', content: '我们家族原籍山东，清朝时迁徙到河南...', cover: '', photos: [] }
])

const currentStory = ref({})

function back() { router.back() }
function onLoad() { loading.value = false }

function showDetail(story) {
  currentStory.value = story
  detailVisible.value = true
}

async function approve(id) {
  try {
    stories.value = stories.value.filter(s => s.id !== id)
    detailVisible.value = false
    showSuccessToast('审核通过')
  } catch (e) {
    showToast('操作失败')
  }
}

async function reject(id) {
  if (!reviewComment.value) {
    showToast('请填写拒绝原因')
    return
  }
  try {
    stories.value = stories.value.filter(s => s.id !== id)
    detailVisible.value = false
    reviewComment.value = ''
    showSuccessToast('已拒绝')
  } catch (e) {
    showToast('操作失败')
  }
}
</script>

<style scoped>
.committee-stories { padding-bottom: 20px; }

.story-title { font-size: 14px; color: #333; }
.story-meta { font-size: 12px; color: #999; margin-top: 4px; }
.story-preview { color: #666; margin-top: 4px; }

.detail-popup { height: 100%; display: flex; flex-direction: column; }
.detail-content { flex: 1; overflow-y: auto; padding: 16px; }
.detail-title { font-size: 18px; font-weight: bold; }
.detail-meta { font-size: 12px; color: #999; margin-top: 8px; }
.detail-text { font-size: 14px; line-height: 1.8; margin-top: 12px; }
.detail-actions { padding: 12px; background: #fff; border-top: 1px solid #eee; }
</style>