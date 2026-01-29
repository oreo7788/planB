<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

// 登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 容量使用百分比
const usagePercent = computed(() => userStore.usagePercent)

// 容量状态样式
const usageStatus = computed(() => {
  const percent = usagePercent.value
  if (percent >= 100) return 'danger'
  if (percent >= 80) return 'warning'
  return 'normal'
})

// 菜单列表
const menuList = [
  { icon: 'label-o', title: '标签管理', path: '/tags' },
  { icon: 'delete-o', title: '回收站', path: '/trash', badge: '' },
  { icon: 'comment-o', title: '意见反馈', action: 'feedback' },
  { icon: 'info-o', title: '关于我们', path: '/about' }
]

// 跳转页面
const onMenuClick = (item: any) => {
  if (item.path) {
    router.push(item.path)
  } else if (item.action === 'feedback') {
    // 意见反馈
    showToast('功能开发中')
  }
}

// 退出登录
const onLogout = () => {
  userStore.clearToken()
  showToast('已退出登录')
  router.replace('/login')
}
</script>

<template>
  <div class="page-container mine-page">
    <!-- 未登录状态 -->
    <div v-if="!isLoggedIn" class="user-card login-card">
      <div class="login-info">
        <div class="login-text">
          <h2 class="login-title">登录你的票迹</h2>
          <p class="login-desc">同步保存票据与个人足迹</p>
        </div>
        <van-button type="primary" round size="small" @click="router.push('/login')">
          去登录
        </van-button>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div v-else class="user-card">
      <div class="user-info">
        <van-image
          round
          width="64"
          height="64"
          :src="userInfo?.avatarUrl || 'https://img.yzcdn.cn/vant/cat.jpeg'"
          fit="cover"
        />
        <div class="user-detail">
          <h2 class="user-name">{{ userInfo?.nickName || '票迹用户' }}</h2>
          <p class="user-stat">已收藏 {{ userInfo?.ticketCount || 0 }} 张票迹</p>
        </div>
      </div>

      <!-- 容量进度条 -->
      <div class="capacity-section">
        <div class="capacity-header">
          <span class="capacity-label">存储容量</span>
          <span class="capacity-value">
            {{ userInfo?.photoCount || 0 }} / {{ userInfo?.photoQuota || 100 }}
          </span>
        </div>
        <van-progress
          :percentage="usagePercent"
          :show-pivot="false"
          :color="usageStatus === 'danger' ? '#ee0a24' : usageStatus === 'warning' ? '#ff976a' : '#07c160'"
          track-color="#ebedf0"
        />
        <p v-if="usageStatus === 'warning'" class="capacity-tip warning">
          容量即将用完，<span @click="router.push('/trash')">去清理</span>
        </p>
        <p v-if="usageStatus === 'danger'" class="capacity-tip danger">
          已达上限，请清理回收站
        </p>
      </div>
    </div>

    <!-- 账号信息 -->
    <van-cell-group v-if="isLoggedIn" inset class="phone-section">
      <van-cell
        title="手机号"
        :value="userInfo?.phone || '未绑定'"
      >
        <template #icon>
          <van-icon name="phone-o" class="cell-icon" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 菜单列表 -->
    <van-cell-group inset>
      <van-cell
        v-for="item in menuList"
        :key="item.title"
        :title="item.title"
        is-link
        @click="onMenuClick(item)"
      >
        <template #icon>
          <van-icon :name="item.icon" class="cell-icon" />
        </template>
        <template v-if="item.badge" #value>
          <van-badge :content="item.badge" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 退出登录 -->
    <div v-if="isLoggedIn" class="logout-section">
      <van-button block plain type="default" @click="onLogout">
        退出登录
      </van-button>
    </div>

    <!-- 底部导航 -->
    <TabBar />
  </div>
</template>

<style lang="scss" scoped>
.mine-page {
  padding-bottom: 80px;
}

.user-card {
  margin: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.login-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.login-text {
  .login-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .login-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-detail {
  flex: 1;
  
  .user-name {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px;
  }
  
  .user-stat {
    font-size: 14px;
    color: var(--text-placeholder);
    margin: 0;
  }
}

.capacity-section {
  .capacity-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    .capacity-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .capacity-value {
      font-size: 13px;
      color: var(--text-placeholder);
    }
  }
  
  .capacity-tip {
    font-size: 12px;
    margin: 8px 0 0;
    
    &.warning {
      color: #ff976a;
      
      span {
        color: var(--primary-color);
        cursor: pointer;
      }
    }
    
    &.danger {
      color: #ee0a24;
    }
  }
}

.phone-section {
  margin: 16px;
}

.cell-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--text-secondary);
}

:deep(.van-cell-group--inset) {
  margin: 16px;
}

.logout-section {
  padding: 24px 16px;
}
</style>
