<template>
  <div class="overview">
    <van-nav-bar title="家族概述" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>
    
    <!-- 基本信息卡片 -->
    <div class="info-card">
      <div class="card-header">
        <div class="surname">{{ familyInfo.surname || '姓氏' }}</div>
        <div class="hall-name">{{ familyInfo.hall_name || '堂号' }}</div>
      </div>
      <van-cell-group inset>
        <van-cell title="家族姓氏" :value="familyInfo.surname || '未设置'" :is-link="editMode" @click="editField('surname')" />
        <van-cell title="堂号" :value="familyInfo.hall_name || '未设置'" :is-link="editMode" @click="editField('hall_name')" />
        <van-cell title="祖籍地" :value="familyInfo.origin || '未设置'" :is-link="editMode" @click="editField('origin')" />
        <van-cell title="现居地" :value="familyInfo.location || '未设置'" :is-link="editMode" @click="editField('location')" />
        <van-cell title="始迁祖" :value="familyInfo.ancestor || '未设置'" :is-link="editMode" @click="editField('ancestor')" />
        <van-cell title="开基祖" :value="familyInfo.founder || '未设置'" :is-link="editMode" @click="editField('founder')" />
        <van-cell title="家族字辈" :value="familyInfo.generations || '未设置'" :is-link="editMode" @click="editField('generations')" />
      </van-cell-group>
    </div>
    
    <!-- 家族简介 -->
    <van-cell-group inset style="margin: 12px" title="家族简介">
      <div class="section-content">
        <div v-if="!editMode" class="intro-text">{{ familyInfo.introduction || '暂无简介，点击右上角编辑添加家族起源、迁徙历史等信息。' }}</div>
        <van-field
          v-else
          v-model="familyInfo.introduction"
          type="textarea"
          rows="5"
          placeholder="请输入家族简介：起源、迁徙、发展..."
          @blur="saveInfo"
        />
      </div>
    </van-cell-group>
    
    <!-- 家训家规 -->
    <van-cell-group inset style="margin: 12px" title="家训家规">
      <div class="section-content">
        <div v-if="!editMode" class="rules-text">{{ familyInfo.rules || '暂无家训家规，点击右上角编辑添加家族传统、家风家训等信息。' }}</div>
        <van-field
          v-else
          v-model="familyInfo.rules"
          type="textarea"
          rows="4"
          placeholder="请输入家训家规..."
          @blur="saveInfo"
        />
      </div>
    </van-cell-group>
    
    <!-- 家风传统 -->
    <van-cell-group inset style="margin: 12px" title="家风传统">
      <div class="section-content">
        <div v-if="!editMode" class="tradition-text">{{ familyInfo.tradition || '暂无家风传统，点击右上角编辑添加家族传统活动、祭祖习俗等信息。' }}</div>
        <van-field
          v-else
          v-model="familyInfo.tradition"
          type="textarea"
          rows="3"
          placeholder="请输入家风传统..."
          @blur="saveInfo"
        />
      </div>
    </van-cell-group>
    
    <!-- 宗祠墓园 -->
    <van-cell-group inset style="margin: 12px" title="宗祠墓园">
      <van-cell title="宗祠位置" :value="familyInfo.temple_location || '未设置'" :is-link="editMode" @click="editField('temple_location')" />
      <van-cell title="祖茔位置" :value="familyInfo.grave_location || '未设置'" :is-link="editMode" @click="editField('grave_location')" />
    </van-cell-group>
    
    <!-- 统计信息 -->
    <van-cell-group inset style="margin: 12px" title="统计信息">
      <van-cell title="世代数量" :value="`${stats.generations || 0}代`" />
      <van-cell title="成员总数" :value="`${stats.total_members || 0}人`" />
      <van-cell title="在世族人" :value="`${stats.living_members || 0}人`" />
      <van-cell title="最新修订" :value="stats.last_update || '未修订'" />
      <van-cell title="修订次数" :value="`${stats.update_count || 0}次`" />
    </van-cell-group>
    
    <!-- 编辑弹窗 -->
    <van-dialog v-model:show="showEdit" :title="currentField.label" show-cancel-button @confirm="saveField">
      <van-field v-model="editValue" :placeholder="'请输入' + currentField.label" />
    </van-dialog>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { familyApi, memberApi } from '../api'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const editMode = ref(false)
