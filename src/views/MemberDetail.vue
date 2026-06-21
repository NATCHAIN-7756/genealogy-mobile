<template>
  <div class="member">
    <van-nav-bar title="成员详情" left-arrow @click-left="back" />
    <van-cell-group inset>
      <van-cell title="姓名" :value="member.name" />
      <van-cell title="性别" :value="member.gender" />
      <van-cell title="出生日期" :value="member.birth_date" />
    </van-cell-group>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { memberApi } from '../api'
const router = useRouter()
const route = useRoute()
const member = ref({})
function back() { router.back() }
onMounted(async () => {
  const res = await memberApi.get(route.params.id)
  member.value = res.data
})
</script>
