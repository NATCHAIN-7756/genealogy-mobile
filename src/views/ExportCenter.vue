<template>
  <div class="export-center">
    <van-nav-bar title="印刷成册" left-arrow @click-left="back" />
    
    <van-notice-bar
      left-icon="info-o"
      text="选择需要导出的章节，生成PDF文件后可下载打印"
      wrapable
      style="margin: 12px"
    />
    
    <!-- 章节选择（可拖拽排序） -->
    <van-cell-group inset style="margin: 12px" title="选择章节（长按拖拽排序）">
      <van-checkbox-group v-model="selectedChapters">
        <div 
          v-for="(chapter, index) in sortedChapters" 
          :key="chapter.id"
          class="chapter-item"
          draggable="true"
          @dragstart="onDragStart(index, $event)"
          @dragover="onDragOver(index, $event)"
          @drop="onDrop(index, $event)"
          @dragend="onDragEnd"
        >
          <van-cell clickable @click="toggleChapter(chapter.id)">
            <template #icon>
              <van-icon name="sort" class="drag-handle" v-if="isSelected(chapter.id)" />
            </template>
            <template #title>
              <van-checkbox :name="chapter.id" ref="checkboxes" @click.stop>
                {{ chapter.title }}
              </van-checkbox>
            </template>
            <template #label>
              <span style="color: #999; font-size: 12px;">{{ chapter.desc }}</span>
            </template>
            <template #value>
              <span class="chapter-pages">约{{ chapter.pages }}页</span>
            </template>
          </van-cell>
        </div>
      </van-checkbox-group>
    </van-cell-group>
    
    <!-- 排版设置 -->
    <van-cell-group inset style="margin: 12px" title="排版设置">
      <van-cell title="纸张大小">
        <template #value>
          <van-radio-group v-model="paperSize" direction="horizontal">
            <van-radio name="A4">A4</van-radio>
            <van-radio name="A5">A5</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
      <van-cell title="字体大小">
        <template #value>
          <van-radio-group v-model="fontSize" direction="horizontal">
            <van-radio name="12">标准</van-radio>
            <van-radio name="14">适中</van-radio>
            <van-radio name="16">老年</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
      <van-cell title="行间距">
        <template #value>
          <van-radio-group v-model="lineHeight" direction="horizontal">
            <van-radio name="compact">紧凑</van-radio>
            <van-radio name="normal">正常</van-radio>
            <van-radio name="loose">宽松</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
      <van-cell title="页边距">
        <template #value>
          <van-radio-group v-model="marginStyle" direction="horizontal">
            <van-radio name="normal">标准</van-radio>
            <van-radio name="binding">装订版</van-radio>
          </van-radio-group>
        </template>
      </van-cell>
    </van-cell-group>
    
    <!-- 封面定制 -->
    <van-cell-group inset style="margin: 12px" title="封面设置">
      <van-field v-model="coverTitle" label="封面标题" placeholder="张氏家谱" />
      <van-field v-model="coverSubtitle" label="副标题" placeholder="传承家族记忆" />
      <van-field v-model="publishDate" label="出版日期" placeholder="2026年6月" />
    </van-cell-group>
    
    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-value">{{ selectedChapters.length }}</div>
        <div class="stat-label">选中章节</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ estimatedPages }}</div>
        <div class="stat-label">预计页数</div>
      </div>
    </div>
    
    <!-- 导出按钮 -->
    <div class="export-actions">
      <van-button type="default" block size="large" @click="showPreview" style="margin-bottom: 8px;">
        <van-icon name="eye-o" /> 预览
      </van-button>
      <van-button type="primary" block size="large" :loading="exporting" @click="exportPDF">
        <van-icon name="down" /> 生成并下载PDF
      </van-button>
    </div>
    
    <!-- 预览弹窗 -->
    <van-popup v-model:show="previewVisible" position="bottom" :style="{ height: '80%' }">
      <div class="preview-container">
        <van-nav-bar title="预览排版效果" left-arrow @click-left="previewVisible = false" />
        <div class="preview-toolbar">
          <van-button size="small" @click="previewPageIdx = 0" :type="previewPageIdx === 0 ? 'primary' : 'default'">封面</van-button>
          <van-button size="small" @click="previewPageIdx = 1" :type="previewPageIdx === 1 ? 'primary' : 'default'">目录</van-button>
          <van-button size="small" v-for="(ch, i) in selectedChapters.slice(0, 5)" :key="ch" @click="previewPageIdx = i + 2" :type="previewPageIdx === i + 2 ? 'primary' : 'default'">{{ chapters.find(c => c.id === ch)?.title }}</van-button>
        </div>
        <div class="preview-scroll">
          <div class="preview-pdf-page" :style="previewPdfStyle">
            <!-- 封面 -->
            <div v-if="previewPageIdx === 0" class="preview-cover">
              <div class="preview-cover-title" :style="{ fontSize: previewFontSize * 3 + 'px' }">{{ coverTitle }}</div>
              <div class="preview-cover-subtitle" :style="{ fontSize: previewFontSize * 1.5 + 'px' }">{{ coverSubtitle }}</div>
              <div class="preview-cover-date" :style="{ fontSize: previewFontSize + 'px' }">{{ publishDate }}</div>
            </div>
            <!-- 目录 -->
            <div v-else-if="previewPageIdx === 1" class="preview-toc">
              <div class="preview-page-title" :style="{ fontSize: previewFontSize * 1.5 + 'px' }">目录</div>
              <div v-for="(id, index) in selectedChapters" :key="id" class="preview-toc-item" :style="{ fontSize: previewFontSize + 'px', lineHeight: previewLineHeight }">
                {{ index + 1 }}. {{ chapters.find(c => c.id === id)?.title }}
              </div>
            </div>
            <!-- 章节内容 -->
            <div v-else class="preview-content-page">
              <div class="preview-page-title" :style="{ fontSize: previewFontSize * 1.5 + 'px' }">{{ previewChapterTitle }}</div>
              <div class="preview-text" :style="{ fontSize: previewFontSize + 'px', lineHeight: previewLineHeight }">{{ previewChapterContent }}</div>
            </div>
          </div>
        </div>
        <div class="preview-info">
          <span>字体: {{ fontSize }}pt</span>
          <span>行距: {{ lineHeight === 'compact' ? '紧凑' : lineHeight === 'loose' ? '宽松' : '正常' }}</span>
          <span>页边距: {{ marginStyle === 'binding' ? '装订版' : '标准' }}</span>
        </div>
      </div>
    </van-popup>
    
    <!-- 进度提示 -->
    <van-overlay :show="exporting">
      <div class="loading-wrapper">
        <van-loading type="spinner" size="24px" color="#fff" vertical>
          正在生成PDF...<br/>{{ exportProgress }}
        </van-loading>
      </div>
    </van-overlay>
    
    <!-- PDF渲染容器（隐藏但可渲染） -->
    <div ref="pdfContainer" class="pdf-render-container" style="position: fixed; left: -9999px; top: 0;">
      <div ref="pdfContent" class="pdf-content" :style="pdfStyle">
        <!-- 封面 -->
        <div class="pdf-page cover-page" v-if="renderPages.includes('cover')">
          <div class="cover-title">{{ coverTitle }}</div>
          <div class="cover-subtitle">{{ coverSubtitle }}</div>
          <div class="cover-date">{{ publishDate }}</div>
        </div>
        
        <!-- 目录 -->
        <div class="pdf-page" v-if="renderPages.includes('toc')">
          <div class="page-title">目录</div>
          <div class="toc-list">
            <div class="toc-item" v-for="(id, index) in selectedChapters" :key="id">
              {{ index + 1 }}. {{ chapters.find(c => c.id === id)?.title }}
            </div>
          </div>
        </div>
        
        <!-- 各章节 -->
        <div class="pdf-page" v-for="page in contentPages" :key="page.id">
          <div class="page-title">{{ page.title }}</div>
          <div class="page-content">{{ page.content }}</div>
        </div>
      </div>
    </div>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { memberApi, familyApi } from '../api'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const exporting = ref(false)
