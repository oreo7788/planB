import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vant 样式
import 'vant/lib/index.css'
// 全局样式
import './styles/index.scss'
// 触摸模拟器（用于 PC 调试）
import '@vant/touch-emulator'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
