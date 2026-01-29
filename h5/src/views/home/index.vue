<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTicketStore } from '@/stores/ticket'
import TicketCard from '@/components/TicketCard.vue'
import TabBar from '@/components/TabBar.vue'
import type { Ticket } from '@/api/ticket'
import type { TicketType } from '@/types'

const router = useRouter()
const ticketStore = useTicketStore()

const refreshing = ref(false)

// ============================================
// 分类导航配置
// ============================================
interface CategoryItem {
  key: 'all' | TicketType
  label: string
  icon: string
}

const categories: CategoryItem[] = [
  { key: 'all', label: '全部', icon: 'apps-o' },
  { key: 'movie', label: '电影', icon: 'video-o' },
  { key: 'show', label: '演出', icon: 'music-o' },
  { key: 'train', label: '火车', icon: 'logistics' },
  { key: 'flight', label: '登机牌', icon: 'guide-o' },
  { key: 'scenic', label: '出游', icon: 'location-o' }
]

// 当前选中的分类
const activeCategory = ref<'all' | TicketType>('all')

// 切换分类
const onCategoryChange = (key: 'all' | TicketType) => {
  activeCategory.value = key
}

// 根据分类筛选后的票据
const filteredTickets = computed(() => {
  if (activeCategory.value === 'all') {
    return ticketStore.tickets
  }
  return ticketStore.tickets.filter(t => t.type === activeCategory.value)
})

// 统计数据（基于筛选后的票据）
const stats = computed(() => ({
  total: filteredTickets.value.length,
  cities: new Set(filteredTickets.value.map(t => {
    const loc = t.location as any
    return loc?.city || loc?.departure?.city
  }).filter(Boolean)).size,
  year: new Date().getFullYear()
}))

// 按活动时间排序的票据（基于筛选后的数据）
const sortedTickets = computed(() => {
  return [...filteredTickets.value].sort((a, b) => {
    // 优先使用 date 字段，否则使用 createdAt
    const dateA = a.date ? new Date(a.date).getTime() : new Date(a.createdAt).getTime()
    const dateB = b.date ? new Date(b.date).getTime() : new Date(b.createdAt).getTime()
    // 按时间倒序（最新的在前）
    return dateB - dateA
  })
})

