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
          <span class="example-name">→ {{ family.surname || '张' }}{{ generations[14] || '明' }}华</span>
        </div>
        <div class="example-item">
          <span class="example-gen">第16代</span>
          <span class="example-char">{{ generations[15] || '德' }}</span>
          <span class="example-name">→ {{ family.surname || '张' }}{{ generations[15] || '德' }}强</span>
        </div>
        <div class="example-item">
          <span class="example-gen">第17代</span>
          <span class="example-char">{{ generations[16] || '传' }}</span>
          <span class="example-name">→ {{ family.surname || '张' }}{{ generations[16] || '传' }}伟</span>
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
          placeholder="每行一个字辈，或直接输入连续字符如：大德传家永..."
        />
        <div class="tips">
          <van-notice-bar left-icon="info-o" background="#f0f9ff" color="#1989fa">
            提示：输入连续字符或每行一个字，将自动同步到家族概述
          </van-notice-bar>
        </div>
        <div style="padding: 16px">
          <van-button type="primary" block @click="saveGenerations" :loading="saving">保存</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <!-- 单字编辑弹窗 -->
    <van-popup v-model:show="showCharEdit" position="center" round>
      <van-cell-group inset style="margin: 16px; width: 280px">
        <van-cell title="编辑字辈" />
        <van-field v-model="editCharValue" label="字辈" placeholder="请输入字辈" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="saveChar">确定</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const editMode = ref(false)
const saving = ref(false)

const family = ref({})
const generations = ref([])
const generationText = ref('')
const desc = ref('')
const showCharEdit = ref(false)
const editCharIndex = ref(0)
const editCharValue = ref('')

const token = localStorage.getItem('token')

function back() { router.back() }

// 从generation_rule字符串解析字辈数组
function parseGenerationRule(rule) {
  if (!rule) return []
  // 移除空格和换行
  const chars = rule.replace(/[\s\n]/g, '')
  return chars.split('')
}

// 将字辈数组转为字符串
function arrayToRule(arr) {
  return arr.join('')
}

async function loadFamily() {
  try {
    const res = await api.get('/...')
    family.value = res.data
    
    // 从generation_rule解析字辈表
    generations.value = parseGenerationRule(res.data.generation_rule)
    generationText.value = res.data.generation_rule || ''
    
    console.log('加载家族信息:', res.data.name, '字辈:', res.data.generation_rule)
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

function editChar(index) {
  editCharIndex.value = index
  editCharValue.value = generations.value[index] || ''
  showCharEdit.value = true
}

function saveChar() {
  generations.value[editCharIndex.value] = editCharValue.value
  generationText.value = arrayToRule(generations.value)
  showCharEdit.value = false
}

async function saveGenerations() {
  // 将文本转换为字辈数组
  const text = generationText.value.replace(/[\s\n]/g, '')
  generations.value = text.split('')
  
  saving.value = true
  try {
    // 保存到family.generation_rule
    await api.put(`/families/${familyId}`, 
      { generation_rule: text },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    family.value.generation_rule = text
    showSuccessToast('保存成功，已同步到家族概述')
    editMode.value = false
    
    // 通知其他页面更新
    localStorage.setItem('family_generation_updated', Date.now())
  } catch (e) {
    console.error('保存失败:', e)
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadFamily())
</script>

<style scoped>
.generation-table {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.generation-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.table-wrapper {
  padding: 12px;
  overflow-x: auto;
}

.generation-table-content {
  width: 100%;
  border-collapse: collapse;
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

.tips {
  padding: 12px;
}
</style>