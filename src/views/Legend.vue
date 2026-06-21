<template>
  <div class="legend">
    <van-nav-bar title="凡例" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>
    
    <div class="content-card">
      <h1 class="title">凡例</h1>
      
      <!-- 编纂规则 -->
      <div class="section">
        <h2 class="section-title">一、编纂宗旨</h2>
        <ul class="rule-list">
          <li>本谱以"传承家族记忆，凝聚族人情感"为宗旨，力求详实准确，实事求是。</li>
          <li>收录范围：凡我族直系血亲及其配偶，无论男女，均在收录之列。</li>
          <li>时间跨度：自始迁祖至今，历二十五代，六百余年。</li>
        </ul>
      </div>
      
      <!-- 世系编排 -->
      <div class="section">
        <h2 class="section-title">二、世系编排</h2>
        <ul class="rule-list">
          <li>世代顺序：以始迁祖为第一代，向下依次递增。</li>
          <li>长幼次序：同代成员按长幼排序，长子列前。</li>
          <li>房系分支：注明长房、二房、三房等分支。</li>
        </ul>
      </div>
      
      <!-- 符号说明 -->
      <div class="section">
        <h2 class="section-title">三、符号说明</h2>
        <van-cell-group inset>
          <van-cell title="〇" value="男性成员" />
          <van-cell title="○" value="女性成员" />
          <van-cell title="□" value="已故成员" />
          <van-cell title="→" value="配偶关系" />
          <van-cell title="↓" value="父子关系" />
          <van-cell title="♂" value="男性" />
          <van-cell title="♀" value="女性" />
        </van-cell-group>
      </div>
      
      <!-- 记录格式 -->
      <div class="section">
        <h2 class="section-title">四、记录格式</h2>
        <ul class="rule-list">
          <li>姓名：以正式姓名为准，括号内注明别名、字号。</li>
          <li>生卒：格式为"生于X年X月X日，卒于X年X月X日"。</li>
          <li>配偶：注明配偶姓名、籍贯、父名。</li>
          <li>子女：按长幼顺序列出子女姓名。</li>
          <li>学历：注明最高学历及毕业院校。</li>
          <li>职业：注明主要职业及工作单位。</li>
        </ul>
      </div>
      
      <!-- 特殊说明 -->
      <div class="section">
        <h2 class="section-title">五、特殊说明</h2>
        <ul class="rule-list">
          <li>女性入谱：现代家谱女子与男子同等入谱，注明夫家姓氏。</li>
          <li>养子入谱：经族委会认可者，注明"养子"身份。</li>
          <li>失考者：因史料缺失，注明"失考"，待后人补充。</li>
        </ul>
      </div>
      
      <!-- 编辑弹窗 -->
      <van-popup v-model:show="editMode" position="bottom" round style="height: 80%">
        <van-cell-group inset style="margin: 16px">
          <van-cell title="编辑凡例" />
          <van-field
            v-model="legendContent"
            type="textarea"
            rows="12"
            placeholder="输入凡例内容..."
          />
          <div style="padding: 16px">
            <van-button type="primary" block @click="saveLegend">保存</van-button>
          </div>
        </van-cell-group>
      </van-popup>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const editMode = ref(false)
const legendContent = ref('')

function back() {
  router.back()
}

function saveLegend() {
  localStorage.setItem(`family_${familyId}_legend`, legendContent.value)
  showToast('已保存')
  editMode.value = false
}

onMounted(() => {
  const saved = localStorage.getItem(`family_${familyId}_legend`)
  if (saved) {
    legendContent.value = saved
  }
})
</script>

<style scoped>
.legend {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.content-card {
  background: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #667eea;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.rule-list {
  padding-left: 20px;
  font-size: 14px;
  line-height: 2;
  color: #666;
}

.rule-list li {
  margin-bottom: 8px;
}
</style>