const showEdit = ref(false)
const activeTabbar = ref(1)

const currentField = ref({ key: '', label: '' })
const editValue = ref('')

const familyInfo = ref({
  surname: '张',
  hall_name: '清河堂',
  origin: '山西洪洞',
  location: '山东济南',
  ancestor: '张三公',
  founder: '张三公',
  generations: '三、大、明、清、传、家、立、业、光、宗、耀、祖、德、泽、明',
  introduction: '吾族世居此地，耕读传家，世代繁衍，人才辈出。自始迁祖张三公于明洪武二年（1369年）由山西洪洞迁居济南，历六百余年，传二十五代，子孙繁衍，枝繁叶茂。',
  rules: '孝父母、敬祖宗、友兄弟、睦宗族、和邻里、教子孙、勤职业、崇节俭。读书传家，诚信待人，乐善好施，济困扶危。',
  tradition: '读书传家、勤俭持家、诚信待人、乐善好施。每年清明祭祖，重阳敬老，春节团拜，世代相传。',
  temple_location: '村东宗祠，始建于明代，历代修缮',
  grave_location: '南山之阳，始迁祖墓园'
})

const stats = ref({
  generations: 0,
  total_members: 0,
  living_members: 0,
  last_update: '',
  update_count: 0
})

const fieldLabels = {
  surname: '家族姓氏',
  hall_name: '堂号',
  origin: '祖籍地',
  location: '现居地',
  ancestor: '始迁祖',
  founder: '开基祖',
  generations: '家族字辈',
  temple_location: '宗祠位置',
  grave_location: '祖茔位置'
}

function back() {
  router.back()
}

function editField(field) {
  if (!editMode.value) return
  currentField.value = { key: field, label: fieldLabels[field] }
  editValue.value = familyInfo.value[field] || ''
  showEdit.value = true
}

function saveField() {
  familyInfo.value[currentField.value.key] = editValue.value
  saveInfo()
}

async function saveInfo() {
  try {
    await familyApi.update(familyId, familyInfo.value)
  } catch (e) {
    // 本地保存
  }
  // 始终保存到localStorage，供PDF导出使用
  localStorage.setItem(`family_${familyId}_info`, JSON.stringify(familyInfo.value))
  showToast('已保存')
}

async function loadFamilyInfo() {
  try {
    const res = await familyApi.get(familyId)
    familyInfo.value = {
      surname: res.data.surname || '',
      hall_name: res.data.hall_name || '',
      origin: res.data.origin || '',
      location: res.data.location || '',
      ancestor: res.data.ancestor || '',
      founder: res.data.founder || '',
      generations: res.data.generations || '',
      introduction: res.data.description || '',
      rules: res.data.rules || '',
      tradition: res.data.tradition || '',
      temple_location: res.data.temple_location || '',
      grave_location: res.data.grave_location || ''
    }
    
    // 加载统计
    const members = await memberApi.list(familyId)
    const genSet = new Set(members.data.map(m => m.generation).filter(Boolean))
    stats.value.generations = genSet.size
    stats.value.total_members = members.data.length
    stats.value.living_members = members.data.length // TODO: 区分已故
    stats.value.last_update = new Date().toLocaleDateString('zh-CN')
  } catch (e) {
    // 从本地加载
    const saved = localStorage.getItem(`family_${familyId}_info`)
    if (saved) {
      familyInfo.value = JSON.parse(saved)
    }
  }
}

onMounted(() => {
  loadFamilyInfo()
})
</script>

<style scoped>
.overview {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-top: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  color: #fff;
}

.surname {
  font-size: 36px;
  font-weight: bold;
}

.hall-name {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 4px;
}

.section-content {
  padding: 12px;
}

.intro-text,
.rules-text,
.tradition-text {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}
</style>