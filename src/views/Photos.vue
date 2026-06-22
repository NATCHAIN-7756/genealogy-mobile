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
      <van-grid-item v-for="photo in photos" :key="photo.id" @click="goPhoto(photo)">
        <van-image :src="photo.url" fit="cover" width="100%" height="150" radius="8" />
        <div class="photo-title">{{ photo.title }}</div>
      </van-grid-item>
    </van-grid>
    
    <van-empty v-if="photos.length === 0" description="暂无照片" />
    
    <van-popup v-model:show="showUpload" position="bottom" round style="height: 50%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="上传照片" />
        <van-field v-model="newPhoto.title" label="标题" placeholder="照片说明" />
        <van-field v-model="newPhoto.url" label="图片URL" placeholder="请输入图片地址" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="uploadPhoto">上传</van-button>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTab = ref(0)
const activeTabbar = ref(1)
const showUpload = ref(false)
const photos = ref([])
const newPhoto = ref({ title: '', url: '' })

const token = localStorage.getItem('token')

function back() { router.back() }
function goPhoto(photo) { router.push(`/family/${familyId}/album/${photo.id}`) }

async function loadPhotos() {
  try {
    // 照片接口暂未实现，使用模拟数据
    photos.value = [
      { id: 1, title: '1980年全家福', url: 'https://via.placeholder.com/300x200?text=全家福' },
      { id: 2, title: '爷爷年轻照', url: 'https://via.placeholder.com/300x200?text=爷爷' },
      { id: 3, title: '家族聚会', url: 'https://via.placeholder.com/300x200?text=聚会' }
    ]
  } catch (e) {
    showToast('加载失败')
  }
}

async function uploadPhoto() {
  if (!newPhoto.value.url) {
    showToast('请输入图片地址')
    return
  }
  showToast('上传成功')
  showUpload.value = false
  photos.value.unshift({ id: Date.now(), title: newPhoto.value.title || '新照片', url: newPhoto.value.url })
  newPhoto.value = { title: '', url: '' }
}

onMounted(() => { loadPhotos() })
</script>

<style scoped>
.photos { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.photo-title { padding: 8px; font-size: 12px; color: #666; }
</style>