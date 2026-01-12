<script setup lang="ts">
import { computed } from 'vue'
import type { Ticket } from '@/api/ticket'
import { TICKET_TYPE_CONFIG } from '@/types'
import { getAirlineByFlightNumber } from '@/data/airlines'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  click: [ticket: Ticket]
}>()

// 类型配置
const typeConfig = computed(() => TICKET_TYPE_CONFIG[props.ticket.type])

// 航司信息（根据航班号自动识别）
const airlineInfo = computed(() => {
  if (props.ticket.type !== 'flight') return null
  return getAirlineByFlightNumber(props.ticket.tripNumber || '')
})

// 卡片样式类型
const cardStyle = computed(() => {
  const type = props.ticket.type
  if (type === 'flight') return 'flight'
  if (type === 'train') return 'train'
  if (type === 'show') return 'show'
  if (type === 'movie') return 'movie'
  if (type === 'exhibition') return 'horizontal'
  if (type === 'scenic') return 'scenic'
  return 'default'
})

// 格式化日期 - 显示为 YYYY.MM.DD 格式
const formattedDate = computed(() => {
  if (!props.ticket.date) return ''
  const date = new Date(props.ticket.date)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
})

// 地点显示
const locationText = computed(() => {
  const loc = props.ticket.location
  if (!loc) return ''
  
  if (loc.type === 'route') {
    return `${loc.departure?.city || ''} → ${loc.arrival?.city || ''}`
  }
  return loc.city || loc.address || ''
})

// 路线信息（火车票/机票）
const routeInfo = computed(() => {
  const loc = props.ticket.location
  if (!loc || loc.type !== 'route') {
    return { 
      departure: '', 
      arrival: '',
      departureCode: '',
      arrivalCode: '',
      departureTime: '',
      arrivalTime: ''
    }
  }
  return {
    departure: loc.departure?.city || loc.departure?.station || '',
    arrival: loc.arrival?.city || loc.arrival?.station || '',
    departureCode: loc.departure?.code || '',
    arrivalCode: loc.arrival?.code || '',
    departureTime: loc.departure?.time || '',
    arrivalTime: loc.arrival?.time || ''
  }
})

// 计算航班/火车用时和跨天信息
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

// 火车类型识别
const trainTypeLabel = computed(() => {
  if (props.ticket.type !== 'train') return ''
  const no = (props.ticket.tripNumber || props.ticket.name || '').toUpperCase()
  if (no.startsWith('G')) return '高铁'
  if (no.startsWith('D')) return '动车'
  if (no.startsWith('Z')) return '直达'
  if (no.startsWith('T')) return '特快'
  if (no.startsWith('K')) return '快速'
  if (/^\d+$/.test(no)) return '普通列车'
  if (no) return '普通列车'
  return '火车'
})

const flightDuration = computed(() => flightTimeInfo.value.duration)

// 副标题
const subtitle = computed(() => {
  const parts: string[] = []
  if (locationText.value && !['train', 'flight'].includes(props.ticket.type)) {
    parts.push(locationText.value)
  }
  if (props.ticket.note) {
    parts.push(props.ticket.note.slice(0, 20))
  }
  return parts.join(' · ') || ''
})

// 电影票影院信息
const cinemaInfo = computed(() => {
  if (props.ticket.type !== 'movie') return null
  const loc = props.ticket.location
  // 优先使用 address 作为影院名称，其次是 city
  return loc?.address || loc?.city || ''
})

// 电影票/演出票座位信息
const seatInfo = computed(() => {
  if (!['movie', 'show'].includes(props.ticket.type)) return null
  
  // 优先使用 seat 字段
  if (props.ticket.seat) {
    return props.ticket.seat
  }
  
  // 兼容旧数据：从 note 中解析座位信息
  const note = props.ticket.note || ''
  // 尝试匹配常见的座位格式，如 "5排3座"、"A区 5排3号"、"5-3"
  const seatPattern = /(\d+)\s*[排行]\s*(\d+)\s*[座号]?/
  const match = note.match(seatPattern)
  if (match) {
    return `${match[1]}排${match[2]}座`
  }
  // 尝试匹配简单格式如 "5-3"
  const simplePattern = /(\d+)\s*[-]\s*(\d+)/
  const simpleMatch = note.match(simplePattern)
  if (simpleMatch) {
    return `${simpleMatch[1]}排${simpleMatch[2]}座`
  }
  // 如果 note 中包含座位相关关键词，直接返回 note
  if (note.includes('排') || note.includes('座') || note.includes('号')) {
    return note.slice(0, 20)
  }
  return ''
})

