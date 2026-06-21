<template>
  <div class="books">
    <van-nav-bar title="家族传承" />
    
    <!-- 家谱PDF入口 -->
    <div class="genealogy-pdf-card" @click="goExport">
      <div class="card-left">
        <van-icon name="cluster" size="32" color="#667eea" />
      </div>
      <div class="card-right">
        <div class="card-title">家谱印刷成册</div>
        <div class="card-desc">生成家谱PDF，下载打印</div>
      </div>
      <van-icon name="arrow" color="#999" />
    </div>
    
    <van-search v-model="searchText" placeholder="搜索图书" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部">
        <van-cell-group inset style="margin: 12px">
          <!-- 上传图书入口 -->
          <van-cell title="上传图书" label="上传PDF、图片等文件" is-link @click="showUpload = true">
            <template #icon>
              <div class="upload-icon">
                <van-icon name="plus" size="20" color="#667eea" />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
        <div class="book-grid">
          <div 
            v-for="book in books" 
            :key="book.id" 
            class="book-card" 
            @click="goReader(book)"
          >
            <div class="book-cover">
              <van-icon :name="getIcon(book.file_type)" size="40" />
            </div>
            <div class="book-title">{{ book.title }}</div>
            <van-tag size="small">{{ book.file_type?.toUpperCase() }}</van-tag>
          </div>
        </div>
        <van-empty v-if="books.length === 0" description="暂无图书" />
      </van-tab>
      
      <van-tab title="PDF">
        <div class="book-grid">
          <div 
            v-for="book in pdfBooks" 
            :key="book.id" 
            class="book-card"
            @click="goReader(book)"
          >
            <div class="book-cover">
              <van-icon name="description" size="40" />
            </div>
            <div class="book-title">{{ book.title }}</div>
          </div>
        </div>
      </van-tab>
      
      <van-tab title="图片">
        <div class="book-grid">
          <div 
            v-for="book in imageBooks" 
            :key="book.id" 
            class="book-card"
            @click="goReader(book)"
          >
            <div class="book-cover">
              <van-icon name="photo-o" size="40" />
            </div>
            <div class="book-title">{{ book.title }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <van-popup v-model:show="showUpload" position="bottom" round style="height: 70%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="上传图书" />
        <van-field
          v-model="uploadForm.title"
          label="书名"
          placeholder="请输入书名"
          required
        />
        <van-field
          v-model="uploadForm.author"
          label="作者"
          placeholder="作者（可选）"
        />
        <van-cell title="家族" required>
          <template #value>
            <van-radio-group v-model="uploadForm.family_id" direction="horizontal">
              <van-radio v-for="f in families" :key="f.id" :name="f.id">{{ f.name }}</van-radio>
            </van-radio-group>
          </template>
        </van-cell>
        <van-cell title="选择文件">
          <template #value>
            <van-uploader
              v-model="fileList"
              :max-count="1"
              accept=".pdf,.epub,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
              :after-read="onFileSelect"
            />
          </template>
        </van-cell>
        <div v-if="selectedFile" class="file-preview">
          <van-icon :name="getFileIcon(selectedFile.name)" size="24" />
          <span>{{ selectedFile.name }}</span>
        </div>
        <div style="padding: 16px">
          <van-button type="primary" block :loading="uploading" @click="uploadBook">上传</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { bookApi, familyApi } from '../api'

const router = useRouter()
const activeTab = ref(0)
const activeTabbar = ref(2)
const searchText = ref('')
const books = ref([])
const families = ref([])

const pdfBooks = computed(() => books.value.filter(b => b.file_type === 'pdf'))
const imageBooks = computed(() => books.value.filter(b => ['jpg', 'jpeg', 'png'].includes(b.file_type)))

// 上传相关
const showUpload = ref(false)
const uploading = ref(false)
const fileList = ref([])
const selectedFile = ref(null)
const uploadForm = ref({
  title: '',
  author: '',
  family_id: null
})

function getIcon(type) {
  if (type === 'pdf') return 'description'
  if (['jpg', 'jpeg', 'png'].includes(type)) return 'photo-o'
  if (type === 'docx') return 'notes-o'
  if (type === 'xlsx') return 'balance-list-o'
  if (type === 'pptx') return 'tv-o'
  if (type === 'epub') return 'bookmark-o'
  return 'description'
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return getIcon(ext)
}

async function loadBooks() {
  try {
    const res = await bookApi.list()
    books.value = res.data
  } catch (e) {
    showToast('加载失败')
  }
}

async function loadFamilies() {
  try {
    const res = await familyApi.list()
    families.value = res.data
    if (families.value.length > 0) {
      uploadForm.value.family_id = families.value[0].id
    }
  } catch (e) {
    console.error('加载家族失败', e)
  }
}

function goReader(book) {
  console.log('点击图书:', book)
  const params = new URLSearchParams({
    url: book.file_url,
    type: book.file_type,
    title: book.title
  })
  router.push(`/books/${book.id}?${params.toString()}`)
}

function goExport() {
  // 跳转到第一个家族的导出页面
  if (families.value.length > 0) {
    router.push(`/family/${families.value[0].id}/export`)
  } else {
    showToast('请先创建家族')
  }
}

function onFileSelect(file) {
  selectedFile.value = file.file
  if (!uploadForm.value.title) {
    uploadForm.value.title = file.file.name.replace(/\.[^/.]+$/, '')
  }
}

async function uploadBook() {
  if (!uploadForm.value.title) {
    showToast('请输入书名')
    return
  }
  if (!uploadForm.value.family_id) {
    showToast('请选择家族')
    return
  }
  if (!selectedFile.value) {
    showToast('请选择文件')
    return
  }
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('family_id', uploadForm.value.family_id)
    formData.append('title', uploadForm.value.title)
    formData.append('author', uploadForm.value.author || '')
    formData.append('file', selectedFile.value)
    
    const res = await fetch('/api/books', {
      method: 'POST',
      body: formData
    })
    
    if (!res.ok) throw new Error('上传失败')
    
    showToast('上传成功')
    showUpload.value = false
    uploadForm.value = { title: '', author: '', family_id: families.value[0]?.id }
    selectedFile.value = null
    fileList.value = []
    loadBooks()
  } catch (e) {
    showToast('上传失败: ' + e.message)
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  loadBooks()
  loadFamilies()
})
</script>

<style scoped>
.books {
  padding-bottom: 60px;
}
.genealogy-pdf-card {
  display: flex;
  align-items: center;
  margin: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 12px;
  border: 1px solid #667eea40;
}
.card-left {
  width: 56px;
  height: 56px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}
.card-right {
  flex: 1;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}
.card-desc {
  font-size: 12px;
  color: #999;
}
.upload-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}
.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
  padding-bottom: 20px;
}
.book-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.book-card:active {
  background: #f0f0f0;
}
.book-cover {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
.book-title {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 0 16px 16px;
}
.file-preview span {
  font-size: 14px;
  color: #333;
}
</style>