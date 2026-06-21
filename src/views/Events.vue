<template>
  <div class="events">
    <van-nav-bar title="大事记" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showCreate = true" />
      </template>
    </van-nav-bar>
    
    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ events.length }}</div>
        <div class="stat-label">事件总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ thisYearEvents }}</div>
        <div class="stat-label">今年事件</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ recentEvents }}</div>
        <div class="stat-label">近30天</div>
      </div>
    </div>
    
    <!-- 分类筛选 -->
    <div class="filter-tabs">
      <van-tag 
        v-for="cat in categories" 
        :key="cat.value"
        :type="activeCategory === cat.value ? 'primary' : 'default'"
        size="medium"
        @click="activeCategory = cat.value"
        style="margin: 4px"
      >
        {{ cat.label }}
      </van-tag>
    </div>
    
    <!-- 时间线 -->
    <div class="timeline">
      <div v-for="year in years" :key="year" class="year-section">
        <div class="year-header">{{ year }}年</div>
        
        <div v-for="event in getEventsByYear(year)" :key="event.id" class="timeline-item" @click="goEvent(event)">
          <div class="timeline-dot" :class="'type-' + event.event_type"></div>
          <div class="timeline-content">
            <div class="event-date">{{ formatDate(event.event_date) }}</div>
            <div class="event-title">{{ event.title }}</div>
            <div class="event-meta">
              <span v-if="event.location">
                <van-icon name="location-o" size="12" />
                {{ event.location }}
              </span>
              <van-tag :type="getEventTypeTag(event.event_type)" size="small">
                {{ getEventTypeLabel(event.event_type) }}
              </van-tag>
            </div>
            <div v-if="event.excerpt" class="event-excerpt">{{ event.excerpt }}</div>
            
            <!-- 参与人物 -->
            <div v-if="event.participants && event.participants.length > 0" class="event-participants">
              <span v-for="p in event.participants" :key="p.id" class="participant-tag" @click.stop="goMember(p)">
                {{ p.name }}
              </span>
            </div>
            
            <!-- 配图 -->
            <div v-if="event.photos && event.photos.length > 0" class="event-photos">
              <van-image 
                v-for="(photo, index) in event.photos.slice(0, 3)" 
                :key="index"
                :src="photo"
                fit="cover"
                width="80"
                height="80"
                radius="4"
                style="margin-right: 4px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <van-empty v-if="filteredEvents.length === 0" description="暂无大事记" />
    
    <!-- 创建事件弹窗 -->
    <van-popup v-model:show="showCreate" position="bottom" round style="height: 80%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="记录大事" />
        <van-field v-model="newEvent.title" label="标题" placeholder="请输入事件标题" required />
        
        <van-cell title="类型" required>
          <template #value>
            <van-radio-group v-model="newEvent.event_type" direction="horizontal">
              <van-radio name="major">大事</van-radio>
              <van-radio name="wedding">婚嫁</van-radio>
              <van-radio name="birth">添丁</van-radio>
              <van-radio name="honor">荣誉</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        
        <van-field 
          v-model="newEvent.event_date" 
          label="日期" 
          placeholder="YYYY-MM-DD"
          type="date"
          required
        />
        
        <van-field 
          v-model="newEvent.location" 
          label="地点" 
          placeholder="发生地点"
        />
        
        <van-field
          v-model="newEvent.content"
          type="textarea"
          rows="4"
          label="描述"
          placeholder="请描述事件详情..."
        />
        
        <van-cell title="相关人物">
          <template #value>
            <van-tag v-for="p in newEvent.participants" :key="p" closeable @close="removeParticipant(p)">
              {{ p }}
            </van-tag>
            <van-button size="small" plain @click="selectParticipant">+ 添加</van-button>
          </template>
        </van-cell>
        
        <van-cell title="上传图片">
          <template #value>
            <van-uploader 
              v-model="newEvent.photos" 
              multiple
              :max-count="9"
              preview-size="60"
            />
          </template>
        </van-cell>
        
        <div style="padding: 16px">
          <van-button type="primary" block :loading="submitting" @click="submitEvent">
            保存
          </van-button>
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

const router = useRouter()
const route = useRoute()
const familyId = route.params.id

const activeCategory = ref('')
const showCreate = ref(false)
const submitting = ref(false)
const activeTabbar = ref(1)

const categories = [
  { label: '全部', value: '' },
  { label: '大事', value: 'major' },
  { label: '婚嫁', value: 'wedding' },
  { label: '添丁', value: 'birth' },
  { label: '祭祀', value: 'sacrifice' },
  { label: '荣誉', value: 'honor' }
]

const events = ref([])

const newEvent = ref({
  title: '',
  event_type: 'major',
  event_date: '',
  location: '',
  content: '',
  participants: [],
  photos: []
})

const filteredEvents = computed(() => {
  let result = events.value
  if (activeCategory.value) {
    result = result.filter(e => e.event_type === activeCategory.value)
  }
  return result.sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
})

const years = computed(() => {
  const yearSet = new Set()
  filteredEvents.value.forEach(e => {
    if (e.event_date) {
      yearSet.add(parseInt(e.event_date.split('-')[0]))
    }
  })
  return Array.from(yearSet).sort((a, b) => b - a)
})