// 电影厅信息展示（优先使用 hall 字段）
const hallInfoDisplay = computed(() => {
  if (props.ticket.type !== 'movie') return null
  
  // 优先使用 hall 字段
  if (props.ticket.hall) return props.ticket.hall
  
  // 回退：从 seat 或 note 中解析
  const seatText = props.ticket.seat || ''
  const noteText = props.ticket.note || ''
  const textToSearch = seatText || noteText
  
  const hallPattern = /(\d+号厅|[A-Z]+厅|\d+厅)/i
  const match = textToSearch.match(hallPattern)
  return match ? match[0] : ''
})

// 电影版本展示（优先使用 version 字段）
const movieVersionDisplay = computed(() => {
  if (props.ticket.type !== 'movie') return null
  
  // 优先使用 version 字段
  if (props.ticket.version) return props.ticket.version
  
  // 回退：从 tags 中查找版本信息
  const tags = props.ticket.tags || []
  const versionTags = ['IMAX', 'IMAX 3D', '3D', '2D', '原版', '国语', '粤语', '杜比全景声', '杜比视界', '巨幕', '激光', 'CGS', '4DX', 'CINITY', 'ScreenX']
  for (const tag of tags) {
    for (const v of versionTags) {
      if (tag.toUpperCase().includes(v.toUpperCase())) {
        return tag
      }
    }
  }
  
  // 回退：从 seat 或 note 中解析
  const seatText = props.ticket.seat || ''
  const noteText = props.ticket.note || ''
  const textToSearch = seatText + ' ' + noteText
  
  const versionPattern = /(IMAX\s*3D|IMAX|杜比全景声|杜比视界|巨幕厅|激光厅|CGS|4DX|CINITY|ScreenX|原版3D|原版2D|国语3D|国语2D|粤语|3D|2D)/i
  const match = textToSearch.match(versionPattern)
  return match ? match[0] : ''
})

// 电影场次时间展示（优先使用 showtime 字段）
const showtimeDisplay = computed(() => {
  if (props.ticket.type !== 'movie') return null
  
  // 优先使用 showtime 字段
  if (props.ticket.showtime) return props.ticket.showtime
  
  // 回退：从 note 中解析
  const note = props.ticket.note || ''
  const timePattern = /\d{1,2}:\d{2}/
  const match = note.match(timePattern)
  return match ? match[0] : ''
})

// 座位信息展示
const seatInfoDisplay = computed(() => {
  if (!['movie', 'show'].includes(props.ticket.type)) return null
  return seatInfo.value
})

// 是否显示脱敏
const isMasked = computed(() => props.ticket.privacy === 'masked')

const handleClick = () => {
  emit('click', props.ticket)
}
</script>

