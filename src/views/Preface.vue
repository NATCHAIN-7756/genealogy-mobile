<template>
  <div class="preface">
    <van-nav-bar title="序言" left-arrow @click-left="back">
      <template #right>
        <van-icon name="edit" size="20" @click="editMode = !editMode" />
      </template>
    </van-nav-bar>
    
    <!-- 序言内容 -->
    <div class="content-card">
      <h1 class="title">{{ preface.title }}</h1>
      
      <div class="preface-body">
        <p v-for="(para, index) in preface.paragraphs" :key="index" class="paragraph">
          {{ para }}
        </p>
      </div>
      
      <div class="signature">
        <div class="author">{{ preface.author }}</div>
        <div class="date">{{ preface.date }}</div>
      </div>
    </div>
    
    <!-- 编辑模式 -->
    <van-popup v-model:show="editMode" position="bottom" round style="height: 80%">
      <van-cell-group inset style="margin: 16px">
        <van-cell title="编辑序言" />
        <van-field v-model="preface.title" label="标题" placeholder="序言标题" />
        <van-field
          v-model="paragraphText"
          type="textarea"
          rows="10"
          label="内容"
          placeholder="每段用空行分隔"
        />
        <van-field v-model="preface.author" label="署名" placeholder="编委会" />
        <van-field v-model="preface.date" label="日期" placeholder="2026年6月" />
        <div style="padding: 16px">
          <van-button type="primary" block @click="savePreface">保存</van-button>
        </div>
      </van-cell-group>
    </van-popup>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const editMode = ref(false)

const preface = ref({
  title: '重修家谱序',
  paragraphs: [
    '家之有谱，如国之有史。族谱者，所以明世系、辨昭穆、敦宗族、叙昭穆也。吾族自始迁祖张三公于明洪武二年由山西洪洞迁居济南，历六百余年，传二十五代，子孙繁衍，枝繁叶茂。',
    '岁月沧桑，人事更迭，旧谱多有散佚。今逢盛世，国泰民安，族人倡议重修家谱，以承先启后，继往开来。此举既可缅怀先祖创业之艰辛，又能激励后辈奋发图强，诚为盛事。',
    '本次修谱，力求详实准确，广征博采，历时三载，数易其稿。凡我族人，无论远近，皆在收录之列。虽未尽善尽美，然用心良苦，望后世子孙珍之重之，续修勿替。',
    '愿我族人，敬宗收族，和睦相处，传承家风，发扬光大，俾使先祖遗德，永世流芳。是为序。'
  ],
  author: '张氏族谱编委会',
  date: '2026年6月'
})

const paragraphText = computed({
  get: () => preface.value.paragraphs.join('\n\n'),
  set: (val) => {
    preface.value.paragraphs = val.split('\n\n').filter(p => p.trim())
  }
})

function back() {
  router.back()
}

function savePreface() {
  localStorage.setItem(`family_${familyId}_preface`, JSON.stringify(preface.value))
  showToast('已保存')
  editMode.value = false
}

onMounted(() => {
  const saved = localStorage.getItem(`family_${familyId}_preface`)
  if (saved) {
    preface.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.preface {
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

.preface-body {
  font-size: 16px;
  line-height: 2;
  color: #333;
}

.paragraph {
  text-indent: 2em;
  margin-bottom: 16px;
}

.signature {
  margin-top: 32px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.author {
  margin-bottom: 8px;
}

.date {
  color: #999;
}
</style>