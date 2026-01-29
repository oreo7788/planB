<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, showSuccessToast, closeToast, showImagePreview } from 'vant'
import { useTicketStore } from '@/stores/ticket'
import { TICKET_TYPE_CONFIG, PRIVACY_CONFIG } from '@/types'
import FlightDetail from '@/components/FlightDetail.vue'
import TrainDetail from '@/components/TrainDetail.vue'
import MovieDetail from '@/components/MovieDetail.vue'
import ScenicDetail from '@/components/ScenicDetail.vue'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const ticketId = computed(() => route.params.id as string)
const ticket = computed(() => ticketStore.currentTicket)
const loading = ref(true)

// 类型配置
const typeConfig = computed(() => {
  if (!ticket.value) return null
  return TICKET_TYPE_CONFIG[ticket.value.type]
})

// 隐私配置
const privacyConfig = computed(() => {
  if (!ticket.value) return null
  return PRIVACY_CONFIG[ticket.value.privacy]
})

// 隐私文本
const privacyText = computed(() => {
  if (!ticket.value) return ''
  const map: Record<string, string> = {
    public: 'Public',
    private: 'Private',
    masked: 'Masked'
  }
  return map[ticket.value.privacy] || ''
})

// 格式化日期
const formattedDate = computed(() => {
  if (!ticket.value?.date) return ''
  const date = new Date(ticket.value.date)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

// 地点显示
const locationText = computed(() => {
  if (!ticket.value?.location) return ''
  const loc = ticket.value.location
  if (loc.type === 'route') {
    return `${loc.departure?.city || ''} → ${loc.arrival?.city || ''}`
  }
  return loc.address || loc.city || ''
})

// 标签列表
const tags = computed(() => {
  if (!ticket.value?.tags) return []
  return Array.isArray(ticket.value.tags) ? ticket.value.tags : []
})

// 是否脱敏显示
const isMasked = computed(() => ticket.value?.privacy === 'masked')

// 是否为交通票
const isTransportTicket = computed(() => {
  return ticket.value && ['train', 'flight'].includes(ticket.value.type)
})

// 是否为机票
const isFlightTicket = computed(() => {
  return ticket.value?.type === 'flight'
})

// 是否为火车票
const isTrainTicket = computed(() => {
  return ticket.value?.type === 'train'
})

// 是否为电影票
const isMovieTicket = computed(() => {
  return ticket.value?.type === 'movie'
})

// 是否为景区门票
const isScenicTicket = computed(() => {
  return ticket.value?.type === 'scenic'
})

onMounted(async () => {
  try {
    await ticketStore.loadTicketDetail(ticketId.value)
  } catch (error) {
    showToast('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
})

// 返回
const onBack = () => {
  router.back()
}

// 编辑
const onEdit = () => {
  router.push(`/edit/${ticketId.value}`)
}

// 删除
const onDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条票迹吗？删除后可在回收站恢复'
    })
    
    showLoadingToast({ message: '删除中...', forbidClick: true })
    await ticketStore.removeTicket(ticketId.value)
    closeToast()
    showSuccessToast('已移入回收站')
    router.back()
  } catch (error) {
    // 用户取消或删除失败
    closeToast()
  }
}

// 预览图片
const onPreviewImage = () => {
  if (!ticket.value?.photo) return
  showImagePreview({
    images: [ticket.value.photo],
    closeable: true
  })
}
</script>