<template>
  <!-- ============================================ -->
  <!-- 机票卡片 -->
  <!-- ============================================ -->
  <div 
    v-if="cardStyle === 'flight'" 
    class="ticket-card card-flight" 
    :style="airlineInfo ? { '--airline-color': airlineInfo.color } : {}"
    @click="handleClick"
  >
    <div class="flight-accent">
      <span v-if="airlineInfo" class="airline-code">{{ airlineInfo.shortName }}</span>
    </div>
    <div class="flight-body">
      <div class="flight-header">
        <div class="header-left">
          <span class="flight-number">{{ ticket.tripNumber || ticket.name }}</span>
          <span class="flight-label">FLIGHT</span>
        </div>
        <div v-if="ticket.thumbnail || ticket.photo" class="flight-thumbnail">
          <van-image
            :src="ticket.thumbnail || ticket.photo"
            fit="cover"
            radius="6"
            :class="{ 'is-masked': isMasked }"
          />
        </div>
      </div>
      <div class="flight-route">
        <div class="flight-point departure">
          <span class="code">{{ isMasked ? '***' : (routeInfo.departureCode || routeInfo.departure.slice(0, 3).toUpperCase() || 'DEP') }}</span>
          <span class="city">{{ isMasked ? '***' : routeInfo.departure }}</span>
          <span v-if="routeInfo.departureTime && !isMasked" class="time">{{ routeInfo.departureTime }}</span>
        </div>
        <div class="flight-line">
          <div class="line-track">
            <span class="line-dot"></span>
            <span class="line-dash"></span>
            <span class="plane-icon">✈</span>
            <span class="line-dash"></span>
            <span class="line-dot"></span>
          </div>
          <span v-if="flightDuration && !isMasked" class="flight-duration">{{ flightDuration }}</span>
        </div>
        <div class="flight-point arrival">
          <span class="code">{{ isMasked ? '***' : (routeInfo.arrivalCode || routeInfo.arrival.slice(0, 3).toUpperCase() || 'ARR') }}</span>
          <span class="city">{{ isMasked ? '***' : routeInfo.arrival }}</span>
          <span v-if="routeInfo.arrivalTime && !isMasked" class="time">
            {{ routeInfo.arrivalTime }}<sup v-if="flightTimeInfo.isNextDay" class="next-day">+1</sup>
          </span>
        </div>
      </div>
      <div class="flight-footer">
        <span class="flight-datetime">{{ formattedDate }}</span>
        <span v-if="ticket.price" class="flight-price">¥{{ ticket.price }}</span>
      </div>
      <div v-if="ticket.tags && Array.isArray(ticket.tags) && ticket.tags.length > 0" class="flight-tags">
        <van-tag v-for="tag in ticket.tags.slice(0, 3)" :key="tag" plain color="#3b82f6">
          {{ tag }}
        </van-tag>
      </div>
      <div v-if="ticket.note" class="flight-note">
        <van-icon name="edit" size="12" />
        <span class="note-text">{{ ticket.note.slice(0, 30) }}{{ ticket.note.length > 30 ? '...' : '' }}</span>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- 火车票卡片 -->
  <!-- ============================================ -->
  <div v-else-if="cardStyle === 'train'" class="ticket-card card-train" @click="handleClick">
    <div class="train-accent"></div>
    <div class="train-container">
      <div class="train-header">
        <div class="train-no">
          <van-icon name="logistics" />
          <span>{{ ticket.tripNumber || ticket.name }}</span>
        </div>
        <div class="date-badge">
          <van-icon name="calendar-o" />
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <div class="train-body">
        <div class="station-col from">
          <span class="station">{{ isMasked ? '***' : routeInfo.departure }}</span>
          <span class="time">{{ routeInfo.departureTime || '--:--' }}</span>
        </div>

        <div class="route-visual">
          <span class="duration" v-if="flightDuration">{{ flightDuration }}</span>
          <div class="visual-line">
            <div class="dot"></div>
            <div class="line-dashed"></div>
            <div class="train-icon-wrapper">
              <van-icon name="logistics" />
            </div>
            <div class="line-dashed has-arrow"></div>
            <div class="dot"></div>
          </div>
          <span class="label">{{ trainTypeLabel }}</span>
        </div>

        <div class="station-col to">
          <span class="station">{{ isMasked ? '***' : routeInfo.arrival }}</span>
          <span class="time">
            {{ routeInfo.arrivalTime || '--:--' }}
            <sup v-if="flightTimeInfo.isNextDay" class="next-day">+1</sup>
          </span>
        </div>
      </div>

      <div class="ticket-divider">
        <div class="notch left"></div>
        <div class="dashed-line"></div>
        <div class="notch right"></div>
      </div>

      <div class="train-footer">
        <div class="footer-left">
          <div class="tags" v-if="ticket.tags && ticket.tags.length">
            <span v-for="tag in ticket.tags.slice(0, 2)" :key="tag" class="mini-tag">{{ tag }}</span>
          </div>
          <span v-else-if="ticket.note" class="note-text">{{ ticket.note }}</span>
          <span v-else class="note-text text-placeholder">二等座</span>
        </div>
        <div class="footer-right">
          <span class="currency">¥</span>
          <span class="price" v-if="ticket.price">{{ ticket.price }}</span>
          <span class="price" v-else>--</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- 演出票卡片 -->
  <!-- ============================================ -->
  <div v-else-if="cardStyle === 'show'" class="ticket-card card-show" @click="handleClick">
    <div class="show-header">
      <div class="show-icon">
        <van-icon name="music-o" color="#fff" size="20" />
      </div>
      <span class="show-label">LIVE SHOW</span>
    </div>
    <div class="show-content">
      <h3 class="show-title">{{ ticket.name }}</h3>
      <p v-if="locationText" class="show-venue">{{ isMasked ? '***' : locationText }}</p>
    </div>
    <div class="show-footer">
      <div class="show-info">
        <p v-if="seatInfo" class="show-seat ellipsis">
          <van-icon name="coupon-o" size="12" />
          {{ isMasked ? '***' : seatInfo }}
        </p>
        <p v-else-if="ticket.note" class="show-seat ellipsis">{{ isMasked ? '***' : ticket.note }}</p>
        <p class="show-datetime">{{ formattedDate }}<span v-if="ticket.price"> · ¥{{ ticket.price }}</span></p>
      </div>
      <div class="show-badge">
        <span class="badge-text">PASS</span>
        <van-icon name="qr" size="28" color="rgba(255,255,255,0.8)" />
      </div>
    </div>
    <div v-if="ticket.tags && Array.isArray(ticket.tags) && ticket.tags.length > 0" class="show-tags">
      <van-tag v-for="tag in ticket.tags.slice(0, 2)" :key="tag" color="rgba(255,255,255,0.2)" text-color="#fff">
        {{ tag }}
      </van-tag>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- 电影票卡片 -->
  <!-- ============================================ -->
  <div v-else-if="cardStyle === 'movie'" class="ticket-card card-movie" @click="handleClick">
    <div class="movie-poster">
      <van-image
        v-if="ticket.thumbnail || ticket.photo"
        :src="ticket.thumbnail || ticket.photo"
        fit="cover"
        :class="{ 'is-masked': isMasked }"
      >
        <template #loading>
          <van-loading type="spinner" size="20" color="#fff" />
        </template>
        <template #error>
          <van-icon name="video-o" size="40" color="rgba(255,255,255,0.3)" />
        </template>
      </van-image>
      <div v-else class="poster-placeholder">
        <van-icon name="video-o" size="48" color="rgba(255,255,255,0.4)" />
      </div>
      <div v-if="ticket.tags && ticket.tags.length > 0" class="movie-rating">
        <span>{{ ticket.tags[0] }}</span>
      </div>
    </div>
    
    <div class="movie-perforation">
      <div class="perf-line"></div>
    </div>
    
    <div class="movie-stub">
      <div class="stub-content">
        <!-- 电影名称 + 版本 -->
        <div class="movie-header">
          <h3 class="movie-title">{{ ticket.name }}</h3>
          <span v-if="movieVersionDisplay" class="version-tag">{{ movieVersionDisplay }}</span>
        </div>
        <!-- 影院信息 -->
        <div class="movie-venue" v-if="cinemaInfo || locationText">
          <span>{{ isMasked ? '***' : (cinemaInfo || locationText || '影院') }}</span>
        </div>
        <!-- 座位和厅信息（并排） -->
        <div class="movie-seat-row" v-if="seatInfoDisplay || hallInfoDisplay">
          <div class="seat-item" v-if="hallInfoDisplay">
            <van-icon name="tv-o" size="12" />
            <span>{{ isMasked ? '***' : hallInfoDisplay }}</span>
          </div>
          <div class="seat-item" v-if="seatInfoDisplay">
            <van-icon name="coupon-o" size="12" />
            <span>{{ isMasked ? '***' : seatInfoDisplay }}</span>
          </div>
        </div>
        <!-- 底部：日期场次 + 价格 -->
        <div class="movie-footer">
          <div class="footer-left">
            <div class="datetime-info">
              <span class="date-text">{{ formattedDate }}</span>
              <span class="time-text" v-if="showtimeDisplay">{{ showtimeDisplay }}</span>
            </div>
          </div>
          <div class="footer-right" v-if="ticket.price">
            <span class="movie-price">¥{{ ticket.price }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- 景区卡片 -->
  <!-- ============================================ -->
  <div v-else-if="cardStyle === 'scenic'" class="ticket-card card-scenic" @click="handleClick">
    <div class="scenic-image">
      <van-image
        v-if="ticket.thumbnail || ticket.photo"
        :src="ticket.thumbnail || ticket.photo"
        fit="cover"
        :class="{ 'is-masked': isMasked }"
      />
      <div v-else class="placeholder">
        <van-icon :name="typeConfig.icon" size="48" :color="typeConfig.color" />
      </div>
      <div class="scenic-overlay">
        <div class="scenic-type">
          <van-icon name="eye-o" size="12" />
          <span>景区门票</span>
        </div>
        <div class="scenic-info">
          <h3 class="ticket-name">{{ ticket.name }}</h3>
          <p v-if="locationText" class="location">
            <van-icon name="location-o" size="12" />
            {{ isMasked ? '***' : locationText }}
          </p>
        </div>
      </div>
    </div>
    <div class="scenic-footer">
      <div class="scenic-meta">
        <span class="scenic-date">
          <van-icon name="calendar-o" size="12" />
          {{ formattedDate }}
        </span>
        <span v-if="ticket.price" class="scenic-price">¥{{ ticket.price }}</span>
      </div>
      <div v-if="ticket.note" class="scenic-note">
        <p class="note-text ellipsis-2">"{{ ticket.note }}"</p>
      </div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- 默认横向卡片（展览等） -->
  <!-- ============================================ -->
  <div v-else class="ticket-card card-horizontal" :class="'card-' + ticket.type" @click="handleClick">
    <div class="card-image">
      <van-image
        v-if="ticket.thumbnail || ticket.photo"
        :src="ticket.thumbnail || ticket.photo"
        fit="cover"
        :class="{ 'is-masked': isMasked }"
      >
        <template #loading>
          <van-loading type="spinner" size="20" />
        </template>
        <template #error>
          <van-icon name="photo-fail" size="32" color="#ddd" />
        </template>
      </van-image>
      <div v-else class="placeholder">
        <van-icon :name="typeConfig.icon" size="36" :color="typeConfig.color" />
      </div>
    </div>
    <div class="card-content">
      <div class="card-header">
        <h3 class="ticket-name ellipsis">{{ ticket.name }}</h3>
        <van-icon name="arrow" class="action-icon" color="#ccc" size="16" />
      </div>
      <p v-if="subtitle" class="ticket-subtitle ellipsis">{{ isMasked ? '***' : subtitle }}</p>
      <div class="card-footer">
        <span v-if="formattedDate" class="ticket-date">{{ formattedDate }}</span>
        <div v-if="ticket.tags && Array.isArray(ticket.tags) && ticket.tags.length > 0" class="card-tags">
          <van-tag v-for="tag in ticket.tags.slice(0, 2)" :key="tag" plain color="#999">
            {{ tag }}
          </van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ============================================
// 通用卡片样式
// ============================================
.ticket-card {
  background: var(--bg-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// ============================================
// 机票卡片
// ============================================
.card-flight {
  display: flex;
  min-height: 190px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid rgba(59, 130, 246, 0.1);
  position: relative;
  overflow: visible;
  
  &::before {
    content: 'BOARDING PASS';
    position: absolute;
    right: 16px;
    top: 30px;
    font-size: 32px;
    font-weight: 900;
    color: rgba(59, 130, 246, 0.04);
    pointer-events: none;
    white-space: nowrap;
    transform: rotate(-5deg);
  }
  
  .flight-accent {
    width: 36px;
    background: linear-gradient(180deg, var(--airline-color, #3b82f6) 0%, var(--airline-color, #60a5fa) 100%);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .airline-code {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 10px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 2px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 8px;
      bottom: 8px;
      width: 0;
      border-right: 2px dashed rgba(255, 255, 255, 0.4);
    }
  }
  
  .flight-body {
    flex: 1;
    padding: 14px 16px;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  
  .flight-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
    
    .header-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .flight-number {
      font-size: 14px;
      font-weight: 700;
      color: var(--airline-color, #3b82f6);
    }
    
    .flight-label {
      font-size: 10px;
      color: var(--slate-400);
      letter-spacing: 2px;
      font-weight: 700;
    }
    
    .flight-thumbnail {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      
      :deep(.van-image) {
        width: 100%;
        height: 100%;
        
        &.is-masked {
          filter: blur(4px);
        }
      }
    }
  }
  
  .flight-route {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    
    .flight-point {
      text-align: center;
      min-width: 60px;
      
      &.departure { text-align: left; }
      &.arrival { text-align: right; }
      
      .code {
        display: block;
        font-size: 22px;
        font-weight: 800;
        color: var(--slate-900);
        letter-spacing: 1px;
        margin-bottom: 2px;
      }
      
      .city {
        display: block;
        font-size: 11px;
        color: var(--slate-400);
      }
      
      .time {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: var(--slate-600);
        margin-top: 6px;
        
        .next-day {
          font-size: 9px;
          color: var(--amber-500);
          font-weight: 700;
          margin-left: 2px;
          vertical-align: super;
        }
      }
    }
    
    .flight-line {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px 0;
      min-width: 70px;
      
      .line-track {
        display: flex;
        align-items: center;
        width: 100%;
        
        .line-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--blue-500);
          flex-shrink: 0;
        }
        
        .line-dash {
          flex: 1;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            var(--blue-500) 0px,
            var(--blue-500) 4px,
            transparent 4px,
            transparent 8px
          );
          min-width: 16px;
        }
        
        .plane-icon {
          font-size: 14px;
          color: var(--blue-500);
          margin: 0 2px;
          flex-shrink: 0;
        }
      }
      
      .flight-duration {
        font-size: 10px;
        color: var(--slate-400);
        margin-top: 6px;
        letter-spacing: 0.5px;
        font-weight: 500;
      }
    }
  }
  
  .flight-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px dashed var(--slate-200);
    
    .flight-datetime {
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-500);
      letter-spacing: 0.5px;
    }
    
    .flight-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--blue-500);
    }
  }
  
  .flight-tags {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  
  .flight-note {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 10px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: var(--radius-sm);
    
    .van-icon {
      color: var(--slate-400);
      flex-shrink: 0;
      margin-top: 1px;
    }
    
    .note-text {
      font-size: 11px;
      color: var(--slate-500);
      line-height: 1.4;
      word-break: break-all;
    }
  }
}

