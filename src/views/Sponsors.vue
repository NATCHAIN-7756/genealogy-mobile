<template>
  <div class="sponsors">
    <van-nav-bar title="赞助名录" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showCreate = true" />
      </template>
    </van-nav-bar>
    
    <van-cell-group inset style="margin: 12px">
      <van-cell v-for="sponsor in sponsors" :key="sponsor.id">
        <template #icon>
          <van-icon name="balance-list-o" size="20" style="margin-right: 12px; color: #ff9800" />
        </template>
        <template #title>
          <span class="sponsor-name">{{ sponsor.donor_name }}</span>
        </template>
        <template #label>
          <span>{{ sponsor.donate_date?.slice(0,10) }}</span>
        </template>
        <template #value>
          <van-tag type="warning">¥{{ sponsor.amount }}</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="sponsors.length === 0" description="暂无赞助记录" />
    
    <van-popup v-model:show="showCreate" position="bottom" round style="height: 50%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="添加赞助" />
        <van-field v-model="newSponsor.donor_name" label="姓名" placeholder="赞助人姓名" required />
        <van-field v-model="newSponsor.amount" type="number" label="金额" placeholder="赞助金额" required />
        <van-field v-model="newSponsor.donate_date" label="日期" placeholder="YYYY-MM-DD" />
        <van-field v-model="newSponsor.note" label="备注" placeholder="备注信息" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="submitSponsor">提交</van-button>
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
const activeTabbar = ref(1)
const showCreate = ref(false)
const sponsors = ref([])
const newSponsor = ref({ donor_name: '', amount: '', donate_date: '', note: '' })

const token = localStorage.getItem('token')

function back() { router.back() }

async function loadSponsors() {
  try {
    const res = await axios.get(`http://45.207.215.95/api/sponsors/family/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    sponsors.value = res.data
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

async function submitSponsor() {
  if (!newSponsor.value.donor_name || !newSponsor.value.amount) {
    showToast('请填写完整')
    return
  }
  try {
    await axios.post(`http://45.207.215.95/api/sponsors/family/${familyId}`, newSponsor.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('提交成功')
    showCreate.value = false
    newSponsor.value = { donor_name: '', amount: '', donate_date: '', note: '' }
    loadSponsors()
  } catch (e) {
    console.error('提交失败:', e)
    showToast('提交失败')
  }
}

onMounted(() => loadSponsors())
</script>

<style scoped>
.sponsors { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.sponsor-name { font-weight: 500; }
</style>