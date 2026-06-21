<template>
  <div class="family-detail">
    <van-nav-bar :title="familyInfo.name" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editFamily" />
      </template>
    </van-nav-bar>
    
    <!-- 家庭信息卡片 -->
    <van-cell-group inset style="margin: 12px" title="家庭信息">
      <van-cell title="户主" :value="familyInfo.head_name" />
      <van-cell title="世代" :value="`第${familyInfo.generation || '?'}代`" />
      <van-cell title="现居地" :value="familyInfo.address || '未设置'" />
      <van-cell title="家庭成员" :value="`${familyInfo.member_count || 0}人`" />
      <van-cell title="联系方式" :value="familyInfo.phone || '未设置'" />
    </van-cell-group>
    
    <!-- 成员列表 -->
    <van-cell-group inset style="margin: 12px" title="成员列表">
      <van-cell 
        v-for="member in members"
        :key="member.id"
        is-link
        @click="goMemberCard(member)"
      >
        <template #title>
          <div class="member-name">
            {{ member.name }}
            <van-tag v-if="member.relation" size="small" type="primary">{{ member.relation }}</van-tag>
          </div>
        </template>
        <template #label>
          <div class="member-info">
            <span v-if="member.gender">{{ member.gender }}</span>
            <span v-if="member.age">{{ member.age }}岁</span>
            <span v-if="member.occupation">{{ member.occupation }}</span>
          </div>
        </template>
        <template #icon>
          <van-image 
            round 
            width="40" 
            height="40" 
            style="margin-right: 12px; background: #e8f3ff; display: flex; align-items: center; justify-content: center;"
          >
            <span style="font-size: 16px; color: #1989fa">{{ member.name?.charAt(0) }}</span>
          </van-image>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="members.length === 0" description="暂无成员" />
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const householdId = route.params.householdId
const activeTabbar = ref(1)

const familyInfo = ref({
  name: '加载中...',
  head_name: '',
  generation: null,
  address: '',
  member_count: 0,
  phone: ''
})

const members = ref([])

function back() {
  router.back()
}

function editFamily() {
  showToast('编辑功能开发中')
}

function goMemberCard(member) {
  router.push(`/family/${familyId}/member/${member.id}/card`)
}

async function loadFamilyDetail() {
  // 模拟数据（后续对接API）
  familyInfo.value = {
    name: '张三家庭',
    head_name: '张三',
    generation: 15,
    address: '北京市朝阳区',
    member_count: 4,
    phone: '138****1234'
  }
  
  members.value = [
    { id: 1, name: '张三', gender: '男', age: 45, relation: '户主', occupation: '工程师' },
    { id: 2, name: '李四', gender: '女', age: 43, relation: '配偶', occupation: '教师' },
    { id: 3, name: '张小明', gender: '男', age: 18, relation: '子', occupation: '学生' },
    { id: 4, name: '张小红', gender: '女', age: 15, relation: '女', occupation: '学生' }
  ]
}

onMounted(() => {
  loadFamilyDetail()
})
</script>

<style scoped>
.family-detail {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-info {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
</style>