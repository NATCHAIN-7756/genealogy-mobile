<template>
  <div class="member-submit">
    <van-nav-bar title="家谱信息填报" left-arrow @click-left="back" />
    
    <!-- 进度指示 -->
    <van-steps :active="activeStep" active-color="#1989fa">
      <van-step>基本信息</van-step>
      <van-step>家庭关系</van-step>
      <van-step>扩展信息</van-step>
      <van-step>故事照片</van-step>
    </van-steps>
    
    <div class="form-container">
      <!-- 第一步：基本信息 -->
      <div v-show="activeStep === 0">
        <van-cell-group inset title="基本信息（必填）">
          <van-field v-model="form.name" label="姓名" placeholder="请输入姓名" required />
          <van-field name="gender" label="性别">
            <template #input>
              <van-radio-group v-model="form.gender" direction="horizontal">
                <van-radio name="male">男</van-radio>
                <van-radio name="female">女</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field v-model="form.birthDate" is-link readonly label="出生日期" placeholder="请选择" @click="showBirthPicker = true" />
          <van-popup v-model:show="showBirthPicker" position="bottom">
            <van-date-picker v-model="form.birthDateObj" title="选择出生日期" @confirm="onBirthConfirm" @cancel="showBirthPicker = false" />
          </van-popup>
          <van-field v-model="form.birthPlace" label="出生地" placeholder="省/市/县" />
          <van-field name="isAlive" label="是否在世">
            <template #input>
              <van-radio-group v-model="form.isAlive" direction="horizontal">
                <van-radio :name="true">在世</van-radio>
                <van-radio :name="false">已故</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <template v-if="!form.isAlive">
            <van-field v-model="form.deathDate" is-link readonly label="逝世日期" placeholder="请选择" @click="showDeathPicker = true" />
            <van-popup v-model:show="showDeathPicker" position="bottom">
              <van-date-picker v-model="form.deathDateObj" title="选择逝世日期" @confirm="onDeathConfirm" @cancel="showDeathPicker = false" />
            </van-popup>
          </template>
        </van-cell-group>
      </div>
      
      <!-- 第二步：家庭关系 -->
      <div v-show="activeStep === 1">
        <van-cell-group inset title="家庭关系（必填）">
          <van-field v-model="form.fatherName" label="父亲姓名" placeholder="父亲姓名" required />
          <van-field v-model="form.motherName" label="母亲姓名" placeholder="母亲姓名" />
          <van-field name="spouseType" label="婚姻状况">
            <template #input>
              <van-radio-group v-model="form.spouseType" direction="horizontal">
                <van-radio name="married">已婚</van-radio>
                <van-radio name="single">未婚</van-radio>
                <van-radio name="divorced">离异</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <template v-if="form.spouseType === 'married'">
            <van-field v-model="form.spouseName" label="配偶姓名" placeholder="配偶姓名" />
            <van-field v-model="form.spouseBirthDate" is-link readonly label="配偶出生" placeholder="出生日期" @click="showSpouseBirthPicker = true" />
            <van-popup v-model:show="showSpouseBirthPicker" position="bottom">
              <van-date-picker v-model="form.spouseBirthDateObj" title="选择出生日期" @confirm="onSpouseBirthConfirm" @cancel="showSpouseBirthPicker = false" />
            </van-popup>
          </template>
          <van-field v-model="form.childrenCount" type="digit" label="子女数量" placeholder="0" />
          <van-field v-model="form.childrenNames" label="子女姓名" placeholder="用逗号分隔" rows="2" autosize type="textarea" />
        </van-cell-group>
      </div>
      
      <!-- 第三步：扩展信息 -->
      <div v-show="activeStep === 2">
        <van-cell-group inset title="扩展信息（选填）">
          <van-field v-model="form.education" label="学历" placeholder="如：本科、硕士" />
          <van-field v-model="form.occupation" label="职业" placeholder="如：教师、工程师" />
          <van-field v-model="form.workplace" label="工作单位" placeholder="工作单位名称" />
          <van-field v-model="form.address" label="居住地址" placeholder="详细地址" rows="2" autosize type="textarea" />
          <van-field v-model="form.phone" type="tel" label="联系电话" placeholder="手机号码" />
          <van-field v-model="form.email" type="email" label="电子邮箱" placeholder="邮箱地址" />
          <van-field v-model="form.generationOrder" label="字辈" placeholder="如：第18代 '德' 字辈" />
        </van-cell-group>
      </div>
      
      <!-- 第四步：故事照片 -->
      <div v-show="activeStep === 3">
        <van-cell-group inset title="家族故事（选填）">
          <van-field v-model="form.story" label="个人故事" placeholder="创业经历、家风传承、老故事..." rows="4" autosize type="textarea" />
          <van-cell title="照片上传">
            <template #label>
              <span class="hint">上传个人照片、家庭合影、老照片</span>
            </template>
          </van-cell>
          <van-uploader v-model="form.photos" multiple :max-count="9" style="padding: 12px" />
        </van-cell-group>
      </div>
    </div>
    
    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <van-button v-if="activeStep > 0" block @click="prevStep">上一步</van-button>
      <van-button v-if="activeStep < 3" type="primary" block @click="nextStep">下一步</van-button>
      <van-button v-if="activeStep === 3" type="primary" block :loading="submitting" @click="submit">提交审核</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const activeStep = ref(0)
const submitting = ref(false)

const showBirthPicker = ref(false)
const showDeathPicker = ref(false)
const showSpouseBirthPicker = ref(false)

const form = reactive({
  // 基本信息
  name: '',
  gender: 'male',
  birthDate: '',
  birthDateObj: ['2000', '01', '01'],
  birthPlace: '',
  isAlive: true,
  deathDate: '',
  deathDateObj: ['2020', '01', '01'],
  
  // 家庭关系
  fatherName: '',
  motherName: '',
  spouseType: 'married',
  spouseName: '',
  spouseBirthDate: '',
  spouseBirthDateObj: ['2000', '01', '01'],
  childrenCount: '',
  childrenNames: '',
  
  // 扩展信息
  education: '',
  occupation: '',
  workplace: '',
  address: '',
  phone: '',
  email: '',
  generationOrder: '',
  
  // 故事照片
  story: '',
  photos: []
})

function back() {
  if (activeStep.value > 0) {
    activeStep.value--
  } else {
    router.back()
  }
}

function nextStep() {
  // 简单验证
  if (activeStep.value === 0) {
    if (!form.name) {
      showToast('请填写姓名')
      return
    }
  }
  if (activeStep.value === 1) {
    if (!form.fatherName) {
      showToast('请填写父亲姓名')
      return
    }
  }
  activeStep.value++
}

function prevStep() {
  activeStep.value--
}

function onBirthConfirm({ selectedValues }) {
  form.birthDate = selectedValues.join('-')
  showBirthPicker.value = false
}

function onDeathConfirm({ selectedValues }) {
  form.deathDate = selectedValues.join('-')
  showDeathPicker.value = false
}

function onSpouseBirthConfirm({ selectedValues }) {
  form.spouseBirthDate = selectedValues.join('-')
  showSpouseBirthPicker.value = false
}

async function submit() {
  submitting.value = true
  try {
    // TODO: 提交到后端
    await new Promise(r => setTimeout(r, 1500))
    showSuccessToast('提交成功，等待审核')
    router.back()
  } catch (e) {
    showToast('提交失败：' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.member-submit {
  padding-bottom: 70px;
}

.form-container {
  padding: 12px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.bottom-actions .van-button {
  flex: 1;
}

.hint {
  font-size: 12px;
  color: #999;
}
</style>