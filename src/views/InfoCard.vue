<template>
  <div class="infocard">
    <van-nav-bar title="个人信息卡" left-arrow @click-left="back">
      <template #right>
        <van-icon name="share-o" size="20" @click="showShare = true" />
      </template>
    </van-nav-bar>
    
    <!-- 头像和基本信息 -->
    <div class="header-card">
      <div class="avatar-wrapper">
        <van-image
          round
          width="80"
          height="80"
          :src="info.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.png'"
          fit="cover"
        />
      </div>
      <div class="name-section">
        <h2>{{ info.name || '点击编辑姓名' }}</h2>
        <p class="generation-tag" v-if="info.generation">第{{ info.generation }}代</p>
      </div>
      <van-button 
        size="small" 
        :type="editMode ? 'primary' : 'default'"
        @click="editMode = !editMode"
      >
        {{ editMode ? '完成' : '编辑' }}
      </van-button>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <div class="action-item" @click="generateQRCode">
        <van-icon name="qr" size="24" color="#667eea" />
        <span>名片码</span>
      </div>
      <div class="action-item" @click="showShare = true">
        <van-icon name="share" size="24" color="#667eea" />
        <span>分享</span>
      </div>
      <div class="action-item" @click="syncToFamily">
        <van-icon name="cluster-o" size="24" color="#667eea" />
        <span>同步</span>
      </div>
    </div>
    
    <!-- 基本信息 -->
    <van-cell-group inset title="基本信息" style="margin: 12px">
      <van-cell title="姓名" :value="info.name || '未设置'" :is-link="editMode" @click="editField('name')" />
      <van-cell title="性别" :value="info.gender || '未设置'" :is-link="editMode" @click="editField('gender')" />
      <van-cell title="出生日期" :value="formatDate(info.birth_date)" :is-link="editMode" @click="editField('birth_date')">
        <template #value>
          <span>{{ formatDate(info.birth_date) }}</span>
          <van-tag v-if="info.birth_date" type="primary" size="small" style="margin-left: 8px">{{ getZodiac(info.birth_date) }}</van-tag>
        </template>
      </van-cell>
      <van-cell title="年龄" :value="getAge(info.birth_date)" v-if="info.birth_date" />
      <van-cell title="出生地" :value="info.birth_place || '未设置'" :is-link="editMode" @click="editField('birth_place')" />
      <van-cell title="籍贯" :value="info.hometown || '未设置'" :is-link="editMode" @click="editField('hometown')" />
      <van-cell title="民族" :value="info.ethnicity || '未设置'" :is-link="editMode" @click="editField('ethnicity')" />
      <van-cell title="世代" :value="info.generation ? `第${info.generation}代` : '未设置'" :is-link="editMode" @click="editField('generation')" />
    </van-cell-group>
    
    <!-- 健康信息 -->
    <van-cell-group inset title="健康信息" style="margin: 12px">
      <van-cell title="血型" :value="info.blood_type || '未设置'" :is-link="editMode" @click="editField('blood_type')" />
      <van-cell title="遗传病" :value="info.genetic_disease || '无'" :is-link="editMode" @click="editField('genetic_disease')">
        <template #value>
          <span :style="{ color: info.genetic_disease && info.genetic_disease !== '无' ? '#ee0a24' : '' }">{{ info.genetic_disease || '无' }}</span>
        </template>
      </van-cell>
      <van-cell title="过敏史" :value="info.allergy || '无'" :is-link="editMode" @click="editField('allergy')" />
      <van-cell title="特殊病史" :value="info.medical_history || '无'" :is-link="editMode" @click="editField('medical_history')" />
    </van-cell-group>
    
    <!-- 联系方式 -->
    <van-cell-group inset title="联系方式" style="margin: 12px">
      <van-cell title="手机号" :value="info.phone || '未设置'" :is-link="editMode" @click="editField('phone')">
        <template #right-icon v-if="info.phone && !editMode">
          <a :href="'tel:' + info.phone" @click.stop>
            <van-icon name="phone-o" color="#07c160" size="18" />
          </a>
        </template>
      </van-cell>
      <van-cell title="微信号" :value="info.wechat || '未设置'" :is-link="editMode" @click="editField('wechat')" />
      <van-cell title="现居地" :value="info.address || '未设置'" :is-link="editMode" @click="editField('address')" />
    </van-cell-group>
    
    <!-- 教育职业 -->
    <van-cell-group inset title="教育职业" style="margin: 12px">
      <van-cell title="学历" :value="info.education || '未设置'" :is-link="editMode" @click="editField('education')" />
      <van-cell title="职业" :value="info.occupation || '未设置'" :is-link="editMode" @click="editField('occupation')" />
      <van-cell title="单位" :value="info.company || '未设置'" :is-link="editMode" @click="editField('company')" />
      <van-cell title="职务" :value="info.position || '未设置'" :is-link="editMode" @click="editField('position')" />
    </van-cell-group>
    
    <!-- 家庭关系 -->
    <van-cell-group inset title="家庭关系" style="margin: 12px">
      <van-cell title="父亲" :value="info.father_name || '未设置'" :is-link="editMode" @click="editField('father_name')" />
      <van-cell title="母亲" :value="info.mother_name || '未设置'" :is-link="editMode" @click="editField('mother_name')" />
      <van-cell title="配偶" :value="info.spouse_name || '未设置'" :is-link="editMode" @click="editField('spouse_name')" />
      <van-cell title="子女" :value="info.children_count ? `${info.children_count}人` : '未设置'" :is-link="editMode" @click="editField('children_count')" />
    </van-cell-group>
    
    <!-- 个人简介 -->
    <van-cell-group inset title="个人简介" style="margin: 12px">
      <van-field
        v-model="info.bio"
        type="textarea"
        rows="3"
        autosize
        :readonly="!editMode"
        placeholder="记录你的故事、人生经历..."
        show-word-limit
        maxlength="500"
        @blur="saveInfo"
      />
    </van-cell-group>

    <!-- 编辑弹窗 -->
    <van-dialog v-model:show="showEdit" :title="currentField.label" show-cancel-button @confirm="saveField">
      <van-field v-model="editValue" :placeholder="'请输入' + currentField.label" />
    </van-dialog>
    
    <!-- 性别选择 -->
    <van-action-sheet v-model:show="showGender" :actions="genderActions" @select="onGenderSelect" />
    
    <!-- 世代选择 -->
    <van-popup v-model:show="showGeneration" position="bottom" round>
      <van-picker :columns="generationColumns" @confirm="onGenerationConfirm" @cancel="showGeneration = false" />
    </van-popup>
    
    <!-- 日期选择 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="selectedDate"
        title="选择出生日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 学历选择 -->
    <van-action-sheet v-model:show="showEducation" :actions="educationActions" @select="onEducationSelect" />

    <!-- 血型选择 -->
    <van-action-sheet v-model:show="showBloodType" :actions="bloodTypeActions" @select="onBloodTypeSelect" />

    <!-- 分享面板 -->
    <van-share-sheet
      v-model:show="showShare"
      title="分享名片"
      :options="shareOptions"
      @select="onShareSelect"
    />

    <!-- 二维码弹窗 -->
    <van-popup v-model:show="showQRCode" round style="padding: 24px">
      <div class="qrcode-container">
        <h3 style="margin-bottom: 16px">{{ info.name || '我的' }}名片</h3>
        <canvas ref="qrcodeCanvas" width="200" height="200" style="border-radius: 8px"></canvas>
        <p style="color: #999; font-size: 12px; margin: 12px 0">扫码查看联系方式</p>
        <van-button size="small" type="primary" @click="saveQRCodeImage">保存图片</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showLoadingToast, closeToast } from 'vant'
