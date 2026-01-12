<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { mpBridge } from '@/utils/bridge'

const userStore = useUserStore()

onMounted(async () => {
  // 从 URL 参数中获取 token
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  
  if (token) {
    userStore.setToken(token)
    // 获取用户信息
    await userStore.fetchUserInfo()
  }
  
  // 检测运行环境
  if (mpBridge.isMiniProgram()) {
    console.log('[App] 运行在小程序环境')
  } else {
    console.log('[App] 运行在浏览器环境')
  }
})
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <keep-alive :include="['Home']">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style lang="scss">
// ============================================
// 字体加载 - Inter 字体
// ============================================
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

// ============================================
// 全局应用样式
// ============================================
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 
    Helvetica, 'Segoe UI', Arial, Roboto, 'PingFang SC', 'Hiragino Sans GB', 
    'Microsoft Yahei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background: var(--bg-page);
}

// ============================================
// 应用容器
// ============================================
.app-container {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
  position: relative;
  
  // 桌面端显示边框阴影
  @media (min-width: 431px) {
    box-shadow: 
      0 0 0 1px var(--border-color),
      0 25px 50px -12px rgba(0, 0, 0, 0.1);
  }
}

// ============================================
// 全局过渡动画
// ============================================
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// ============================================
// 滚动条美化
// ============================================
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--slate-200);
  border-radius: 2px;
  
  &:hover {
    background: var(--slate-300);
  }
}

// ============================================
// 全局选中样式
// ============================================
::selection {
  background: rgba(16, 185, 129, 0.2);
  color: inherit;
}

// ============================================
// Vant 组件全局样式覆盖
// ============================================

// 下拉刷新
.van-pull-refresh {
  &__head {
    font-size: 12px;
    color: var(--slate-400);
  }
}

// 空状态
.van-empty {
  padding: 60px 20px;
  
  &__description {
    color: var(--slate-500);
    font-size: 14px;
    margin-top: 16px;
  }
  
  &__bottom {
    margin-top: 24px;
  }
}

// 按钮
.van-button {
  &--primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
    
    &:active {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
    }
  }
  
  &--round {
    border-radius: var(--radius-full);
  }
}

// 图标
.van-icon {
  vertical-align: middle;
}

// Toast
.van-toast {
  font-size: 14px;
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

// 标签
.van-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  
  &--plain {
    background: transparent;
  }
}

// Loading
.van-loading {
  &__spinner {
    color: var(--primary-color);
  }
}

// Dialog
.van-dialog {
  border-radius: var(--radius-xl);
  overflow: hidden;
  
  &__header {
    font-weight: 600;
    padding-top: 24px;
  }
  
  &__message {
    color: var(--slate-500);
    line-height: 1.6;
  }
  
  &__confirm {
    color: var(--primary-color);
    font-weight: 600;
  }
}

// ActionSheet
.van-action-sheet {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  
  &__header {
    font-weight: 600;
  }
  
  &__item {
    font-size: 16px;
    
    &--disabled {
      color: var(--slate-300);
    }
  }
  
  &__cancel {
    color: var(--slate-500);
  }
}

// Cell
.van-cell {
  padding: 14px 16px;
  font-size: 15px;
  
  &__title {
    color: var(--text-primary);
  }
  
  &__value {
    color: var(--text-secondary);
  }
  
  &__right-icon {
    color: var(--slate-300);
  }
  
  &::after {
    border-color: var(--border-color);
  }
}

// Field
.van-field {
  &__label {
    color: var(--text-primary);
    font-weight: 500;
  }
  
  &__control {
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-placeholder);
    }
  }
}

// Popup
.van-popup {
  &--round {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
}

// Image
.van-image {
  &__error,
  &__loading {
    background: var(--bg-gray);
  }
}
</style>
