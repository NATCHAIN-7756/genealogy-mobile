<template>
  <div class="story-detail">
    <van-nav-bar :title="story.title" left-arrow @click-left="back">
      <template #right>
        <van-icon name="share-o" size="20" @click="shareStory" />
      </template>
    </van-nav-bar>
    
    <!-- 文章头部 -->
    <div class="story-header">
      <van-tag :type="getCategoryType(story.category)" size="medium">
        {{ getCategoryLabel(story.category) }}
      </van-tag>
      <h1 class="story-title">{{ story.title }}</h1>
      <div class="story-meta">
        <span>
          <van-icon name="user-o" size="14" />
          {{ story.author }}
        </span>
        <span>{{ story.date }}</span>
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
    
    <!-- 关联人物 -->
    <van-cell-group v-if="story.members && story.members.length > 0" inset style="margin: 12px" title="关联人物">
      <van-cell 
        v-for="member in story.members" 
        :key="member.id"
        :title="member.name"
        is-link
        @click="goMember(member)"
      >
        <template #label>
          <span>{{ member.relation }}</span>
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 互动区域 -->
    <div class="interaction-bar">
      <van-button plain size="small" @click="likeStory">
        <van-icon :name="isLiked ? 'like' : 'like-o'" :color="isLiked ? '#f44' : ''" />
        {{ story.likes || 0 }}
      </van-button>
      <van-button plain size="small" @click="showComments = true">
        <van-icon name="comment-o" />
        {{ story.comments || 0 }}
      </van-button>
      <van-button plain size="small" @click="collectStory">
        <van-icon :name="isCollected ? 'star' : 'star-o'" :color="isCollected ? '#ff9800' : ''" />
        收藏
      </van-button>
    </div>
    
    <!-- 评论弹窗 -->
    <van-popup v-model:show="showComments" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="评论区" />
        <div v-if="comments.length > 0" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-author">{{ comment.author }}</div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-time">{{ comment.time }}</div>
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
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'

const router = useRouter()
const route = useRoute()
const storyId = route.params.storyId

const activeTabbar = ref(1)
const showComments = ref(false)
const isLiked = ref(false)
const isCollected = ref(false)
const newComment = ref('')

const story = ref({
  id: 1,
  title: '张三公迁居济南记',
  category: 'origin',
  author: '族委会',
  date: '2026-01-15',
  content: `<p>明洪武二年（1369年），始迁祖张三公响应朝廷号召，携家眷由山西洪洞县大槐树迁至济南，开启了我族在山东的繁衍历史。</p>
<p>据族谱记载，张三公原籍山西平阳府洪洞县，家有良田百亩，生活殷实。当时朝廷下令移民实京师，张三公虽不舍故土，但念及君命难违，遂携妻子老小，踏上了东迁之路。</p>
<p>一路上风餐露宿，历经艰辛。三公常告诫子孙："吾辈虽离故土，然张氏家风不可忘。勤俭持家，诗书传世，方为立身之本。"</p>
<p>至济南后，三公择地而居，勤恳耕作，渐成家业。其子孙繁衍，枝繁叶茂，至今已传二十五代，族人遍布全国各地。</p>`,
  photos: [],
  members: [
    { id: 1, name: '张三公', relation: '始迁祖' }
  ],
  views: 520,
  likes: 86,
  comments: 12
})

const comments = ref([
  { id: 1, author: '张明', content: '原来我们家族有这么悠久的历史！', time: '2026-01-16' },
  { id: 2, author: '李四', content: '感谢族委会整理这些珍贵史料', time: '2026-01-17' }
])

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

function goMember(member) {
  router.push(`/family/${route.params.id}/member/${member.id}/card`)
}

function shareStory() {
  showToast('分享功能开发中')
}

function likeStory() {
  isLiked.value = !isLiked.value
  if (isLiked.value) {
    story.value.likes++
    showToast('已点赞')
  } else {
    story.value.likes--
  }
}

function collectStory() {
  isCollected.value = !isCollected.value
  showToast(isCollected.value ? '已收藏' : '已取消收藏')
}

function previewPhoto(index) {
  showImagePreview({ images: story.value.photos, startPosition: index })
}

function submitComment() {
  if (!newComment.value.trim()) {
    showToast('请输入评论内容')
    return
  }
  comments.value.unshift({
    id: Date.now(),
    author: '我',
    content: newComment.value,
    time: '刚刚'
  })
  story.value.comments++
  newComment.value = ''
  showToast('评论成功')
}

onMounted(() => {
  // TODO: 加载故事详情
})
</script>

<style scoped>
.story-detail {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
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