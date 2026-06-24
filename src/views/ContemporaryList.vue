<template>
  <div class="contemporary">
    <van-nav-bar title="当代族人" left-arrow @click-left="back" />
    
    <van-search v-model="searchText" placeholder="搜索家庭或成员" />
    
    <van-cell-group inset style="margin: 12px" title="家庭列表">
      <!-- 我的家庭（高亮显示） -->
      <van-cell 
        v-if="myFamily" 
        is-link 
        @click="goFamilyDetail(myFamily.id)"
        class="my-family-cell"
      >
        <template #icon>
          <van-icon name="home-o" size="24" style="margin-right: 12px; color: #07c160" />
        </template>
        <template #title>
          <div class="family-name">{{ myFamily.name }}</div>
        </template>
        <template #label>
          <div class="family-info">
            <span>{{ myFamily.member_count || 0 }}人</span>
            <span v-if="myFamily.address">{{ myFamily.address }}</span>
          </div>
        </template>
        <template #value>
          <van-tag type="success">我的家庭</van-tag>
        </template>
      </van-cell>
      
      <!-- 其他家庭 -->
      <van-cell 
        v-for="family in otherFamilies" 
        :key="family.id" 
        is-link 
        @click="goFamilyDetail(family.id)"
      >
        <template #icon>
          <van-icon name="home-o" size="24" style="margin-right: 12px; color: #1989fa" />
        </template>
        <template #title>
          <div class="family-name">{{ family.name }}</div>
        </template>
        <template #label>
          <div class="family-info">
            <span>{{ family.member_count || 0 }}人</span>
            <span v-if="family.address">{{ family.address }}</span>
          </div>
        </template>
        <template #value>
          <van-tag type="primary">{{ family.member_count || 0 }}</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="families.length === 0 && !myFamily" description="暂无家庭数据" />
    
    <AppTabbar />
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
const searchText = ref('')
const activeTabbar = ref(1)

const token = localStorage.getItem('token')
const user = ref({})
const families = ref([])
const myFamily = ref(null)

const filteredFamilies = computed(() => {
  if (!searchText.value) return families.value
  return families.value.filter(f => 
    f.name.includes(searchText.value) || 
    (f.address && f.address.includes(searchText.value))
  )
})

// 其他家庭（排除我的家庭）
const otherFamilies = computed(() => {
  return filteredFamilies.value.filter(f => !f.is_my_family)
})

function back() {
  router.back()
}

function goFamilyDetail(householdId) {
  router.push(`/family/${familyId}/contemporary/${householdId}`)
}

async function loadUser() {
  try {
    const res = await api.get('/...')
    user.value = res.data
  } catch (e) {
    console.error('加载用户失败:', e)
  }
}

async function loadFamilies() {
  try {
    // 获取所有成员
    const res = await api.get('/...')
    const allMembers = res.data || []
    
    // 按 household_id 分组
    const householdsDict = {}
    const myHouseholdId = null
    
    allMembers.forEach(m => {
      const hid = m.household_id || m.id
      if (!householdsDict[hid]) {
        householdsDict[hid] = {
          id: hid,
          name: m.name + '家庭',
          address: m.birth_place,
          member_count: 0,
          is_my_family: false,
          members: []
        }
      }
      householdsDict[hid].members.push(m)
      householdsDict[hid].member_count++
      
      // 检查是否是当前用户的家庭
      if (m.user_id === user.value?.id) {
        householdsDict[hid].is_my_family = true
      }
    })
    
    // 转换为数组
    const householdsList = Object.values(householdsDict)
    
    // 找到我的家庭
    myFamily.value = householdsList.find(f => f.is_my_family)
    
    // 其他家庭
    families.value = householdsList.filter(f => !f.is_my_family)
    
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

onMounted(async () => {
  await loadUser()
  await loadFamilies()
})
</script>

<style scoped>
.contemporary {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.my-family-cell {
  background: #f0fff0;
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
