<template>
  <div class="photos">
    <van-nav-bar title="家族相册" left-arrow @click-left="back">
      <template #right>
        <van-icon name="photo-o" size="20" @click="showUpload = true" />
      </template>
    </van-nav-bar>
    
    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ totalPhotos }}</div>
        <div class="stat-label">照片总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ albums.length }}</div>
        <div class="stat-label">相册数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ taggedCount }}</div>
        <div class="stat-label">已标注</div>
      </div>
    </div>
    
    <!-- 分类筛选 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="相册">
        <div class="album-grid">
          <div 
            v-for="album in albums" 
            :key="album.id" 
            class="album-card"
            @click="goAlbum(album)"
          >
            <van-image 
              :src="album.cover || 'https://via.placeholder.com/150?text=相册'" 
              fit="cover"
              width="100%"
              height="120"
              radius="8"
            />
            <div class="album-info">
              <div class="album-name">{{ album.name }}</div>
              <div class="album-count">{{ album.photo_count }}张</div>
            </div>
          </div>
          
          <!-- 创建相册 -->
          <div class="album-card create-card" @click="createAlbum">
            <van-icon name="plus" size="32" color="#999" />
            <div class="create-text">创建相册</div>
          </div>
        </div>
      </van-tab>
      
      <van-tab title="时间线">
        <van-list v-model:loading="loading" :finished="finished" @load="loadPhotos">
          <div v-for="year in timelineYears" :key="year" class="timeline-section">
            <div class="year-title">{{ year }}年代</div>
            <div class="photo-grid">
              <div 
                v-for="photo in getPhotosByYear(year)" 
                :key="photo.id"
                class="photo-item"
                @click="previewPhoto(photo)"
              >
                <van-image 
                  :src="photo.thumbnail || photo.url" 
                  fit="cover"
                  width="100%"
                  height="100"
                  radius="4"
                />
                <div v-if="photo.taken_year" class="photo-year">{{ photo.taken_year }}年</div>
              </div>
            </div>
          </div>
        </van-list>
      </van-tab>
      
      <van-tab title="全部">
        <van-search v-model="searchText" placeholder="搜索照片描述" />
        <div class="photo-grid all-photos">
          <div 
            v-for="photo in filteredPhotos" 
            :key="photo.id"
            class="photo-item"
            @click="previewPhoto(photo)"
          >
            <van-image 
              :src="photo.thumbnail || photo.url" 
              fit="cover"
              width="100%"
              height="100"
              radius="4"
            />
          </div>
        </div>
        <van-empty v-if="filteredPhotos.length === 0" description="暂无照片" />
      </van-tab>
    </van-tabs>
    
    <!-- 上传弹窗 -->
    <van-popup v-model:show="showUpload" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="上传照片" />
        <van-uploader 
          v-model="uploadFiles" 
          multiple
          :max-count="9"
          preview-size="80"
        />
        <van-field
          v-model="uploadDesc"
          type="textarea"
          rows="2"
          label="描述"
          placeholder="照片描述（可选）"
        />
        <van-cell title="选择相册">
          <template #value>
            <van-dropdown-menu>
              <van-dropdown-item v-model="uploadAlbum" :options="albumOptions" />
            </van-dropdown-menu>
          </template>
        </van-cell>
        <van-field
          v-model="uploadYear"
          type="number"
          label="拍摄年份"
          placeholder="如：1985（可选）"
        />
        <div style="padding: 16px">
          <van-button type="primary" block :loading="uploading" @click="uploadPhotos">
            上传
          </van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <!-- 照片详情弹窗 -->
    <van-popup v-model:show="showDetail" position="bottom" round style="height: 85%">
      <div class="photo-detail" v-if="currentPhoto">
        <van-image 
          :src="currentPhoto.url" 
          fit="contain"
          width="100%"
          height="300"
        />
        
        <van-cell-group inset style="margin: 12px">
          <van-cell title="基本信息" />
          <van-cell title="拍摄时间" :value="currentPhoto.taken_date || '未知'" />
          <van-cell title="拍摄地点" :value="currentPhoto.taken_place || '未知'" />
          <van-cell title="所属相册" :value="currentPhoto.album_name" />
          <van-cell title="描述" :value="currentPhoto.description || '暂无'" />
        </van-cell-group>
        
        <!-- 人物标注 -->
        <van-cell-group inset style="margin: 12px" title="人物标注">
          <div class="tagged-members">
            <van-tag 
              v-for="tag in currentPhoto.tagged_members" 
              :key="tag.member_id"
              type="primary"
              size="medium"
              @click="goMember(tag)"
              style="margin: 4px"
            >
              {{ tag.member_name }}
            </van-tag>
            <van-button size="small" plain @click="addTag">+ 标注人物</van-button>
          </div>
        </van-cell-group>
        
        <!-- 操作按钮 -->
        <div class="photo-actions">
          <van-button plain size="small" @click="downloadPhoto">
            <van-icon name="down" /> 下载
          </van-button>
          <van-button plain size="small" @click="sharePhoto">
            <van-icon name="share-o" /> 分享
          </van-button>
          <van-button plain size="small" @click="relateStory">
            <van-icon name="edit" /> 关联故事
          </van-button>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showImagePreview } from 'vant'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id