const thisYearEvents = computed(() => {
  const thisYear = new Date().getFullYear()
  return events.value.filter(e => e.event_date?.startsWith(thisYear)).length
})

const recentEvents = computed(() => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  return events.value.filter(e => new Date(e.event_date) >= thirtyDaysAgo).length
})

function back() {
  router.back()
}

function goEvent(event) {
  router.push(`/family/${familyId}/event/${event.id}`)
}

function goMember(participant) {
  router.push(`/family/${familyId}/member/${participant.id}/card`)
}

function getEventsByYear(year) {
  return filteredEvents.value.filter(e => e.event_date?.startsWith(year))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
}

function getEventTypeLabel(type) {
  const map = {
    major: '大事',
    wedding: '婚嫁',
    birth: '添丁',
    sacrifice: '祭祀',
    honor: '荣誉'
  }
  return map[type] || '事件'
}

function getEventTypeTag(type) {
  const map = {
    major: 'warning',
    wedding: 'danger',
    birth: 'success',
    sacrifice: 'default',
    honor: 'primary'
  }
  return map[type] || 'default'
}

function removeParticipant(name) {
  newEvent.value.participants = newEvent.value.participants.filter(p => p !== name)
}

function selectParticipant() {
  showToast('选择成员功能开发中')
}

async function submitEvent() {
  if (!newEvent.value.title) {
    showToast('请输入标题')
    return
  }
  if (!newEvent.value.event_date) {
    showToast('请选择日期')
    return
  }
  
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    showToast('保存成功')
    showCreate.value = false
    // 重置表单
    newEvent.value = {
      title: '',
      event_type: 'major',
      event_date: '',
      location: '',
      content: '',
      participants: [],
      photos: []
    }
  } catch (e) {
    showToast('保存失败')
  } finally {
    submitting.value = false
  }
}

async function loadEvents() {
  // 模拟数据
  events.value = [
    {
      id: 1,
      title: '张小明考取清华大学',
      event_date: '2026-06-18',
      event_type: 'honor',
      location: '济南',
      excerpt: '张小明以优异成绩被清华大学计算机系录取，成为家族第一位清华学子。',
      participants: [{ id: 10, name: '张小明' }],
      photos: []
    },
    {
      id: 2,
      title: '清明祭祖活动',
      event_date: '2026-04-05',
      event_type: 'sacrifice',
      location: '祖茔',
      excerpt: '族人齐聚祖茔，举行清明祭祖仪式，缅怀先祖。',
      participants: [],
      photos: ['https://via.placeholder.com/80?text=祭祖1', 'https://via.placeholder.com/80?text=祭祖2']
    },
    {
      id: 3,
      title: '张小明与李四结婚',
      event_date: '2025-10-01',
      event_type: 'wedding',
      location: '济南',
      excerpt: '张小明与李四喜结连理，家族成员共同见证这一幸福时刻。',
      participants: [{ id: 10, name: '张小明' }, { id: 11, name: '李四' }],
      photos: ['https://via.placeholder.com/80?text=婚礼']
    },
    {
      id: 4,
      title: '家族宗祠重修落成',
      event_date: '2025-05-20',
      event_type: 'major',
      location: '山东老家',
      excerpt: '历时三年，家族宗祠重修工程圆满完成，族人共同举行落成典礼。',
      participants: [],
      photos: []
    },
    {
      id: 5,
      title: '张大牛中举人',
      event_date: '1885-08-15',
      event_type: 'honor',
      location: '济南府',
      excerpt: '第十代张大牛公考中举人，为家族争光。',
      participants: [{ id: 5, name: '张大牛' }],
      photos: []
    },
    {
      id: 6,
      title: '始迁祖迁居济南',
      event_date: '1369-03-01',
      event_type: 'major',
      location: '山西洪洞→济南',
      excerpt: '明洪武二年，始迁祖张三公响应朝廷号召，由山西洪洞县大槐树迁至济南。',
      participants: [{ id: 1, name: '张三公' }],
      photos: []
    }
  ]
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.events {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin: 12px;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.filter-tabs {
  padding: 8px 12px;
  background: #fff;
}

.timeline {
  padding: 16px 12px;
}

.year-section {
  margin-bottom: 16px;
}

.year-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 8px 0;
  border-bottom: 2px solid #667eea;
  margin-bottom: 12px;
}

.timeline-item {
  position: relative;
  padding-left: 24px;
  margin-bottom: 16px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
}

.timeline-dot.type-major { background: #ff9800; }
.timeline-dot.type-wedding { background: #f44; }
.timeline-dot.type-birth { background: #4caf50; }
.timeline-dot.type-sacrifice { background: #999; }
.timeline-dot.type-honor { background: #1989fa; }

.timeline-content {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.event-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.event-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.event-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-excerpt {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.event-participants {
  margin-bottom: 8px;
}

.participant-tag {
  display: inline-block;
  background: #e8f3ff;
  color: #1989fa;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.event-photos {
  display: flex;
  margin-top: 8px;
}
</style>