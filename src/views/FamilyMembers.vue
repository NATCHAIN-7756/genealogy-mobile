<template>
  <div class="family-members">
    <van-nav-bar title="家族成员" left-arrow @click-left="back">
      <template #right>
        <van-icon name="filter-o" size="20" @click="showFilter = true" />
      </template>
    </van-nav-bar>
    
    <!-- 搜索 -->
    <van-search v-model="searchText" placeholder="搜索姓名、籍贯" @search="onSearch" />
    
    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ members.length }}</div>
        <div class="stat-label">总人数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ livingCount }}</div>
        <div class="stat-label">在世</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ deceasedCount }}</div>
        <div class="stat-label">已故</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ generationCount }}</div>
        <div class="stat-label">世代</div>
      </div>
    </div>
    
    <!-- 筛选标签 -->
    <div class="filter-tags" v-if="hasFilters">
      <van-tag v-if="filters.generation" type="primary" closeable @close="filters.generation = null">
        第{{ filters.generation }}代
      </van-tag>
      <van-tag v-if="filters.gender" type="primary" closeable @close="filters.gender = null">
        {{ filters.gender }}
      </van-tag>
      <van-tag v-if="filters.branch" type="warning" closeable @close="filters.branch = null">
        {{ filters.branch }}
      </van-tag>
      <van-tag v-if="filters.status" :type="filters.status === '在世' ? 'success' : 'default'" closeable @close="filters.status = null">
        {{ filters.status }}
      </van-tag>
      <van-button size="small" plain @click="clearFilters">清除全部</van-button>
    </div>
    
    <!-- 成员列表 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadMembers"
    >
      <van-cell-group inset style="margin: 12px">
        <van-cell 
          v-for="member in filteredMembers"
          :key="member.id"
          is-link
          @click="goMemberCard(member)"
        >
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
          <template #title>
            <div class="member-title">
              <span class="member-name">{{ member.name }}</span>
              <van-tag v-if="member.gender" size="small" :type="member.gender === '男' ? 'primary' : 'danger'">
                {{ member.gender }}
              </van-tag>
              <van-tag v-if="member.generation" size="small" type="success">
                第{{ member.generation }}代
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
              <span v-if="member.is_deceased" class="deceased-tag">已故</span>
            </div>
          </template>
          <template #value>
            <van-icon v-if="member.is_deceased" name="star-o" color="#999" />
          </template>
        </van-cell>
      </van-cell-group>
    </van-list>
    
    <van-empty v-if="!loading && filteredMembers.length === 0" description="暂无符合条件的成员" />
    
    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilter" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="筛选条件" />
        
        <van-cell title="世代">
          <template #value>
            <van-dropdown-menu>
              <van-dropdown-item v-model="filters.generation" :options="generationOptions" />
            </van-dropdown-menu>
          </template>
        </van-cell>
        
        <van-cell title="性别">
          <template #value>
            <van-radio-group v-model="filters.gender" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="男">男</van-radio>
              <van-radio name="女">女</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        
        <van-cell title="房系">
          <template #value>
            <van-dropdown-menu>
              <van-dropdown-item v-model="filters.branch" :options="branchOptions" />
            </van-dropdown-menu>
          </template>
        </van-cell>
        
        <van-cell title="状态">
          <template #value>
            <van-radio-group v-model="filters.status" direction="horizontal">
              <van-radio name="">全部</van-radio>
              <van-radio name="在世">在世</van-radio>
              <van-radio name="已故">已故</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        
        <div style="padding: 16px; display: flex; gap: 8px">
          <van-button block @click="showFilter = false">取消</van-button>
          <van-button type="primary" block @click="applyFilters">应用</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
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

const searchText = ref('')
const loading = ref(false)
const finished = ref(false)
const showFilter = ref(false)
const activeTabbar = ref(1)

const members = ref([])
const allMembers = ref([])

const filters = ref({
  generation: null,
  gender: '',
  branch: '',
  status: ''
})

const generationOptions = ref([])
const branchOptions = ref([])

// 统计计算
const livingCount = computed(() => members.value.filter(m => !m.is_deceased).length)
const deceasedCount = computed(() => members.value.filter(m => m.is_deceased).length)
const generationCount = computed(() => {
  const gens = new Set(members.value.map(m => m.generation).filter(Boolean))
  return gens.size
})

const hasFilters = computed(() => {
  return filters.value.generation || filters.value.gender || filters.value.branch || filters.value.status
})

const filteredMembers = computed(() => {
  let result = members.value
  
  // 搜索过滤
  if (searchText.value) {
    result = result.filter(m => 
      m.name.includes(searchText.value) || 
      (m.birth_place && m.birth_place.includes(searchText.value))
    )
  }
  
  // 世代过滤
  if (filters.value.generation) {
    result = result.filter(m => m.generation === filters.value.generation)
  }
  
  // 性别过滤
  if (filters.value.gender) {
    result = result.filter(m => m.gender === filters.value.gender)
  }
  
  // 房系过滤
  if (filters.value.branch) {
    result = result.filter(m => m.branch === filters.value.branch)
  }
  
  // 状态过滤
  if (filters.value.status === '在世') {
    result = result.filter(m => !m.is_deceased)
  } else if (filters.value.status === '已故') {
    result = result.filter(m => m.is_deceased)
  }
  
  return result
})

function back() {
  router.back()
}

function onSearch() {
  // 触发搜索
}

function goMemberCard(member) {
  router.push(`/family/${familyId}/member/${member.id}/card`)
}

function clearFilters() {
  filters.value = {
    generation: null,
    gender: '',
    branch: '',
    status: ''
  }
}

function applyFilters() {
  showFilter.value = false
}

async function loadMembers() {
  try {
    const res = await memberApi.list(familyId)
    allMembers.value = res.data
    members.value = res.data
    finished.value = true
    
    // 生成筛选选项
    const gens = new Set(res.data.map(m => m.generation).filter(Boolean))
    generationOptions.value = [
      { text: '全部', value: null },
      ...Array.from(gens).sort((a, b) => a - b).map(g => ({ text: `第${g}代`, value: g }))
    ]
    
    const branches = new Set(res.data.map(m => m.branch).filter(Boolean))
    branchOptions.value = [
      { text: '全部', value: '' },
      ...Array.from(branches).map(b => ({ text: b, value: b }))
    ]
  } catch (e) {
    showToast('加载失败')
    allMembers.value = []
    finished.value = true
    
    generationOptions.value = [
      { text: '全部', value: null },
      { text: '第14代', value: 14 },
      { text: '第15代', value: 15 }
    ]
    
    branchOptions.value = [
      { text: '全部', value: '' },
      { text: '长房', value: '长房' },
      { text: '二房', value: '二房' },
      { text: '三房', value: '三房' }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.family-members {
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

.filter-tags {
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.member-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-size: 16px;
  font-weight: 500;
}

.member-info {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.deceased-tag {
  color: #999;
  font-style: italic;
}
</style>