import { memberApi, familyApi } from '../api'
import QRCode from 'qrcode'

const router = useRouter()
const editMode = ref(false)
const showEdit = ref(false)
const showGender = ref(false)
const showGeneration = ref(false)
const showDatePicker = ref(false)
const showEducation = ref(false)
const showBloodType = ref(false)
const showShare = ref(false)
const showQRCode = ref(false)

const currentField = ref({ key: '', label: '' })
const editValue = ref('')
const selectedDate = ref(['2000', '01', '01'])
const qrcodeCanvas = ref(null)

const minDate = new Date(1900, 0, 1)
const maxDate = new Date()

const info = ref({
  avatar: '',
  name: '',
  gender: '',
  birth_date: '',
  birth_place: '',
  hometown: '',
  ethnicity: '汉族',
  generation: null,
  blood_type: '',
  genetic_disease: '',
  allergy: '',
  medical_history: '',
  phone: '',
  wechat: '',
  address: '',
  education: '',
  occupation: '',
  company: '',
  position: '',
  father_name: '',
  mother_name: '',
  spouse_name: '',
  children_count: null,
  bio: ''
})

const familyId = ref(null)
const memberId = ref(null)

const genderActions = [{ name: '男' }, { name: '女' }]

const bloodTypeActions = [{ name: 'A型' }, { name: 'B型' }, { name: 'AB型' }, { name: 'O型' }, { name: '其他' }]

const generationColumns = Array.from({ length: 30 }, (_, i) => ({ text: `第${i + 1}代`, value: i + 1 }))

const educationActions = [
  { name: '小学' }, { name: '初中' }, { name: '高中' },
  { name: '中专' }, { name: '大专' }, { name: '本科' },
  { name: '硕士' }, { name: '博士' }, { name: '其他' }
]

const shareOptions = [
  { name: '微信', icon: 'wechat' },
  { name: '复制链接', icon: 'link' },
  { name: '保存图片', icon: 'photo' }
]

const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

