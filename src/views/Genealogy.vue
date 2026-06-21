<template>
  <div class="genealogy">
    <van-nav-bar :title="familyName" left-arrow @click-left="back">
      <template #right>
        <van-icon name="search" size="20" @click="showSearch = true" style="margin-right: 12px" />
        <van-icon name="wap-nav" size="20" @click="showMenu = true" />
      </template>
    </van-nav-bar>
    
    <!-- 搜索弹窗 -->
    <van-popup v-model:show="showSearch" position="top" style="height: 100%">
      <van-search v-model="searchKeyword" placeholder="搜索成员、故事、大事记..." show-action @search="onSearch" @cancel="showSearch = false">
        <template #action>
          <div @click="showSearch = false">取消</div>
        </template>
      </van-search>
      
      <div class="search-result" v-if="searchKeyword">
        <van-tabs v-model:active="searchTab">
          <van-tab title="成员">
            <van-cell-group inset>
              <van-cell v-for="member in searchResults.members" :key="member.id" :title="member.name" :label="member.generation" is-link @click="goMember(member.id)">
                <template #icon>
                  <van-icon name="user-o" size="20" style="margin-right: 8px" />
                </template>
              </van-cell>
              <van-empty v-if="searchResults.members.length === 0" description="未找到成员" />
            </van-cell-group>
          </van-tab>
          <van-tab title="故事">
            <van-cell-group inset>
              <van-cell v-for="story in searchResults.stories" :key="story.id" :title="story.title" :label="story.author" is-link @click="goStory(story.id)">
                <template #icon>
                  <van-icon name="comment-o" size="20" style="margin-right: 8px" />
                </template>
              </van-cell>
              <van-empty v-if="searchResults.stories.length === 0" description="未找到故事" />
            </van-cell-group>
          </van-tab>
          <van-tab title="大事记">
            <van-cell-group inset>
              <van-cell v-for="event in searchResults.events" :key="event.id" :title="event.title" :label="event.date" is-link @click="goEvent(event.id)">
                <template #icon>
                  <van-icon name="clock-o" size="20" style="margin-right: 8px" />
                </template>
              </van-cell>
              <van-empty v-if="searchResults.events.length === 0" description="未找到大事记" />
            </van-cell-group>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>
    
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
  { id: 'about', title: '关于电子家谱', desc: '功能介绍与使用指南', icon: 'question-o', route: `/family/${familyId}/about` },
  { id: 'preface', title: '序言', desc: '编委会致辞', icon: 'bookmark-o', route: `/family/${familyId}/preface` },
  { id: 'legend', title: '凡例', desc: '编纂规则说明', icon: 'description', route: `/family/${familyId}/legend` },
  { id: 'overview', title: '家族概述', desc: '家族基本信息', icon: 'info-o', route: `/family/${familyId}/overview` },
  { id: 'contemporary', title: '当代族人', desc: '在世家庭列表', icon: 'friends-o', route: `/family/${familyId}/contemporary` },
  { id: 'generations', title: '世系目录', desc: '按世代浏览', icon: 'bars', route: `/family/${familyId}/generations` },
  { id: 'members', title: '家族成员', desc: '全部成员列表', icon: 'user-o', route: `/family/${familyId}/members` },
  { id: 'stories', title: '家族故事', desc: '家族历史故事', icon: 'edit', route: `/family/${familyId}/stories` },
  { id: 'photos', title: '家族相册', desc: '珍贵照片集', icon: 'photo-o', route: `/family/${familyId}/photos` },
  { id: 'events', title: '大事记', desc: '重要事件记录', icon: 'clock-o', route: `/family/${familyId}/events` },
  { id: 'generation-table', title: '字辈排行', desc: '字辈对照表', icon: 'orders-o', route: `/family/${familyId}/generation-table` },
  { id: 'tree-print', title: '世系图', desc: '可打印世系图', icon: 'cluster-o', route: `/family/${familyId}/tree-print` },
  { id: 'sponsors', title: '赞助名录', desc: '捐助致谢', icon: 'balance-list-o', route: `/family/${familyId}/sponsors` },
  { id: 'postscript', title: '后记', desc: '编后语', icon: 'edit', route: `/family/${familyId}/postscript` },
  { id: 'export', title: '印刷成册', desc: 'PDF导出', icon: 'printer', route: `/family/${familyId}/export` }
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