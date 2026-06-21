<template>
  <div class="about">
    <van-nav-bar title="电子家谱的优势" left-arrow @click-left="back" />
    
    <!-- 核心优势卡片 -->
    <div class="hero-card">
      <div class="hero-icon">
        <van-icon name="cluster" size="48" color="#667eea" />
      </div>
      <h1>电子家谱</h1>
      <p>让家族传承更简单、更持久</p>
    </div>
    
    <!-- 优势对比 -->
    <van-cell-group inset style="margin: 12px" title="与传统纸质家谱对比">
      <div class="compare-table">
        <div class="compare-row header">
          <div class="col">对比项</div>
          <div class="col paper">纸质家谱</div>
          <div class="col digital">电子家谱</div>
        </div>
        <div class="compare-row">
          <div class="col">保存时间</div>
          <div class="col paper">几十年易损坏</div>
          <div class="col digital highlight">永久保存</div>
        </div>
        <div class="compare-row">
          <div class="col">查阅方式</div>
          <div class="col paper">需到存放地</div>
          <div class="col digital highlight">随时随地</div>
        </div>
        <div class="compare-row">
          <div class="col">更新修订</div>
          <div class="col paper">需重新印刷</div>
          <div class="col digital highlight">实时更新</div>
        </div>
        <div class="compare-row">
          <div class="col">传播范围</div>
          <div class="col paper">仅少数人持有</div>
          <div class="col digital highlight">全员共享</div>
        </div>
        <div class="compare-row">
          <div class="col">制作成本</div>
          <div class="col paper">印刷费用高</div>
          <div class="col digital highlight">几乎零成本</div>
        </div>
        <div class="compare-row">
          <div class="col">图片资料</div>
          <div class="col paper">黑白照片有限</div>
          <div class="col digital highlight">高清多媒体</div>
        </div>
        <div class="compare-row">
          <div class="col">信息互动</div>
          <div class="col paper">静态展示</div>
          <div class="col digital highlight">评论点赞投稿</div>
        </div>
      </div>
    </van-cell-group>
    
    <!-- 核心优势详解 -->
    <van-cell-group inset style="margin: 12px" title="七大核心优势">
      <div class="advantage-list">
        <div v-for="(adv, index) in advantages" :key="index" class="advantage-item" @click="expandAdvantage(index)">
          <div class="adv-header">
            <van-icon :name="adv.icon" size="24" color="#667eea" />
            <span class="adv-title">{{ adv.title }}</span>
            <van-icon :name="expanded === index ? 'arrow-up' : 'arrow-down'" color="#999" />
          </div>
          <div v-if="expanded === index" class="adv-content">
            {{ adv.content }}
          </div>
        </div>
      </div>
    </van-cell-group>
    
    <!-- 使用场景 -->
    <van-cell-group inset style="margin: 12px" title="适用场景">
      <van-grid :column-num="2" :gutter="8">
        <van-grid-item icon="search" text="寻根问祖" />
        <van-grid-item icon="user-circle-o" text="了解祖先" />
        <van-grid-item icon="phone-circle-o" text="联系族人" />
        <van-grid-item icon="photo-o" text="分享照片" />
        <van-grid-item icon="edit" text="记录故事" />
        <van-grid-item icon="calendar-o" text="大事记载" />
        <van-grid-item icon="share" text="传承后代" />
        <van-grid-item icon="printer" text="打印成册" />
      </van-grid>
    </van-cell-group>
    
    <!-- 数据安全 -->
    <van-cell-group inset style="margin: 12px" title="数据安全保障">
      <van-cell title="云端存储" label="数据备份，永不丢失" icon="cloud-o" />
      <van-cell title="权限管理" label="仅家族成员可见" icon="shield-o" />
      <van-cell title="隐私保护" label="个人信息加密存储" icon="lock" />
      <van-cell title="操作记录" label="所有编辑有记录可追溯" icon="logistics" />
    </van-cell-group>
    
    <!-- 未来展望 -->
    <van-cell-group inset style="margin: 12px" title="未来发展">
      <div class="future-content">
        <p>电子家谱将不断升级完善，未来支持：</p>
        <ul>
          <li>🧬 DNA族谱分析</li>
          <li>📍 族人分布地图</li>
          <li>🤖 AI智能续谱</li>
          <li>🎬 家族纪录片制作</li>
          <li>🏛️ 族谱博物馆展示</li>
        </ul>
      </div>
    </van-cell-group>
    
    <van-tabbar v-model="activeTabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="cluster-o" to="/family">家谱</van-tabbar-item>
      <van-tabbar-item icon="bookmark-o" to="/books">传承</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const familyId = route.params.id
