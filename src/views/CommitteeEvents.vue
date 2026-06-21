<template>
  <div class="committee-events">
    <van-nav-bar title="待审核大事记" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="event in events" :key="event.id" is-link @click="showDetail(event)">
          <template #icon>
            <van-icon :name="getEventIcon(event.eventType)" size="40" color="#1989fa" style="margin-right: 8px" />
          </template>
          <template #title>
            <div class="event-title">{{ event.title }}</div>
          </template>
          <template #label>
            <div class="event-meta">
              <span>{{ event.eventType }} · {{ event.eventDate }}</span>
              <div class="event-people">相关人物：{{ event.people }}</div>
            </div>
          </template>
          <template #value>
            <van-button size="small" type="primary" @click.stop="approve(event.id)">通过</van-button>
            <van-button size="small" type="default" @click.stop="reject(event.id)" style="margin-left: 4px">拒绝</van-button>
          </template>
        </van-cell>
      </van-list>
      <van-empty v-if="events.length === 0 && !loading" description="暂无待审核大事记" />
    </van-cell-group>
    
    <!-- 详情弹窗 -->
    <van-popup v-model:show="detailVisible" position="bottom" style="height: 70%">
      <div class="detail-popup">
        <van-nav-bar title="大事详情" left-arrow @click-left="detailVisible = false" />
        <div class="detail-content">
          <div class="detail-title">{{ currentEvent.title }}</div>
          <div class="detail-meta">{{ currentEvent.eventType }} · {{ currentEvent.eventDate }}</div>
          <van-divider />
          <van-cell-group inset>
            <van-cell title="相关人物" :value="currentEvent.people" />
            <van-cell title="提交人" :value="currentEvent.author" />
            <van-cell title="提交时间" :value="currentEvent.submitDate" />
          </van-cell-group>
          <div class="detail-desc">{{ currentEvent.description }}</div>
        </div>
        <div class="detail-actions">
          <van-field v-model="reviewComment" placeholder="审核意见（拒绝时填写）" />
          <van-button type="primary" block @click="approve(currentEvent.id)">通过</van-button>
          <van-button type="danger" block @click="reject(currentEvent.id)" style="margin-top: 8px">拒绝</van-button>
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

const events = ref([
  { id: 1, title: '李明升学宴', eventType: '升学', eventDate: '2026-06-20', people: '李明', author: '张三', submitDate: '2026-06-01', description: '李明考上清华大学，举办升学宴...' },
  { id: 2, title: '家族祭祖', eventType: '祭祖', eventDate: '2026-04-05', people: '全体族人', author: '李四', submitDate: '2026-05-28', description: '清明节家族集体祭祖活动...' }
])

const currentEvent = ref({})

const eventIcons = {
  '升学': 'certificate',
  '婚嫁': 'like-o',
  '寿诞': 'birthday-1',
  '丧葬': 'flower-o',
  '祭祖': 'balance-list-o',
  '团聚': 'friends-o'
}

function getEventIcon(type) {
  return eventIcons[type] || 'clock-o'
}

function back() { router.back() }
function onLoad() { loading.value = false }

function showDetail(event) {
  currentEvent.value = event
  detailVisible.value = true
}

async function approve(id) {
  events.value = events.value.filter(e => e.id !== id)
  detailVisible.value = false
  showSuccessToast('审核通过')
}

async function reject(id) {
  if (!reviewComment.value) {
    showToast('请填写拒绝原因')
    return
  }
  events.value = events.value.filter(e => e.id !== id)
  detailVisible.value = false
  reviewComment.value = ''
  showSuccessToast('已拒绝')
}
</script>

<style scoped>
.committee-events { padding-bottom: 20px; }

.event-title { font-size: 14px; color: #333; }
.event-meta { font-size: 12px; color: #999; margin-top: 4px; }
.event-people { color: #666; margin-top: 2px; }

.detail-popup { height: 100%; display: flex; flex-direction: column; }
.detail-content { flex: 1; overflow-y: auto; padding: 16px; }
.detail-title { font-size: 18px; font-weight: bold; }
.detail-meta { font-size: 12px; color: #999; margin-top: 8px; }
.detail-desc { font-size: 14px; line-height: 1.8; margin-top: 12px; color: #333; }
.detail-actions { padding: 12px; background: #fff; border-top: 1px solid #eee; }
</style>