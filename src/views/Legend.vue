<template>
  <div class="legend">
    <van-nav-bar title="凡例" left-arrow @click-left="back">
      <template #right>
        <van-icon name="plus" size="20" @click="showAdd = true" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading-center" />

    <div v-else class="content-card">
      <h1 class="title">凡例</h1>

      <!-- 章节列表 -->
      <div v-for="(section, index) in legends" :key="section.id" class="section">
        <div class="section-header">
          <h2 class="section-title">{{ section.section }}</h2>
          <div class="section-actions">
            <van-icon name="edit" size="18" @click="editSection(index)" />
            <van-icon name="delete" size="18" color="#ee0a24" @click="deleteSection(section.id)" style="margin-left: 12px" />
          </div>
        </div>
        <ul class="rule-list">
          <li v-for="(item, i) in section.content" :key="i">{{ item }}</li>
        </ul>
      </div>

      <van-empty v-if="legends.length === 0" description="暂无凡例，点击右上角添加" />
    </div>

    <!-- 添加/编辑弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" round style="height: 80%">
      <van-cell-group inset style="margin: 16px">
        <van-cell :title="editingIndex >= 0 ? '编辑章节' : '添加章节'" />
        <van-field v-model="form.section" label="章节标题" placeholder="如：编纂宗旨" />
        <van-field
          v-model="formContentText"
          type="textarea"
          rows="10"
          label="内容（每行一条）"
          placeholder="每行输入一条规则..."
        />
        <van-field v-model.number="form.sort_order" type="digit" label="排序号" placeholder="数字越小越靠前" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="saveSection">保存</van-button>
        </div>
      </van-cell-group>
    </van-popup>

    <AppTabbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import api from '../api'
import AppTabbar from '../components/AppTabbar.vue'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const loading = ref(true)
const legends = ref([])
const showAdd = ref(false)
const editingIndex = ref(-1)
const form = ref({ section: '', content: [], sort_order: 0 })
const token = localStorage.getItem('token')

const formContentText = computed({
  get: () => form.value.content.join('\n'),
  set: (val) => { form.value.content = val.split('\n').filter(x => x.trim()) }
})

function back() { router.back() }

async function loadLegends() {
  try {
    const res = await api.get(`/legends/family/${familyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    legends.value = res.data
  } catch (e) {
    console.error('加载失败:', e)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function editSection(index) {
  editingIndex.value = index
  const section = legends.value[index]
  form.value = {
    section: section.section,
    content: [...section.content],
    sort_order: section.sort_order || index
  }
  showAdd.value = true
}

async function deleteSection(id) {
  try {
    await showConfirmDialog({ title: '确认删除', message: '删除此章节？' })
    await api.delete(`/legends/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('已删除')
    loadLegends()
  } catch (e) {
    if (e.message !== 'cancel') {
      console.error('删除失败:', e)
      showToast('删除失败')
    }
  }
}

async function saveSection() {
  if (!form.value.section.trim()) {
    showToast('请输入章节标题')
    return
  }
  if (form.value.content.length === 0) {
    showToast('请输入内容')
    return
  }

  try {
    if (editingIndex.value >= 0) {
      // 更新
      const id = legends.value[editingIndex.value].id
      await api.put(`/legends/${id}`, form.value, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('已更新')
    } else {
      // 新增
      await api.post(`/legends/family/${familyId}`, form.value, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('已添加')
    }
    showAdd.value = false
    editingIndex.value = -1
    form.value = { section: '', content: [], sort_order: 0 }
    loadLegends()
  } catch (e) {
    console.error('保存失败:', e)
    showToast('保存失败')
  }
}

onMounted(() => loadLegends())
</script>

<style scoped>
.legend { padding-bottom: 50px; background: #f5f5f5; min-height: 100vh; }
.loading-center { display: flex; justify-content: center; padding-top: 100px; }
.content-card { background: #fff; margin: 16px; padding: 24px; border-radius: 8px; }
.title { font-size: 24px; font-weight: bold; text-align: center; color: #333; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #667eea; }
.section { margin-bottom: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-title { font-size: 16px; font-weight: bold; color: #333; margin: 0; }
.section-actions { display: flex; align-items: center; }
.rule-list { padding-left: 20px; font-size: 14px; line-height: 2; color: #666; margin: 0; }
.rule-list li { margin-bottom: 8px; }
</style>