<template>
  <div class="genealogy-book">
    <van-nav-bar :title="currentChapter?.title || '家谱'" left-arrow @click-left="back" fixed>
      <template #right>
        <van-icon name="bars" size="20" @click="showToc = true" />
      </template>
    </van-nav-bar>

    <!-- 内容区域 -->
    <div class="book-content" v-if="!loading">
      <!-- 封面 -->
      <div v-if="currentChapterIndex === 0" class="cover-page">
        <div class="cover-inner">
          <div class="surname-display">{{ family?.surname || '族' }}</div>
          <h1>{{ family?.name }}</h1>
          <p class="subtitle">{{ family?.hall_name || '堂号待定' }}</p>
        </div>
      </div>

      <!-- 序言 -->
      <div v-else-if="currentChapterIndex === 1" class="content-page">
        <h1 class="chapter-title">{{ preface?.title || '序言' }}</h1>
        <div class="chapter-body">
          <p v-for="(para, i) in preface?.paragraphs" :key="i" class="paragraph">{{ para }}</p>
        </div>
        <div class="signature">
          <div class="author">{{ preface?.author }}</div>
          <div class="date">{{ preface?.date }}</div>
        </div>
      </div>

      <!-- 凡例 -->
      <div v-else-if="currentChapterIndex === 2" class="content-page">
        <h1 class="chapter-title">凡例</h1>
        <div class="chapter-body">
          <div v-for="(legend, i) in legends" :key="i" class="legend-section">
            <h3>{{ legend.section }}</h3>
            <ul>
              <li v-for="(item, j) in legend.items" :key="j">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 概述 -->
      <div v-else-if="currentChapterIndex === 3" class="content-page">
        <h1 class="chapter-title">家族概述</h1>
        <div class="chapter-body">
          <van-cell-group inset>
            <van-cell title="堂号" :value="family?.hall_name || '待定'" />
            <van-cell title="郡望" :value="family?.location || '待定'" />
            <van-cell title="始祖" :value="family?.ancestor || '待定'" />
            <van-cell title="始迁祖" :value="family?.founder || '待定'" />
          </van-cell-group>
          <div class="intro-section">
            <h3>家族简介</h3>
            <p>{{ family?.introduction }}</p>
          </div>
          <div class="rules-section">
            <h3>家训族规</h3>
            <p>{{ family?.rules }}</p>
          </div>
          <div class="tradition-section">
            <h3>家风传统</h3>
            <p>{{ family?.tradition }}</p>
          </div>
        </div>
      </div>

      <!-- 字辈表 -->
      <div v-else-if="currentChapterIndex === 4" class="content-page">
        <h1 class="chapter-title">字辈谱</h1>
        <div class="chapter-body">
          <div class="generation-list">
            <div v-for="(char, i) in generationChars" :key="i" class="generation-item">
              <span class="gen-order">第{{ i + 1 }}代</span>
              <span class="gen-char">{{ char }}</span>
            </div>
          </div>
          <p class="gen-note">字辈：{{ family?.generation_rule }}</p>
        </div>
      </div>

      <!-- 当代成员 -->
      <div v-else-if="currentChapterIndex === 5" class="content-page">
        <h1 class="chapter-title">当代族亲</h1>
        <div class="chapter-body">
          <van-cell-group inset>
            <van-cell v-for="member in contemporaryMembers" :key="member.id" :title="member.name" :value="member.generation ? `${member.generation}代` : ''" />
          </van-cell-group>
          <p v-if="contemporaryMembers.length === 0" class="empty-note">暂无当代成员数据</p>
        </div>
      </div>

      <!-- 家族故事 -->
      <div v-else-if="currentChapterIndex === 6" class="content-page">
        <h1 class="chapter-title">家族故事</h1>
        <div class="chapter-body">
          <div v-for="story in stories" :key="story.id" class="story-item">
            <h3>{{ story.title }}</h3>
            <p>{{ story.content }}</p>
          </div>
          <p v-if="stories.length === 0" class="empty-note">暂无家族故事</p>
        </div>
      </div>

      <!-- 家族活动 -->
      <div v-else-if="currentChapterIndex === 7" class="content-page">
        <h1 class="chapter-title">家族活动</h1>
        <div class="chapter-body">
          <div v-for="event in events" :key="event.id" class="event-item">
            <h3>{{ event.title }}</h3>
            <p class="event-date">{{ event.date }}</p>
            <p>{{ event.description }}</p>
          </div>
          <p v-if="events.length === 0" class="empty-note">暂无活动记录</p>
        </div>
      </div>

      <!-- 后记 -->
      <div v-else-if="currentChapterIndex === 8" class="content-page">
        <h1 class="chapter-title">{{ postscript?.title || '后记' }}</h1>
        <div class="chapter-body">
          <p v-for="(para, i) in postscript?.paragraphs" :key="i" class="paragraph">{{ para }}</p>
        </div>
        <div class="signature">
          <div class="author">{{ postscript?.author }}</div>
          <div class="date">{{ postscript?.date }}</div>
        </div>
      </div>
    </div>

    <!-- 翻页控制 -->
    <div class="page-controls" v-if="!loading">
      <van-button size="small" :disabled="currentChapterIndex === 0" @click="prevPage">
        <van-icon name="arrow-left" />上一页
      </van-button>
      <span class="page-info">{{ currentChapterIndex + 1 }} / {{ chapters.length }}</span>
      <van-button size="small" :disabled="currentChapterIndex === chapters.length - 1" @click="nextPage">
        下一页<van-icon name="arrow-right" />
      </van-button>
    </div>

    <!-- 底部导航栏 -->
    <AppTabbar />

    <!-- 目录弹窗 -->
    <van-popup v-model:show="showToc" position="left" style="width: 70%; height: 100%" class="toc-popup">
      <div class="toc-panel">
        <van-nav-bar title="目录" left-arrow @click-left="showToc = false" />
        <van-cell-group>
          <van-cell
            v-for="(chapter, index) in chapters"
            :key="index"
            :title="chapter.title"
            :class="{ active: currentChapterIndex === index }"
            @click="goToChapter(index)"
          >
            <template #icon>
              <van-icon :name="chapter.icon" style="margin-right: 8px" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-popup>

    <!-- 加载中 -->
    <van-loading v-if="loading" class="loading-center" size="24px">加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id

