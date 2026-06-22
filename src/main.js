import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vant/lib/index.css'

// 引入 Vant Toast 组件
import { 
  showSuccessToast, 
  showToast, 
  showFailToast,
  showLoadingToast,
  closeToast
} from 'vant'

const app = createApp(App)
app.use(router)

// 全局挂载 Toast 方法到 window
window.$showSuccessToast = showSuccessToast
window.$showToast = showToast
window.$showFailToast = showFailToast
window.$showLoadingToast = showLoadingToast
window.$closeToast = closeToast

app.mount('#app')
