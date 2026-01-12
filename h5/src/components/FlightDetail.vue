<script setup lang="ts">
import { computed } from 'vue'
import type { Ticket } from '@/api/ticket'
import { getAirlineByFlightNumber } from '@/data/airlines'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  previewImage: []
}>()

// 航司信息
const airlineInfo = computed(() => {
  return getAirlineByFlightNumber(props.ticket.tripNumber || '')
})

// 路线信息
const routeInfo = computed(() => {
  const loc = props.ticket.location
  if (!loc || loc.type !== 'route') {
    return {
      departure: '',
      arrival: '',
      departureCode: '',
      arrivalCode: '',
      departureTime: '',
      arrivalTime: '',
      departureStation: '',
      arrivalStation: ''
    }
  }
  return {
    departure: loc.departure?.city || '',
    arrival: loc.arrival?.city || '',
    departureCode: loc.departure?.code || '',
    arrivalCode: loc.arrival?.code || '',
    departureTime: loc.departure?.time || '',
    arrivalTime: loc.arrival?.time || '',
    departureStation: loc.departure?.station || '',
    arrivalStation: loc.arrival?.station || ''
  }
})

// 计算飞行时间和跨天信息
const flightTimeInfo = computed(() => {
  const depTime = routeInfo.value.departureTime
  const arrTime = routeInfo.value.arrivalTime
  
  if (!depTime || !arrTime) return { duration: '', isNextDay: false }
  
  const [depH, depM] = depTime.split(':').map(Number)
  const [arrH, arrM] = arrTime.split(':').map(Number)
  
  let depMinutes = depH * 60 + depM
  let arrMinutes = arrH * 60 + arrM
  
  const isNextDay = arrMinutes < depMinutes
  if (isNextDay) {
    arrMinutes += 24 * 60
  }
  
  const diffMinutes = arrMinutes - depMinutes
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  
  return {
    duration: parts.join(' ') || '0m',
    isNextDay
  }
})

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

