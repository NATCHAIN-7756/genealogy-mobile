<template>
  <div class="member-detail">
    <van-nav-bar title="成员详情" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px" v-if="member">
      <van-cell center>
        <template #icon>
          <van-image round width="60" height="60" style="background: #e8f3ff; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px; color: #1989fa">{{ member.name?.charAt(0) || '人' }}</span>
          </van-image>
        </template>
        <template #title>
          <div class="member-name">{{ member.name }}</div>
        </template>
        <template #label>
          <div class="member-info">第{{ member.generation }}代 · {{ member.gender === 'male' ? '男' : '女' }}</div>
        </template>
      </van-cell>
      
      <van-cell title="出生日期" :value="member.birth_date || '未设置'" icon="calendar-o" />
      <van-cell title="籍贯" :value="member.birthplace || '未设置'" icon="location-o" />
      <van-cell title="学历" :value="member.education || '未设置'" icon="bookmark-o" />
      <van-cell title="职业" :value="member.occupation || '未设置'" icon="briefcase-o" />
      <van-cell title="电话" :value="member.phone || '未设置'" icon="phone-o" />
      <van-cell title="地址" :value="member.address || '未设置'" icon="home-o" />
      <van-cell title="简介" :value="member.bio || '暂无'" />
    </van-cell-group>
    
    <van-empty v-if="!member" description="成员不存在" />
    
    <van-cell-group inset style="margin: 12px" title="家庭关系">
      <van-cell v-if="member?.spouse_name" title="配偶" :value="member.spouse_name" icon="friends-o" />
      <van-cell v-if="member?.father_name" title="父亲" :value="member.father_name" icon="user-o" />
      <van-cell v-if="member?.mother_name" title="母亲" :value="member.mother_name" icon="user-o" />
      <van-cell v-for="child in member?.children" :key="child.id" title="子女" :value="child.name" icon="friends-o" />
    </van-cell-group>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const memberId = route.params.memberId || route.params.id
const activeTabbar = ref(1)
const member = ref(null)

const token = localStorage.getItem('token')

function back() { router.back() }

async function loadMember() {
  try {
    const res = await api.get('/...')
    member.value = res.data
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

onMounted(() => loadMember())
</script>

<style scoped>
.member-detail { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.member-name { font-size: 18px; font-weight: 600; }
.member-info { font-size: 12px; color: #999; margin-top: 4px; }
</style>