<template>
  <div class="family-detail">
    <van-nav-bar title="家庭详情" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px" v-if="family">
      <van-cell center>
        <template #icon>
          <van-icon name="home-o" size="24" style="margin-right: 12px; color: #1989fa" />
        </template>
        <template #title>
          <div class="family-name">{{ family.name }}</div>
        </template>
        <template #label>
          <div class="family-info">第{{ family.generation }}代 · {{ family.member_count || 0 }}人</div>
        </template>
      </van-cell>
      
      <van-cell title="地址" :value="family.address || '未设置'" icon="location-o" />
      <van-cell title="电话" :value="family.phone || '未设置'" icon="phone-o" />
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="家庭成员">
      <van-cell v-for="member in members" :key="member.id" is-link @click="goMember(member)">
        <template #icon>
          <van-icon name="user-o" size="20" style="margin-right: 8px" />
        </template>
        <template #title>
          <span>{{ member.name }}</span>
          <van-tag v-if="member.is_head" type="primary" size="small">户主</van-tag>
        </template>
        <template #label>
          <span>{{ member.relation || '成员' }} · {{ member.birth_date || '' }}</span>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="!family" description="家庭不存在" />
    
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
const householdId = route.params.householdId
const activeTabbar = ref(1)
const family = ref(null)
const members = ref([])

const token = localStorage.getItem('token')

function back() { router.back() }
function goMember(member) { router.push(`/member/${member.id}`) }

async function loadFamily() {
  try {
    const res = await axios.get(`http://45.207.215.95/api/members/family/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    members.value = res.data
    if (res.data.length > 0) {
      const head = res.data.find(m => m.is_head) || res.data[0]
      family.value = {
        name: head.name + '家庭',
        generation: head.generation,
        member_count: res.data.length,
        address: head.address || '',
        phone: head.phone || ''
      }
    }
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

onMounted(() => { loadFamily() })
</script>

<style scoped>
.family-detail { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.family-name { font-size: 18px; font-weight: 500; }
.family-info { font-size: 12px; color: #999; margin-top: 4px; }
</style>