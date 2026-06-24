<template>
  <div class="event-detail">
    <van-nav-bar title="事件详情" left-arrow @click-left="back" />
    
    <!-- 事件头部 -->
    <div class="event-header" :class="'type-' + event.event_type">
      <van-tag :type="getEventTypeTag(event.event_type)" size="large">
        {{ getEventTypeLabel(event.event_type) }}
      </van-tag>
      <h1 class="event-title">{{ event.title }}</h1>
      <div class="event-date">{{ event.event_date }}</div>
      <div v-if="event.location" class="event-location">
        <van-icon name="location-o" /> {{ event.location }}
      </div>
    </div>
    
    <!-- 事件内容 -->
    <van-cell-group inset style="margin: 12px" title="事件详情">
      <div class="event-content">{{ event.content }}</div>
    </van-cell-group>
    
    <!-- 配图 -->
    <van-cell-group v-if="event.photos && event.photos.length > 0" inset style="margin: 12px" title="相关图片">
      <van-grid :column-num="3" :gutter="4">
        <van-grid-item v-for="(photo, index) in event.photos" :key="index" @click="previewPhoto(index)">
          <van-image :src="photo" fit="cover" width="100%" height="80" radius="4" />
        </van-grid-item>
      </van-grid>
    </van-cell-group>
    
    <!-- 参与人物 -->
    <van-cell-group v-if="event.participants && event.participants.length > 0" inset style="margin: 12px" title="相关人物">
      <van-cell 
        v-for="p in event.participants" 
        :key="p.id"
        :title="p.name"
        is-link
        @click="goMember(p)"
      />
    </van-cell-group>
    
    <!-- 互动 -->
    <div class="interaction-bar">
      <van-button plain size="small" @click="likeEvent">
        <van-icon name="like-o" /> {{ event.likes || 0 }}
      </van-button>
      <van-button plain size="small" @click="shareEvent">
        <van-icon name="share-o" /> 分享
      </van-button>
    </div>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const eventId = route.params.eventId
const activeTabbar = ref(1)

const event = ref({
  id: 1,
  title: '张小明考取清华大学',
  event_date: '2026-06-18',
  event_type: 'honor',
  location: '济南',
  content: '张小明以优异成绩被清华大学计算机系录取，成为家族第一位清华学子。这是家族教育史上的里程碑事件，族人纷纷祝贺，并勉励后辈以此为榜样，努力学习，为家族争光。',
  photos: [],
  participants: [{ id: 10, name: '张小明' }],
  likes: 86
})

function back() {
  router.back()
}

function goMember(p) {
  router.push(`/family/${familyId}/member/${p.id}/card`)
}

function getEventTypeLabel(type) {
  const map = { major: '大事', wedding: '婚嫁', birth: '添丁', sacrifice: '祭祀', honor: '荣誉' }
  return map[type] || '事件'
}

function getEventTypeTag(type) {
  const map = { major: 'warning', wedding: 'danger', birth: 'success', sacrifice: 'default', honor: 'primary' }
  return map[type] || 'default'
}

function previewPhoto(index) {
  showImagePreview({ images: event.value.photos, startPosition: index })
}

function likeEvent() {
  event.value.likes++
  showToast('已点赞')
}

function shareEvent() {
  showToast('分享功能开发中')
}

onMounted(() => {
  // TODO: 加载事件详情
})
</script>

<style scoped>
.event-detail {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.event-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  color: #fff;
  text-align: center;
}

.event-header.type-major { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
.event-header.type-wedding { background: linear-gradient(135deg, #f44 0%, #d32f2f 100%); }
.event-header.type-birth { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); }
.event-header.type-sacrifice { background: linear-gradient(135deg, #999 0%, #666 100%); }
.event-header.type-honor { background: linear-gradient(135deg, #1989fa 0%, #0d47a1 100%); }

.event-title {
  font-size: 20px;
  font-weight: bold;
  margin: 12px 0;
}

.event-date, .event-location {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.event-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.event-content {
  padding: 16px;
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.interaction-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
}
</style>