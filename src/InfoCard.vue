<template>
  <div class="infocard">
    <van-nav-bar title="信息卡片" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>
    
    <!-- 基本信息卡片 -->
    <van-cell-group inset title="基本信息" style="margin: 12px">
      <van-cell title="姓名" :value="info.name" :is-link="editMode" @click="editField('name')" />
      <van-cell title="性别" :value="info.gender || '未设置'" :is-link="editMode" @click="editField('gender')" />
      <van-cell title="出生日期" :value="info.birth_date || '未设置'" :is-link="editMode" @click="editField('birth_date')" />
      <van-cell title="出生地" :value="info.birth_place || '未设置'" :is-link="editMode" @click="editField('birth_place')" />
      <van-cell title="籍贯" :value="info.hometown || '未设置'" :is-link="editMode" @click="editField('hometown')" />
      <van-cell title="民族" :value="info.ethnicity || '未设置'" :is-link="editMode" @click="editField('ethnicity')" />
      <van-cell title="世代" :value="info.generation ? `第${info.generation}代` : '未设置'" :is-link="editMode" @click="editField('generation')" />
    </van-cell-group>
    
    <!-- 联系方式 -->
    <van-cell-group inset title="联系方式" style="margin: 12px">
      <van-cell title="手机号" :value="info.phone || '未设置'" :is-link="editMode" @click="editField('phone')" />
      <van-cell title="微信号" :value="info.wechat || '未设置'" :is-link="editMode" @click="editField('wechat')" />
      <van-cell title="现居地" :value="info.address || '未设置'" :is-link="editMode" @click="editField('address')" />
    </van-cell-group>
    
    <!-- 教育工作 -->
    <van-cell-group inset title="教育工作" style="margin: 12px">
      <van-cell title="学历" :value="info.education || '未设置'" :is-link="editMode" @click="editField('education')" />
      <van-cell title="职业" :value="info.occupation || '未设置'" :is-link="editMode" @click="editField('occupation')" />
      <van-cell title="单位" :value="info.company || '未设置'" :is-link="editMode" @click="editField('company')" />
    </van-cell-group>
    
    <!-- 家庭关系 -->
    <van-cell-group inset title="家庭关系" style="margin: 12px">
      <van-cell title="父亲" :value="info.father_name || '未设置'" :is-link="editMode" @click="editField('father_name')" />
      <van-cell title="母亲" :value="info.mother_name || '未设置'" :is-link="editMode" @click="editField('mother_name')" />
      <van-cell title="配偶" :value="info.spouse_name || '未设置'" :is-link="editMode" @click="editField('spouse_name')" />
      <van-cell title="子女" :value="info.children_count ? `${info.children_count}人` : '未设置'" :is-link="editMode" @click="editField('children_count')" />
    </van-cell-group>
    
    <!-- 简介 -->
    <van-cell-group inset title="个人简介" style="margin: 12px">
      <van-field
        v-model="info.bio"
        type="textarea"
        rows="3"
        :readonly="!editMode"
        placeholder="记录你的故事..."
        @blur="saveInfo"
      />
    </van-cell-group>
    
    <!-- 同步按钮 -->
    <div style="padding: 16px">
      <van-button type="primary" block :loading="syncing" @click="syncToFamily">
        同步到家谱
      </van-button>
      <p class="sync-hint">保存后将自动同步到家谱成员信息</p>
    </div>
    
    <!-- 编辑弹窗 -->
    <van-dialog v-model:show="showEdit" :title="currentField.label" show-cancel-button @confirm="saveField">
      <van-field v-model="editValue" :placeholder="'请输入' + currentField.label" />
    </van-dialog>
    
    <!-- 性别选择 -->
    <van-action-sheet v-model:show="showGender" :actions="genderActions" @select="onGenderSelect" />
    
    <!-- 世代选择 -->
    <van-picker v-model:show="showGeneration" :columns="generationColumns" @confirm="onGenerationConfirm" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { memberApi, familyApi } from '../api'

const router = useRouter()
const editMode = ref(false)
const syncing = ref(false)
const showEdit = ref(false)
const showGender = ref(false)
const showGeneration = ref(false)

const currentField = ref({ key: '', label: '' })
const editValue = ref('')

const info = ref({
  name: '',
  gender: '',
  birth_date: '',
  birth_place: '',
  hometown: '',
  ethnicity: '',
  generation: null,
  phone: '',
  wechat: '',
  address: '',
  education: '',
  occupation: '',
  company: '',
  father_name: '',
  mother_name: '',
  spouse_name: '',
  children_count: null,
  bio: ''
})

const familyId = ref(null)
const memberId = ref(null)

const genderActions = [
  { name: '男' },
  { name: '女' }
]

const generationColumns = Array.from({ length: 20 }, (_, i) => ({ text: `第${i + 1}代`, value: i + 1 }))

function back() {
  router.back()
}

function editField(field) {
  if (!editMode.value) return
  
  const labels = {
    name: '姓名',
    gender: '性别',
    birth_date: '出生日期',
    birth_place: '出生地',
    hometown: '籍贯',
    ethnicity: '民族',
    generation: '世代',
    phone: '手机号',
    wechat: '微信号',
    address: '现居地',
    education: '学历',
    occupation: '职业',
    company: '单位',
    father_name: '父亲',
    mother_name: '母亲',
    spouse_name: '配偶',
    children_count: '子女数量'
  }
  
  currentField.value = { key: field, label: labels[field] }
  
  if (field === 'gender') {
    showGender.value = true
    return
  }
  
  if (field === 'generation') {
    showGeneration.value = true
    return
  }
  
  editValue.value = info.value[field] || ''
  showEdit.value = true
}

function saveField() {
  info.value[currentField.value.key] = editValue.value
  saveInfo()
}

function onGenderSelect(action) {
  info.value.gender = action.name
  saveInfo()
}

function onGenerationConfirm({ selectedOptions }) {
  info.value.generation = selectedOptions[0].value
  saveInfo()
}

async function saveInfo() {
  localStorage.setItem('user_info_card', JSON.stringify(info.value))
  showToast('已保存')
}

async function syncToFamily() {
  if (!info.value.name) {
    showToast('请先填写姓名')
    return
  }
  
  syncing.value = true
  try {
    const data = {
      name: info.value.name,
      gender: info.value.gender,
      birth_date: info.value.birth_date,
      birth_place: info.value.birth_place,
      generation: info.value.generation,
      notes: info.value.bio,
      family_id: familyId.value
    }
    
    if (memberId.value) {
      await memberApi.update(memberId.value, data)
    } else {
      const res = await memberApi.create(data)
      memberId.value = res.data.id
      localStorage.setItem('user_member_id', memberId.value)
    }
    
    showToast('同步成功')
  } catch (e) {
    showToast('同步失败: ' + e.message)
  } finally {
    syncing.value = false
  }
}

async function loadInfo() {
  // 从本地存储加载
  const saved = localStorage.getItem('user_info_card')
  if (saved) {
    info.value = { ...info.value, ...JSON.parse(saved) }
  }
  
  // 加载家族ID
  try {
    const res = await familyApi.list()
    if (res.data.length > 0) {
      familyId.value = res.data[0].id
    }
  } catch (e) {
    console.error('加载家族失败', e)
  }
  
  // 加载已同步的成员ID
  memberId.value = localStorage.getItem('user_member_id')
}

onMounted(() => {
  loadInfo()
})
</script>

<style scoped>
.infocard {
  padding-bottom: 80px;
  background: #f5f5f5;
  min-height: 100vh;
}

.sync-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>