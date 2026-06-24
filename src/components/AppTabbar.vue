<template>
  <van-tabbar v-model="active" @change="onChange">
    <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
    <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
    <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
    <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  modelValue: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])
const route = useRoute()
const active = ref(props.modelValue)

// 根据路由自动设置 active
watch(() => route.path, (path) => {
  if (path === '/' || path.startsWith('/home')) active.value = 0
  else if (path.startsWith('/family')) active.value = 1
  else if (path.startsWith('/books')) active.value = 2
  else if (path.startsWith('/profile')) active.value = 3
}, { immediate: true })

function onChange(val) {
  emit('update:modelValue', val)
}
</script>