// 格式化日期 - 简短版本
const shortDate = computed(() => {
  if (!props.ticket.date) return ''
  const date = new Date(props.ticket.date)
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

// 是否脱敏
const isMasked = computed(() => props.ticket.privacy === 'masked')

// 主题色
const themeColor = computed(() => airlineInfo.value?.color || '#3b82f6')

// 处理图片预览
const handlePreviewImage = () => {
  if (props.ticket.photo) {
    emit('previewImage')
  }
}
</script>

<template>
  <div 
    class="flight-detail" 
    :style="{ '--airline-color': themeColor }"
  >
    <!-- 登机牌头部 -->
    <div class="boarding-pass-header">
      <div class="header-left">
        <div class="airline-logo">
          <span class="logo-text">{{ airlineInfo?.shortName || '航空' }}</span>
        </div>
        <div class="airline-info">
          <span class="airline-name">{{ airlineInfo?.name || '航空公司' }}</span>
          <span class="flight-label">BOARDING PASS</span>
        </div>
      </div>
      <div class="header-right">
        <span class="flight-number">{{ ticket.tripNumber || ticket.name }}</span>
      </div>
    </div>

    <!-- 航线信息区域 -->
    <div class="route-section">
      <div class="route-main">
        <!-- 出发地 -->
        <div class="airport departure">
          <span class="airport-code">{{ isMasked ? '***' : (routeInfo.departureCode || routeInfo.departure.slice(0, 3).toUpperCase() || 'DEP') }}</span>
          <span class="airport-city">{{ isMasked ? '***' : routeInfo.departure }}</span>
          <span class="airport-name" v-if="routeInfo.departureStation && !isMasked">{{ routeInfo.departureStation }}</span>
        </div>

        <!-- 航线可视化 -->
        <div class="route-visual">
          <div class="route-line">
            <div class="line-dot start"></div>
            <div class="line-track">
              <div class="line-dashed"></div>
              <div class="plane-wrapper">
                <span class="plane-icon">✈</span>
              </div>
              <div class="line-dashed"></div>
            </div>
            <div class="line-dot end"></div>
          </div>
          <span class="flight-duration" v-if="flightTimeInfo.duration && !isMasked">
            {{ flightTimeInfo.duration }}
          </span>
        </div>

        <!-- 到达地 -->
        <div class="airport arrival">
          <span class="airport-code">{{ isMasked ? '***' : (routeInfo.arrivalCode || routeInfo.arrival.slice(0, 3).toUpperCase() || 'ARR') }}</span>
          <span class="airport-city">{{ isMasked ? '***' : routeInfo.arrival }}</span>
          <span class="airport-name" v-if="routeInfo.arrivalStation && !isMasked">{{ routeInfo.arrivalStation }}</span>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="time-section" v-if="routeInfo.departureTime || routeInfo.arrivalTime">
        <div class="time-item departure">
          <span class="time-label">DEPARTURE</span>
          <span class="time-value">{{ routeInfo.departureTime || '--:--' }}</span>
        </div>
        <div class="time-divider">
          <van-icon name="arrow" />
        </div>
        <div class="time-item arrival">
          <span class="time-label">ARRIVAL</span>
          <span class="time-value">
            {{ routeInfo.arrivalTime || '--:--' }}
            <sup v-if="flightTimeInfo.isNextDay" class="next-day-badge">+1</sup>
          </span>
        </div>
      </div>
    </div>

    <!-- 撕裂线 -->
    <div class="tear-line">
      <div class="notch left"></div>
      <div class="dashed-line"></div>
      <div class="notch right"></div>
    </div>

    <!-- 详细信息区域 -->
    <div class="info-section">
      <!-- 信息卡片网格 -->
      <div class="info-grid">
        <div class="info-card">
          <span class="info-label">DATE</span>
          <span class="info-value">{{ shortDate || '--' }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">FLIGHT</span>
          <span class="info-value">{{ ticket.tripNumber || '--' }}</span>
        </div>
        <div class="info-card" v-if="ticket.price">
          <span class="info-label">PRICE</span>
          <span class="info-value price">¥{{ ticket.price }}</span>
        </div>
        <div class="info-card" v-if="airlineInfo">
          <span class="info-label">AIRLINE</span>
          <span class="info-value">{{ airlineInfo.code }}</span>
        </div>
      </div>

      <!-- 图片区域 -->
      <div 
        v-if="ticket.photo" 
        class="photo-section"
        @click="handlePreviewImage"
      >
        <van-image
          :src="ticket.photo"
          fit="cover"
          :class="{ 'is-masked': isMasked }"
        >
          <template #loading>
            <van-loading type="spinner" />
          </template>
        </van-image>
        <div class="photo-overlay">
          <van-icon name="enlarge" size="20" />
          <span>点击查看大图</span>
        </div>
      </div>

      <!-- 完整日期 -->
      <div class="date-full" v-if="formattedDate">
        <van-icon name="calendar-o" size="14" />
        <span>{{ formattedDate }}</span>
      </div>

      <!-- 标签 -->
      <div v-if="ticket.tags && ticket.tags.length > 0" class="tags-section">
        <div class="section-header">
          <van-icon name="label-o" size="14" />
          <span>TAGS</span>
        </div>
        <div class="tags-list">
          <span v-for="tag in ticket.tags" :key="tag" class="tag-item">{{ tag }}</span>
        </div>
      </div>

      <!-- 备注 -->
      <div v-if="ticket.note" class="note-section">
        <div class="section-header">
          <van-icon name="edit" size="14" />
          <span>NOTE</span>
        </div>
        <div class="note-content">
          <p>"{{ ticket.note }}"</p>
        </div>
      </div>
    </div>

    <!-- 条形码装饰 -->
    <div class="barcode-section">
      <div class="barcode">
        <div v-for="i in 40" :key="i" class="bar" :style="{ width: Math.random() > 0.5 ? '2px' : '1px' }"></div>
      </div>
      <span class="barcode-text">{{ ticket.tripNumber || ticket.name }} · {{ shortDate }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flight-detail {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
  
  &::before {
    content: 'BOARDING PASS';
    position: absolute;
    right: 20px;
    top: 80px;
    font-size: 48px;
    font-weight: 900;
    color: rgba(59, 130, 246, 0.03);
    pointer-events: none;
    white-space: nowrap;
    transform: rotate(-10deg);
  }
}

// 登机牌头部
.boarding-pass-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 16px;
  background: linear-gradient(135deg, var(--airline-color) 0%, color-mix(in srgb, var(--airline-color) 80%, #000) 100%);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      transparent 10px, 
      var(--airline-color) 10px, 
      var(--airline-color) 12px,
      transparent 12px
    );
    background-size: 22px 100%;
    opacity: 0.3;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .airline-logo {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    
    .logo-text {
      font-size: 12px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 1px;
    }
  }
  
  .airline-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .airline-name {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }
    
    .flight-label {
      font-size: 9px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 2px;
    }
  }
  
  .header-right {
    .flight-number {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 1px;
    }
  }
}

// 航线信息
.route-section {
  padding: 24px 20px;
}

.route-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.airport {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  &.departure {
    align-items: flex-start;
    text-align: left;
  }
  
  &.arrival {
    align-items: flex-end;
    text-align: right;
  }
  
  .airport-code {
    font-size: 32px;
    font-weight: 900;
    color: var(--slate-900);
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 6px;
  }
  
  .airport-city {
    font-size: 14px;
    font-weight: 600;
    color: var(--slate-600);
    margin-bottom: 2px;
  }
  
  .airport-name {
    font-size: 11px;
    color: var(--slate-400);
    max-width: 100px;
  }
}

.route-visual {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 8px 0;
  min-width: 100px;
  
  .route-line {
    display: flex;
    align-items: center;
    width: 100%;
    
    .line-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--airline-color);
      flex-shrink: 0;
      
      &.start {
        box-shadow: 0 0 0 3px rgba(var(--airline-color), 0.2);
      }
    }
    
    .line-track {
      flex: 1;
      display: flex;
      align-items: center;
      
      .line-dashed {
        flex: 1;
        height: 2px;
        background: repeating-linear-gradient(
          90deg,
          var(--airline-color) 0px,
          var(--airline-color) 6px,
          transparent 6px,
          transparent 12px
        );
      }
      
      .plane-wrapper {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        padding: 4px 8px;
        
        .plane-icon {
          font-size: 18px;
          color: var(--airline-color);
        }
      }
    }
  }
  
  .flight-duration {
    font-size: 11px;
    font-weight: 600;
    color: var(--slate-400);
    margin-top: 8px;
    letter-spacing: 0.5px;
  }
}

// 时间区域
.time-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  
  .time-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    &.departure { align-items: flex-start; }
    &.arrival { align-items: flex-end; }
    
    .time-label {
      font-size: 9px;
      font-weight: 700;
      color: var(--slate-400);
      letter-spacing: 1px;
    }
    
    .time-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--slate-900);
      
      .next-day-badge {
        font-size: 10px;
        font-weight: 700;
        color: var(--amber-500);
        margin-left: 2px;
        vertical-align: super;
      }
    }
  }
  
  .time-divider {
    color: var(--slate-300);
    
    .van-icon {
      font-size: 20px;
    }
  }
}

