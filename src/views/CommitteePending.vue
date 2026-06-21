<template>
  <div class="committee-pending">
    <van-nav-bar title="待审核成员" left-arrow @click-left="back" />
    <van-cell-group inset style="margin: 12px">
      <van-list v-model:loading="loading" :finished="finished" @load="onLoad">
        <van-cell v-for="member in pendingMembers" :key="member.id" :title="member.name" :label="member.info">
          <template #value>
            <van-button size="small" type="primary" @click="approve(member.id)">通过</van-button>
            <van-button size="small" type="default" @click="reject(member.id)" style="margin-left: 4px">拒绝</van-button>
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
const loading = ref(false)
const finished = ref(true)
const pendingMembers = ref([
  { id: 1, name: '张四', info: '第19代，申请加入' },
  { id: 2, name: '张五', info: '第20代，信息待完善' }
])

function back() { router.back() }
function onLoad() {}
function approve(id) {
  pendingMembers.value = pendingMembers.value.filter(m => m.id !== id)
}
function reject(id) {
  pendingMembers.value = pendingMembers.value.filter(m => m.id !== id)
}
</script>

<style scoped>
.committee-pending { padding-bottom: 20px; }
</style>