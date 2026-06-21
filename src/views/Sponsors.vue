<template>
  <div class="sponsors">
    <van-nav-bar title="赞助致谢" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showAdd = true" />
      </template>
    </van-nav-bar>
    
    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ sponsors.length }}</div>
        <div class="stat-label">赞助人数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalAmount }}</div>
        <div class="stat-label">总金额(元)</div>
      </div>
    </div>
    
    <!-- 致谢词 -->
    <van-cell-group inset style="margin: 12px" title="致谢词">
      <div class="thanks-content">
        <p>本次修谱，承蒙以下族人慷慨捐助，鼎力支持，使家谱得以顺利出版。在此，编委会谨向各位赞助者致以诚挚谢意！</p>
        <p>望我族人发扬传统，团结互助，使家族日益兴旺，世代传承。</p>
      </div>
    </van-cell-group>
    
    <!-- 赞助名录 -->
    <van-cell-group inset style="margin: 12px" title="赞助名录">
      <van-cell 
        v-for="sponsor in sponsorsSorted" 
        :key="sponsor.id"
        :title="sponsor.name"
        :label="sponsor.date"
      >
        <template #icon>
          <van-tag :type="getLevelTag(sponsor.amount)" size="medium" style="margin-right: 8px">
            {{ getLevel(sponsor.amount) }}
          </van-tag>
        </template>
        <template #value>
          <span class="amount">{{ sponsor.amount }}元</span>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="sponsors.length === 0" description="暂无赞助记录" />
    
    <!-- 添加赞助 -->
    <van-popup v-model:show="showAdd" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="添加赞助" />
        <van-field v-model="newSponsor.name" label="姓名" placeholder="赞助人姓名" required />
        <van-field v-model="newSponsor.amount" type="number" label="金额" placeholder="赞助金额" required />
        <van-field v-model="newSponsor.date" label="日期" placeholder="YYYY-MM-DD" />
        <van-field v-model="newSponsor.remark" label="备注" placeholder="可选" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="addSponsor">添加</van-button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const showAdd = ref(false)

const sponsors = ref([])

const newSponsor = ref({
  name: '',
  amount: '',
  date: '',
  remark: ''
})

const totalAmount = computed(() => {
  return sponsors.value.reduce((sum, s) => sum + parseInt(s.amount || 0), 0)
})

const sponsorsSorted = computed(() => {
  return [...sponsors.value].sort((a, b) => parseInt(b.amount) - parseInt(a.amount))
})

function back() {
  router.back()
}

function getLevel(amount) {
  const a = parseInt(amount)
  if (a >= 10000) return '功德主'
  if (a >= 5000) return '护法主'
  if (a >= 1000) return '赞助人'
  return '热心人'
}

function getLevelTag(amount) {
  const level = getLevel(amount)
  const map = {
    '功德主': 'warning',
    '护法主': 'primary',
    '赞助人': 'success',
    '热心人': 'default'
  }
  return map[level] || 'default'
}

function addSponsor() {
  if (!newSponsor.value.name || !newSponsor.value.amount) {
    showToast('请填写姓名和金额')
    return
  }
  
  sponsors.value.push({
    id: Date.now(),
    name: newSponsor.value.name,
    amount: parseInt(newSponsor.value.amount),
    date: newSponsor.value.date || new Date().toLocaleDateString('zh-CN'),
    remark: newSponsor.value.remark
  })
  
  localStorage.setItem(`family_${familyId}_sponsors`, JSON.stringify(sponsors.value))
  showToast('已添加')
  showAdd.value = false
  newSponsor.value = { name: '', amount: '', date: '', remark: '' }
}

onMounted(() => {
  const saved = localStorage.getItem(`family_${familyId}_sponsors`)
  if (saved) {
    sponsors.value = JSON.parse(saved)
  } else {
    // 模拟数据
    sponsors.value = [
      { id: 1, name: '张明华', amount: 10000, date: '2025-03-15', remark: '' },
      { id: 2, name: '张德强', amount: 5000, date: '2025-04-20', remark: '' },
      { id: 3, name: '张传伟', amount: 3000, date: '2025-05-10', remark: '' },
      { id: 4, name: '张立业', amount: 2000, date: '2025-06-01', remark: '' },
      { id: 5, name: '张光宗', amount: 1000, date: '2025-06-15', remark: '' }
    ]
  }
})
</script>

<style scoped>
.sponsors {
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

.thanks-content {
  padding: 12px;
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

.thanks-content p {
  margin-bottom: 8px;
  text-indent: 2em;
}

.amount {
  font-size: 16px;
  font-weight: bold;
  color: #ff9800;
}
</style>