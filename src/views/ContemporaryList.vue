<template>
  <div class="contemporary">
    <van-nav-bar title="当代族人" left-arrow @click-left="back" />
    
    <van-search v-model="searchText" placeholder="搜索家庭或成员" />
    
    <van-cell-group inset style="margin: 12px" title="家庭列表">
      <van-cell 
        v-for="family in filteredFamilies"
        :key="family.id"
        is-link
        @click="goFamilyDetail(family)"
      >
        <template #title>
          <div class="family-name">{{ family.name }}</div>
        </template>
        <template #label>
          <div class="family-info">
            <span>第{{ family.generation || '?' }}代</span>
            <span>{{ family.member_count || 0 }}人</span>
            <span v-if="family.address">{{ family.address }}</span>
          </div>
        </template>
        <template #icon>
          <van-icon name="home-o" size="24" style="margin-right: 12px; color: #1989fa" />
        </template>
        <template #value>
          <van-tag type="primary">{{ family.member_count || 0 }}</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="families.length === 0" description="暂无家庭数据" />
    
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
import { familyApi } from '../api'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const searchText = ref('')
const activeTabbar = ref(1)

const families = ref([])

const filteredFamilies = computed(() => {
  if (!searchText.value) return families.value
  return families.value.filter(f => 
    f.name.includes(searchText.value) || 
    (f.address && f.address.includes(searchText.value))
  )
})

function back() {
  router.back()
}

function goFamilyDetail(family) {
  router.push(`/family/${familyId}/contemporary/${family.id}`)
}

async function loadFamilies() {
  try {
    // 模拟家庭数据（后续对接真实API）
    const res = await familyApi.get(familyId)
    // 暂时用模拟数据
    families.value = [
      { id: 1, name: '张三家庭', generation: 15, member_count: 4, address: '北京' },
      { id: 2, name: '李四家庭', generation: 15, member_count: 3, address: '上海' },
      { id: 3, name: '王五家庭', generation: 16, member_count: 5, address: '深圳' }
    ]
  } catch (e) {
    showToast('加载失败')
  }
}

onMounted(() => {
  loadFamilies()
})
</script>

<style scoped>
.contemporary {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.family-name {
  font-size: 16px;
  font-weight: 500;
}

.family-info {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>