const exportProgress = ref('')
const pdfContainer = ref(null)
const pdfContent = ref(null)

const selectedChapters = ref(['preface', 'legend', 'overview', 'contemporary', 'generations', 'members', 'postscript'])
const renderPages = ref([])
const contentPages = ref([])

const chapters = [
  { id: 'preface', title: '序言', desc: '编委会致辞', pages: 2 },
  { id: 'legend', title: '凡例', desc: '编纂规则说明', pages: 2 },
  { id: 'overview', title: '家族概述', desc: '家族基本信息', pages: 4 },
  { id: 'contemporary', title: '当代族人', desc: '在世家庭列表', pages: 10 },
  { id: 'generations', title: '世系目录', desc: '按世代浏览', pages: 5 },
  { id: 'members', title: '家族成员', desc: '全部成员列表', pages: 10 },
  { id: 'stories', title: '家族故事', desc: '家族历史故事', pages: 8 },
  { id: 'photos', title: '家族相册', desc: '珍贵照片集', pages: 6 },
  { id: 'events', title: '大事记', desc: '重要事件记录', pages: 5 },
  { id: 'generation-table', title: '字辈排行', desc: '字辈对照表', pages: 3 },
  { id: 'tree-print', title: '世系图', desc: '可打印世系图', pages: 4 },
  { id: 'sponsors', title: '赞助名录', desc: '捐助致谢', pages: 2 },
  { id: 'postscript', title: '后记', desc: '编后语', pages: 2 }
]