// ============================================
// 火车票卡片
// ============================================
.card-train {
  min-height: 190px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.1);

  &::before {
    content: 'TRAIN TICKET';
    position: absolute;
    right: 16px;
    top: 30px;
    font-size: 32px;
    font-weight: 900;
    color: rgba(20, 184, 166, 0.04);
    pointer-events: none;
    white-space: nowrap;
    transform: rotate(-5deg);
  }

  .train-accent {
    height: 5px;
    background: linear-gradient(90deg, var(--teal-500) 0%, #2dd4bf 100%);
  }

  .train-container {
    display: flex;
    flex-direction: column;
  }

  .train-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px 0;

    .date-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-500);
    }

    .train-no {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 700;
      color: var(--teal-500);
    }
  }

  .train-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px 18px;
    
    .station-col {
      display: flex;
      flex-direction: column;
      flex: 1;

      &.from {
        align-items: flex-start;
        text-align: left;
      }

      &.to {
        align-items: flex-end;
        text-align: right;
      }

      .station {
        font-size: 20px;
        font-weight: 800;
        color: var(--slate-900);
        line-height: 1.2;
        margin-bottom: 4px;
      }

      .time {
        font-size: 14px;
        font-weight: 600;
        color: var(--slate-500);
        
        .next-day {
          font-size: 10px;
          color: var(--amber-500);
          vertical-align: top;
          margin-left: 2px;
        }
      }
    }

    .route-visual {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 70px;
      padding: 0 6px;

      .duration {
        font-size: 10px;
        color: var(--slate-400);
        margin-bottom: 4px;
        font-weight: 500;
      }

      .visual-line {
        display: flex;
        align-items: center;
        width: 100%;
        color: var(--slate-300);

        .dot {
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
        }

        .line-dashed {
          flex: 1;
          height: 1px;
          background: repeating-linear-gradient(
            90deg,
            var(--slate-300) 0px,
            var(--slate-300) 3px,
            transparent 3px,
            transparent 6px
          );
        }

        .train-icon-wrapper {
          padding: 0 4px;
          color: var(--teal-500);
          
          .van-icon {
            display: block;
            font-size: 14px;
          }
        }
      }

      .label {
        font-size: 9px;
        color: var(--slate-400);
        margin-top: 4px;
        font-weight: 500;
      }
    }
  }

  .ticket-divider {
    position: relative;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 10px;

    .dashed-line {
      width: 100%;
      border-top: 1px dashed var(--slate-200);
    }

    .notch {
      position: absolute;
      width: 14px;
      height: 14px;
      background: var(--bg-page);
      border-radius: 50%;
      top: 50%;
      transform: translateY(-50%);
      
      &.left { left: -17px; }
      &.right { right: -17px; }
    }
  }

  .train-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px 16px;

    .footer-left {
      flex: 1;
      display: flex;
      align-items: center;
      
      .mini-tag {
        display: inline-block;
        font-size: 9px;
        color: var(--teal-500);
        background: rgba(20, 184, 166, 0.15);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        margin-right: 6px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .note-text {
        font-size: 12px;
        font-weight: 600;
        color: var(--slate-600);
        
        &.text-placeholder {
          color: var(--slate-400);
          font-weight: 500;
        }
      }
    }

    .footer-right {
      display: flex;
      align-items: baseline;
      color: var(--teal-500);

      .currency {
        font-size: 12px;
        font-weight: 600;
        margin-right: 2px;
      }

      .price {
        font-size: 18px;
        font-weight: 700;
      }
    }
  }
}

