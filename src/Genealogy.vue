<template>
  <div class="genealogy">
    <van-nav-bar :title="familyName" left-arrow @click-left="back">
      <template #right>
        <van-icon name="wap-nav" size="20" @click="showMenu = true" />
      </template>
    </van-nav-bar>
    
    <div class="cover">
      <div class="cover-inner">
        <div class="cover-title">{{ familyName }}家谱</div>
        <div class="cover-subtitle">传承家族记忆</div>
      </div>
    </div>
    
    <div class="catalog">
      <van-cell-group inset>
        <van-cell 
          v-for="(chapter, index) in chapters" 
          :key="index"
          :title="chapter.title"
          :label="chapter.desc"
          is-link
          @click="openChapter(chapter)"
        >
          <template #icon>
            <van-icon :name="chapter.icon" size="20" style="margin-right: 8px" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <van-popup v-model:show="showMenu" position="right" style="width: 60%; height: 100%">
      <van-cell-group title="快捷导航">
        <van-cell title="返回首页" is-link @click="goHome" />
        <van-cell title="查看树图" is-link @click="goTree" />
        <van-cell title="图书资料" is-link @click="goBooks" />
      </van-cell-group>
    </van-popup>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { familyApi } from '../api'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const familyName = ref('家族')
const activeTabbar = ref(1)
const showMenu = ref(false)

const chapters = ref([
  { id: 'overview', title: '家族概述', desc: '家族基本信息', icon: 'info-o' },
  { id: 'contemporary', title: '当代族人', desc: '在世家庭列表', icon: 'friends-o', route: `/family/${familyId}/contemporary` },
  { id: 'generations', title: '世系目录', desc: '按世代浏览', icon: 'bars' },
  { id: 'members', title: '家族成员', desc: '全部成员列表', icon: 'user-o' },
  { id: 'stories', title: '家族故事', desc: '家族历史故事', icon: 'edit' },
  { id: 'photos', title: '家族相册', desc: '珍贵照片集', icon: 'photo-o' },
  { id: 'events', title: '大事记', desc: '重要事件记录', icon: 'clock-o' }
])

function back() { router.back() }
function goHome() { showMenu.value = false; router.push('/') }
function goTree() { showMenu.value = false; router.push(`/tree/${familyId}`) }
function goBooks() { showMenu.value = false; router.push('/books') }

function openChapter(chapter) {
  if (chapter.route) {
    router.push(chapter.route)
  } else {
    showToast('章节: ' + chapter.title)
  }
}

async function loadFamily() {
  try {
    const res = await familyApi.get(familyId)
    familyName.value = res.data.name
  } catch (e) {
    showToast('加载失败')
  }
}

onMounted(() => { loadFamily() })
</script>

<style scoped>
.genealogy { min-height: 100vh; background: #f5f5f5; padding-bottom: 50px; }
.cover { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; color: #fff; }
.cover-inner { text-align: center; }
.cover-title { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
.cover-subtitle { font-size: 14px; opacity: 0.9; }
.catalog { margin-top: -20px; padding: 0 12px; }
</style>