// 拖拽排序 - 在chapters定义后初始化
const sortedChapters = ref([...chapters])
const dragIndex = ref(-1)
const dragOverIndex = ref(-1)

const paperSize = ref('A4')
const fontSize = ref('14')
const lineHeight = ref('normal')
const marginStyle = ref('normal') // 标准normal / 装订版binding
const coverTitle = ref('张氏家谱')
const coverSubtitle = ref('传承家族记忆')
const publishDate = ref('2026年6月')
const familyInfo = ref({})

// 预览功能
const previewVisible = ref(false)
const previewPages = ref([])
const previewPageIdx = ref(0)

// 预览排版样式
const previewFontSize = computed(() => parseInt(fontSize.value))
const previewLineHeight = computed(() => lineHeight.value === 'compact' ? '1.5' : lineHeight.value === 'loose' ? '2' : '1.8')
const previewPdfStyle = computed(() => {
  const pw = paperSize.value === 'A4' ? '100%' : '70%'
  const marginL = marginStyle.value === 'binding' ? '25px' : '15px'
  return {
    width: pw,
    maxWidth: '400px',
    minHeight: '500px',
    padding: '15px',
    paddingLeft: marginL
  }
})

const previewChapterTitle = computed(() => {
  if (previewPageIdx.value < 2) return ''
  const idx = previewPageIdx.value - 2
  const chapterId = selectedChapters.value[idx]
  return chapters.find(c => c.id === chapterId)?.title || ''
})

const previewChapterContent = computed(() => {
  if (previewPageIdx.value < 2) return ''
  const idx = previewPageIdx.value - 2
  const chapterId = selectedChapters.value[idx]
  return getChapterContent(chapterId)
})

// PDF渲染样式
const pdfStyle = computed(() => {
  const fs = parseInt(fontSize.value)
  const lh = lineHeight.value === 'compact' ? '1.5' : lineHeight.value === 'loose' ? '2' : '1.8'
  const pw = paperSize.value === 'A4' ? '210mm' : '148mm'
  const ph = paperSize.value === 'A4' ? '297mm' : '210mm'
  
  // 装订版左侧留25mm，标准15mm
  const marginL = marginStyle.value === 'binding' ? '25mm' : '15mm'
  
  return {
    fontSize: `${fs}px`,
    lineHeight: lh,
    width: pw,
    '--page-width': pw,
    '--page-height': ph,
    '--margin-left': marginL
  }
})

const estimatedPages = computed(() => {
  const base = selectedChapters.value.reduce((sum, id) => {
    const chapter = chapters.find(c => c.id === id)
    return sum + (chapter?.pages || 0)
  }, 0)
  const fontFactor = fontSize.value === '12' ? 0.85 : fontSize.value === '16' ? 1.4 : 1
  const lineFactor = lineHeight.value === 'compact' ? 0.8 : lineHeight.value === 'loose' ? 1.25 : 1
  return Math.ceil(base * fontFactor * lineFactor)
})

function back() { router.back() }

function toggleChapter(id) {
  const index = selectedChapters.value.indexOf(id)
  if (index > -1) selectedChapters.value.splice(index, 1)
  else selectedChapters.value.push(id)
}

