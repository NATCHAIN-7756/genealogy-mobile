<template>
  <div class="generations">
    <van-nav-bar title="世系目录" left-arrow @click-left="back" />
    
    <van-search v-model="searchText" placeholder="搜索世代或成员" />
    
    <!-- 统计概览 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalGenerations }}</div>
        <div class="stat-label">世代</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalMembers }}</div>
        <div class="stat-label">总人数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.currentGeneration }}</div>
        <div class="stat-label">当代</div>
      </div>
    </div>
    
    <!-- 世代列表 -->
    <van-cell-group inset style="margin: 12px">
      <van-cell 
        v-for="gen in filteredGenerations"
        :key="gen.order"
        is-link
        @click="goGeneration(gen)"
      >
        <template #title>
          <div class="gen-title">
            <span class="gen-order">第{{ gen.order }}代</span>
            <van-tag v-if="gen.isAncestor" type="warning" size="small">始迁祖</van-tag>
            <van-tag v-if="gen.isCurrent" type="success" size="small">当代</van-tag>
          </div>
        </template>
        <template #label>
          <div class="gen-info">
            <span>{{ gen.memberCount }}人</span>
            <span v-if="gen.timeRange">{{ gen.timeRange }}</span>
            <span v-if="gen.branches">{{ gen.branches }}</span>
          </div>
        </template>
        <template #icon>
          <div class="gen-icon" :class="{ 'ancestor': gen.isAncestor, 'current': gen.isCurrent }">
            {{ gen.order }}
          </div>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="generations.length === 0" description="暂无世系数据" />
    
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
import { memberApi } from '../api'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const searchText = ref('')
const activeTabbar = ref(1)

const stats = ref({
  totalGenerations: 0,
  totalMembers: 0,
  currentGeneration: 0
})

const generations = ref([])

const filteredGenerations = computed(() => {
  if (!searchText.value) return generations.value
  return generations.value.filter(g => 
    `第${g.order}代`.includes(searchText.value) ||
    g.branches?.includes(searchText.value)
  )
})

function back() {
  router.back()
}

function goGeneration(gen) {
  router.push(`/family/${familyId}/generation/${gen.order}`)
}

async function loadGenerations() {
  try {
    const res = await memberApi.list(familyId)
    const members = res.data
    
    // 按世代分组统计
    const genMap = new Map()
    members.forEach(m => {
      const gen = m.generation || 1
      if (!genMap.has(gen)) {
        genMap.set(gen, [])
      }
      genMap.get(gen).push(m)
    })
    
    // 生成世代列表
    const genList = []
    genMap.forEach((members, order) => {
      genList.push({
        order,
        memberCount: members.length,
        timeRange: getTimeRange(members),
        branches: getBranches(members),
        isAncestor: order === 1,
        isCurrent: order === Math.max(...genMap.keys())
      })
    })
    
    // 按世代排序
    generations.value = genList.sort((a, b) => a.order - b.order)
    
    // 统计信息
    stats.value.totalGenerations = genMap.size
    stats.value.totalMembers = members.length
    stats.value.currentGeneration = Math.max(...genMap.keys())
    
  } catch (e) {
    showToast('加载失败')
    // 模拟数据
    generations.value = [
      { order: 1, memberCount: 1, timeRange: '明洪武年间', branches: '始迁祖', isAncestor: true, isCurrent: false },
      { order: 2, memberCount: 3, timeRange: '明永乐年间', branches: '三房分支', isAncestor: false, isCurrent: false },
      { order: 3, memberCount: 8, timeRange: '明正统年间', branches: '长房3人·二房3人·三房2人', isAncestor: false, isCurrent: false },
      { order: 15, memberCount: 86, timeRange: '1960-1990年', branches: '长房30人·二房35人·三房21人', isAncestor: false, isCurrent: true }
    ]
    stats.value = { totalGenerations: 15, totalMembers: 520, currentGeneration: 15 }
  }
}

function getTimeRange(members) {
  // 根据出生日期估算时间范围
  const dates = members.map(m => m.birth_date).filter(Boolean)
  if (dates.length === 0) return ''
  const years = dates.map(d => parseInt(d.split('-')[0]))
  return `${Math.min(...years)}-${Math.max(...years)}年`
}

function getBranches(members) {
  // 统计房系
  const branches = new Set(members.map(m => m.branch).filter(Boolean))
  if (branches.size === 0) return ''
  return `${branches.size}房分支`
}

onMounted(() => {
  loadGenerations()
})
</script>

<style scoped>
.generations {
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

.gen-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gen-order {
  font-size: 16px;
  font-weight: 500;
}

.gen-info {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.gen-icon {
  width: 36px;
  height: 36px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  margin-right: 12px;
}

.gen-icon.ancestor {
  background: #ff9800;
  color: #fff;
}

.gen-icon.current {
  background: #4caf50;
  color: #fff;
}
</style>