// 按月份分组的票据（已按活动时间排序）
const ticketsByMonth = computed(() => {
  const groups: Record<string, Ticket[]> = {}
  const monthOrder: string[] = [] // 记录月份出现顺序
  
  sortedTickets.value.forEach(ticket => {
    const date = ticket.date ? new Date(ticket.date) : new Date(ticket.createdAt)
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`
    if (!groups[key]) {
      groups[key] = []
      monthOrder.push(key) // 按时间顺序记录月份
    }
    groups[key].push(ticket)
  })
  
  // 返回有序的分组对象
  const orderedGroups: Record<string, Ticket[]> = {}
  monthOrder.forEach(month => {
    orderedGroups[month] = groups[month]
  })
  
  return orderedGroups
})

// 获取月份英文名
const getMonthEnglish = (monthKey: string) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December']
  const match = monthKey.match(/(\d+)月/)
  if (match) {
    const monthNum = parseInt(match[1]) - 1
    return `${months[monthNum]} Highlights`
  }
  return 'Highlights'
}

// 初始加载
onMounted(() => {
  console.log('[Home] 页面加载，当前票据数:', ticketStore.tickets.length)
})

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await ticketStore.loadTickets({}, true)
  refreshing.value = false
  showToast('刷新完成')
}

// 点击票据卡片
const onTicketClick = (ticket: Ticket) => {
  router.push(`/detail/${ticket.id}`)
}

// 跳转搜索
const onSearch = () => {
  showToast('搜索功能开发中')
}

// 跳转个人中心
const onProfile = () => {
  router.push('/mine')
}
</script>

<template>
  <div class="page-container home-page">
    <!-- 毛玻璃顶部导航 -->
    <header class="glass-nav header">
      <div class="header-left">
        <h1 class="app-title">票迹</h1>
        <div class="app-subtitle-wrap">
          <span class="status-dot"></span>
          <p class="app-subtitle">PERSONAL TIMELINE</p>
        </div>
      </div>
      <div class="header-right">
        <button class="icon-btn" @click="onSearch">
          <van-icon name="search" size="20" />
        </button>
        <button class="icon-btn" @click="onProfile">
          <van-icon name="user-o" size="20" />
        </button>
      </div>
    </header>

    <!-- Web 端主视觉 -->
    <section class="web-hero">
      <div class="hero-card">
        <div class="hero-text">
          <p class="hero-kicker">YOUR PERSONAL TIMELINE</p>
          <h1 class="hero-title">让每一张票据，都有故事</h1>
          <p class="hero-desc">
            记录演出、旅行与观影，把每一次出发和抵达收藏成回忆。
          </p>
          <div class="hero-actions">
            <van-button type="primary" round @click="router.push('/add')">
              添加票迹
            </van-button>
            <van-button plain round @click="router.push('/mine')">
              查看我的
            </van-button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="value">{{ stats.total }}</span>
            <span class="label">收藏票据</span>
          </div>
          <div class="hero-stat">
            <span class="value">{{ stats.cities }}</span>
            <span class="label">足迹城市</span>
          </div>
          <div class="hero-stat">
            <span class="value">{{ stats.year }}</span>
            <span class="label">年度</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 分类导航栏 TopBar -->
    <nav class="category-nav">
      <div class="category-scroll">
        <div 
          v-for="cat in categories" 
          :key="cat.key"
          class="category-item"
          :class="{ 'category-item--active': activeCategory === cat.key }"
          @click="onCategoryChange(cat.key)"
        >
          <div class="category-icon-wrap">
            <van-icon :name="cat.icon" size="18" />
          </div>
          <span class="category-label">{{ cat.label }}</span>
        </div>
      </div>
    </nav>

    <!-- 统计卡片区域（仅全部页面显示） -->
    <section v-if="activeCategory === 'all'" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--emerald">
            <van-icon name="bookmark-o" size="16" />
          </div>
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">收藏总数</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">
            <van-icon name="location-o" size="16" />
          </div>
          <span class="stat-value">{{ stats.cities }}</span>
          <span class="stat-label">足迹城市</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--purple">
            <van-icon name="calendar-o" size="16" />
          </div>
          <span class="stat-value">{{ stats.year }}</span>
          <span class="stat-label">当前年份</span>
        </div>
      </div>
    </section>
    
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 空状态 -->
      <div v-if="filteredTickets.length === 0" class="empty-container">
        <div class="empty-content">
          <div class="empty-icon-wrap">
            <van-icon name="records-o" size="64" color="var(--slate-200)" />
          </div>
          <template v-if="activeCategory === 'all'">
            <p class="empty-title">暂无票迹</p>
            <p class="empty-desc">点击下方按钮，开始记录你的生活足迹</p>
            <van-button 
              round 
              type="primary" 
              class="empty-btn"
              @click="router.push('/add')"
            >
              <van-icon name="plus" style="margin-right: 6px" />
              添加第一张票迹
            </van-button>
          </template>
          <template v-else>
            <p class="empty-title">暂无{{ categories.find(c => c.key === activeCategory)?.label }}票据</p>
            <p class="empty-desc">切换其他分类查看，或添加新的票迹</p>
            <van-button 
              round 
              type="primary" 
              class="empty-btn"
              @click="router.push('/add')"
            >
              <van-icon name="plus" style="margin-right: 6px" />
              添加票迹
            </van-button>
          </template>
        </div>
      </div>
      
      <!-- 时间线内容 -->
      <main v-if="filteredTickets.length > 0" class="timeline-content">
        <div class="timeline-line"></div>
        
        <template v-for="(tickets, month) in ticketsByMonth" :key="month">
          <!-- 月份标题 -->
          <div class="month-header">
            <div class="timeline-dot"></div>
            <div class="month-info">
              <h2 class="month-title">{{ month }}</h2>
              <p class="month-subtitle">{{ getMonthEnglish(month) }}</p>
            </div>
          </div>
          
          <!-- 票据列表 -->
          <div class="ticket-list">
            <TicketCard
              v-for="ticket in tickets"
              :key="ticket.id"
              :ticket="ticket"
              @click="onTicketClick"
            />
          </div>
        </template>
      </main>
    </van-pull-refresh>
    
    <!-- 底部导航（含添加按钮） -->
    <TabBar />
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 100px;
  background: var(--bg-page);
}

.web-hero {
  display: none;
}

// ============================================
// 毛玻璃导航栏
// ============================================
.header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.header-left {
  .app-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--slate-900);
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }
  
  .app-subtitle-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary-color);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .app-subtitle {
    font-size: 10px;
    color: var(--slate-400);
    font-weight: 700;
    letter-spacing: 2px;
    margin: 0;
    text-transform: uppercase;
  }
}

.header-right {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--slate-400);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
  
  &:active {
    transform: scale(0.95);
    background: var(--bg-gray);
  }
}

// ============================================
// 分类导航栏
// ============================================
.category-nav {
  position: sticky;
  top: 88px; // header 高度
  z-index: 25;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 0;
}

.category-scroll {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.25s ease;
  min-width: 64px;
  
  &:active {
    transform: scale(0.96);
  }
  
  &--active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    box-shadow: 0 4px 16px -4px rgba(16, 185, 129, 0.5);
    
    .category-icon-wrap {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    
    .category-label {
      color: #fff;
      font-weight: 600;
    }
  }
}

.category-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--slate-500);
  transition: all 0.25s ease;
}

.category-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--slate-600);
  white-space: nowrap;
  transition: all 0.25s ease;
}

// ============================================
// 统计区域
// ============================================
.stats-section {
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--bg-card);
  padding: 16px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  
  &--emerald {
    background: rgba(16, 185, 129, 0.1);
    color: var(--primary-color);
  }
  
  &--blue {
    background: var(--blue-50);
    color: var(--blue-500);
  }
  
  &--purple {
    background: var(--purple-50);
    color: var(--purple-500);
  }
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--slate-900);
  line-height: 1;
}

.stat-label {
  font-size: 9px;
  color: var(--slate-400);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 6px;
}

// ============================================
// 时间线内容
// ============================================
.timeline-content {
  position: relative;
  padding: 40px 24px 24px;
}

.timeline-line {
  position: absolute;
  left: 36px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--slate-200), var(--slate-100));
  z-index: 0;
}

.month-header {
  position: relative;
  margin-bottom: 24px;
  padding-left: 40px;
}

.timeline-dot {
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  border: 4px solid var(--bg-card);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  z-index: 1;
}

.month-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.month-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--slate-900);
  margin: 0;
  letter-spacing: -0.02em;
}

.month-subtitle {
  font-size: 10px;
  color: var(--slate-400);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.ticket-list {
  padding-left: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

// ============================================
// 空状态
// ============================================
.empty-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon-wrap {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--slate-900);
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--slate-500);
  margin: 0 0 32px;
  max-width: 240px;
  line-height: 1.5;
}

.empty-btn {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  box-shadow: 0 10px 30px -5px rgba(16, 185, 129, 0.4);
  padding: 12px 28px !important;
  height: auto !important;
  font-weight: 600;
  
  &:active {
    transform: scale(0.98);
  }
}

// ============================================
// 下拉刷新样式
// ============================================
:deep(.van-pull-refresh__track) {
  min-height: calc(100vh - 200px);
}

:deep(.van-pull-refresh__head) {
  color: var(--slate-400);
  font-size: 12px;
  font-weight: 500;
}

// ============================================
// Web 端优化
// ============================================
@media (min-width: 1024px) {
  .home-page {
    padding-bottom: 40px;
    background: transparent;
  }

  .header {
    display: none;
  }

  .web-hero {
    display: block;
    padding: 24px 0 8px;
  }

  .hero-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.06));
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 24px;
    padding: 32px 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    box-shadow: 0 20px 40px -24px rgba(15, 23, 42, 0.2);
  }

  .hero-text {
    max-width: 520px;
  }

  .hero-kicker {
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--text-secondary);
    font-weight: 700;
    margin-bottom: 10px;
  }

  .hero-title {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .hero-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 20px;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    min-width: 260px;
  }

  .hero-stat {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    box-shadow: var(--shadow-xs);
  }

  .hero-stat .value {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .hero-stat .label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .stats-section {
    display: none;
  }

  .category-nav {
    position: static;
    background: transparent;
    border-bottom: none;
    padding: 16px 0 8px;
  }

  .category-scroll {
    padding: 0;
    flex-wrap: wrap;
    gap: 10px;
  }

  .category-item {
    flex-direction: row;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-full);
  }

  .category-icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
  }

  .category-label {
    font-size: 13px;
  }

  .timeline-content {
    padding: 24px 0;
  }

  .timeline-line {
    display: none;
  }

  .month-header {
    padding-left: 0;
    margin-bottom: 16px;
  }

  .timeline-dot {
    display: none;
  }

  .ticket-list {
    padding-left: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .empty-container {
    min-height: 420px;
  }
}

// ============================================
// 响应式适配
// ============================================
@media (max-width: 320px) {
  .header {
    padding: 16px 20px;
  }
  
  .header-left .app-title {
    font-size: 22px;
  }
  
  .stats-section {
    padding: 20px;
  }
  
  .stats-grid {
    gap: 8px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .timeline-content {
    padding: 32px 20px 20px;
  }
  
  .timeline-line {
    left: 32px;
  }
  
  .month-header,
  .ticket-list {
    padding-left: 36px;
  }
  
  .timeline-dot {
    left: 4px;
  }
}
</style>