// ============================================
// 演出票卡片
// ============================================
.card-show {
  padding: 18px 20px;
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  
  .show-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    position: relative;
    z-index: 1;
    
    .show-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }
    
    .show-label {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 2px;
      font-weight: 700;
    }
  }
  
  .show-content {
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    
    .show-title {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    
    .show-venue {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
    }
  }
  
  .show-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    position: relative;
    z-index: 1;
    
    .show-info {
      flex: 1;
      
      .show-seat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 6px;
        max-width: 180px;
        
        .van-icon {
          flex-shrink: 0;
        }
      }
      
      .show-datetime {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
        font-weight: 500;
      }
    }
    
    .show-badge {
      text-align: center;
      
      .badge-text {
        display: block;
        font-size: 9px;
        color: rgba(255, 255, 255, 0.5);
        letter-spacing: 1px;
        margin-bottom: 4px;
        font-weight: 600;
      }
    }
  }
  
  .show-tags {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    position: relative;
    z-index: 1;
  }
}

// ============================================
// 电影票卡片
// ============================================
.card-movie {
  display: flex;
  min-height: 160px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  position: relative;
  overflow: visible;
  border: 1px solid rgba(245, 158, 11, 0.1);
  
  .movie-poster {
    width: 110px;
    flex-shrink: 0;
    position: relative;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: var(--radius-2xl) 0 0 var(--radius-2xl);
    overflow: hidden;
    
    :deep(.van-image) {
      width: 100%;
      height: 100%;
      
      &.is-masked {
        filter: blur(8px);
      }
    }
    
    .poster-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    .movie-rating {
      position: absolute;
      top: 8px;
      left: 8px;
      background: linear-gradient(135deg, var(--amber-500) 0%, #d97706 100%);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
  
  .movie-perforation {
    width: 14px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 14px;
      height: 14px;
      background: var(--bg-page);
      border-radius: 50%;
      z-index: 2;
    }
    
    &::before { top: -7px; }
    &::after { bottom: -7px; }
    
    .perf-line {
      width: 0;
      height: calc(100% - 28px);
      border-left: 2px dashed var(--slate-200);
    }
  }
  
  .movie-stub {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 14px 16px;
    min-width: 0;
    position: relative;
    
    .stub-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .movie-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      
      .movie-title {
        flex: 1;
        font-size: 15px;
        font-weight: 700;
        color: var(--slate-900);
        margin: 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .version-tag {
        flex-shrink: 0;
        font-size: 10px;
        font-weight: 600;
        color: #fff;
        background: linear-gradient(135deg, var(--amber-500) 0%, #d97706 100%);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        white-space: nowrap;
      }
    }
    
    .movie-venue {
      font-size: 13px;
      font-weight: 600;
      color: var(--slate-400);
      margin-top: 6px;
      margin-bottom: 16px;
      
      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }
    }
    
    .movie-seat-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
      
      .seat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--slate-600);
        background: rgba(245, 158, 11, 0.1);
        padding: 3px 8px;
        border-radius: var(--radius-sm);
        
        .van-icon {
          color: var(--amber-500);
          flex-shrink: 0;
        }
        
        span {
          font-weight: 500;
        }
      }
    }
    
    .movie-footer {
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px dashed var(--slate-200);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      
      .footer-left {
        flex: 1;
        min-width: 0;
        
        .datetime-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          
          .date-text,
          .time-text {
            font-size: 12px;
            font-weight: 500;
            color: var(--slate-500);
          }
        }
      }
      
      .footer-right {
        flex-shrink: 0;
        
        .movie-price {
          font-size: 16px;
          font-weight: 700;
          color: var(--rose-500);
        }
      }
    }
  }
}

