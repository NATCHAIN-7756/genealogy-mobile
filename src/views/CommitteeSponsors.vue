<template>
  <div class="committee-sponsors">
    <van-nav-bar title="待审核赞助" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="sponsor in sponsors" :key="sponsor.id" is-link @click="showDetail(sponsor)">
          <template #icon>
            <van-icon name="gold-coin-o" size="40" color="#ff976a" style="margin-right: 8px" />
          </template>
          <template #title>
            <div class="sponsor-title">{{ sponsor.name }}</div>
          </template>
          <template #label>
            <div class="sponsor-meta">
              <span>{{ sponsor.type }} · {{ sponsor.amount || sponsor.item }}</span>
              <div class="sponsor-date">{{ sponsor.date }}</div>
            </div>
          </template>
          <template #value>
            <van-button size="small" type="primary" @click.stop="approve(sponsor.id)">通过</van-button>
            <van-button size="small" type="default" @click.stop="reject(sponsor.id)" style="margin-left: 4px">拒绝</van-button>
          </template>
        </van-cell>
      </van-list>
      <van-empty v-if="sponsors.length === 0 && !loading" description="暂无待审核赞助" />
    </van-cell-group>
    
    <!-- 详情弹窗 -->
    <van-popup v-model:show="detailVisible" position="bottom" style="height: 60%">
      <div class="detail-popup">
        <van-nav-bar title="赞助详情" left-arrow @click-left="detailVisible = false" />
        <div class="detail-content">
          <van-cell-group inset>
            <van-cell title="赞助人" :value="currentSponsor.name" />
            <van-cell title="赞助类型" :value="currentSponsor.type" />
            <van-cell title="金额/物品" :value="currentSponsor.amount || currentSponsor.item" />
            <van-cell title="赞助日期" :value="currentSponsor.date" />
            <van-cell title="留言" :value="currentSponsor.message" v-if="currentSponsor.message" />
          </van-cell-group>
        </div>
        <div class="detail-actions">
          <van-field v-model="reviewComment" placeholder="审核意见（拒绝时填写）" />
          <van-button type="primary" block @click="approve(currentSponsor.id)">通过</van-button>
          <van-button type="danger" block @click="reject(currentSponsor.id)" style="margin-top: 8px">拒绝</van-button>
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

const sponsors = ref([
  { id: 1, name: '张三', type: '现金', amount: '5000元', item: '', date: '2026-05-20', message: '愿家族繁荣昌盛' },
  { id: 2, name: '李四', type: '物品', amount: '', item: '水泥10吨', date: '2026-05-18', message: '' }
])

const currentSponsor = ref({})

function back() { router.back() }
function onLoad() { loading.value = false }

function showDetail(sponsor) {
  currentSponsor.value = sponsor
  detailVisible.value = true
}

async function approve(id) {
  sponsors.value = sponsors.value.filter(s => s.id !== id)
  detailVisible.value = false
  showSuccessToast('审核通过')
}

async function reject(id) {
  if (!reviewComment.value) {
    showToast('请填写拒绝原因')
    return
  }
  sponsors.value = sponsors.value.filter(s => s.id !== id)
  detailVisible.value = false
  reviewComment.value = ''
  showSuccessToast('已拒绝')
}
</script>

<style scoped>
.committee-sponsors { padding-bottom: 20px; }

.sponsor-title { font-size: 14px; color: #333; }
.sponsor-meta { font-size: 12px; color: #999; margin-top: 4px; }
.sponsor-date { color: #666; margin-top: 2px; }

.detail-popup { height: 100%; display: flex; flex-direction: column; }
.detail-content { flex: 1; overflow-y: auto; padding: 16px; }
.detail-actions { padding: 12px; background: #fff; border-top: 1px solid #eee; }
</style>