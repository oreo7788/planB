<script setup lang="ts">
import { computed } from 'vue'
import type { Ticket } from '@/api/ticket'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  previewImage: []
}>()

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

// 计算行程时间和跨天信息
const travelTimeInfo = computed(() => {
  const depTime = routeInfo.value.departureTime
  const arrTime = routeInfo.value.arrivalTime
  
  if (!depTime || !arrTime) return { duration: '', durationText: '', isNextDay: false }
  
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
  
  // 中文版本
  const textParts: string[] = []
  if (hours > 0) textParts.push(`${hours}小时`)
  if (minutes > 0) textParts.push(`${minutes}分钟`)
  
  return {
    duration: parts.join(' ') || '0m',
    durationText: textParts.join('') || '0分钟',
    isNextDay
  }
})

// 火车类型识别
const trainTypeInfo = computed(() => {
  const no = (props.ticket.tripNumber || props.ticket.name || '').toUpperCase()
  if (no.startsWith('G')) return { type: '高速动车', label: '高速铁路', color: '#14b8a6' }
  if (no.startsWith('D')) return { type: '动车组', label: '动车组', color: '#3b82f6' }
  if (no.startsWith('C')) return { type: '城际列车', label: '城际列车', color: '#8b5cf6' }
  if (no.startsWith('Z')) return { type: '直达特快', label: '直达特快', color: '#f59e0b' }
  if (no.startsWith('T')) return { type: '特快列车', label: '特快列车', color: '#ef4444' }
  if (no.startsWith('K')) return { type: '快速列车', label: '快速列车', color: '#ec4899' }
  return { type: '普通列车', label: '普通列车', color: '#64748b' }
})

