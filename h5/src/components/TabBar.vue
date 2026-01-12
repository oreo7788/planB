<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeTab = computed(() => {
  const path = route.path
  if (path === '/' || path.startsWith('/detail')) return 'home'
  if (path === '/mine' || path.startsWith('/tags') || path.startsWith('/trash') || path.startsWith('/about')) return 'mine'
  return 'home'
})

const tabs = [
  { 
    name: 'home', 
    icon: 'wap-home-o', 
    activeIcon: 'wap-home', 
    label: '首页',
    labelEn: 'HOME',
    path: '/' 
  },
  { 
    name: 'footprint', 
    icon: 'guide-o', 
    activeIcon: 'guide-o', 
    label: '足迹',
    labelEn: 'TRACE',
    path: '/footprint',
    disabled: true
  },
  { name: 'add', path: '/add' }, // 中间占位
  { 
    name: 'stats', 
    icon: 'bar-chart-o', 
    activeIcon: 'bar-chart-o', 
    label: '数据',
    labelEn: 'STATS',
    path: '/stats',
    disabled: true
  },
  { 
    name: 'mine', 
    icon: 'user-o', 
    activeIcon: 'user', 
    label: '我的',
    labelEn: 'PROFILE',
    path: '/mine' 
  }
]

const handleTabClick = (tab: typeof tabs[0]) => {
  if (tab.disabled) {
    return
  }
  if (tab.name !== 'add') {
    router.push(tab.path)
  }
}

const onAdd = () => {
  router.push('/add')
}
</script>

<template>
  <div class="tabbar-wrapper">
    <nav class="tabbar glass-nav">
      <template v-for="tab in tabs" :key="tab.name">
        <!-- 中间添加按钮占位 -->
        <div v-if="tab.name === 'add'" class="tab-placeholder"></div>
        
        <!-- 普通 Tab -->
        <button 
          v-else
          class="tab-item"
          :class="{ 
            'is-active': activeTab === tab.name,
            'is-disabled': tab.disabled 
          }"
          @click="handleTabClick(tab)"
        >
          <van-icon 
            :name="activeTab === tab.name ? tab.activeIcon : tab.icon" 
            class="tab-icon"
            size="24"
          />
          <span class="tab-label">{{ tab.labelEn }}</span>
        </button>
      </template>
    </nav>
    
    <!-- 中间悬浮添加按钮 -->
    <button class="fab-button" @click="onAdd">
      <van-icon name="plus" class="fab-icon" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.tabbar-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  z-index: 100;
  padding: 0 0 env(safe-area-inset-bottom);
  background: transparent;
}

.tabbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  padding: 0 8px;
}

.tab-placeholder {
  width: 56px;
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 0;
  
  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  &:not(.is-disabled):active {
    transform: scale(0.95);
  }
}

.tab-icon {
  color: var(--slate-300);
  transition: color 0.2s ease;
  
  .is-active & {
    color: var(--primary-color);
  }
}

.tab-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--slate-300);
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: color 0.2s ease;
  
  .is-active & {
    color: var(--primary-color);
  }
}

// ============================================
// 悬浮添加按钮 (FAB)
// ============================================
.fab-button {
  position: absolute;
  bottom: calc(32px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-color);
  border: none;
  box-shadow: 
    0 8px 24px -4px rgba(16, 185, 129, 0.5),
    0 4px 8px -2px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &:hover {
    background: var(--primary-dark);
    transform: translateX(-50%) scale(1.05);
  }
  
  &:active {
    transform: translateX(-50%) scale(0.95);
    box-shadow: 
      0 4px 12px -2px rgba(16, 185, 129, 0.4),
      0 2px 4px -1px rgba(16, 185, 129, 0.2);
  }
}

.fab-icon {
  font-size: 32px;
  color: #fff;
  transition: transform 0.3s ease;
  
  .fab-button:hover & {
    transform: rotate(90deg);
  }
}

// ============================================
// 响应式适配
// ============================================
@media (max-width: 320px) {
  .tabbar {
    height: 56px;
    padding: 0 4px;
  }
  
  .tab-placeholder {
    width: 48px;
  }
  
  .tab-icon {
    font-size: 20px !important;
  }
  
  .tab-label {
    font-size: 9px;
    letter-spacing: 0.5px;
  }
  
  .fab-button {
    width: 56px;
    height: 56px;
    bottom: calc(28px + env(safe-area-inset-bottom));
  }
  
  .fab-icon {
    font-size: 28px;
  }
}
</style>
