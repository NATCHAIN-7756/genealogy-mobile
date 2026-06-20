<template>
  <div class="tree">
    <van-nav-bar title="家族树图" left-arrow @click-left="back" />
    
    <van-loading v-if="loading" class="loading-center" />
    
    <div v-else class="tree-scroll">
      <div class="tree-nodes">
        <div v-for="gen in generations" :key="gen.level" class="generation">
          <div v-for="member in gen.members" :key="member.id" class="node" @click="showMember(member)">
            <van-image round width="50" height="50" style="background: #e8f3ff; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 20px; color: #1989fa">{{ member.name?.charAt(0) }}</span>
          </van-image>
            <div class="name">{{ member.name }}</div>
            <div class="relation">{{ member.relation }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <van-action-bar>
      <van-action-bar-button icon="replay" text="重置" @click="resetTree" />
      <van-action-bar-button type="primary" icon="share" text="分享" @click="shareTree" />
    </van-action-bar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { canvasApi } from '../api'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const treeData = ref(null)
const familyId = route.params.id

const generations = computed(() => {
  if (!treeData.value) return []
  return treeData.value.generations || []
})

function back() {
  router.back()
}

async function loadTree() {
  try {
    const res = await canvasApi.getTree(familyId)
    treeData.value = res.data
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function showMember(member) {
  showToast(member.name)
}

function resetTree() {
  loadTree()
}

function shareTree() {
  showToast('分享功能开发中')
}

onMounted(() => {
  loadTree()
})
</script>

<style scoped>
.tree {
  height: 100vh;
  background: #f7f8fa;
}
.loading-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.tree-scroll {
  overflow-x: auto;
  padding: 16px;
}
.tree-nodes {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: max-content;
}
.generation {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  min-width: 80px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.name {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}
.relation {
  font-size: 12px;
  color: #999;
}
</style>