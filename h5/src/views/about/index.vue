<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const version = '1.0.0'

const menuList = [
  { title: '隐私政策', path: '/privacy' },
  { title: '用户协议', path: '/terms' }
]
</script>

<template>
  <div class="page-container about-page">
    <!-- 导航栏 -->
    <van-nav-bar title="关于我们" left-arrow @click-left="$router.back()" />

    <!-- Logo 和应用信息 -->
    <div class="app-info">
      <div class="app-logo">
        <van-icon name="bookmark" size="48" color="#07c160" />
      </div>
      <h1 class="app-name">票迹</h1>
      <p class="app-version">版本 {{ version }}</p>
      <p class="app-slogan">记录你的精彩人生</p>
    </div>

    <!-- 菜单列表 -->
    <van-cell-group inset>
      <van-cell
        v-for="item in menuList"
        :key="item.path"
        :title="item.title"
        is-link
        @click="router.push(item.path)"
      />
    </van-cell-group>

    <!-- 版权信息 -->
    <div class="copyright">
      <p>© 2024 票迹 All Rights Reserved</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  background: var(--bg-page);
  min-height: 100vh;
}

.app-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  
  .app-logo {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .app-name {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
  }
  
  .app-version {
    font-size: 14px;
    color: var(--text-placeholder);
    margin: 0 0 8px;
  }
  
  .app-slogan {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

:deep(.van-cell-group--inset) {
  margin: 0 16px;
}

.copyright {
  text-align: center;
  padding: 40px 20px;
  
  p {
    font-size: 12px;
    color: var(--text-placeholder);
    margin: 0;
  }
}
</style>
