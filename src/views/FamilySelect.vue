<template>
  <div class="family-select">
    <van-nav-bar title="选择家族" />
    
    <van-cell-group inset style="margin: 12px">
      <van-cell
        v-for="family in families" 
        :key="family.id"
        :title="family.name"
        :label="family.description || '点击进入家谱'"
        is-link
        @click="goFamily(family)"
      >
        <template #icon>
          <van-icon name="cluster" size="20" style="margin-right: 8px" />
        </template>
        <template #value>
          <van-tag type="primary">{{ family.member_count || 0 }}人</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="families.length === 0" description="暂无家族，请先创建" />
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { familyApi } from '../api'

const router = useRouter()
const activeTabbar = ref(1)
const families = ref([])

async function loadFamilies() {
  try {
    const res = await familyApi.list()
    families.value = res.data
    // 如果只有一个家族，直接跳转
    if (res.data.length === 1) {
      router.replace()
    }
  } catch (e) {
    showToast('加载失败')
  }
}

function goFamily(family) {
  router.push()
}

onMounted(() => {
  loadFamilies()
})
</script>

<style scoped>
.family-select {
  padding-bottom: 50px;
}
</style>
