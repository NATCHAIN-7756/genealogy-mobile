<template>
  <div class="events">
    <van-nav-bar title="大事记" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showCreate = true" />
      </template>
    </van-nav-bar>
    
    <van-list v-model:loading="loading" :finished="finished" @load="loadEvents">
      <van-cell-group inset style="margin: 12px">
        <van-cell v-for="event in events" :key="event.id" is-link @click="goEvent(event)">
          <template #icon>
            <div class="event-icon">
              <van-icon name="clock-o" size="20" color="#1989fa" />
            </div>
          </template>
          <template #title>
            <div class="event-title">{{ event.title }}</div>
          </template>
          <template #label>
            <div class="event-date">{{ event.event_date?.slice(0,10) }}</div>
            <div class="event-desc">{{ event.description?.slice(0,50) }}...</div>
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
    
    <van-empty v-if="!loading && events.length === 0" description="暂无大事记" />
    
    <van-popup v-model:show="showCreate" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="添加大事记" />
        <van-field v-model="newEvent.title" label="标题" placeholder="事件名称" required />
        <van-field v-model="newEvent.event_date" label="日期" placeholder="YYYY-MM-DD" required />
        <van-field v-model="newEvent.description" type="textarea" rows="4" label="描述" placeholder="事件描述..." />
        <div style="padding: 16px">
          <van-button type="primary" block :loading="submitting" @click="submitEvent">添加</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { eventApi } from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const loading = ref(false)
const finished = ref(false)
const showCreate = ref(false)
const submitting = ref(false)
const activeTabbar = ref(1)
const events = ref([])
const newEvent = ref({ title: '', event_date: '', description: '' })

function back() { router.back() }
function goEvent(event) { router.push(`/family/${familyId}/event/${event.id}`) }

async function loadEvents() {
  loading.value = true
  try {
    const res = await eventApi.list(familyId)
    events.value = res.data
    finished.value = true
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
    finished.value = true
  } finally {
    loading.value = false
  }
}

async function submitEvent() {
  if (!newEvent.value.title || !newEvent.value.event_date) {
    showToast('请填写完整')
    return
  }
  submitting.value = true
  try {
    await eventApi.create(familyId, newEvent.value)
    showToast('添加成功')
    showCreate.value = false
    newEvent.value = { title: '', event_date: '', description: '' }
    loadEvents()
  } catch (e) {
    console.error('添加失败:', e)
    showToast('添加失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => { loadEvents() })
</script>

<style scoped>
.events { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.event-icon { width: 36px; height: 36px; background: #e8f3ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
.event-title { font-size: 16px; font-weight: 500; }
.event-date { font-size: 12px; color: #1989fa; margin-top: 4px; }
.event-desc { font-size: 12px; color: #999; margin-top: 2px; }
</style>
