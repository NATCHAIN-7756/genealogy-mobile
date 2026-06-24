<template>
  <div class="user-info">
    <van-nav-bar title="个人信息" left-arrow @click-left="back" />

    <van-cell-group inset style="margin: 12px" title="基本信息">
      <van-field
        v-model="form.name"
        label="姓名"
        placeholder="请输入真实姓名"
        required
        :rules="[{ required: true, message: '请填写姓名' }]"
      />
      <van-field name="gender" label="性别">
        <template #input>
          <van-radio-group v-model="form.gender" direction="horizontal">
            <van-radio name="male">男</van-radio>
            <van-radio name="female">女</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        v-model="form.birth_date"
        label="出生日期"
        placeholder="如：1990-01-15"
        type="date"
      />
    </van-cell-group>

    <div style="padding: 16px">
      <van-button type="primary" block @click="saveInfo" :loading="saving">保存</van-button>
    </div>

    <van-notice-bar
      v-if="!user.info_completed"
      left-icon="info-o"
      background="#fff7cc"
      color="#ff976a"
      style="margin: 12px"
    >
      完善信息后可创建家族，系统会自动从您的姓名中提取姓氏
    </van-notice-bar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import api from '../api'

const router = useRouter()
const user = ref({})
const form = ref({
  name: '',
  gender: 'male',
  birth_date: ''
})
const saving = ref(false)

const token = localStorage.getItem('token')

function back() {
  router.back()
}

async function loadUser() {
  try {
    const res = await api.get('/...')
    user.value = res.data
    form.value.name = res.data.name || ''
    form.value.gender = res.data.gender || 'male'
    form.value.birth_date = res.data.birth_date || ''
  } catch (e) {
    console.error('加载用户信息失败:', e)
    showToast('加载失败')
  }
}

async function saveInfo() {
  if (!form.value.name) {
    showToast('请填写姓名')
    return
  }

  saving.value = true
  try {
    const res = await api.put('/auth/info', form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })

    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))

    showSuccessToast('保存成功')
    router.back()
  } catch (e) {
    console.error('保存失败:', e)
    showToast('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadUser())
</script>

<style scoped>
.user-info {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}
</style>