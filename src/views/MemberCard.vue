<template>
  <div class="member-card">
    <van-nav-bar :title="memberInfo.name" left-arrow @click-left="back">
      <template #right>
        <van-icon name="share" size="20" @click="shareCard" />
      </template>
    </van-nav-bar>
    
    <!-- 个人头像和基本信息 -->
    <div class="card-header">
      <van-image round width="80" height="80" style="background: #e8f3ff;">
        <template #default>
          <span style="font-size: 32px; color: #1989fa">{{ memberInfo.name?.charAt(0) }}</span>
        </template>
      </van-image>
      <div class="card-name">{{ memberInfo.name }}</div>
      <div class="card-tags">
        <van-tag type="primary">第{{ memberInfo.generation || '?' }}代</van-tag>
        <van-tag v-if="memberInfo.gender" :type="memberInfo.gender === '男' ? 'primary' : 'danger'">{{ memberInfo.gender }}</van-tag>
        <van-tag v-if="memberInfo.age">{{ memberInfo.age }}岁</van-tag>
      </div>
    </div>
    
    <!-- 基本信息 -->
    <van-cell-group inset style="margin: 12px" title="基本信息">
      <van-cell title="姓名" :value="memberInfo.name" />
      <van-cell title="性别" :value="memberInfo.gender || '未设置'" />
      <van-cell title="出生日期" :value="memberInfo.birth_date || '未设置'" />
      <van-cell title="出生地" :value="memberInfo.birth_place || '未设置'" />
      <van-cell title="籍贯" :value="memberInfo.hometown || '未设置'" />
      <van-cell title="民族" :value="memberInfo.ethnicity || '汉族'" />
    </van-cell-group>
    
    <!-- 联系方式 -->
    <van-cell-group inset style="margin: 12px" title="联系方式">
      <van-cell title="手机号" :value="memberInfo.phone || '未设置'" />
      <van-cell title="微信号" :value="memberInfo.wechat || '未设置'" />
      <van-cell title="现居地" :value="memberInfo.address || '未设置'" />
    </van-cell-group>
    
    <!-- 教育工作 -->
    <van-cell-group inset style="margin: 12px" title="教育工作">
      <van-cell title="学历" :value="memberInfo.education || '未设置'" />
      <van-cell title="职业" :value="memberInfo.occupation || '未设置'" />
      <van-cell title="单位" :value="memberInfo.company || '未设置'" />
    </van-cell-group>
    
    <!-- 家庭关系 -->
    <van-cell-group inset style="margin: 12px" title="家庭关系">
      <van-cell title="父亲" :value="memberInfo.father_name || '未设置'" />
      <van-cell title="母亲" :value="memberInfo.mother_name || '未设置'" />
      <van-cell title="配偶" :value="memberInfo.spouse_name || '未设置'" />
      <van-cell title="子女" :value="memberInfo.children_names || '未设置'" />
    </van-cell-group>
    
    <!-- 个人简介 -->
    <van-cell-group inset style="margin: 12px" title="个人简介">
      <div class="bio-content">{{ memberInfo.bio || '暂无简介' }}</div>
    </van-cell-group>
    
    <!-- 操作按钮 -->
    <div style="padding: 16px">
      <van-button type="primary" block @click="editCard">编辑信息</van-button>
    </div>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const memberId = route.params.memberId
const activeTabbar = ref(1)

const memberInfo = ref({
  name: '加载中...',
  generation: null,
  gender: '',
  age: null,
  birth_date: '',
  birth_place: '',
  hometown: '',
  ethnicity: '',
  phone: '',
  wechat: '',
  address: '',
  education: '',
  occupation: '',
  company: '',
  father_name: '',
  mother_name: '',
  spouse_name: '',
  children_names: '',
  bio: ''
})

function back() {
  router.back()
}

function shareCard() {
  showToast('分享功能开发中')
}

function editCard() {
  // 跳转到编辑页面或打开编辑弹窗
  showToast('编辑功能开发中')
}

async function loadMemberCard() {
  memberInfo.value = {
    name: '张三',
    generation: 15,
    gender: '男',
    age: 45,
    birth_date: '1981-03-15',
    birth_place: '北京市',
    hometown: '山东济南',
    ethnicity: '汉族',
    phone: '138****1234',
    wechat: 'zhangsan123',
    address: '北京市朝阳区',
    education: '硕士',
    occupation: '工程师',
    company: '某科技公司',
    father_name: '张大牛',
    mother_name: '李氏',
    spouse_name: '李四',
    children_names: '张小明、张小红',
    bio: '从事软件工程行业20年，热爱家族事业，致力于家族文化传承。'
  }
}

onMounted(() => {
  loadMemberCard()
})
</script>

<style scoped>
.member-card {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.card-name {
  font-size: 24px;
  font-weight: bold;
  margin: 12px 0 8px;
}

.card-tags {
  display: flex;
  gap: 8px;
}

.bio-content {
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}
</style>