// 格式化日期
const formattedDate = computed(() => {
  if (!props.ticket.date) return { full: '', short: '', weekDay: '' }
  const date = new Date(props.ticket.date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return {
    full: `${year}年${date.getMonth() + 1}月${date.getDate()}日 ${weekDay}`,
    short: `${year}.${month}.${day}`,
    weekDay
  }
})

// 是否脱敏
const isMasked = computed(() => props.ticket.privacy === 'masked')

// 主题色
const themeColor = computed(() => trainTypeInfo.value.color)

// 座位信息解析
const seatDetails = computed(() => {
  const hall = props.ticket.hall || ''
  const seat = props.ticket.seat || ''
  const note = props.ticket.note || ''
  const text = seat || note
  
  // 从 hall 字段解析车厢号（格式："05车厢" 或 "5"）
  let carriage = ''
  if (hall) {
    const hallMatch = hall.match(/(\d+)/)
    if (hallMatch) {
      carriage = hallMatch[1].padStart(2, '0')
    }
  }
  // 兼容：如果 hall 没有，尝试从 seat/note 中解析
  if (!carriage) {
    const carriageMatch = text.match(/(\d+)\s*[车厢号]/)
    if (carriageMatch) {
      carriage = carriageMatch[1].padStart(2, '0')
    }
  }
  
  // 席别（优先从 seat 字段解析）
  const seatTypes = ['商务座', '特等座', '一等座', '二等座', '软卧', '硬卧', '软座', '硬座', '无座']
  let seatType = ''
  for (const type of seatTypes) {
    if (seat.includes(type) || note.includes(type)) {
      seatType = type
      break
    }
  }
  // 从 tags 中查找
  if (!seatType) {
    const tags = props.ticket.tags || []
    for (const tag of tags) {
      for (const type of seatTypes) {
        if (tag.includes(type)) {
          seatType = type
          break
        }
      }
      if (seatType) break
    }
  }
  
  // 座位号（从 seat 字段中提取，排除席别）
  let seatNo = ''
  if (seat) {
    // 移除席别后的内容作为座位号
    let seatStr = seat
    for (const type of seatTypes) {
      seatStr = seatStr.replace(type, '')
    }
    seatStr = seatStr.trim()
    // 尝试匹配座位号格式
    const seatMatch = seatStr.match(/(\d+[A-Fa-f]|\d+[排行]?\d*[座号]?)/)
    if (seatMatch) {
      seatNo = seatMatch[1].toUpperCase()
    } else if (seatStr) {
      seatNo = seatStr
    }
  }
  
  return { carriage, seatNo, seatType }
})

// 是否有座位信息
const hasSeatInfo = computed(() => {
  const { carriage, seatNo, seatType } = seatDetails.value
  return carriage || seatNo || seatType
})

// 处理图片预览
const handlePreviewImage = () => {
  if (props.ticket.photo) {
    emit('previewImage')
  }
}
</script>

<template>
  <div class="train-detail" :style="{ '--train-color': themeColor }">
    <!-- Hero 区域 -->
    <div class="ticket-hero">
      <div class="hero-pattern"></div>
      
      <!-- 顶部徽章 -->
      <div class="hero-header">
        <div class="train-type-badge">
          <van-icon name="logistics" size="14" />
          <span>{{ trainTypeInfo.label }}</span>
        </div>
        <div class="train-icon-box">
          <van-icon name="logistics" size="28" />
        </div>
      </div>

      <!-- 车次号 -->
      <div class="train-number-section">
        <p class="label">TRAIN NUMBER</p>
        <h2 class="number">{{ ticket.tripNumber || ticket.name }}</h2>
      </div>

      <!-- 路线展示 -->
      <div class="route-display">
        <div class="station-info departure">
          <div class="station-name">{{ isMasked ? '***' : (routeInfo.departureStation || routeInfo.departure || '出发站') }}</div>
          <div class="station-time">{{ routeInfo.departureTime || '--:--' }}</div>
        </div>
        
        <div class="route-middle">
          <div class="duration-label">{{ travelTimeInfo.duration || '--' }}</div>
          <div class="route-line">
            <div class="station-dot"></div>
            <van-icon name="arrow" class="arrow-icon" />
            <div class="station-dot"></div>
          </div>
          <div class="direct-label">Direct</div>
        </div>
        
        <div class="station-info arrival">
          <div class="station-name">{{ isMasked ? '***' : (routeInfo.arrivalStation || routeInfo.arrival || '到达站') }}</div>
          <div class="station-time">
            {{ routeInfo.arrivalTime || '--:--' }}
            <sup v-if="travelTimeInfo.isNextDay" class="next-day">+1</sup>
          </div>
        </div>
      </div>

      <!-- 座位信息徽章 -->
      <div v-if="hasSeatInfo" class="seat-badge">
        <div class="seat-item" v-if="seatDetails.carriage">
          <span class="seat-label">车厢</span>
          <span class="seat-value">{{ seatDetails.carriage }}</span>
        </div>
        <div class="seat-divider" v-if="seatDetails.carriage && seatDetails.seatNo"></div>
        <div class="seat-item" v-if="seatDetails.seatNo">
          <span class="seat-label">座位</span>
          <span class="seat-value">{{ seatDetails.seatNo }}</span>
        </div>
        <div class="seat-divider" v-if="(seatDetails.carriage || seatDetails.seatNo) && seatDetails.seatType"></div>
        <div class="seat-item" v-if="seatDetails.seatType">
          <span class="seat-label">席别</span>
          <span class="seat-value">{{ seatDetails.seatType }}</span>
        </div>
      </div>
    </div>

    <!-- 详细信息区域 -->
    <div class="detail-section">
      <!-- 标题和价格 -->
      <div class="detail-header">
        <div class="header-left">
          <h2 class="route-title">{{ isMasked ? '*** → ***' : `${routeInfo.departure || '出发'} → ${routeInfo.arrival || '到达'}` }}</h2>
        </div>
        <div class="header-right" v-if="ticket.price">
          <span class="price-label">Ticket Price</span>
          <span class="price-value">¥{{ ticket.price }}</span>
        </div>
      </div>

      <!-- 信息卡片网格 -->
      <div class="info-grid">
        <div class="info-card">
          <div class="card-icon teal">
            <van-icon name="calendar-o" size="20" />
          </div>
          <div class="card-content">
            <span class="card-label">Travel Date</span>
            <span class="card-value">{{ formattedDate.short || '--' }}</span>
            <span class="card-sub">{{ formattedDate.weekDay }}</span>
          </div>
        </div>
        <div class="info-card">
          <div class="card-icon orange">
            <van-icon name="clock-o" size="20" />
          </div>
          <div class="card-content">
            <span class="card-label">Duration</span>
            <span class="card-value">{{ travelTimeInfo.durationText || '--' }}</span>
            <span class="card-sub">{{ trainTypeInfo.type }}</span>
          </div>
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

      <!-- 标签 -->
      <div v-if="ticket.tags && ticket.tags.length > 0" class="tags-section">
        <h3 class="section-title">
          <van-icon name="label-o" size="12" />
          <span>Tags & Context</span>
        </h3>
        <div class="tags-list">
          <span v-for="tag in ticket.tags" :key="tag" class="tag-item"># {{ tag }}</span>
        </div>
      </div>

      <!-- 旅途感想 -->
      <div v-if="ticket.note" class="note-section">
        <h3 class="section-title">
          <van-icon name="edit" size="12" />
          <span>The Memory</span>
        </h3>
        <div class="note-card">
          <van-icon name="comment-o" class="quote-icon" />
          <p class="note-text">"{{ ticket.note }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.train-detail {
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: #fff;
}

