<template>
  <div class="profile">
    <van-nav-bar title="我的" />
    
    <van-cell-group inset style="margin: 12px">
      <van-cell center>
        <template #icon>
          <van-image round width="60" height="60" style="background: #e8f3ff; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 24px; color: #1989fa">李</span>
        </van-image>
        </template>
        <template #title>
          <div class="user-name">LiXingYan</div>
        </template>
        <template #label>
          <div class="user-id">用户ID: test_user_001</div>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="功能">
      <van-cell title="我的家族" icon="cluster" is-link to="/" />
      <van-cell title="我的图书" icon="bookmark-o" is-link to="/books" />
      <van-cell title="历史版本" icon="clock-o" is-link />
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="设置">
      <van-cell title="消息通知" icon="bell">
        <template #right-icon>
          <van-switch v-model="notifyEnabled" size="20" />
        </template>
      </van-cell>
      <van-cell title="深色模式" icon="moon-o">
        <template #right-icon>
          <van-switch v-model="darkMode" size="20" />
        </template>
      </van-cell>
      <van-cell title="关于" icon="info-o" is-link />
    </van-cell-group>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">图书</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTabbar = ref(2)
const notifyEnabled = ref(true)
const darkMode = ref(false)
</script>

<style scoped>
.profile {
  padding-bottom: 50px;
}
.user-name {
  font-size: 18px;
  font-weight: 600;
}
.user-id {
  font-size: 12px;
  color: #999;
}
</style>