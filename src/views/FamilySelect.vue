<template>
  <div class="family-select">
    <van-nav-bar title="选择家族" />
    
    <!-- 我的家谱（姓氏匹配） -->
    <div v-if="myFamily" class="my-family-section">
      <div class="section-title">我的家谱</div>
      <div class="family-card featured" @click="goFamily(myFamily)">
        <div class="family-cover">
          <div class="surname-display">{{ myFamily.surname || '族' }}</div>
          <div class="family-name">{{ myFamily.name }}</div>
        </div>
        <div class="family-info">
          <van-tag type="primary" size="large">{{ myFamily.member_count || 0 }}人</van-tag>
          <div class="view-btn">打开家谱</div>
        </div>
      </div>
    </div>
    
    <!-- 其他家族 -->
    <van-cell-group v-if="otherFamilies.length > 0" inset style="margin: 12px" title="其他家族">
      <van-cell
        v-for="family in otherFamilies" 
        :key="family.id"
        :title="family.name"
        :label="family.surname ? `${family.surname}氏家族` : '点击进入家谱'"
        is-link
        @click="goFamily(family)"
      >
        <template #icon>
          <van-icon name="cluster" size="20" style="margin-right: 8px" />
        </template>
        <template #value>
          <van-tag type="primary">{{ family.member_count || 0 }}人</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-empty v-if="!loading && families.length === 0" description="暂无家族，请先创建" />
    
    <van-loading v-if="loading" size="24px" style="text-align: center; margin-top: 100px">加载中...</van-loading>
    
    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const activeTabbar = ref(1)
const families = ref([])
const userSurname = ref('')
const loading = ref(true)

// 提取姓氏的函数
function extractSurname(name) {
  if (!name) return ''
  
  // 复姓列表（优先匹配）
  const compoundSurnames = [
    '欧阳', '司马', '上官', '诸葛', '东方', '皇甫', '尉迟', '公孙',
    '慕容', '端木', '独孤', '司空', '夏侯', '轩辕', '令狐', '长孙',
    '宇文', '赫连', '拓跋', '秃发', '乞伏', '斛律', '尔朱', '斛斯',
    '贺兰', '贺拔', '万俟', '可频', '伊娄', '达奚', '秃发', '车非',
    '叱卢', '莫折', '和突', '伊娄', '莫侯', '豆卢', '侯莫', '乙弗',
    '拓跋', '秃发', '慕容', '拓跋', '段干', '百里', '东郭', '南门',
    '呼延', '归海', '羊舌', '微生', '岳帅', '谷梁', '公羊', '公玉',
    '左丘', '梁丘', '巫马', '漆雕', '壤驷', '公西', '颛孙', '宗正'
  ]
  
  // 优先检查复姓
  for (const surname of compoundSurnames) {
    if (name.startsWith(surname)) {
      return surname
    }
  }
  
  // 单字姓氏
  return name.charAt(0)
}

// 我的家族（姓氏匹配）
const myFamily = computed(() => {
  if (!userSurname.value || families.value.length === 0) return null
  
  // 找到姓氏匹配的家族
  const matched = families.value.find(f => f.surname === userSurname.value)
  return matched || families.value[0] // 没匹配则返回第一个
})

// 其他家族
const otherFamilies = computed(() => {
  if (!myFamily.value) return families.value
  return families.value.filter(f => f.id !== myFamily.value.id)
})

async function loadData() {
  try {
    const token = localStorage.getItem('token')
    
    // 加载用户信息
    const userRes = await api.get('/...')
    
    // 提取用户姓氏
    if (userRes.data.name) {
      userSurname.value = extractSurname(userRes.data.name)
      console.log('用户姓氏:', userSurname.value)
    }
    
    // 加载家族列表
    const res = await api.get('/...')
    
    // 按姓氏匹配排序
    families.value = res.data.sort((a, b) => {
      // 姓氏匹配的排前面
      const aMatch = a.surname === userSurname.value ? 1 : 0
      const bMatch = b.surname === userSurname.value ? 1 : 0
      return bMatch - aMatch
    })
    
    // 如果只有一个家族且姓氏匹配，直接进入
    if (res.data.length === 1 && res.data[0].surname === userSurname.value) {
      router.replace(`/family/${res.data[0].id}`)
    }
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  }
}

function goFamily(family) {
  router.push(`/family/${family.id}/book`)
}

onMounted(() => loadData())
</script>

<style scoped>
.family-select { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }

.my-family-section { padding: 16px; }

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding-left: 4px;
}

.family-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.family-card.featured {
  min-height: 100px;
}

.family-cover {
  display: flex;
  flex-direction: column;
}

.surname-display {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.family-name {
  font-size: 16px;
  opacity: 0.9;
}

.family-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.view-btn {
  font-size: 12px;
  opacity: 0.8;
}
</style>