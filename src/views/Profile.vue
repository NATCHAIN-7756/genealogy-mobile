<template>
  <div class="profile">
    <van-nav-bar title="我的" />
    
    <van-cell-group inset style="margin: 12px">
      <van-cell center>
        <template #icon>
          <van-image round width="60" height="60" style="background: #e8f3ff; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 24px; color: #1989fa">{{ surname || '李' }}</span>
        </van-image>
        </template>
        <template #title>
          <div class="user-name">{{ userInfo.name || '未设置姓名' }}</div>
        </template>
        <template #label>
          <div class="user-id">{{ userInfo.family_name || '选择家族后同步' }}</div>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="个人信息">
      <van-cell title="信息卡片" icon="idcard" is-link to="/infocard">
        <template #label>
          <span class="hint">个人基本信息</span>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="家谱投稿">
      <van-cell title="我的投稿" icon="edit" is-link to="/my-submissions">
        <template #label>
          <span class="hint">管理故事、照片、大事记等投稿</span>
        </template>
        <template #value>
          <van-badge :content="pendingCount" v-if="pendingCount > 0" />
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group inset style="margin: 12px" title="功能">
      <van-cell title="我的家族" icon="cluster" is-link to="/" />
      <van-cell title="我的图书" icon="bookmark-o" is-link to="/books" />
      <van-cell title="组委会" icon="friends-o" is-link to="/committee" v-if="isCommitteeMember">
        <template #label>
          <span class="hint">审核成员、编辑家谱</span>
        </template>
      </van-cell>
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
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { familyApi } from '../api'

const activeTabbar = ref(3)
const notifyEnabled = ref(true)
const darkMode = ref(false)
const isCommitteeMember = ref(true) // TODO: 根据用户角色判断
const pendingCount = ref(2) // 待审核数量

const surname = ref('')
const userInfo = ref({
  name: '',
  family_name: '',
  family_id: null
})

async function loadUserInfo() {
  try {
    const families = await familyApi.list()
    if (families.data.length > 0) {
      userInfo.value.family_name = families.data[0].name
      userInfo.value.family_id = families.data[0].id
      surname.value = families.data[0].surname || families.data[0].name.charAt(0)
    }
  } catch (e) {
    console.error('加载失败', e)
  }
}

onMounted(() => {
  loadUserInfo()
})
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
.hint {
  font-size: 12px;
  color: #999;
}
</style>