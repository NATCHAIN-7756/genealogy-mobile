<template>
  <div class="preface">
    <van-nav-bar title="序言" left-arrow @click-left="back">
      <template #right>
        <van-icon name="bars" size="20" style="margin-right: 12px" @click="goBook" />
        <van-icon name="edit" size="20" @click="showEdit = true" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <div v-else class="content-card">
      <h1 class="title">{{ preface.title }}</h1>

      <div class="preface-body">
        <p v-for="(para, index) in preface.paragraphs" :key="index" class="paragraph">
          {{ para }}
        </p>
      </div>

      <div class="signature">
        <div class="author">{{ preface.author }}</div>
        <div class="date">{{ preface.date }}</div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <van-popup v-model:show="showEdit" position="bottom" round style="height: 80%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="编辑序言" />
        <van-field v-model="preface.title" label="标题" placeholder="序言标题" />
        <van-field
          v-model="paragraphText"
          type="textarea"
          rows="12"
          label="内容"
          placeholder="每段用空行分隔"
        />
        <van-field v-model="preface.author" label="署名" placeholder="族委会" />
        <van-field v-model="preface.date" label="日期" placeholder="2026年6月" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="savePreface">保存</van-button>
        </div>
      </van-cell-group>
    </van-popup>

    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const loading = ref(true)
const showEdit = ref(false)
const preface = ref({
  title: '序言',
  paragraphs: [],
  author: '族委会',
  date: ''
})
const token = localStorage.getItem('token')

const paragraphText = computed({
  get: () => preface.value.paragraphs.join('\n\n'),
  set: (val) => {
    preface.value.paragraphs = val.split(/\n\n+/).filter(x => x.trim())
  }
})

function back() { router.back() }

async function loadPreface() {
  try {
    const res = await api.get(`/preface/family/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    preface.value = res.data
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

async function savePreface() {
  if (!preface.value.title.trim()) {
    showToast('请输入标题')
    return
  }

  try {
    await api.post(`/preface/family/${familyId}`, preface.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('已保存')
    showEdit.value = false
  } catch (e) {
    console.error('保存失败:', e)
    showToast('保存失败')
  }
}

function goBook() {
  router.push()
}

onMounted(() => loadPreface())
</script>

<style scoped>
.preface { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.loading-center { display: flex; justify-content: center; padding-top: 100px; }
.content-card { background: #fff; margin: 16px; padding: 24px; border-radius: 8px; }
.title { font-size: 24px; font-weight: bold; text-align: center; color: #333; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #667eea; }
.preface-body { font-size: 16px; line-height: 1.8; color: #333; }
.paragraph { margin-bottom: 16px; text-indent: 2em; }
.signature { margin-top: 32px; text-align: right; color: #666; }
.author { font-size: 14px; margin-bottom: 4px; }
.date { font-size: 12px; }
</style>