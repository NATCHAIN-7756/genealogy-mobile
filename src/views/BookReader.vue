<template>
  <div class="reader">
    <van-nav-bar :title="title" left-arrow @click-left="back" fixed />
    
    <div class="reader-content">
      <!-- PDF -->
      <vue-office-pdf
        v-if="fileType === 'pdf'"
        :src="fileUrl"
        style="height: 100%"
        @rendered="onRendered"
        @error="onError"
      />
      
      <!-- DOCX -->
      <vue-office-docx
        v-else-if="fileType === 'docx'"
        :src="fileUrl"
        style="height: 100%"
        @rendered="onRendered"
        @error="onError"
      />
      
      <!-- XLSX / XLS -->
      <vue-office-excel
        v-else-if="['xlsx', 'xls'].includes(fileType)"
        :src="fileUrl"
        style="height: 100%"
        @rendered="onRendered"
        @error="onError"
      />
      
      <!-- PPTX -->
      <vue-office-pptx
        v-else-if="fileType === 'pptx'"
        :src="fileUrl"
        style="height: 100%"
        @rendered="onRendered"
        @error="onError"
      />
      
      <!-- EPUB / MOBI / 其他 - 用vue-book-reader -->
      <VueReader
        v-else-if="['epub', 'mobi', 'azw3', 'fb2', 'cbz'].includes(fileType)"
        :url="fileUrl"
        :title="title"
        @tocChanged="onTocChanged"
      >
        <template #loadingView>
          <div class="loading-center">
            <van-loading size="24px">加载中...</van-loading>
          </div>
        </template>
        <template #errorView>
          <div class="error-center">
            <van-icon name="warning-o" size="48" />
            <p>加载失败</p>
            <van-button size="small" @click="back">返回</van-button>
          </div>
        </template>
      </VueReader>
      
      <!-- 图片 -->
      <div v-else-if="['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)" class="image-viewer">
        <van-image :src="fileUrl" fit="contain" width="100%" height="100%">
          <template v-slot:loading>
            <van-loading size="24px">加载中...</van-loading>
          </template>
          <template v-slot:error>
            <div class="error-center">
              <van-icon name="warning-o" size="48" />
              <p>加载失败</p>
            </div>
          </template>
        </van-image>
      </div>
      
      <!-- 不支持的格式 -->
      <div v-else class="error-center">
        <van-icon name="info-o" size="48" />
        <p>暂不支持此格式</p>
        <p class="format-info">{{ fileType?.toUpperCase() }}</p>
        <van-button size="small" @click="back">返回</van-button>
      </div>
    </div>
    
    <!-- 加载提示 -->
    <van-loading v-if="loading" class="loading-overlay" size="24px">加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

// vue-office 组件
import VueOfficePdf from '@vue-office/pdf'
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePptx from '@vue-office/pptx'

// 样式
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'

// vue-book-reader
import { VueReader } from 'vue-book-reader'

const route = useRoute()
const router = useRouter()

const title = decodeURIComponent(route.query.title || '阅读')
const fileUrl = route.query.url
const fileType = route.query.type?.toLowerCase()

const loading = ref(true)

function back() {
  router.back()
}

function onRendered() {
  loading.value = false
  console.log('渲染完成')
}

function onError(e) {
  loading.value = false
  showToast('加载失败')
  console.error('渲染错误:', e)
}

function onTocChanged(toc) {
  console.log('目录:', toc)
}

onMounted(() => {
  if (!fileUrl) {
    showToast('文件地址无效')
    loading.value = false
  }
})
</script>

<style scoped>
.reader {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.reader-content {
  flex: 1;
  overflow: auto;
  margin-top: 46px;
  height: calc(100vh - 46px);
}

.image-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #000;
}

.loading-center,
.error-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #999;
}

.format-info {
  font-size: 14px;
  color: #666;
  padding: 4px 12px;
  background: #eee;
  border-radius: 4px;
}

.loading-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
  color: #fff;
}
</style>