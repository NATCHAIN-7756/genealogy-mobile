<template>
  <div class="reader">
    <van-nav-bar :title="title" left-arrow @click-left="back">
      <template #right>
        <van-icon name="bars" size="20" @click="showToolbar = !showToolbar" />
      </template>
    </van-nav-bar>
    
    <div class="reader-content" ref="readerRef">
      <!-- PDF -->
      <canvas v-if="type === 'pdf'" ref="pdfCanvas" class="pdf-canvas" />
      
      <!-- 图片 -->
      <img v-else-if="['jpg', 'jpeg', 'png'].includes(type)" :src="fileUrl" class="image-view" />
      
      <!-- 其他 -->
      <van-empty v-else description="不支持此格式" />
    </div>
    
    <!-- 工具栏 -->
    <van-popup v-model:show="showToolbar" position="bottom" round>
      <van-cell-group inset>
        <van-cell title="页码" v-if="type === 'pdf'" :value="`${currentPage} / ${totalPages}`" />
        <van-cell v-if="type === 'pdf'">
          <template #title>页面</template>
          <van-slider v-model="currentPage" :min="1" :max="totalPages" @change="renderPdfPage" />
        </van-cell>
        <van-cell v-if="['jpg', 'jpeg', 'png'].includes(type)">
          <template #title>缩放</template>
          <van-slider v-model="zoomLevel" :min="50" :max="200" />
        </van-cell>
      </van-cell-group>
    </van-popup>
    
    <!-- 翻页按钮 -->
    <van-action-bar v-if="type === 'pdf'">
      <van-action-bar-button text="上一页" @click="prevPage" :disabled="currentPage <= 1" />
      <van-action-bar-button type="primary" text="下一页" @click="nextPage" :disabled="currentPage >= totalPages" />
    </van-action-bar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'

const route = useRoute()
const router = useRouter()

const title = route.query.title || '阅读'
const fileUrl = route.query.url
const type = route.query.type

const showToolbar = ref(false)
const readerRef = ref(null)
const pdfCanvas = ref(null)
const pdfDoc = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const zoomLevel = ref(100)

function back() {
  router.back()
}

async function loadPdf() {
  if (!fileUrl) return
  
  try {
    pdfDoc.value = await pdfjsLib.getDocument(fileUrl).promise
    totalPages.value = pdfDoc.value.numPages
    await renderPdfPage(1)
  } catch (e) {
    showToast('加载PDF失败')
    console.error(e)
  }
}

async function renderPdfPage(page) {
  if (!pdfDoc.value || !pdfCanvas.value) return
  
  const pageNum = typeof page === 'number' ? page : currentPage.value
  const pageObj = await pdfDoc.value.getPage(pageNum)
  const viewport = pageObj.getViewport({ scale: 1.5 })
  
  const canvas = pdfCanvas.value
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height
  
  await pageObj.render({
    canvasContext: context,
    viewport: viewport
  }).promise
}

async function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    await renderPdfPage(currentPage.value)
  }
}

async function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    await renderPdfPage(currentPage.value)
  }
}

onMounted(() => {
  if (type === 'pdf') {
    loadPdf()
  }
})
</script>

<style scoped>
.reader {
  height: 100vh;
  background: #f7f8fa;
}
.reader-content {
  height: calc(100vh - 46px - 50px);
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
}
.pdf-canvas {
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
.image-view {
  max-width: 100%;
  border-radius: 4px;
}
</style>