function isSelected(id) {
  return selectedChapters.value.includes(id)
}

// 拖拽排序
function onDragStart(index, event) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

function onDragOver(index, event) {
  event.preventDefault()
  if (dragIndex.value !== -1 && dragIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function onDrop(index, event) {
  event.preventDefault()
  if (dragIndex.value !== -1 && dragIndex.value !== index) {
    const items = [...sortedChapters.value]
    const dragItem = items[dragIndex.value]
    items.splice(dragIndex.value, 1)
    items.splice(index, 0, dragItem)
    sortedChapters.value = items
    
    // 更新选中顺序
    const newSelected = items.filter(c => isSelected(c.id)).map(c => c.id)
    selectedChapters.value = newSelected
  }
}

function onDragEnd() {
  dragIndex.value = -1
  dragOverIndex.value = -1
}

// 预览功能
function showPreview() {
  previewPageIdx.value = 0
  previewVisible.value = true
}

function getChapterContent(id) {
  const f = familyInfo.value
  const contents = {
    'preface': `家之有谱，如国之有史。族谱者，所以明世系、辨昭穆、敦宗族也。

吾族自始迁祖迁居此地，历数百余年，子孙繁衍，枝繁叶茂。

本次修谱，力求详实准确，广征博采。凡我族人，无论远近，皆在收录之列。

愿我族人，敬宗收族，和睦相处，传承家风，发扬光大。是为序。`,
    'legend': `一、编纂宗旨
本谱以"传承家族记忆，凝聚族人情感"为宗旨。

二、世系编排
以始迁祖为第一代，向下依次递增。

三、记录格式
姓名、生卒年月、配偶、子女、学历职业等。`,
    'overview': `【家族姓氏】${f.surname || coverTitle.value.replace('氏家谱', '')}氏
【堂号】${f.hall_name || '待补充'}
【祖籍地】${f.origin || '待补充'}
【始迁祖】${f.ancestor || '待补充'}

【家族简介】
${f.description || '吾族世居此地，耕读传家，世代繁衍。'}

【家训】
孝父母、敬祖宗、友兄弟、睦宗族、和邻里、教子孙、勤职业、崇节俭。`,
    'contemporary': '【当代族人名录】\n\n本章节记录在世族人的家庭信息...',
    'generations': '【世系目录】\n\n按世代排列的族人名录...',
    'members': '【家族成员】\n\n全部家族成员列表...',
    'stories': '【家族故事】\n\n创业艰辛、家教传承、读书传家...',
    'photos': '【家族相册】\n\n珍贵照片集...',
    'events': '【大事记】\n\n家族重要事件记录...',
    'generation-table': '【字辈排行】\n\n字辈对照表...',
    'tree-print': '【世系图】\n\n家族世系图...',
    'sponsors': '【赞助名录】\n\n功德主、赞助人名录...',
    'postscript': `家谱终于付梓问世。

此次修谱，承蒙族中长辈鼎力支持，族人踊跃参与。

${f.surname || coverTitle.value.replace('氏家谱', '')}氏族谱编委会
${publishDate.value}`
  }
  return contents[id] || ''
}

async function exportPDF() {
  if (selectedChapters.value.length === 0) {
    showToast('请至少选择一个章节')
    return
  }
  
  exporting.value = true
  exportProgress.value = '加载数据...'
  
  try {
    const familyRes = await familyApi.get(familyId)
    familyInfo.value = familyRes.data || {}
    
    exportProgress.value = '准备页面...'
    
    // 准备渲染页面
    renderPages.value = ['cover', 'toc']
    contentPages.value = selectedChapters.value.map(id => ({
      id,
      title: chapters.find(c => c.id === id)?.title || '',
      content: getChapterContent(id)
    }))
    
    await nextTick()
    exportProgress.value = '渲染页面...'
    
    // 等待DOM更新
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 临时移到可见区域进行截图
    pdfContainer.value.style.left = '0'
    pdfContainer.value.style.top = '0'
    pdfContainer.value.style.zIndex = '-9999'
    pdfContainer.value.style.opacity = '1'
    
    exportProgress.value = '生成图片...'
    
    // 使用html2canvas截图
    const canvas = await html2canvas(pdfContent.value, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: pdfContent.value.scrollWidth,
      windowHeight: pdfContent.value.scrollHeight
    })
    
    // 截图完成后移回隐藏位置
    pdfContainer.value.style.left = '-9999px'
    
    exportProgress.value = '生成PDF...'
    
    // 创建PDF
    const pw = paperSize.value === 'A4' ? 210 : 148
    const ph = paperSize.value === 'A4' ? 297 : 210
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: paperSize.value.toLowerCase()
    })
    
    // 按页分割图片
    const pageHeightPx = canvas.width * (ph / pw)
    const totalPages = Math.ceil(canvas.height / pageHeightPx)
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()
      
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = Math.min(pageHeightPx, canvas.height - i * pageHeightPx)
      
      const ctx = pageCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, i * pageHeightPx, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height)
      
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(imgData, 'JPEG', 0, 0, pw, ph)
      
      exportProgress.value = `生成第 ${i + 1}/${totalPages} 页...`
    }
    
    const fileName = `${coverTitle.value}_${new Date().toISOString().slice(0, 10)}.pdf`
    pdf.save(fileName)
    
    showSuccessToast('PDF已生成')
    
  } catch (e) {
    console.error('PDF生成失败', e)
    showToast('生成失败: ' + e.message)
  } finally {
    exporting.value = false
    exportProgress.value = ''
    renderPages.value = []
    contentPages.value = []
  }
}

