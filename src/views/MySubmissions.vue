<template>
  <div class="my-submissions">
    <van-nav-bar title="我的投稿" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="18" @click="showAddSheet = true" />
      </template>
    </van-nav-bar>
    
    <!-- 投稿统计 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-num">{{ stats.total }}</div>
        <div class="stat-label">总投稿</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.pending }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.approved }}</div>
        <div class="stat-label">已通过</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.rejected }}</div>
        <div class="stat-label">已退回</div>
      </div>
    </div>
    
    <!-- 章节列表 -->
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab v-for="chapter in chapters" :key="chapter.id" :title="chapter.title">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
            <van-cell-group inset style="margin: 12px">
              <van-cell v-for="item in chapter.items" :key="item.id" is-link @click="viewDetail(chapter.id, item.id)">
                <template #title>
                  <div class="item-title">{{ item.title }}</div>
                </template>
                <template #label>
                  <div class="item-meta">
                    <span>{{ item.date }}</span>
                    <van-tag :type="getStatusType(item.status)" size="small">{{ getStatusText(item.status) }}</van-tag>
                  </div>
                </template>
                <template #icon>
                  <van-image v-if="item.cover" :src="item.cover" width="40" height="40" radius="4" fit="cover" style="margin-right: 8px" />
                  <van-icon v-else :name="chapter.icon" size="40" color="#eee" style="margin-right: 8px" />
                </template>
              </van-cell>
            </van-cell-group>
            <van-empty v-if="chapter.items.length === 0" description="暂无投稿" />
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
    
    <!-- 新建投稿弹窗 -->
    <van-action-sheet v-model:show="showAddSheet" :actions="addActions" cancel-text="取消" @select="onAddSelect" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref(0)
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(true)
const showAddSheet = ref(false)

const stats = reactive({
  total: 8,
  pending: 2,
  approved: 5,
  rejected: 1
})

const chapters = ref([
  {
    id: 'stories',
    title: '家族故事',
    icon: 'comment-o',
    items: [
      { id: 1, title: '爷爷的创业故事', date: '2026-06-15', status: 'approved', cover: '' },
      { id: 2, title: '家族迁徙史', date: '2026-06-10', status: 'pending', cover: '' }
    ]
  },
  {
    id: 'photos',
    title: '家族相册',
    icon: 'photo-o',
    items: [
      { id: 3, title: '祖辈老照片', date: '2026-06-08', status: 'approved', cover: '' },
      { id: 4, title: '2026春节合影', date: '2026-06-05', status: 'approved', cover: '' }
    ]
  },
  {
    id: 'events',
    title: '大事记',
    icon: 'clock-o',
    items: [
      { id: 5, title: '李明升学宴', date: '2026-06-01', status: 'pending', cover: '' },
      { id: 6, title: '家族祭祖', date: '2026-05-28', status: 'approved', cover: '' }
    ]
  },
  {
    id: 'sponsors',
    title: '赞助名录',
    icon: 'gold-coin-o',
    items: [
      { id: 7, title: '捐款记录', date: '2026-05-20', status: 'approved', cover: '' }
    ]
  }
])

const addActions = [
  { name: '写家族故事', subname: '记录家族历史、家风传承', chapter: 'stories' },
  { name: '上传照片', subname: '老照片、家庭合影', chapter: 'photos' },
  { name: '记录大事', subname: '婚丧嫁娶、升学就业', chapter: 'events' },
  { name: '登记赞助', subname: '捐款捐物记录', chapter: 'sponsors' }
]

function back() {
  router.back()
}

function getStatusType(status) {
  return status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'danger'
}

function getStatusText(status) {
  return status === 'approved' ? '已通过' : status === 'pending' ? '待审核' : '已退回'
}

function onRefresh() {
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

function onLoad() {
  loading.value = false
}

function viewDetail(chapterId, itemId) {
  router.push(`/my-submissions/${chapterId}/${itemId}`)
}

function onAddSelect(action) {
  router.push(`/my-submissions/${action.chapter}/new`)
}
</script>

<style scoped>
.my-submissions {
  padding-bottom: 20px;
}

.stats-card {
  display: flex;
  background: #fff;
  margin: 12px;
  border-radius: 8px;
  padding: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.item-title {
  font-size: 14px;
  color: #333;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>