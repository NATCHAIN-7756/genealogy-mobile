<template>
  <div class="home">
    <van-nav-bar title="家谱" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadData"
      >
        <van-cell-group inset style="margin: 12px">
          <van-cell
            v-for="family in families"
            :key="family.id"
            :title="family.name"
            :label="family.description"
            is-link
            @click="goFamily(family.id)"
          >
            <template #icon>
              <van-icon name="cluster" size="20" style="margin-right: 8px" />
            </template>
            <template #value>
              <van-tag type="primary">{{ family.member_count || 0 }}人</van-tag>
            </template>
          </van-cell>
        </van-cell-group>
        
        <van-empty v-if="!loading && families.length === 0" description="暂无家族" />
      </van-list>
    </van-pull-refresh>
    
    <van-floating-bubble icon="plus" @click="showCreate = true" />
    
    <van-popup v-model:show="showCreate" position="bottom" round style="height: 60%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="创建家族" />
        <van-field v-model="newFamily.name" label="家族名称" placeholder="请输入家族名称" />
        <van-field v-model="newFamily.surname" label="姓氏" placeholder="请输入姓氏" />
        <van-field v-model="newFamily.description" label="简介" type="textarea" rows="2" placeholder="家族简介（可选）" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="createFamily">创建</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <van-tabbar v-model="activeTab">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">图书</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { familyApi } from '../api'

const router = useRouter()
const activeTab = ref(0)
const families = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const showCreate = ref(false)

const newFamily = ref({ name: '', surname: '', description: '' })

async function loadData() {
  try {
    const res = await familyApi.list()
    families.value = res.data
    finished.value = true
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

async function onRefresh() {
  await loadData()
  refreshing.value = false
}

function goFamily(id) {
  router.push(`/family/${id}`)
}

async function createFamily() {
  if (!newFamily.value.name) {
    showToast('请输入家族名称')
    return
  }
  try {
    await familyApi.create(newFamily.value)
    showToast('创建成功')
    showCreate.value = false
    newFamily.value = { name: '', surname: '', description: '' }
    loadData()
  } catch (e) {
    showToast('创建失败')
  }
}
</script>

<style scoped>
.home {
  padding-bottom: 50px;
}
</style>