onMounted(async () => {
  try {
    const res = await familyApi.get(familyId)
    familyInfo.value = res.data || {}
    if (res.data?.name) {
      coverTitle.value = res.data.name + '氏家谱'
    }
  } catch (e) {
    console.log('加载家族信息失败', e)
  }
})
</script>

<style scoped>
.export-center {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.chapter-pages { font-size: 12px; color: #999; }

.stats-card {
  display: flex; justify-content: space-around;
  padding: 16px; margin: 12px; border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff;
}
.stat-item { text-align: center; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; opacity: 0.9; margin-top: 4px; }

.export-actions { margin: 16px; }
.loading-wrapper { display: flex; align-items: center; justify-content: center; height: 100%; }

/* PDF渲染容器 */
.pdf-render-container {
  position: fixed; top: -9999px; left: -9999px;
  font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
}

.pdf-content {
  background: #fff;
  padding: 0;
}

.pdf-page {
  width: var(--page-width);
  height: var(--page-height);
  padding: 15mm;
  padding-left: var(--margin-left, 15mm);
  box-sizing: border-box;
  page-break-after: always;
  background: #fff;
  border: 1px solid #eee;
}

.cover-page {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  text-align: center;
}

.cover-title {
  font-size: 48px; font-weight: bold;
  margin-bottom: 20px;
}

.cover-subtitle {
  font-size: 24px;
  color: #666;
  margin-bottom: 40px;
}

.cover-date {
  font-size: 18px;
  color: #999;
}

.page-title {
  font-size: 24px; font-weight: bold;
  margin-bottom: 15px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.page-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.toc-list {
  padding-left: 20px;
}

.toc-item {
  font-size: 16px;
  margin: 10px 0;
}

/* 章节拖拽样式 */
.chapter-item {
  transition: transform 0.2s;
}

.chapter-item:active {
  background: #f0f0f0;
}

.drag-handle {
  color: #999;
  margin-right: 8px;
  cursor: move;
}

/* 预览弹窗样式 */
.preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
}

.preview-pdf-page {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  margin: auto;
}

.preview-cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 500px;
  text-align: center;
  padding: 20px;
}

.preview-cover-title {
  font-weight: bold;
  margin-bottom: 16px;
}

.preview-cover-subtitle {
  color: #666;
  margin-bottom: 32px;
}

.preview-cover-date {
  color: #999;
}

.preview-toc {
  padding: 20px;
}

.preview-toc-item {
  margin: 8px 0;
}

.preview-content-page {
  padding: 20px;
}

.preview-page-title {
  font-weight: bold;
  border-bottom: 2px solid #333;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.preview-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-info {
  padding: 8px;
  background: #fff;
  border-top: 1px solid #eee;
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

/* 旧预览样式已移除 */
.preview-page {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.preview-page-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
}
</style>