// 撕裂线
.tear-line {
  position: relative;
  height: 24px;
  display: flex;
  align-items: center;
  margin: 0 -4px;
  
  .notch {
    width: 24px;
    height: 24px;
    background: var(--bg-page);
    border-radius: 50%;
    flex-shrink: 0;
    
    &.left {
      margin-left: -12px;
    }
    
    &.right {
      margin-right: -12px;
    }
  }
  
  .dashed-line {
    flex: 1;
    border-top: 2px dashed var(--slate-200);
  }
}

// 详细信息区域
.info-section {
  padding: 20px;
  background: #fff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-card {
  background: var(--slate-50);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .info-label {
    font-size: 9px;
    font-weight: 700;
    color: var(--slate-400);
    letter-spacing: 1px;
  }
  
  .info-value {
    font-size: 16px;
    font-weight: 700;
    color: var(--slate-800);
    
    &.price {
      color: var(--airline-color);
    }
  }
}

// 图片区域
.photo-section {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
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
  
  .photo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.4) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 12px;
    gap: 4px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 11px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:active .photo-overlay {
    opacity: 1;
  }
}

// 完整日期
.date-full {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--slate-50);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--slate-600);
  
  .van-icon {
    color: var(--airline-color);
  }
}

// 分区标题
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--slate-400);
  letter-spacing: 1px;
  
  .van-icon {
    color: var(--airline-color);
  }
}

// 标签区域
.tags-section {
  margin-bottom: 16px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
    padding: 6px 14px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid rgba(59, 130, 246, 0.1);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--airline-color);
  }
}

// 备注区域
.note-section {
  .note-content {
    background: var(--slate-50);
    border-radius: 16px;
    padding: 16px;
    
    p {
      font-size: 14px;
      color: var(--slate-600);
      line-height: 1.7;
      margin: 0;
      font-style: italic;
      white-space: pre-wrap;
    }
  }
}

// 条形码
.barcode-section {
  padding: 16px 20px 20px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.barcode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  height: 40px;
  
  .bar {
    height: 100%;
    background: var(--slate-800);
    
    &:nth-child(odd) {
      height: 85%;
    }
  }
}

.barcode-text {
  font-size: 10px;
  font-weight: 600;
  color: var(--slate-400);
  letter-spacing: 2px;
  text-transform: uppercase;
}
</style>