const activeTab = ref(0)
const activeTabbar = ref(1)
const searchText = ref('')
const loading = ref(false)
const finished = ref(false)
const showUpload = ref(false)
const showDetail = ref(false)
const uploading = ref(false)

const uploadFiles = ref([])
const uploadDesc = ref('')
const uploadAlbum = ref('')
const uploadYear = ref('')

const albums = ref([])
const photos = ref([])
const currentPhoto = ref(null)

const totalPhotos = computed(() => photos.value.length)
const taggedCount = computed(() => photos.value.filter(p => p.tagged_members?.length > 0).length)

const albumOptions = computed(() => [
  { text: '选择相册', value: '' },
  ...albums.value.map(a => ({ text: a.name, value: a.id }))
])

const timelineYears = computed(() => {
  const years = new Set()
  photos.value.forEach(p => {
    if (p.taken_year) years.add(Math.floor(p.taken_year / 10) * 10)
  })
  return Array.from(years).sort((a, b) => a - b)
})

const filteredPhotos = computed(() => {
  if (!searchText.value) return photos.value
  return photos.value.filter(p => 
    p.description?.includes(searchText.value) ||
    p.taken_place?.includes(searchText.value)
  )
})

function back() {
  router.back()
}

function goAlbum(album) {
  router.push(`/family/${familyId}/album/${album.id}`)
}

function previewPhoto(photo) {
  currentPhoto.value = photo
  showDetail.value = true
}

function getPhotosByYear(decade) {
  return photos.value.filter(p => {
    const year = p.taken_year
    return year && year >= decade && year < decade + 10
  })
}

function createAlbum() {
  showToast('创建相册功能开发中')
}

function addTag() {
  showToast('标注人物功能开发中')
}

function goMember(tag) {
  router.push(`/family/${familyId}/member/${tag.member_id}/card`)
}

function downloadPhoto() {
  showToast('下载功能开发中')
}

function sharePhoto() {
  showToast('分享功能开发中')
}

function relateStory() {
  showToast('关联故事功能开发中')
}

async function uploadPhotos() {
  if (uploadFiles.value.length === 0) {
    showToast('请选择照片')
    return
  }
  
  uploading.value = true
  try {
    // 模拟上传
    await new Promise(r => setTimeout(r, 1500))
    showToast('上传成功')
    showUpload.value = false
    uploadFiles.value = []
    uploadDesc.value = ''
    uploadYear.value = ''
  } catch (e) {
    showToast('上传失败')
  } finally {
    uploading.value = false
  }
}

async function loadPhotos() {
  // 模拟数据
  albums.value = [
    { id: 1, name: '全家福', photo_count: 15, cover: 'https://via.placeholder.com/150?text=全家福' },
    { id: 2, name: '老照片', photo_count: 32, cover: 'https://via.placeholder.com/150?text=老照片' },
    { id: 3, name: '祭祖活动', photo_count: 8, cover: 'https://via.placeholder.com/150?text=祭祖' },
    { id: 4, name: '婚礼纪念', photo_count: 25, cover: 'https://via.placeholder.com/150?text=婚礼' },
    { id: 5, name: '故居老宅', photo_count: 12, cover: 'https://via.placeholder.com/150?text=老宅' }
  ]
  
  photos.value = [
    { id: 1, url: 'https://via.placeholder.com/300?text=1980全家福', thumbnail: '', taken_year: 1980, taken_date: '1980年春节', taken_place: '济南', album_name: '全家福', description: '1980年春节全家福', tagged_members: [{member_id: 1, member_name: '张三'}, {member_id: 2, member_name: '李四'}] },
    { id: 2, url: 'https://via.placeholder.com/300?text=1950老照片', thumbnail: '', taken_year: 1950, taken_date: '1950年', taken_place: '山东', album_name: '老照片', description: '爷爷年轻时', tagged_members: [] },
    { id: 3, url: 'https://via.placeholder.com/300?text=2010祭祖', thumbnail: '', taken_year: 2010, taken_date: '2010年清明', taken_place: '祖茔', album_name: '祭祖活动', description: '清明祭祖', tagged_members: [] },
    { id: 4, url: 'https://via.placeholder.com/300?text=2020婚礼', thumbnail: '', taken_year: 2020, taken_date: '2020年10月', taken_place: '济南', album_name: '婚礼纪念', description: '张小明婚礼', tagged_members: [{member_id: 3, member_name: '张小明'}] },
    { id: 5, url: 'https://via.placeholder.com/300?text=1965合影', thumbnail: '', taken_year: 1965, taken_date: '1965年', taken_place: '老家', album_name: '老照片', description: '长辈合影', tagged_members: [] }
  ]
  
  finished.value = true
}

onMounted(() => {
  loadPhotos()
})
</script>

<style scoped>
.photos {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.stats-card {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin: 12px;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

.album-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.album-info {
  padding: 8px 12px;
}

.album-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.album-count {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  border: 2px dashed #ddd;
  background: #fafafa;
}

.create-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.timeline-section {
  margin-bottom: 16px;
}

.year-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 12px;
  background: #fff;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
}

.all-photos {
  padding: 12px;
}

.photo-item {
  position: relative;
}

.photo-year {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.photo-detail {
  background: #f5f5f5;
  min-height: 100%;
}

.tagged-members {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.photo-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
}
</style>