const activeTabbar = ref(1)
const expanded = ref(-1)

const advantages = [
  {
    icon: 'clock-circle-o',
    title: '1. 永久保存',
    content: '传统纸质家谱易受虫蛀、霉变、火灾等损毁，保存时间有限。电子家谱存储在云端服务器，自动备份，永久保存，世代传承。'
  },
  {
    icon: 'location-o',
    title: '2. 随时查阅',
    content: '纸质家谱需到存放地点才能查阅，外地族人难以接触。电子家谱可通过手机、电脑随时随地查看，无论身在何处都能了解家族历史。'
  },
  {
    icon: 'refresh',
    title: '3. 实时更新',
    content: '纸质家谱修订需重新印刷，成本高周期长。电子家谱可实时添加新成员、更新信息，家族动态即时呈现。'
  },
  {
    icon: 'share-o',
    title: '4. 全员共享',
    content: '纸质家谱数量有限，仅少数人持有。电子家谱所有家族成员都可查看，人人有谱，家家传承。'
  },
  {
    icon: 'balance-list-o',
    title: '5. 成本低廉',
    content: '印刷纸质家谱费用高昂，动辄数万元。电子家谱几乎零成本，节省开支，惠及更多族人。'
  },
  {
    icon: 'photo-o',
    title: '6. 多媒体丰富',
    content: '纸质家谱多为黑白文字和少量照片。电子家谱支持高清照片、视频、音频等多媒体，生动展现家族风貌。'
  },
  {
    icon: 'comment-o',
    title: '7. 互动参与',
    content: '纸质家谱是静态展示，族人无法参与。电子家谱支持评论、点赞、投稿，族人共同建设，凝聚家族情感。'
  }
]

function back() {
  router.back()
}

function expandAdvantage(index) {
  expanded.value = expanded.value === index ? -1 : index
}
</script>

<style scoped>
.about {
  padding-bottom: 50px;
  background: #f5f5f5;
  min-height: 100vh;
}

.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
  text-align: center;
  color: #fff;
}

.hero-icon {
  background: rgba(255,255,255,0.2);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.hero-card h1 {
  font-size: 24px;
  margin: 0 0 8px;
}

.hero-card p {
  font-size: 14px;
  opacity: 0.9;
}

.compare-table {
  padding: 8px;
}

.compare-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.compare-row.header {
  background: #f5f5f5;
  font-weight: bold;
}

.compare-row.header .col {
  color: #333;
}

.col {
  flex: 1;
  padding: 10px 8px;
  font-size: 13px;
}

.col.paper {
  color: #999;
}

.col.digital {
  color: #07c160;
}

.col.highlight {
  font-weight: bold;
}

.advantage-list {
  padding: 8px;
}

.advantage-item {
  border-bottom: 1px solid #eee;
}

.adv-header {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

.adv-title {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.adv-content {
  padding: 0 12px 12px 44px;
  font-size: 13px;
  line-height: 1.8;
  color: #666;
}

.future-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

.future-content p {
  margin: 0 0 8px;
}

.future-content ul {
  margin: 0;
  padding-left: 20px;
}

.future-content li {
  margin-bottom: 4px;
}
</style>