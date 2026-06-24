<template>
  <div class="generation-detail">
    <van-nav-bar :title="`第${generationOrder}代`" left-arrow @click-left="back" />
    
    <!-- 世代信息 -->
    <van-cell-group inset style="margin: 12px" title="世代信息">
      <van-cell title="世代" :value="`第${generationOrder}代`" />
      <van-cell title="人数" :value="`${members.length}人`" />
      <van-cell title="时间范围" :value="generationInfo.timeRange || '未知'" />
      <van-cell title="分支情况" :value="generationInfo.branches || '未分类'" />
    </van-cell-group>
    
    <!-- 筛选 -->
    <van-search v-model="searchText" placeholder="搜索成员姓名" />
    
    <!-- 房系筛选 -->
    <div class="filter-tabs" v-if="branches.length > 0">
      <van-tag 
        v-for="branch in branches" 
        :key="branch"
        :type="selectedBranch === branch ? 'primary' : 'default'"
        size="medium"
        @click="toggleBranch(branch)"
        style="margin: 4px"
      >
        {{ branch }}（{{ branchCounts[branch] || 0 }}人）
      </van-tag>
    </div>
    
    <!-- 成员列表 -->
    <van-cell-group inset style="margin: 12px" title="成员列表">
      <van-cell 
        v-for="member in filteredMembers"
        :key="member.id"
        is-link
        @click="goMemberCard(member)"
      >
        <template #title>
          <div class="member-name">
            {{ member.name }}
            <van-tag v-if="member.gender" size="small" :type="member.gender === '男' ? 'primary' : 'danger'">
              {{ member.gender }}
            </van-tag>
            <van-tag v-if="member.branch" size="small" type="warning">
              {{ member.branch }}
            </van-tag>
          </div>
        </template>
        <template #label>
          <div class="member-info">
            <span v-if="member.birth_date">{{ member.birth_date }}</span>
            <span v-if="member.birth_place">{{ member.birth_place }}</span>
            <span v-if="member.is_deceased" style="color: #999">已故</span>
          </div>
        </template>
        <template #icon>
          <van-image 
            round 
            width="40" 
            height="40" 
            style="margin-right: 12px; background: #e8f3ff; display: flex; align-items: center; justify-content: center;"
          >
            <span style="font-size: 16px; color: #1989fa">{{ member.name?.charAt(0) }}</span>
          </van-image>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="members.length === 0" description="暂无成员数据" />
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { memberApi } from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const generationOrder = parseInt(route.params.order)
const searchText = ref('')
const selectedBranch = ref('')
const activeTabbar = ref(1)

const generationInfo = ref({
  timeRange: '',
  branches: ''
})

const members = ref([])
const branches = ref([])
const branchCounts = ref({})

const filteredMembers = computed(() => {
  let result = members.value
  
  // 搜索过滤
  if (searchText.value) {
    result = result.filter(m => m.name.includes(searchText.value))
  }
  
  // 房系过滤
  if (selectedBranch.value) {
    result = result.filter(m => m.branch === selectedBranch.value)
  }
  
  return result
})

function back() {
  router.back()
}

function goMemberCard(member) {
  router.push(`/family/${familyId}/member/${member.id}/card`)
}

function toggleBranch(branch) {
  if (selectedBranch.value === branch) {
    selectedBranch.value = ''
  } else {
    selectedBranch.value = branch
  }
}

async function loadGenerationMembers() {
  try {
    const res = await memberApi.list(familyId)
    // 过滤该世代成员
    const genMembers = res.data.filter(m => m.generation === generationOrder)
    
    members.value = genMembers
    
    // 统计房系
    const branchSet = new Set()
    const counts = {}
    genMembers.forEach(m => {
      if (m.branch) {
        branchSet.add(m.branch)
        counts[m.branch] = (counts[m.branch] || 0) + 1
      }
    })
    
    branches.value = Array.from(branchSet)
    branchCounts.value = counts
    
    // 时间范围
    const dates = genMembers.map(m => m.birth_date).filter(Boolean)
    if (dates.length > 0) {
      const years = dates.map(d => parseInt(d.split('-')[0]))
      generationInfo.value.timeRange = `${Math.min(...years)}-${Math.max(...years)}年`
    }
    
  } catch (e) {
    showToast("加载失败")
    branches.value = []
    branchCounts.value = {}
    generationInfo.value = {}
  }
}
onMounted(() => {
  loadGenerationMembers()
})
</script>

<style scoped>
.generation-detail {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.filter-tabs {
  padding: 12px;
  background: #fff;
  margin: 0 12px;
  border-radius: 8px;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-info {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>