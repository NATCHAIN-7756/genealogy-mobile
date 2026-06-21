<template>
  <div class="postscript">
    <van-nav-bar title="后记" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>
    
    <div class="content-card">
      <h1 class="title">{{ postscript.title }}</h1>
      
      <div class="postscript-body">
        <p v-for="(para, index) in postscript.paragraphs" :key="index" class="paragraph">
          {{ para }}
        </p>
      </div>
      
      <div class="signature">
        <div class="author">{{ postscript.author }}</div>
        <div class="date">{{ postscript.date }}</div>
      </div>
    </div>
    
    <!-- 编辑模式 -->
    <van-popup v-model:show="editMode" position="bottom" round style="height: 80%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="编辑后记" />
        <van-field v-model="postscript.title" label="标题" placeholder="后记标题" />
        <van-field
          v-model="paragraphText"
          type="textarea"
          rows="10"
          label="内容"
          placeholder="每段用空行分隔"
        />
        <van-field v-model="postscript.author" label="署名" placeholder="编委会" />
        <van-field v-model="postscript.date" label="日期" placeholder="2026年6月" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="savePostscript">保存</van-button>
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
const activeTabbar = ref(1)
const editMode = ref(false)

const postscript = ref({
  title: '后记',
  paragraphs: [
    '历时三载，数易其稿，我张氏家谱终于付梓问世，实为家族一大盛事。',
    '此次修谱，承蒙族中长辈鼎力支持，族人踊跃参与，或提供史料，或口述往事，或慷慨捐助，使修谱工作得以顺利进行。在此，谨向所有关心支持修谱工作的族人致以诚挚谢意！',
    '由于年代久远，史料散佚，部分内容难免有疏漏错讹之处，恳请族人批评指正，以便日后续修时更正补充。',
    '家谱既成，非为尘封，而在传承。望我族人珍视此谱，续修勿替，使家族血脉永续，家风代代相传。',
    '是为后记。'
  ],
  author: '张氏族谱编委会',
  date: '2026年6月'
})

const paragraphText = computed({
  get: () => postscript.value.paragraphs.join('\n\n'),
  set: (val) => {
    postscript.value.paragraphs = val.split('\n\n').filter(p => p.trim())
  }
})

function back() {
  router.back()
}

function savePostscript() {
  localStorage.setItem(`family_${familyId}_postscript`, JSON.stringify(postscript.value))
  showToast('已保存')
  editMode.value = false
}

onMounted(() => {
  const saved = localStorage.getItem(`family_${familyId}_postscript`)
  if (saved) {
    postscript.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.postscript {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.content-card {
  background: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #667eea;
}

.postscript-body {
  font-size: 16px;
  line-height: 2;
  color: #333;
}

.paragraph {
  text-indent: 2em;
  margin-bottom: 16px;
}

.signature {
  margin-top: 32px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.author {
  margin-bottom: 8px;
}

.date {
  color: #999;
}
</style>