<template>
  <div class="committee-photos">
    <van-nav-bar title="待审核照片" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="album in albums" :key="album.id" is-link @click="showDetail(album)">
          <template #icon>
            <van-image :src="album.cover || 'https://via.placeholder.com/50'" width="50" height="50" radius="4" fit="cover" style="margin-right: 8px" />
          </template>
          <template #title>
            <div class="album-title">{{ album.title }}</div>
          </template>
          <template #label>
            <div class="album-meta">
              <span>{{ album.author }} · {{ album.submitDate }} · {{ album.count }}张照片</span>
              <div class="album-desc">{{ album.description }}</div>
            </div>
          </template>
          <template #value>
            <van-button size="small" type="primary" @click.stop="approve(album.id)">通过</van-button>
            <van-button size="small" type="default" @click.stop="reject(album.id)" style="margin-left: 4px">拒绝</van-button>
          </template>
        </van-cell>
      </van-list>
      <van-empty v-if="albums.length === 0 && !loading" description="暂无待审核照片" />
    </van-cell-group>
    
    <!-- 详情弹窗 -->
    <van-popup v-model:show="detailVisible" position="bottom" style="height: 80%">
      <div class="detail-popup">
        <van-nav-bar title="照片详情" left-arrow @click-left="detailVisible = false" />
        <div class="detail-content">
          <div class="detail-title">{{ currentAlbum.title }}</div>
          <div class="detail-meta">{{ currentAlbum.author }} · {{ currentAlbum.submitDate }}</div>
          <van-divider />
          <div class="detail-desc">{{ currentAlbum.description }}</div>
          <div class="photo-grid">
            <van-image v-for="(photo, i) in currentAlbum.photos" :key="i" :src="photo" width="100%" fit="contain" style="margin: 8px 0" />
          </div>
        </div>
        <div class="detail-actions">
          <van-field v-model="reviewComment" placeholder="审核意见（拒绝时填写）" />
          <van-button type="primary" block @click="approve(currentAlbum.id)">通过</van-button>
          <van-button type="danger" block @click="reject(currentAlbum.id)" style="margin-top: 8px">拒绝</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const loading = ref(false)
const finished = ref(true)
const detailVisible = ref(false)
const reviewComment = ref('')

const albums = ref([
  { id: 1, title: '祖辈老照片', author: '张三', submitDate: '2026-06-08', count: 5, description: '爷爷奶奶年轻时的照片', cover: '', photos: [] },
  { id: 2, title: '2026春节合影', author: '李四', submitDate: '2026-06-05', count: 12, description: '春节全家福', cover: '', photos: [] }
])

const currentAlbum = ref({})

function back() { router.back() }
function onLoad() { loading.value = false }

function showDetail(album) {
  currentAlbum.value = album
  detailVisible.value = true
}

async function approve(id) {
  albums.value = albums.value.filter(a => a.id !== id)
  detailVisible.value = false
  showSuccessToast('审核通过')
}

async function reject(id) {
  if (!reviewComment.value) {
    showToast('请填写拒绝原因')
    return
  }
  albums.value = albums.value.filter(a => a.id !== id)
  detailVisible.value = false
  reviewComment.value = ''
  showSuccessToast('已拒绝')
}
</script>

<style scoped>
.committee-photos { padding-bottom: 20px; }

.album-title { font-size: 14px; color: #333; }
.album-meta { font-size: 12px; color: #999; margin-top: 4px; }
.album-desc { color: #666; margin-top: 4px; }

.detail-popup { height: 100%; display: flex; flex-direction: column; }
.detail-content { flex: 1; overflow-y: auto; padding: 16px; }
.detail-title { font-size: 18px; font-weight: bold; }
.detail-meta { font-size: 12px; color: #999; margin-top: 8px; }
.detail-desc { font-size: 14px; color: #666; margin-bottom: 12px; }
.photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.detail-actions { padding: 12px; background: #fff; border-top: 1px solid #eee; }
</style>