// Hero 区域
.ticket-hero {
  background: linear-gradient(135deg, #0d9488 0%, var(--train-color) 50%, #2dd4bf 100%);
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
  
  .hero-pattern {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: movePattern 20s linear infinite;
  }
  
  @keyframes movePattern {
    0% { transform: translate(0, 0); }
    100% { transform: translate(30px, 30px); }
  }
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  
  .train-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    color: #fff;
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .train-icon-box {
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
}

.train-number-section {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  
  .label {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  
  .number {
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 2px;
    margin: 0;
  }
}

.route-display {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  
  .station-info {
    flex: 1;
    
    &.departure { text-align: left; }
    &.arrival { text-align: right; }
    
    .station-name {
      font-size: 20px;
      font-weight: 900;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 8px;
      word-break: break-all;
    }
    
    .station-time {
      font-size: 24px;
      font-weight: 900;
      color: #fff;
      
      .next-day {
        font-size: 12px;
        color: #fcd34d;
        vertical-align: super;
        margin-left: 2px;
      }
    }
  }
  
  .route-middle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding-top: 8px;
    min-width: 80px;
    
    .duration-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .route-line {
      display: flex;
      align-items: center;
      gap: 8px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 12px;
        right: 12px;
        top: 50%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
      }
      
      .station-dot {
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
        position: relative;
        z-index: 1;
      }
      
      .arrow-icon {
        color: rgba(255, 255, 255, 0.6);
        font-size: 16px;
        position: relative;
        z-index: 1;
      }
    }
    
    .direct-label {
      font-size: 9px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  }
}

.seat-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 14px 20px;
  border-radius: 16px;
  position: relative;
  z-index: 1;
  max-width: 80%;
  margin: 0 auto;
  
  .seat-item {
    flex: 1;
    text-align: center;
    padding: 0 10px;
    
    .seat-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    
    .seat-value {
      display: block;
      font-size: 20px;
      font-weight: 900;
      color: #fff;
    }
  }
  
  .seat-divider {
    width: 1px;
    height: 36px;
    background: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }
}

// 详细信息区域
.detail-section {
  padding: 24px 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  .header-left {
    flex: 1;
    
    .route-title {
      font-size: 22px;
      font-weight: 900;
      color: var(--slate-900);
      margin: 0;
      line-height: 1.3;
    }
  }
  
  .header-right {
    text-align: right;
    
    .price-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: var(--slate-300);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    
    .price-value {
      font-size: 22px;
      font-weight: 900;
      color: var(--train-color);
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.info-card {
  background: var(--slate-50);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid var(--slate-100);
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.teal {
      background: rgba(20, 184, 166, 0.1);
      color: #14b8a6;
    }
    
    &.orange {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
    }
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .card-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .card-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--slate-700);
    }
    
    .card-sub {
      font-size: 10px;
      font-weight: 500;
      color: var(--slate-400);
    }
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: var(--slate-400);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
  
  .van-icon {
    color: var(--train-color);
  }
}

// 图片区域
.photo-section {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 24px;
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

// 标签区域
.tags-section {
  margin-bottom: 24px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
    padding: 10px 16px;
    background: var(--slate-50);
    border: 1px solid var(--slate-100);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--slate-600);
  }
}

// 感想区域
.note-section {
  .note-card {
    background: rgba(248, 250, 252, 0.5);
    border: 1px solid var(--slate-100);
    border-radius: 32px;
    padding: 24px;
    position: relative;
    overflow: hidden;
    
    .quote-icon {
      position: absolute;
      top: -4px;
      right: -4px;
      font-size: 48px;
      color: var(--slate-100);
      transform: rotate(12deg);
    }
    
    .note-text {
      font-size: 15px;
      font-weight: 500;
      color: var(--slate-600);
      line-height: 1.7;
      margin: 0;
      font-style: italic;
      position: relative;
      z-index: 1;
      white-space: pre-wrap;
    }
  }
}
</style>