<template>
  <div class="page-container detail-page">
    <!-- 毛玻璃导航栏 -->
    <header class="glass-nav">
      <div class="nav-left">
        <button class="nav-btn" @click="onBack">
          <van-icon name="arrow-left" size="20" />
        </button>
        <h1 class="nav-title">票迹详情</h1>
      </div>
      <button class="nav-btn" @click="onEdit">
        <van-icon name="edit" size="18" />
      </button>
    </header>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrapper">
      <van-loading type="spinner" />
    </div>

    <!-- 内容 -->
    <main v-else-if="ticket" class="detail-content">
      <!-- 机票专属详情展示 -->
      <template v-if="isFlightTicket">
        <div class="flight-detail-wrapper">
          <FlightDetail 
            :ticket="ticket" 
            @preview-image="onPreviewImage"
          />
        </div>
        
        <!-- 隐私状态标识 -->
        <div class="privacy-indicator">
          <van-icon :name="privacyConfig?.icon || 'eye-o'" size="14" />
          <span>{{ privacyText }}</span>
        </div>
      </template>

      <!-- 火车票专属详情展示 -->
      <template v-else-if="isTrainTicket">
        <div class="train-detail-wrapper">
          <TrainDetail 
            :ticket="ticket" 
            @preview-image="onPreviewImage"
          />
        </div>
        
        <!-- 隐私状态标识 -->
        <div class="privacy-indicator train">
          <van-icon :name="privacyConfig?.icon || 'eye-o'" size="14" />
          <span>{{ privacyText }}</span>
        </div>
      </template>

      <!-- 电影票专属详情展示 -->
      <template v-else-if="isMovieTicket">
        <div class="movie-detail-wrapper">
          <MovieDetail 
            :ticket="ticket" 
            @preview-image="onPreviewImage"
          />
        </div>
        
        <!-- 隐私状态标识 -->
        <div class="privacy-indicator movie">
          <van-icon :name="privacyConfig?.icon || 'eye-o'" size="14" />
          <span>{{ privacyText }}</span>
        </div>
      </template>

      <!-- 景区门票专属详情展示 -->
      <template v-else-if="isScenicTicket">
        <div class="scenic-detail-wrapper">
          <ScenicDetail 
            :ticket="ticket" 
            @preview-image="onPreviewImage"
          />
        </div>
        
        <!-- 隐私状态标识 -->
        <div class="privacy-indicator scenic">
          <van-icon :name="privacyConfig?.icon || 'eye-o'" size="14" />
          <span>{{ privacyText }}</span>
        </div>
      </template>

      <!-- 其他类型通用详情展示 -->
      <template v-else>
        <!-- 图片区域 -->
        <div class="image-section" @click="onPreviewImage">
          <van-image
            v-if="ticket.photo"
            :src="ticket.photo"
            fit="cover"
            :class="{ 'is-masked': isMasked }"
          >
            <template #loading>
              <van-loading type="spinner" />
            </template>
          </van-image>
          <div v-else class="image-placeholder">
            <van-icon :name="typeConfig?.icon || 'photo-o'" size="48" :color="typeConfig?.color" />
          </div>
        </div>

        <!-- 票据信息区域 -->
        <div class="info-section">
          <!-- 徽章 -->
          <div class="badges">
            <span class="type-badge" :style="{ backgroundColor: typeConfig?.color }">
              {{ typeConfig?.label }}
            </span>
            <span class="privacy-badge">
              <van-icon :name="privacyConfig?.icon || 'eye-o'" size="12" />
              {{ privacyText }}
            </span>
          </div>

          <!-- 标题 -->
          <h2 class="ticket-title">{{ ticket.name }}</h2>

          <!-- 信息列表 -->
          <div class="meta-list">
            <!-- 日期 -->
            <div v-if="formattedDate" class="meta-item">
              <div class="meta-icon">
                <van-icon name="calendar-o" size="16" />
              </div>
              <div class="meta-content">
                <p class="meta-label">Date</p>
                <p class="meta-value">{{ formattedDate }}</p>
              </div>
            </div>

            <!-- 班次（火车票/机票） -->
            <div v-if="isTransportTicket && ticket.tripNumber" class="meta-item">
              <div class="meta-icon">
                <van-icon :name="ticket.type === 'flight' ? 'guide-o' : 'logistics'" size="16" />
              </div>
              <div class="meta-content">
                <p class="meta-label">{{ ticket.type === 'flight' ? 'Flight' : 'Train' }}</p>
                <p class="meta-value">{{ ticket.tripNumber }}</p>
              </div>
            </div>

            <!-- 地点 -->
            <div v-if="locationText" class="meta-item">
              <div class="meta-icon">
                <van-icon name="location-o" size="16" />
              </div>
              <div class="meta-content">
                <p class="meta-label">Location</p>
                <p class="meta-value">{{ isMasked ? '***' : locationText }}</p>
              </div>
            </div>

            <!-- 价格 -->
            <div v-if="ticket.price" class="meta-item">
              <div class="meta-icon">
                <van-icon name="gold-coin-o" size="16" />
              </div>
              <div class="meta-content">
                <p class="meta-label">Price</p>
                <p class="meta-value">{{ isMasked ? '***' : `¥${ticket.price.toFixed(2)}` }}</p>
              </div>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="tags.length > 0" class="tags-section">
            <h3 class="section-label">Tags</h3>
            <div class="tags-list">
              <span v-for="tag in tags" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
          </div>

          <!-- 感想 -->
          <div v-if="ticket.note" class="note-section">
            <h3 class="section-label">Note</h3>
            <p class="note-content">"{{ ticket.note }}"</p>
          </div>
        </div>
      </template>

      <!-- 底部操作栏 -->
      <div class="action-bar">
        <button class="delete-btn" @click="onDelete">
          <van-icon name="delete-o" size="16" />
          删除此票迹
        </button>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// 毛玻璃导航栏