function getZodiac(dateStr) {
  if (!dateStr) return ''
  const year = new Date(dateStr).getFullYear()
  return zodiacs[(year - 1900) % 12]
}

function getAge(dateStr) {
  if (!dateStr) return ''
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age}岁`
}

function formatDate(dateStr) {
  if (!dateStr) return '未设置'
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function back() {
  router.back()
}

const fieldLabels = {
  name: '姓名', gender: '性别', birth_date: '出生日期',
  birth_place: '出生地', hometown: '籍贯', ethnicity: '民族',
  generation: '世代', blood_type: '血型', genetic_disease: '遗传病',
  allergy: '过敏史', medical_history: '特殊病史',
  phone: '手机号', wechat: '微信号',
  address: '现居地', education: '学历', occupation: '职业',
  company: '单位', position: '职务', father_name: '父亲',
  mother_name: '母亲', spouse_name: '配偶', children_count: '子女数量'
}

function editField(field) {
  if (!editMode.value) return
  
  currentField.value = { key: field, label: fieldLabels[field] }
  
  if (field === 'gender') { showGender.value = true; return }
  if (field === 'generation') { showGeneration.value = true; return }
  if (field === 'birth_date') {
    if (info.value.birth_date) {
      const d = new Date(info.value.birth_date)
      selectedDate.value = [String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')]
    }
    showDatePicker.value = true
    return
  }
  if (field === 'education') { showEducation.value = true; return }
  if (field === 'blood_type') { showBloodType.value = true; return }
  
  editValue.value = info.value[field] || ''
  showEdit.value = true
}

function saveField() {
  info.value[currentField.value.key] = editValue.value
  saveInfo()
}

function onGenderSelect(action) {
  info.value.gender = action.name
  showGender.value = false
  saveInfo()
}

function onGenerationConfirm({ selectedOptions }) {
  info.value.generation = selectedOptions[0].value
  showGeneration.value = false
  saveInfo()
}

function onDateConfirm({ selectedValues }) {
  info.value.birth_date = `${selectedValues[0]}-${selectedValues[1]}-${selectedValues[2]}`
  showDatePicker.value = false
  saveInfo()
}

function onEducationSelect(action) {
  info.value.education = action.name
  showEducation.value = false
  saveInfo()
}

function onBloodTypeSelect(action) {
  info.value.blood_type = action.name
  showBloodType.value = false
  saveInfo()
}

function saveInfo() {
  localStorage.setItem('user_info_card', JSON.stringify(info.value))
}

async function syncToFamily() {
  if (!info.value.name) {
    showToast('请先填写姓名')
    return
  }
  
  showLoadingToast({ message: '同步中...', forbidClick: true, duration: 0 })
  
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
    
    closeToast()
    showSuccessToast('同步成功')
  } catch (e) {
    closeToast()
    showToast('同步失败: ' + e.message)
  }
}

async function generateQRCode() {
  showQRCode.value = true
  await new Promise(r => setTimeout(r, 100))
  
  const cardData = `姓名:${info.value.name||''}\n电话:${info.value.phone||''}\n微信:${info.value.wechat||''}\n世代:${info.value.generation||''}代`
  
  try {
    await QRCode.toCanvas(qrcodeCanvas.value, cardData, {
      width: 200,
      margin: 2,
      color: { dark: '#667eea' }
    })
  } catch (e) {
    console.error('QR生成失败', e)
  }
}

function saveQRCodeImage() {
  const canvas = qrcodeCanvas.value
  const link = document.createElement('a')
  link.download = `${info.value.name || '名片'}.png`
  link.href = canvas.toDataURL()
  link.click()
  showSuccessToast('已保存')
}

function onShareSelect(option, index) {
  if (index === 1) {
    navigator.clipboard?.writeText(window.location.href)
    showSuccessToast('链接已复制')
  } else if (index === 2) {
    generateQRCode()
  } else {
    showToast('请在微信中分享')
  }
  showShare.value = false
}

async function loadInfo() {
  const saved = localStorage.getItem('user_info_card')
  if (saved) {
    info.value = { ...info.value, ...JSON.parse(saved) }
  }
  
  try {
    const res = await familyApi.list()
    if (res.data.length > 0) {
      familyId.value = res.data[0].id
    }
  } catch (e) {
    console.error('加载家族失败', e)
  }
  
  memberId.value = localStorage.getItem('user_member_id')
}

onMounted(() => {
  loadInfo()
})
</script>

<style scoped>
.infocard {
  padding-bottom: 80px;
  background: linear-gradient(180deg, #f0f2f5 0%, #fff 100%);
  min-height: 100vh;
}

.header-card {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0 12px 12px;
  border-radius: 12px;
  color: #fff;
}

.avatar-wrapper {
  margin-right: 16px;
}

.name-section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.generation-tag {
  margin: 4px 0 0;
  opacity: 0.8;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  background: #fff;
  margin: 0 12px 12px;
  padding: 16px;
  border-radius: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 12px;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}
</style>
