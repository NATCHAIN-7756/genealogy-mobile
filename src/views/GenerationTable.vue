<template>
  <div class="generation-table">
    <van-nav-bar title="字辈排行表" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>
    
    <!-- 字辈说明 -->
    <van-cell-group inset style="margin: 12px" title="字辈说明">
      <van-cell :label="desc">
        <template #title>
          <div class="generation-desc">
            {{ desc || '字辈，又称派语、行第，是家族用于区分世代的排行用语，族人取名时需按字辈取字，以明长幼、别昭穆。' }}
          </div>
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 字辈表 -->
    <van-cell-group inset style="margin: 12px" title="字辈排行">
      <div class="table-wrapper">
        <table class="generation-table-content">
          <thead>
            <tr>
              <th>世代</th>
              <th>字辈</th>
              <th v-if="editMode">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(char, index) in generations" :key="index">
              <td class="gen-num">第{{ index + 1 }}代</td>
              <td class="gen-char">{{ char }}</td>
              <td v-if="editMode">
                <van-button size="mini" plain @click="editChar(index)">编辑</van-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </van-cell-group>
    
    <!-- 使用示例 -->
    <van-cell-group inset style="margin: 12px" title="使用示例">
      <div class="example-list">
        <div class="example-item">
          <span class="example-gen">第15代</span>
          <span class="example-char">{{ generations[14] || '明' }}</span>
          <span class="example-name">→ 张{{ generations[14] || '明' }}华</span>
        </div>
        <div class="example-item">
          <span class="example-gen">第16代</span>
          <span class="example-char">{{ generations[15] || '德' }}</span>
          <span class="example-name">→ 张{{ generations[15] || '德' }}强</span>
        </div>
        <div class="example-item">
          <span class="example-gen">第17代</span>
          <span class="example-char">{{ generations[16] || '传' }}</span>
          <span class="example-name">→ 张{{ generations[16] || '传' }}伟</span>
        </div>
      </div>
    </van-cell-group>
    
    <!-- 编辑弹窗 -->
    <van-popup v-model:show="editMode" position="bottom" round style="height: 70%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="编辑字辈表" />
        <van-field
          v-model="generationText"
          type="textarea"
          rows="8"
          label="字辈"
          placeholder="每行一个字辈，如：&#10;大&#10;德&#10;传&#10;家..."
        />
        <van-field v-model="desc" type="textarea" rows="3" label="说明" placeholder="字辈说明" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="saveGenerations">保存</van-button>
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

const generations = ref([
  '三', '大', '明', '清', '传',
  '家', '立', '业', '光', '宗',
  '耀', '祖', '德', '泽', '明',
  '德', '传', '家', '永', '昌',
  '盛', '兴', '隆', '福', '寿'
])

const desc = ref('')

const generationText = computed({
  get: () => generations.value.join('\n'),
  set: (val) => {
    generations.value = val.split('\n').filter(c => c.trim())
  }
})

function back() {
  router.back()
}

function editChar(index) {
  const newChar = prompt('请输入字辈', generations.value[index])
  if (newChar) {
    generations.value[index] = newChar
  }
}

function saveGenerations() {
  localStorage.setItem(`family_${familyId}_generations`, JSON.stringify(generations.value))
  localStorage.setItem(`family_${familyId}_gen_desc`, desc.value)
  showToast('已保存')
  editMode.value = false
}

onMounted(() => {
  const saved = localStorage.getItem(`family_${familyId}_generations`)
  if (saved) {
    generations.value = JSON.parse(saved)
  }
  const savedDesc = localStorage.getItem(`family_${familyId}_gen_desc`)
  if (savedDesc) {
    desc.value = savedDesc
  }
})
</script>

<style scoped>
.generation-table {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.generation-desc {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

.table-wrapper {
  padding: 12px;
  overflow-x: auto;
}

.generation-table-content {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.generation-table-content th,
.generation-table-content td {
  padding: 12px;
  text-align: center;
  border: 1px solid #eee;
}

.generation-table-content th {
  background: #f5f5f5;
  font-weight: bold;
  color: #333;
}

.gen-num {
  color: #999;
  font-size: 12px;
}

.gen-char {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.example-list {
  padding: 12px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.example-item:last-child {
  border-bottom: none;
}

.example-gen {
  font-size: 12px;
  color: #999;
  width: 60px;
}

.example-char {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
  width: 40px;
  text-align: center;
}

.example-name {
  font-size: 14px;
  color: #333;
}
</style>