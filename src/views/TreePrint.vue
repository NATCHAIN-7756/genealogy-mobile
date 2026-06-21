<template>
  <div class="tree-print">
    <van-nav-bar title="世系图" left-arrow @click-left="back">
      <template #right>
        <van-icon name="print" size="20" @click="printTree" />
      </template>
    </van-nav-bar>
    
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
              <div v-if="showDate && member.dates" class="member-dates">{{ member.dates }}</div>
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

const familyName = ref('张')
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
  // 模拟数据
  const generations = []
  for (let i = startGeneration.value; i < startGeneration.value + displayGenerations.value; i++) {
    generations.push({
      order: i,
      members: getMembersByGeneration(i)
    })
  }
  return generations
})

const printDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN')
})

function getMembersByGeneration(gen) {
  // 模拟数据
  const mockData = {
    1: [{ id: 1, name: '张三公', spouse: '李氏', dates: '1320-1390', isAncestor: true }],
    2: [
      { id: 2, name: '张大公', spouse: '王氏', dates: '1345-1420' },
      { id: 3, name: '张二公', spouse: '赵氏', dates: '1348-1425' },
      { id: 4, name: '张三公', spouse: '钱氏', dates: '1350-1430' }
    ],
    3: [
      { id: 5, name: '张某某', spouse: '孙氏', dates: '1370-1440' },
      { id: 6, name: '张某某', spouse: '周氏', dates: '1372-1445' },
      { id: 7, name: '张某某', spouse: '吴氏', dates: '1375-1450' },
      { id: 8, name: '张某某', spouse: '郑氏', dates: '1378-1455' }
    ]
  }
  
  return mockData[gen] || [{ id: gen * 10, name: '待补充', spouse: '', dates: '' }]
}

function back() {
  router.back()
}

function printTree() {
  window.print()
}

onMounted(() => {
  // TODO: 加载家族名称
})
</script>

<style scoped>
.tree-print {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
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

/* 打印样式 */
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