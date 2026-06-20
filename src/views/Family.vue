<template>
  <div class="family">
    <van-nav-bar title="家族成员" left-arrow @click-left="back" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="成员">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          @load="loadMembers"
        >
          <van-cell-group inset style="margin: 12px">
            <van-cell
              v-for="member in members"
              :key="member.id"
              :title="member.name"
              :label="member.relation || '成员'"
              is-link
              @click="editMember(member)"
            >
              <template #icon>
                <van-image round width="40" height="40" style="margin-right: 8px; background: #e8f3ff; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 16px; color: #1989fa">{{ member.name?.charAt(0) }}</span>
              </van-image>
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>
        
        <van-empty v-if="members.length === 0" description="暂无成员" />
      </van-tab>
      
      <van-tab title="树图">
        <div class="tree-container" @click="goTree">
          <van-icon name="cluster" size="60" />
          <p>点击查看家族树图</p>
        </div>
      </van-tab>
    </van-tabs>
    
    <van-action-bar>
      <van-action-bar-button type="primary" text="添加成员" @click="showAdd = true" />
    </van-action-bar>
    
    <!-- 添加/编辑成员 -->
    <van-popup v-model:show="showAdd" position="bottom" round style="height: 70%">
      <van-cell-group inset style="margin: 16px">
        <van-cell :title="editingMember ? '编辑成员' : '添加成员'" />
        <van-field v-model="memberForm.name" label="姓名" placeholder="请输入姓名" />
        <van-field v-model="memberForm.gender" label="性别" placeholder="男/女" />
        <van-field v-model="memberForm.birth_date" label="出生日期" placeholder="如：1950-01-01" />
        <van-field v-model="memberForm.birth_place" label="出生地" placeholder="出生地点" />
        <van-field v-model="memberForm.relation" label="关系" placeholder="如：父亲、母亲、子女" />
        <van-field v-model="memberForm.notes" label="备注" type="textarea" rows="2" />
        <div style="padding: 16px; display: flex; gap: 8px">
          <van-button block @click="showAdd = false">取消</van-button>
          <van-button type="primary" block @click="saveMember">保存</van-button>
        </div>
      </van-cell-group>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { memberApi } from '../api'

const router = useRouter()
const route = useRoute()
const activeTab = ref(0)
const members = ref([])
const loading = ref(false)
const finished = ref(false)
const showAdd = ref(false)
const editingMember = ref(null)

const memberForm = ref({
  name: '',
  gender: '',
  birth_date: '',
  birth_place: '',
  relation: '',
  notes: ''
})

const familyId = route.params.id

function back() {
  router.back()
}

function goTree() {
  router.push(`/tree/${familyId}`)
}

async function loadMembers() {
  try {
    const res = await memberApi.list(familyId)
    members.value = res.data
    finished.value = true
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function editMember(member) {
  editingMember.value = member
  memberForm.value = { ...member }
  showAdd.value = true
}

async function saveMember() {
  if (!memberForm.value.name) {
    showToast('请输入姓名')
    return
  }
  
  try {
    const data = { ...memberForm.value, family_id: familyId }
    if (editingMember.value) {
      await memberApi.update(editingMember.value.id, data)
    } else {
      await memberApi.create(data)
    }
    showToast('保存成功')
    showAdd.value = false
    editingMember.value = null
    memberForm.value = { name: '', gender: '', birth_date: '', birth_place: '', relation: '', notes: '' }
    loadMembers()
  } catch (e) {
    showToast('保存失败')
  }
}

onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.tree-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #fff;
  margin: 12px;
  border-radius: 8px;
}
.tree-container p {
  margin-top: 12px;
  color: #666;
}
</style>