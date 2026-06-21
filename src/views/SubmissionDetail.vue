<template>
  <div class="submission-detail">
    <van-nav-bar title="投稿详情" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="18" @click="editSubmission" />
      </template>
    </van-nav-bar>
    
    <div class="detail-card">
      <div class="detail-header">
        <div class="detail-title">{{ submission.title }}</div>
        <van-tag :type="getStatusType(submission.status)" size="large">{{ getStatusText(submission.status) }}</van-tag>
      </div>
      
      <div class="detail-meta">
        <span>提交时间：{{ submission.submitDate }}</span>
        <span v-if="submission.status === 'approved'">审核时间：{{ submission.reviewDate }}</span>
      </div>
      
      <!-- 根据章节类型显示不同内容 -->
      <div class="detail-content">
        <van-divider>投稿内容</van-divider>
        
        <!-- 故事 -->
        <template v-if="chapterId === 'stories'">
          <div class="story-content">{{ submission.content }}</div>
        </template>
        
        <!-- 照片 -->
        <template v-else-if="chapterId === 'photos'">
          <van-grid :column-num="3" gutter="8">
            <van-grid-item v-for="(photo, idx) in submission.photos" :key="idx">
              <van-image :src="photo" fit="cover" />
            </van-grid-item>
          </van-grid>
          <div class="photo-desc">{{ submission.description }}</div>
        </template>
        
        <!-- 大事记 -->
        <template v-else-if="chapterId === 'events'">
          <div class="event-info">
            <van-cell title="事件类型" :value="submission.eventType" />
            <van-cell title="事件日期" :value="submission.eventDate" />
            <van-cell title="相关人物" :value="submission.people" />
            <van-cell title="事件描述" :value="submission.description" />
          </div>
        </template>
        
        <!-- 赞助 -->
        <template v-else-if="chapterId === 'sponsors'">
          <div class="sponsor-info">
            <van-cell title="赞助类型" :value="submission.type" />
            <van-cell title="赞助金额" :value="submission.amount" />
            <van-cell title="赞助日期" :value="submission.date" />
            <van-cell title="留言" :value="submission.message" />
          </div>
        </template>
      </div>
      
      <!-- 审核意见 -->
      <van-cell-group inset v-if="submission.status === 'rejected'" title="审核意见">
        <van-cell :title="submission.reviewComment" />
      </van-cell-group>
      
      <!-- 发布状态 -->
      <van-cell-group inset v-if="submission.status === 'approved'" title="发布状态">
        <van-cell title="已收录到家谱" icon="success" />
        <van-cell title="章节" :value="submission.chapterTitle" />
      </van-cell-group>
    </div>
    
    <!-- 重新提交 -->
    <div class="bottom-actions" v-if="submission.status === 'rejected'">
      <van-button type="primary" block @click="editSubmission">修改后重新提交</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const chapterId = route.params.chapterId
const itemId = route.params.itemId

const submission = ref({
  id: itemId,
  title: '爷爷的创业故事',
  status: 'approved',
  submitDate: '2026-06-15 10:30',
  reviewDate: '2026-06-16 09:00',
  content: '爷爷李大福于1938年出生，年轻时在村里做小买卖。后来改革开放，他开办了第一家五金店...',
  chapterTitle: '家族故事',
  photos: [],
  description: '',
  eventType: '',
  eventDate: '',
  people: '',
  type: '',
  amount: '',
  date: '',
  message: '',
  reviewComment: ''
})

function back() {
  router.back()
}

function editSubmission() {
  router.push(`/my-submissions/${chapterId}/${itemId}/edit`)
}

function getStatusType(status) {
  return status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'danger'
}

function getStatusText(status) {
  return status === 'approved' ? '已通过' : status === 'pending' ? '待审核' : '已退回'
}
</script>

<style scoped>
.submission-detail {
  padding-bottom: 70px;
}

.detail-card {
  margin: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
}

.detail-meta {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.detail-content {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-top: 8px;
}

.story-content {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.photo-desc {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.event-info, .sponsor-info {
  padding: 8px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: #fff;
}
</style>