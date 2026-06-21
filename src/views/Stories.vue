<template>
  <div class="stories">
    <van-nav-bar title="家族故事" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showCreate = true" />
      </template>
    </van-nav-bar>
    
    <!-- 分类筛选 -->
    <van-tabs v-model:active="activeCategory" sticky>
      <van-tab v-for="cat in categories" :key="cat.value" :title="cat.label">
        <van-search v-model="searchText" placeholder="搜索故事" />
        
        <!-- 故事列表 -->
        <van-list v-model:loading="loading" :finished="finished" @load="loadStories">
          <div 
            v-for="story in filteredStories" 
            :key="story.id" 
            class="story-card"
            @click="goStory(story)"
          >
            <div class="story-header">
              <van-tag :type="getCategoryType(story.category)" size="medium">
                {{ getCategoryLabel(story.category) }}
              </van-tag>
              <span class="story-date">{{ story.date }}</span>
            </div>
            
            <div class="story-title">{{ story.title }}</div>
            
            <div class="story-excerpt">{{ story.excerpt }}</div>
            
            <div class="story-meta">
              <span class="story-author">
                <van-icon name="user-o" size="12" />
                {{ story.author }}
              </span>
              <span class="story-stats">
                <van-icon name="eye-o" size="12" />
                {{ story.views || 0 }}
                <van-icon name="like-o" size="12" style="margin-left: 8px" />
                {{ story.likes || 0 }}
              </span>
            </div>
            
            <div v-if="story.cover" class="story-cover">
              <van-image :src="story.cover" fit="cover" width="100%" height="150" radius="8" />
            </div>
          </div>
        </van-list>
        
        <van-empty v-if="!loading && filteredStories.length === 0" description="暂无故事" />
      </van-tab>
    </van-tabs>
    
    <!-- 创建故事弹窗 -->
    <van-popup v-model:show="showCreate" position="bottom" round style="height: 80%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="投稿故事" />
        <van-field v-model="newStory.title" label="标题" placeholder="请输入故事标题" required />
        <van-cell title="分类" required>
          <template #value>
            <van-radio-group v-model="newStory.category" direction="horizontal">
              <van-radio name="biography">传记</van-radio>
              <van-radio name="memoir">回忆录</van-radio>
              <van-radio name="fun">趣事</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        <van-field
          v-model="newStory.content"
          type="textarea"
          rows="8"
          label="内容"
          placeholder="请输入故事内容..."
        />
        <van-cell title="关联人物">
          <template #value>
            <van-tag v-for="m in newStory.members" :key="m" closeable @close="removeMember(m)">
              {{ m }}
            </van-tag>
            <van-button size="small" plain @click="selectMember">+ 添加</van-button>
          </template>
        </van-cell>
        <div style="padding: 16px">
          <van-button type="primary" block :loading="submitting" @click="submitStory">
            提交审核
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

const activeCategory = ref(0)
const searchText = ref('')
const loading = ref(false)
const finished = ref(false)
const showCreate = ref(false)
const submitting = ref(false)
const activeTabbar = ref(1)

const categories = [
  { label: '全部', value: '' },
  { label: '起源', value: 'origin' },
  { label: '传记', value: 'biography' },
  { label: '回忆录', value: 'memoir' },
  { label: '趣事', value: 'fun' },
  { label: '照片', value: 'photo' }
]

const stories = ref([])

const newStory = ref({
  title: '',
  category: 'memoir',
  content: '',
  members: []
})

const filteredStories = computed(() => {
  let result = stories.value
  const cat = categories[activeCategory.value].value
  
  if (cat) {
    result = result.filter(s => s.category === cat)
  }
  
  if (searchText.value) {
    result = result.filter(s => 
      s.title.includes(searchText.value) || 
      s.excerpt.includes(searchText.value)
    )
  }
  
  return result
})

function back() {
  router.back()
}

function goStory(story) {
  router.push(`/family/${familyId}/story/${story.id}`)
}

function getCategoryLabel(cat) {
  const map = {
    origin: '起源',
    biography: '传记',
    memoir: '回忆录',
    fun: '趣事',
    photo: '照片'
  }
  return map[cat] || '故事'
}

function getCategoryType(cat) {
  const map = {
    origin: 'warning',
    biography: 'primary',
    memoir: 'success',
    fun: 'default',
    photo: 'danger'
  }
  return map[cat] || 'default'
}

function removeMember(name) {
  newStory.value.members = newStory.value.members.filter(m => m !== name)
}

function selectMember() {
  showToast('选择成员功能开发中')
}

async function submitStory() {
  if (!newStory.value.title) {
    showToast('请输入标题')
    return
  }
  if (!newStory.value.content) {
    showToast('请输入内容')
    return
  }
  
  submitting.value = true
  try {
    // 模拟提交
    await new Promise(r => setTimeout(r, 1000))
    showToast('提交成功，等待审核')
    showCreate.value = false
    newStory.value = { title: '', category: 'memoir', content: '', members: [] }
  } catch (e) {
    showToast('提交失败')
  } finally {
    submitting.value = false
  }
}

async function loadStories() {
  // 模拟数据
  stories.value = [
    {
      id: 1,
      title: '张三公迁居济南记',
      category: 'origin',
      excerpt: '明洪武二年，始迁祖张三公响应朝廷号召，携家眷由山西洪洞县大槐树迁至济南，开启了我族在山东的繁衍历史...',
      author: '族委会',
      date: '2026-01-15',
      views: 520,
      likes: 86,
      cover: ''
    },
    {
      id: 2,
      title: '清代举人张大牛传',
      category: 'biography',
      excerpt: '第十代张大牛公，清光绪年间中举人，曾任某县令，为官清廉，深受百姓爱戴，其事迹流传至今...',
      author: '张明',
      date: '2026-03-10',
      views: 320,
      likes: 45,
      cover: 'https://via.placeholder.com/300x150?text=举人照片'
    },
    {
      id: 3,
      title: '爷爷的抗战岁月',
      category: 'memoir',
      excerpt: '1942年，爷爷参加了抗日游击队，在山东一带与日军周旋，这段经历成为家族永远的骄傲...',
      author: '张小明',
      date: '2026-05-20',
      views: 280,
      likes: 62,
      cover: ''
    },
    {
      id: 4,
      title: '1980年春节全家福背后的故事',
      category: 'photo',
      excerpt: '这张全家福拍摄于1980年春节，当时全家三代二十余人齐聚一堂，留下了这张珍贵的合影...',
      author: '李四',
      date: '2026-06-01',
      views: 150,
      likes: 38,
      cover: 'https://via.placeholder.com/300x150?text=全家福'
    }
  ]
  finished.value = true
}

onMounted(() => {
  loadStories()
})
</script>

<style scoped>
.stories {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.story-card {
  background: #fff;
  margin: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.story-date {
  font-size: 12px;
  color: #999;
}

.story-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.story-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.story-author, .story-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

.story-cover {
  margin-top: 12px;
}
</style>