.glass-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  .nav-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .nav-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    
    &:active {
      background: var(--bg-gray);
    }
  }
}

.loading-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
}

// 机票详情包装器
.flight-detail-wrapper {
  padding: 16px;
  animation: slideUp 0.4s ease-out;
}

// 火车票详情包装器
.train-detail-wrapper {
  padding: 16px;
  animation: slideUp 0.4s ease-out;
}

// 电影票详情包装器
.movie-detail-wrapper {
  padding: 16px;
  background: var(--slate-100);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 隐私状态指示器
.privacy-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  margin: 0 16px 16px;
  background: var(--slate-50);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--slate-400);
  text-transform: uppercase;
  letter-spacing: 1px;
  
  .van-icon {
    font-size: 14px;
  }
  
  &.movie {
    background: rgba(244, 63, 94, 0.1);
    color: #f43f5e;
  }
  
  &.train {
    background: rgba(20, 184, 166, 0.1);
    color: #14b8a6;
  }
  
  &.scenic {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
}

// 景区门票详情包装器
.scenic-detail-wrapper {
  padding: 16px;
  animation: slideUp 0.4s ease-out;
}

// 图片区域
.image-section {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-gray);
  overflow: hidden;
  
  :deep(.van-image) {
    width: 100%;
    height: 100%;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    &.is-masked img {
      filter: blur(20px);
      transform: scale(1.1);
    }
  }
  
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }
}

// 信息区域
.info-section {
  padding: 24px;
}

// 徽章
.badges {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .type-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .privacy-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    color: var(--text-placeholder);
    text-transform: uppercase;
    letter-spacing: 2px;
  }
}

// 标题
.ticket-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 24px;
  line-height: 1.3;
}

// 信息列表
.meta-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .meta-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--bg-gray);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-placeholder);
    flex-shrink: 0;
  }
  
  .meta-content {
    flex: 1;
    
    .meta-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-placeholder);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 2px;
    }
    
    .meta-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }
}

// 分区标签
.section-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-placeholder);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 12px;
}

// 标签区域
.tags-section {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
    padding: 6px 14px;
    background: var(--bg-gray);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
  }
}

// 感想区域
.note-section {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.note-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
  padding: 16px;
  background: var(--bg-gray);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.03);
  font-style: italic;
  white-space: pre-wrap;
}

// 底部操作栏
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 24px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, #fff 60%, transparent);
}

.delete-btn {
  width: 100%;
  padding: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
}
</style>
