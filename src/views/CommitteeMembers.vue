<template>
  <div class="committee-members">
    <van-nav-bar title="成员列表" left-arrow @click-left="back" />
    <van-cell-group inset style="margin: 12px">
      <van-search v-model="search" placeholder="搜索成员姓名" />
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="member in members" :key="member.id" :title="member.name" :label="member.generation">
          <template #value>
            <van-tag :type="member.status === 'active' ? 'success' : 'default'">{{ member.status === 'active' ? '已审核' : '待审核' }}</van-tag>
          </template>
        </van-cell>
      </van-list>
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const loading = ref(false)
const finished = ref(true)
const members = ref([
  { id: 1, name: '张三', generation: '第18代', status: 'active' },
  { id: 2, name: '张四', generation: '第19代', status: 'pending' }
])

function back() { router.back() }
function onLoad() {}
</script>

<style scoped>
.committee-members { padding-bottom: 20px; }
</style>