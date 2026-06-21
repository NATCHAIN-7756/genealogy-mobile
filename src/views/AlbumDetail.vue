<template>
  <div class="album-detail">
    <van-nav-bar :title="album.name" left-arrow @click-left="back">
      <template #right>
        <van-icon name="photo-o" size="20" @click="showUpload = true" />
      </template>
    </van-nav-bar>
    
    <!-- 相册信息 -->
    <div class="album-header">
      <van-image 
        :src="album.cover" 
        fit="cover"
        width="100%"
        height="200"
      />
      <div class="album-overlay">
        <div class="album-title">{{ album.name }}</div>
        <div class="album-meta">{{ album.photo_count }}张照片</div>
      </div>
    </div>
    
    <van-cell-group inset style="margin: 12px">
      <van-cell title="创建时间" :value="album.create_time" />
      <van-cell title="分类" :value="album.category" />
      <van-cell title="描述" :value="album.description || '暂无描述'" />
    </van-cell-group>
    
    <!-- 照片网格 -->
    <van-cell-group inset style="margin: 12px" title="照片列表">
      <van-grid :column-num="3" :gutter="4">
        <van-grid-item 
          v-for="photo in photos" 
          :key="photo.id"
          @click="previewPhoto(photo, photos)"
        >
          <van-image 
            :src="photo.thumbnail || photo.url" 
            fit="cover"
            width="100%"
            height="100"
            radius="4"
          />
          <div v-if="photo.taken_date" class="photo-date">{{ photo.taken_date }}</div>
        </van-grid-item>
      </van-grid>
    </van-cell-group>
    
    <van-empty v-if="photos.length === 0" description="暂无照片" />
    
    <!-- 上传弹窗 -->
    <van-popup v-model:show="showUpload" position="bottom" round style="height: 50%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="上传照片到相册" />
        <van-uploader 
          v-model="uploadFiles" 
          multiple
          :max-count="9"
          preview-size="80"
        />
        <div style="padding: 16px">
          <van-button type="primary" block :loading="uploading" @click="uploadPhotos">
            上传
          </van-button>
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
import { showToast, showImagePreview } from 'vant'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const albumId = route.params.albumId

const activeTabbar = ref(1)
const showUpload = ref(false)
const uploading = ref(false)
const uploadFiles = ref([])

const album = ref({
  id: 1,
  name: '全家福',
  cover: 'https://via.placeholder.com/400x200?text=全家福',
  photo_count: 15,
  create_time: '2026-01-15',
  category: '主题相册',
  description: '历年春节全家福合集'
})

const photos = ref([])

function back() {
  router.back()
}

function previewPhoto(photo, allPhotos) {
  const images = allPhotos.map(p => p.url)
  const index = allPhotos.findIndex(p => p.id === photo.id)
  showImagePreview({ images, startPosition: index })
}

async function uploadPhotos() {
  if (uploadFiles.value.length === 0) {
    showToast('请选择照片')
    return
  }
  
  uploading.value = true
  try {
    await new Promise(r => setTimeout(r, 1000))
    showToast('上传成功')
    showUpload.value = false
    uploadFiles.value = []
  } catch (e) {
    showToast('上传失败')
  } finally {
    uploading.value = false
  }
}

async function loadAlbum() {
  // 模拟数据
  photos.value = [
    { id: 1, url: 'https://via.placeholder.com/300?text=1980年', thumbnail: '', taken_date: '1980年春节' },
    { id: 2, url: 'https://via.placeholder.com/300?text=1985年', thumbnail: '', taken_date: '1985年春节' },
    { id: 3, url: 'https://via.placeholder.com/300?text=1990年', thumbnail: '', taken_date: '1990年春节' },
    { id: 4, url: 'https://via.placeholder.com/300?text=1995年', thumbnail: '', taken_date: '1995年春节' },
    { id: 5, url: 'https://via.placeholder.com/300?text=2000年', thumbnail: '', taken_date: '2000年春节' },
    { id: 6, url: 'https://via.placeholder.com/300?text=2010年', thumbnail: '', taken_date: '2010年春节' },
    { id: 7, url: 'https://via.placeholder.com/300?text=2020年', thumbnail: '', taken_date: '2020年春节' },
    { id: 8, url: 'https://via.placeholder.com/300?text=2026年', thumbnail: '', taken_date: '2026年春节' }
  ]
}

onMounted(() => {
  loadAlbum()
})
</script>

<style scoped>
.album-detail {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.album-header {
  position: relative;
}

.album-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 16px;
  color: #fff;
}

.album-title {
  font-size: 20px;
  font-weight: bold;
}

.album-meta {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.photo-date {
  font-size: 10px;
  color: #999;
  text-align: center;
  margin-top: 2px;
}
</style>