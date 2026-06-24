<template>
  <div class="tree-print">
    <van-nav-bar title="世系图" left-arrow @click-left="back">
      <template #right>
        <van-icon name="print" size="20" @click="printTree" />
      </template>
    </van-nav-bar>
    
    <van-loading v-if="loading" class="loading-center" />
    
    <template v-else>
      <!-- 控制面板 -->
      <van-cell-group inset style="margin: 12px" title="显示设置">
        <van-cell title="显示世代">
          <template #value>
            <van-stepper v-model="displayGenerations" min="3" max="10" />
          </template>
        </van-cell>
        <van-cell title="起始世代">
          <template #value>
            <van-dropdown-menu>
              <van-dropdown-item v-model="startGeneration" :options="generationOptions" />
            </van-dropdown-menu>
          </template>
        </van-cell>
        <van-cell title="显示配偶" value-class="switch-cell">
          <van-switch v-model="showSpouse" size="20" />
        </van-cell>
        <van-cell title="显示日期" value-class="switch-cell">
          <van-switch v-model="showDate" size="20" />
        </van-cell>
      </van-cell-group>
      
      <!-- 世系图预览 -->
      <div class="tree-preview" id="treeContent">
        <div class="tree-header">
          <h1>{{ familyName }}氏世系图</h1>
          <div class="tree-subtitle">第{{ startGeneration }}代 至 第{{ startGeneration + displayGenerations - 1 }}代</div>
        </div>
        
        <div class="tree-container">
          <div class="generation-row" v-for="gen in displayGenerationList" :key="gen.order">
            <div class="generation-label">第{{ gen.order }}代</div>
            <div class="members-row">
              <div 
                v-for="member in gen.members" 
                :key="member.id" 
                class="member-node"
                :class="{ 'is-ancestor': member.isAncestor }"
              >
                <div class="member-name">{{ member.name }}</div>
                <div v-if="showSpouse && member.spouse" class="member-spouse">{{ member.spouse }}</div>
                <div v-if="showDate && member.birth_date" class="member-dates">{{ member.birth_date?.slice(0,10) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tree-footer">
          <div>印刷日期：{{ printDate }}</div>
          <div>{{ familyName }}氏族谱编委会</div>
        </div>
      </div>
      
      <!-- 打印按钮 -->
      <div class="print-action">
        <van-button type="primary" block size="large" @click="printTree">
          <van-icon name="print" /> 打印世系图
        </van-button>
      </div>
    </template>
    
    <van-empty v-if="!loading && allMembers.length === 0" description="暂无成员数据" />
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { showToast } from "vant"
import { memberApi, familyApi } from "../api"
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const loading = ref(true)

const familyName = ref("")
const allMembers = ref([])
const displayGenerations = ref(5)
const startGeneration = ref(1)
const showSpouse = ref(true)
const showDate = ref(false)

const generationOptions = computed(() => {
  return Array.from({ length: 25 }, (_, i) => ({
    text: `第${i + 1}代`,
    value: i + 1
  }))
})

const displayGenerationList = computed(() => {
  const generations = []
  for (let i = startGeneration.value; i < startGeneration.value + displayGenerations.value; i++) {
    generations.push({
      order: i,
      members: allMembers.value.filter(m => m.generation === i)
    })
  }
  return generations
})

const printDate = computed(() => {
  return new Date().toLocaleDateString("zh-CN")
})

function back() {
  router.back()
}

function printTree() {
  window.print()
}

async function loadData() {
  loading.value = true
  try {
    const familyRes = await familyApi.get(familyId)
    familyName.value = familyRes.data.surname || familyRes.data.name?.charAt(0) || ""
    
    const memberRes = await memberApi.list(familyId)
    allMembers.value = memberRes.data
  } catch (e) {
    console.error("加载失败:", e)
    showToast("加载失败")
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.tree-print {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}

.tree-preview {
  background: #fff;
  margin: 12px;
  padding: 24px;
  border-radius: 8px;
}

.tree-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #333;
}

.tree-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.tree-subtitle {
  font-size: 14px;
  color: #666;
}

.tree-container {
  padding: 16px 0;
}

.generation-row {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.generation-label {
  width: 80px;
  font-size: 12px;
  color: #999;
  padding-top: 8px;
  flex-shrink: 0;
}

.members-row {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.member-node {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  text-align: center;
  min-width: 80px;
}

.member-node.is-ancestor {
  background: #fff3e0;
  border-color: #ff9800;
}

.member-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.member-spouse {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.member-dates {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}

.tree-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.tree-footer div {
  margin-bottom: 4px;
}

.print-action {
  margin: 16px;
}

@media print {
  .van-nav-bar,
  .van-cell-group,
  .print-action,
  .van-tabbar {
    display: none !important;
  }
  
  .tree-print {
    padding: 0;
  }
  
  .tree-preview {
    margin: 0;
    box-shadow: none;
  }
}
</style>
