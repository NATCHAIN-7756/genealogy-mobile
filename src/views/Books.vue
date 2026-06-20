<template>
  <div class="books">
    <van-nav-bar title="家族图书" />
    
    <van-search v-model="searchText" placeholder="搜索图书" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部">
        <van-list v-model:loading="loading" :finished="finished" @load="loadBooks">
          <div class="book-grid">
            <div v-for="book in books" :key="book.id" class="book-card" @click="goReader(book)">
              <div class="book-cover">
                <van-icon :name="getIcon(book.file_type)" size="40" />
              </div>
              <div class="book-title">{{ book.title }}</div>
              <van-tag size="small">{{ book.file_type?.toUpperCase() }}</van-tag>
            </div>
          </div>
        </van-list>
        <van-empty v-if="books.length === 0" description="暂无图书" />
      </van-tab>
      
      <van-tab title="PDF">
        <div class="book-grid">
          <div v-for="book in pdfBooks" :key="book.id" class="book-card" @click="goReader(book)">
            <div class="book-cover">
              <van-icon name="description" size="40" />
            </div>
            <div class="book-title">{{ book.title }}</div>
          </div>
        </div>
      </van-tab>
      
      <van-tab title="图片">
        <div class="book-grid">
          <div v-for="book in imageBooks" :key="book.id" class="book-card" @click="goReader(book)">
            <div class="book-cover">
              <van-icon name="photo-o" size="40" />
            </div>
            <div class="book-title">{{ book.title }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o">图书</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { bookApi } from '../api'

const router = useRouter()
const activeTab = ref(0)
const activeTabbar = ref(1)
const searchText = ref('')
const books = ref([])
const loading = ref(false)
const finished = ref(false)

const pdfBooks = computed(() => books.value.filter(b => b.file_type === 'pdf'))
const imageBooks = computed(() => books.value.filter(b => ['jpg', 'jpeg', 'png'].includes(b.file_type)))

function getIcon(type) {
  if (type === 'pdf') return 'description'
  if (['jpg', 'jpeg', 'png'].includes(type)) return 'photo-o'
  return 'bookmark-o'
}

async function loadBooks() {
  try {
    const res = await bookApi.list()
    books.value = res.data
    finished.value = true
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function goReader(book) {
  router.push(`/books/${book.id}?url=${book.file_url}&type=${book.file_type}&title=${book.title}`)
}

loadBooks()
</script>

<style scoped>
.books {
  padding-bottom: 50px;
}
.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}
.book-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
</style>