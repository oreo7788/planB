<script setup lang="ts">
import { computed } from 'vue'
import type { Ticket } from '@/api/ticket'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  previewImage: []
}>()

// 格式化日期
const formattedDate = computed(() => {
  if (!props.ticket.date) return ''
  const date = new Date(props.ticket.date)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

// 短日期
const shortDate = computed(() => {
  if (!props.ticket.date) return ''
  const date = new Date(props.ticket.date)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
})

// 年份
const year = computed(() => {
  if (!props.ticket.date) return ''
  return new Date(props.ticket.date).getFullYear()
})

// 地点信息
const locationText = computed(() => {
  const loc = props.ticket.location
  if (!loc) return ''
  return loc.address || loc.city || ''
})

// 是否脱敏
const isMasked = computed(() => props.ticket.privacy === 'masked')

// 处理图片预览
const handlePreviewImage = () => {
  if (props.ticket.photo) {
    emit('previewImage')
  }
}
</script>

<template>
  <div class="scenic-detail">
    <!-- 景区图片区域 -->
    <div class="hero-section" @click="handlePreviewImage">
      <van-image
        v-if="ticket.photo"
        :src="ticket.photo"
        fit="cover"
        :class="{ 'is-masked': isMasked }"
      >
        <template #loading>
          <van-loading type="spinner" color="#fff" />
        </template>
      </van-image>
      <div v-else class="hero-placeholder">
        <van-icon name="photo-o" size="64" color="rgba(255,255,255,0.4)" />
      </div>
      
      <!-- 渐变遮罩 -->
      <div class="hero-overlay"></div>
      
      <!-- 景区类型标签 -->
      <div class="type-badge">
        <van-icon name="location-o" size="12" />
        <span>景区门票</span>
      </div>
      
      <!-- 景区信息 -->
      <div class="hero-content">
        <h1 class="scenic-name">{{ ticket.name }}</h1>
        <div class="location-row" v-if="locationText">
          <van-icon name="location-o" size="14" />
          <span>{{ isMasked ? '***' : locationText }}</span>
        </div>
      </div>
    </div>

    <!-- 信息卡片 -->
    <div class="info-card">
      <!-- 日期和价格 -->
      <div class="main-info">
        <div class="info-item date-item">
          <div class="item-icon">
            <van-icon name="calendar-o" size="20" />
          </div>
          <div class="item-content">
            <span class="item-label">游览日期</span>
            <span class="item-value">{{ shortDate || '--' }}</span>
            <span class="item-sub">{{ year }}</span>
          </div>
        </div>
        
        <div class="info-divider"></div>
        
        <div class="info-item price-item" v-if="ticket.price">
          <div class="item-icon">
            <van-icon name="gold-coin-o" size="20" />
          </div>
          <div class="item-content">
            <span class="item-label">门票价格</span>
            <span class="item-value price">¥{{ ticket.price }}</span>
          </div>
        </div>
      </div>

      <!-- 完整日期 -->
      <div class="full-date" v-if="formattedDate">
        <van-icon name="underway-o" size="14" />
        <span>{{ formattedDate }}</span>
      </div>

      <!-- 标签 -->
      <div class="tags-section" v-if="ticket.tags && ticket.tags.length > 0">
        <div class="section-header">
          <van-icon name="label-o" size="14" />
          <span>标签</span>
        </div>
        <div class="tags-list">
          <span v-for="tag in ticket.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- 游记/感受 -->
      <div class="note-section" v-if="ticket.note">
        <div class="section-header">
          <van-icon name="edit" size="14" />
          <span>旅行笔记</span>
        </div>
        <div class="note-box">
          <p>"{{ ticket.note }}"</p>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="footer-decoration">
      <div class="decoration-line"></div>
      <div class="decoration-icon">
        <van-icon name="location" size="16" />
      </div>
      <div class="decoration-line"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scenic-detail {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 景区图片区域
.hero-section {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  
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
  
  .hero-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
}

.type-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #059669;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  
  .scenic-name {
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.3;
  }
  
  .location-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    
    .van-icon {
      flex-shrink: 0;
    }
  }
}

// 信息卡片
.info-card {
  margin-top: 16px;
  padding: 24px 20px;
  background: var(--bg-card, #fff);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.main-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--slate-200, #e2e8f0);
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .item-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    color: #059669;
  }
  
  .item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .item-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--slate-400, #94a3b8);
      letter-spacing: 0.5px;
    }
    
    .item-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--slate-800, #1e293b);
      
      &.price {
        color: #059669;
      }
    }
    
    .item-sub {
      font-size: 11px;
      color: var(--slate-400, #94a3b8);
    }
  }
}

.info-divider {
  width: 1px;
  height: 40px;
  background: var(--slate-200, #e2e8f0);
}

.full-date {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #059669;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--slate-400, #94a3b8);
  
  .van-icon {
    color: #10b981;
  }
}

.tags-section {
  margin-bottom: 16px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag {
    padding: 6px 14px;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #059669;
  }
}

.note-section {
  .note-box {
    background: var(--slate-50, #f8fafc);
    border-radius: 14px;
    padding: 16px;
    border-left: 3px solid #10b981;
    
    p {
      font-size: 14px;
      color: var(--slate-600, #475569);
      line-height: 1.7;
      margin: 0;
      font-style: italic;
      white-space: pre-wrap;
    }
  }
}

// 底部装饰
.footer-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 0;
  
  .decoration-line {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #10b981, transparent);
    border-radius: 1px;
  }
  
  .decoration-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #10b981;
  }
}
</style>
