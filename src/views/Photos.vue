<template>
  <div class="photos">
    <van-nav-bar title="家族相册" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showUpload = true" />
      </template>
    </van-nav-bar>
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部" />
      <van-tab title="全家福" />
      <van-tab title="老照片" />
      <van-tab title="活动" />
    </van-tabs>
    
    <van-grid :column-num="2" :gutter="12" style="padding: 12px">
      <van-grid-item v-for="photo in photos" :key="photo.id" @click="previewPhoto(photo)">
        <van-image :src="photo.url" fit="cover" width="100%" height="150" radius="8" />
        <div class="photo-title">{{ photo.title }}</div>
      </van-grid-item>
    </van-grid>
    
    <van-empty v-if="photos.length === 0" description="暂无照片" />
    
    <van-popup v-model:show="showUpload" position="bottom" round style="height: 50%" class="upload-popup">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="上传照片" />
        <van-field v-model="newPhoto.title" label="标题" placeholder="照片说明" />
        <van-field v-model="newPhoto.url" label="图片URL" placeholder="请输入图片地址" />
        <van-cell title="分类">
          <template #value>
            <van-radio-group v-model="newPhoto.category" direction="horizontal">
              <van-radio name="全家福">全家福</van-radio>
              <van-radio name="老照片">老照片</van-radio>
              <van-radio name="活动">活动</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        <div style="padding: 16px">
          <van-button type="primary" block @click="uploadPhoto">上传</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <van-image-preview v-model:show="showPreview" :images="previewImages" :start-position="previewIndex" />
    
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
const activeTab = ref(0)
const activeTabbar = ref(1)
const showUpload = ref(false)
const showPreview = ref(false)
const previewIndex = ref(0)
const photos = ref([])
const newPhoto = ref({ title: '', url: '', category: '全家福' })

const token = localStorage.getItem('token')

function back() { router.back() }

function previewPhoto(photo) {
  previewIndex.value = photos.value.findIndex(p => p.id === photo.id)
  showPreview.value = true
}

const previewImages = ref([])

async function loadPhotos() {
  try {
    const categories = ['全部', '全家福', '老照片', '活动']
    const category = categories[activeTab.value]
    
    const res = await api.get(`/api/photos/family/${familyId}`, {
      params: { category },
      headers: { Authorization: `Bearer ${token}` }
    })
    photos.value = res.data
    previewImages.value = photos.value.map(p => p.url)
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

async function uploadPhoto() {
  if (!newPhoto.value.url) {
    showToast('请输入图片地址')
    return
  }
  try {
    await api.post(`/api/photos/family/${familyId}`, newPhoto.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('上传成功')
    showUpload.value = false
    newPhoto.value = { title: '', url: '', category: '全家福' }
    loadPhotos()
  } catch (e) {
    console.error('上传失败:', e)
    showToast('上传失败')
  }
}

onMounted(() => loadPhotos())
</script>

<style scoped>
.photos { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.photo-title { padding: 8px; font-size: 12px; color: #666; }

/* 上传弹窗样式 */
.upload-popup :deep(.van-field__label) {
  color: #333 !important;
  font-weight: 500;
}
.upload-popup :deep(.van-cell__title) {
  color: #333 !important;
}
.upload-popup :deep(.van-radio__label) {
  color: #333 !important;
}
</style>