<template>
  <div class="committee">
    <van-nav-bar title="组委会" left-arrow @click-left="back" />
    
    <van-cell-group inset style="margin: 12px" title="审核管理">
      <van-cell title="待审核成员" icon="user-o" is-link to="/committee/members/pending">
        <template #value>
          <van-badge :content="pendingCount" v-if="pendingCount > 0">
            <span></span>
          </van-badge>
        </template>
      </van-cell>
      <van-cell title="待审核故事" icon="comment-o" is-link />
      <van-cell title="待审核照片" icon="photo-o" is-link />
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="内容管理">
      <van-cell title="编辑家谱" icon="edit" is-link to="/family" />
      <van-cell title="成员列表" icon="friends-o" is-link to="/committee/members" />
      <van-cell title="世系管理" icon="cluster-o" is-link />
      <van-cell title="大事记" icon="clock-o" is-link />
      <van-cell title="赞助名录" icon="gold-coin-o" is-link />
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="导出发布">
      <van-cell title="导出家谱PDF" icon="down" is-link to="/export" />
      <van-cell title="发布设置" icon="setting-o" is-link />
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="组委会设置">
      <van-cell title="成员角色" icon="user-circle-o" is-link />
      <van-cell title="邀请成员" icon="share" is-link />
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pendingCount = ref(3)

function back() {
  router.back()
}

onMounted(() => {
  // TODO: 加载待审核数量
})
</script>

<style scoped>
.committee {
  padding-bottom: 20px;
}
</style>