// ============================================
// 景区卡片
// ============================================
.card-scenic {
  .scenic-image {
    position: relative;
    width: 100%;
    height: 180px;
    background: var(--bg-gray);
    
    :deep(.van-image) {
      width: 100%;
      height: 100%;
      
      &.is-masked {
        filter: blur(10px);
      }
    }
    
    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    }
    
    .scenic-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(transparent 40%, rgba(0,0,0,0.6) 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px 14px;
    }
    
    .scenic-type {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      padding: 6px 10px;
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 700;
      color: var(--slate-900);
      align-self: flex-start;
      box-shadow: var(--shadow-sm);
      
      .van-icon {
        color: var(--primary-color);
      }
    }
    
    .scenic-info {
      .ticket-name {
        font-size: 17px;
        font-weight: 700;
        color: #fff;
        margin: 0 0 4px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      
      .location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
        margin: 0;
      }
    }
  }
  
  .scenic-footer {
    padding: 14px 16px;
    
    .scenic-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .scenic-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--slate-500);
    }
    
    .scenic-price {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-color);
    }
    
    .scenic-note {
      .note-text {
        font-size: 13px;
        color: var(--slate-500);
        line-height: 1.5;
        font-style: italic;
        margin: 0;
      }
    }
  }
}

// ============================================
// 横向卡片（展览等）
// ============================================
.card-horizontal {
  display: flex;

  .card-image {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    background: var(--bg-gray);
    
    :deep(.van-image) {
      width: 100%;
      height: 100%;
      
      &.is-masked {
        filter: blur(8px);
      }
    }
    
    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--slate-50) 0%, var(--slate-100) 100%);
    }
  }
  
  .card-content {
    flex: 1;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }
  
  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    
    .ticket-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--slate-900);
      margin: 0;
      line-height: 1.3;
      flex: 1;
    }
    
    .action-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
  
  .ticket-subtitle {
    font-size: 12px;
    color: var(--slate-500);
    margin: 6px 0 0;
    line-height: 1.4;
  }
  
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 8px;
    
    .ticket-date {
      font-size: 13px;
      font-weight: 600;
      color: var(--blue-500);
    }
    
    .card-tags {
      display: flex;
      gap: 6px;
    }
  }
}
</style>
