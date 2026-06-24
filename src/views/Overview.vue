<template>
  <div class="overview">
    <van-nav-bar title="家族概述" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <div v-else>
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <div class="surname">{{ family.surname || '姓氏' }}</div>
          <div class="hall-name">{{ family.hall_name || '堂号' }}</div>
        </div>
        <van-cell-group inset>
          <van-cell title="家族名称" :value="family.name || '未设置'" :is-link="editMode" @click="editField('name')" />
          <van-cell title="家族姓氏" :value="family.surname || '未设置'" :is-link="editMode" @click="editField('surname')" />
          <van-cell title="堂号" :value="family.hall_name || '未设置'" :is-link="editMode" @click="editField('hall_name')" />
          <van-cell title="祖籍地" :value="family.origin || '未设置'" :is-link="editMode" @click="editField('origin')" />
          <van-cell title="现居地" :value="family.location || '未设置'" :is-link="editMode" @click="editField('location')" />
          <van-cell title="始迁祖" :value="family.ancestor || '未设置'" :is-link="editMode" @click="editField('ancestor')" />
          <van-cell title="开基祖" :value="family.founder || '未设置'" :is-link="editMode" @click="editField('founder')" />
          <van-cell title="家族字辈" :value="family.generation_rule || '未设置'" :is-link="editMode" @click="editField('generation_rule')" />
        </van-cell-group>
      </div>

      <!-- 家族简介 -->
      <van-cell-group inset style="margin: 12px" title="家族简介">
        <div class="section-content">
          <div v-if="!editMode" class="intro-text">{{ family.introduction || '暂无简介，点击右上角编辑添加家族起源、迁徙历史等信息。' }}</div>
          <van-field
            v-else
            v-model="family.introduction"
            type="textarea"
            rows="5"
            placeholder="请输入家族简介：起源、迁徙、发展..."
          />
        </div>
      </van-cell-group>

      <!-- 家训家规 -->
      <van-cell-group inset style="margin: 12px" title="家训家规">
        <div class="section-content">
          <div v-if="!editMode" class="rules-text">{{ family.rules || '暂无家训家规，点击右上角编辑添加家族传统、家风家训等信息。' }}</div>
          <van-field
            v-else
            v-model="family.rules"
            type="textarea"
            rows="4"
            placeholder="请输入家训家规..."
          />
        </div>
      </van-cell-group>

      <!-- 家风传统 -->
      <van-cell-group inset style="margin: 12px" title="家风传统">
        <div class="section-content">
          <div v-if="!editMode" class="tradition-text">{{ family.tradition || '暂无家风传统，点击右上角编辑添加家族传统活动、祭祖习俗等信息。' }}</div>
          <van-field
            v-else
            v-model="family.tradition"
            type="textarea"
            rows="4"
            placeholder="请输入家风传统..."
          />
        </div>
      </van-cell-group>

      <!-- 保存按钮 -->
      <div v-if="editMode" style="padding: 16px">
        <van-button type="primary" block @click="saveFamily">保存修改</van-button>
      </div>
    </div>

    <!-- 编辑字段弹窗 -->
    <van-popup v-model:show="showFieldEdit" position="bottom" round>
      <van-cell-group inset style="margin: 16px">
        <van-cell :title="fieldLabels[currentField]" />
        <van-field v-model="fieldValue" :placeholder="'请输入' + fieldLabels[currentField]" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="saveField">确定</van-button>
        </div>
      </van-cell-group>
    </van-popup>

    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const loading = ref(true)
const editMode = ref(false)
const showFieldEdit = ref(false)
const currentField = ref('')
const fieldValue = ref('')

const family = ref({
  name: '',
  surname: '',
  hall_name: '',
  origin: '',
  location: '',
  ancestor: '',
  founder: '',
  generation_rule: '',
  introduction: '',
  rules: '',
  tradition: ''
})

const fieldLabels = {
  name: '家族名称',
  surname: '家族姓氏',
  hall_name: '堂号',
  origin: '祖籍地',
  location: '现居地',
  ancestor: '始迁祖',
  founder: '开基祖',
  generation_rule: '家族字辈'
}

const token = localStorage.getItem('token')

function back() { router.back() }

async function loadFamily() {
  try {
    const res = await api.get(`/api/families/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    family.value = res.data
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function editField(field) {
  currentField.value = field
  fieldValue.value = family.value[field] || ''
  showFieldEdit.value = true
}

function saveField() {
  family.value[currentField.value] = fieldValue.value
  showFieldEdit.value = false
}

async function saveFamily() {
  try {
    await api.put(`/api/families/${familyId}`, family.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('已保存')
    editMode.value = false
  } catch (e) {
    console.error('保存失败:', e)
    showToast('保存失败')
  }
}

onMounted(() => loadFamily())
</script>

<style scoped>
.overview { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.loading-center { display: flex; justify-content: center; padding-top: 100px; }
.info-card { background: #fff; margin: 16px; border-radius: 8px; overflow: hidden; }
.card-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; text-align: center; }
.surname { font-size: 32px; font-weight: bold; color: #fff; margin-bottom: 8px; }
.hall-name { font-size: 16px; color: rgba(255,255,255,0.9); }
.section-content { padding: 16px; background: #fff; }
.intro-text, .rules-text, .tradition-text { font-size: 15px; line-height: 1.8; color: #333; white-space: pre-wrap; }
</style>