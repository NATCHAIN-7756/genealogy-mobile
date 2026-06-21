<template>
  <div class="submission-edit">
    <van-nav-bar title="编辑投稿" left-arrow @click-left="back" />
    
    <!-- 根据章节类型显示不同表单 -->
    <!-- 故事 -->
    <van-cell-group inset v-if="chapterId === 'stories'" title="家族故事">
      <van-field v-model="form.title" label="故事标题" placeholder="请输入标题" required />
      <van-field v-model="form.content" type="textarea" label="故事内容" placeholder="请输入故事内容" rows="6" autosize required />
      <van-cell title="相关人物" />
      <van-field v-model="form.people" label="涉及人物" placeholder="故事中的人物姓名" />
      <van-field v-model="form.period" label="年代" placeholder="如：1930年代" />
      <van-cell title="配图">
        <template #value>
          <van-uploader v-model="form.photos" multiple :max-count="9" />
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 照片 -->
    <van-cell-group inset v-else-if="chapterId === 'photos'" title="上传照片">
      <van-cell title="上传照片">
        <template #value>
          <van-uploader v-model="form.photos" multiple :max-count="20" />
        </template>
      </van-cell>
      <van-field v-model="form.title" label="照片标题" placeholder="如：2026春节合影" required />
      <van-field v-model="form.description" type="textarea" label="照片说明" placeholder="照片背景、人物介绍" rows="3" autosize />
      <van-field v-model="form.date" is-link readonly label="拍摄时间" placeholder="请选择" @click="showDatePicker = true" />
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-date-picker v-model="form.dateObj" title="选择拍摄时间" @confirm="onDateConfirm" @cancel="showDatePicker = false" />
      </van-popup>
      <van-field v-model="form.location" label="拍摄地点" placeholder="如：老家堂屋" />
    </van-cell-group>
    
    <!-- 大事记 -->
    <van-cell-group inset v-else-if="chapterId === 'events'" title="记录大事">
      <van-field v-model="form.title" label="事件标题" placeholder="如：李明升学宴" required />
      <van-cell title="事件类型" is-link @click="showEventPicker = true" :value="form.eventType || '请选择'" />
      <van-popup v-model:show="showEventPicker" position="bottom">
        <van-picker :columns="eventTypes" @confirm="onEventConfirm" @cancel="showEventPicker = false" />
      </van-popup>
      <van-field v-model="form.eventDate" is-link readonly label="事件日期" placeholder="请选择" @click="showEventDatePicker = true" />
      <van-popup v-model:show="showEventDatePicker" position="bottom">
        <van-date-picker v-model="form.eventDateObj" title="选择事件日期" @confirm="onEventDateConfirm" @cancel="showEventDatePicker = false" />
      </van-popup>
      <van-field v-model="form.people" label="相关人物" placeholder="涉及人员姓名" />
      <van-field v-model="form.description" type="textarea" label="事件描述" placeholder="事件详情" rows="3" autosize />
      <van-cell title="配图">
        <template #value>
          <van-uploader v-model="form.photos" multiple :max-count="9" />
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 赞助 -->
    <van-cell-group inset v-else-if="chapterId === 'sponsors'" title="登记赞助">
      <van-cell title="赞助类型" is-link @click="showTypePicker = true" :value="form.type || '请选择'" />
      <van-popup v-model:show="showTypePicker" position="bottom">
        <van-picker :columns="sponsorTypes" @confirm="onTypeConfirm" @cancel="showTypePicker = false" />
      </van-popup>
      <van-field v-model="form.amount" label="金额" placeholder="如：5000元" :required="form.type === '现金'" />
      <van-field v-model="form.item" label="物品" placeholder="如：水泥10吨" :required="form.type === '物品'" />
      <van-field v-model="form.date" is-link readonly label="赞助日期" placeholder="请选择" @click="showSponsorDatePicker = true" />
      <van-popup v-model:show="showSponsorDatePicker" position="bottom">
        <van-date-picker v-model="form.dateObj" title="选择日期" @confirm="onDateConfirm" @cancel="showSponsorDatePicker = false" />
      </van-popup>
      <van-field v-model="form.message" type="textarea" label="留言" placeholder="想说的话" rows="2" autosize />
    </van-cell-group>
    
    <!-- 提交按钮 -->
    <div class="bottom-actions">
      <van-button type="primary" block :loading="submitting" @click="submit">提交审核</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()
const chapterId = route.params.chapterId

const submitting = ref(false)
const showDatePicker = ref(false)
const showEventPicker = ref(false)
const showEventDatePicker = ref(false)
const showTypePicker = ref(false)
const showSponsorDatePicker = ref(false)

const form = reactive({
  title: '',
  content: '',
  people: '',
  period: '',
  photos: [],
  description: '',
  date: '',
  dateObj: ['2026', '01', '01'],
  location: '',
  eventType: '',
  eventDate: '',
  eventDateObj: ['2026', '01', '01'],
  type: '',
  amount: '',
  item: '',
  message: ''
})

const eventTypes = ['升学', '就业', '婚嫁', '寿诞', '丧葬', '祭祖', '团聚', '其他']
const sponsorTypes = ['现金', '物品', '服务', '其他']

function back() {
  router.back()
}

function onDateConfirm({ selectedValues }) {
  form.date = selectedValues.join('-')
  showDatePicker.value = false
  showSponsorDatePicker.value = false
}

function onEventConfirm({ selectedValues }) {
  form.eventType = selectedValues.join(',')
  showEventPicker.value = false
}

function onEventDateConfirm({ selectedValues }) {
  form.eventDate = selectedValues.join('-')
  showEventDatePicker.value = false
}

function onTypeConfirm({ selectedValues }) {
  form.type = selectedValues.join(',')
  showTypePicker.value = false
}

async function submit() {
  if (!form.title && chapterId !== 'sponsors') {
    showToast('请填写标题')
    return
  }
  
  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 1500))
    showSuccessToast('提交成功')
    router.push('/my-submissions')
  } catch (e) {
    showToast('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.submission-edit {
  padding-bottom: 70px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: #fff;
}
</style>