const loading = ref(true)
const showToc = ref(false)
const currentChapterIndex = ref(0)
const activeTabbar = ref(1)

const family = ref(null)
const preface = ref(null)
const legends = ref([])
const postscript = ref(null)
const stories = ref([])
const events = ref([])
const contemporaryMembers = ref([])

const chapters = [
  { title: '封面', icon: 'book-cover' },
  { title: '序言', icon: 'edit' },
  { title: '凡例', icon: 'description' },
  { title: '概述', icon: 'info-o' },
  { title: '字辈谱', icon: 'orders-o' },
  { title: '当代族亲', icon: 'friends-o' },
  { title: '家族故事', icon: 'star-o' },
  { title: '家族活动', icon: 'calendar-o' },
  { title: '后记', icon: 'bookmark-o' }
]

const currentChapter = computed(() => chapters[currentChapterIndex.value])

const generationChars = computed(() => {
  const rule = family.value?.generation_rule || ''
  return rule.split('').filter(c => c.trim())
})

const token = localStorage.getItem('token')

function back() { router.back() }

function prevPage() {
  if (currentChapterIndex.value > 0) {
    currentChapterIndex.value--
  }
}

function nextPage() {
  if (currentChapterIndex.value < chapters.length - 1) {
    currentChapterIndex.value++
  }
}

function goToChapter(index) {
  currentChapterIndex.value = index
  showToc.value = false
}

async function loadAllData() {
  try {
    // 加载家族基本信息
    const familyRes = await api.get('/...')
    family.value = familyRes.data

    // 并行加载所有章节
    const [prefaceRes, legendsRes, postscriptRes, storiesRes, eventsRes, membersRes] = await Promise.all([
      api.get('/...').catch(() => ({ data: null })),
      api.get('/...').catch(() => ({ data: [] })),
      api.get('/...').catch(() => ({ data: null })),
      api.get('/...').catch(() => ({ data: [] })),
      api.get('/...').catch(() => ({ data: [] })),
      api.get('/...').catch(() => ({ data: [] }))
    ])

    preface.value = prefaceRes.data
    legends.value = legendsRes.data.map(l => ({
      section: l.section,
      items: Array.isArray(l.content) ? l.content : []
    }))
    postscript.value = postscriptRes.data
    stories.value = storiesRes.data
    events.value = eventsRes.data
    contemporaryMembers.value = membersRes.data

  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadAllData())
</script>

<style scoped>
.genealogy-book {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px;
  padding-bottom: 110px;
}

.book-content {
  padding: 16px;
}

.loading-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 106px);
}

/* 封面 */
.cover-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 166px);
}

.cover-inner {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  width: 80%;
}

.surname-display {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
}

.cover-inner h1 {
  font-size: 28px;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.8;
}

/* 内容页 */
.content-page {
  background: white;
  padding: 24px;
  border-radius: 8px;
}

.chapter-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #667eea;
}

.chapter-body {
  font-size: 16px;
  line-height: 1.8;
}

.paragraph {
  margin-bottom: 16px;
  text-indent: 2em;
}

.signature {
  margin-top: 32px;
  text-align: right;
  color: #666;
}

/* 凡例 */
.legend-section {
  margin-bottom: 24px;
}

.legend-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
}

.legend-section ul {
  list-style: none;
  padding-left: 16px;
}

.legend-section li {
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.legend-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
}

/* 字辈 */
.generation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.generation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 8px;
}

.gen-order {
  font-size: 14px;
  color: #666;
}

.gen-char {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.gen-note {
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 故事、活动 */
.story-item, .event-item {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.story-item h3, .event-item h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.event-date {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.empty-note {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 翻页控制 */
.page-controls {
  position: fixed;
  bottom: 50px;  /* 在tabbar上方50px */
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #eee;
  z-index: 99;  /* 比tabbar低 */
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 目录 */
.toc-popup {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.toc-panel {
  height: 100%;
  background: transparent;
}

.toc-panel .van-cell {
  padding: 12px 16px;
  font-size: 14px;
}

.toc-panel .van-cell.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 500;
}

.toc-panel .van-cell-group {
  background: transparent;
}
</style>