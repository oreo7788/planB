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

// 短日期格式
const shortDate = computed(() => {
  if (!props.ticket.date) return ''
  const date = new Date(props.ticket.date)
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`
})

// 年份
const year = computed(() => {
  if (!props.ticket.date) return ''
  return new Date(props.ticket.date).getFullYear()
})

// 影院信息
const cinemaInfo = computed(() => {
  const loc = props.ticket.location
  return loc?.address || loc?.city || ''
})

// 座位信息
const seatInfo = computed(() => {
  if (props.ticket.seat) return props.ticket.seat
  
  // 兼容旧数据：从 note 中解析座位信息
  const note = props.ticket.note || ''
  const seatPattern = /(\d+)\s*[排行]\s*(\d+)\s*[座号]?/
  const match = note.match(seatPattern)
  if (match) return `${match[1]}排${match[2]}座`
  
  const simplePattern = /(\d+)\s*[-]\s*(\d+)/
  const simpleMatch = note.match(simplePattern)
  if (simpleMatch) return `${simpleMatch[1]}排${simpleMatch[2]}座`
  
  return ''
})

// 影厅信息
const hallInfo = computed(() => {
  if (props.ticket.hall) return props.ticket.hall
  
  const seatText = props.ticket.seat || ''
  const noteText = props.ticket.note || ''
  const textToSearch = seatText || noteText
  
  const hallPattern = /(\d+号厅|[A-Z]+厅|\d+厅)/i
  const match = textToSearch.match(hallPattern)
  return match ? match[0] : ''
})

// 电影版本
const movieVersion = computed(() => {
  if (props.ticket.version) return props.ticket.version
  
  const tags = props.ticket.tags || []
  const versionTags = ['IMAX', 'IMAX 3D', '3D', '2D', '原版', '国语', '粤语', '杜比全景声', '杜比视界', '巨幕', '激光', 'CGS', '4DX', 'CINITY', 'ScreenX']
  for (const tag of tags) {
    for (const v of versionTags) {
      if (tag.toUpperCase().includes(v.toUpperCase())) {
        return tag
      }
    }
  }
  return ''
})

// 场次时间
const showtime = computed(() => {
  if (props.ticket.showtime) return props.ticket.showtime
  
  const note = props.ticket.note || ''
  const timePattern = /\d{1,2}:\d{2}/
  const match = note.match(timePattern)
  return match ? match[0] : ''
})

// 是否脱敏
const isMasked = computed(() => props.ticket.privacy === 'masked')

// 非版本类的标签（过滤掉版本标签）
const displayTags = computed(() => {
  const tags = props.ticket.tags || []
  const versionTags = ['IMAX', '3D', '2D', '原版', '国语', '粤语', '杜比', '巨幕', '激光', 'CGS', '4DX', 'CINITY', 'ScreenX']
  return tags.filter(tag => {
    return !versionTags.some(v => tag.toUpperCase().includes(v.toUpperCase()))
  })
})

// 处理图片预览
const handlePreviewImage = () => {
  if (props.ticket.photo) {
    emit('previewImage')
  }
}
</script>

<template>
  <div class="movie-detail">
    <!-- 电影票主体 -->
    <div class="ticket-card">
      <!-- 顶部装饰条 -->
      <div class="ticket-header">
        <span class="header-text">ADMIT ONE</span>
        <div class="header-dots">
          <span v-for="i in 5" :key="i" class="dot"></span>
        </div>
        <span class="header-text">电影票</span>
      </div>

      <!-- 海报和信息区域 -->
      <div class="ticket-main">
        <!-- 海报 -->
        <div class="poster-wrapper" @click="handlePreviewImage">
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
          <div v-else class="poster-placeholder">
            <van-icon name="video-o" size="40" color="rgba(255,255,255,0.4)" />
          </div>
          
          <!-- 版本标签 -->
          <div v-if="movieVersion" class="version-tag">{{ movieVersion }}</div>
        </div>

        <!-- 电影信息 -->
        <div class="movie-info">
          <h1 class="movie-title">{{ ticket.name }}</h1>
          
          <div class="info-row" v-if="cinemaInfo">
            <van-icon name="shop-o" size="13" />
            <span>{{ isMasked ? '***' : cinemaInfo }}</span>
          </div>
          
          <div class="info-row" v-if="hallInfo || seatInfo">
            <van-icon name="tv-o" size="13" />
            <span>
              <template v-if="hallInfo">{{ isMasked ? '***' : hallInfo }}</template>
              <template v-if="hallInfo && seatInfo"> · </template>
              <template v-if="seatInfo">{{ isMasked ? '***' : seatInfo }}</template>
            </span>
          </div>
        </div>
      </div>

      <!-- 撕裂线 -->
      <div class="tear-line">
        <div class="notch left"></div>
        <div class="dashed"></div>
        <div class="notch right"></div>
      </div>

      <!-- 票据信息区域 -->
      <div class="ticket-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">日期</span>
            <span class="value highlight">{{ shortDate || '--' }}</span>
            <span class="sub">{{ year }}</span>
          </div>
          <div class="info-item">
            <span class="label">场次</span>
            <span class="value highlight">{{ showtime || '--:--' }}</span>
          </div>
          <div class="info-item" v-if="ticket.price">
            <span class="label">票价</span>
            <span class="value price">¥{{ ticket.price }}</span>
          </div>
        </div>
      </div>

      <!-- 条形码 -->
      <div class="barcode-area">
        <div class="barcode">
          <div v-for="i in 40" :key="i" class="bar" :style="{ width: Math.random() > 0.5 ? '2px' : '1px' }"></div>
        </div>
        <span class="barcode-text">{{ ticket.id?.slice(-10) || '0000000000' }}</span>
      </div>
    </div>

    <!-- 扩展信息 -->
    <div class="extended-section" v-if="formattedDate || displayTags.length > 0 || ticket.note">
      <!-- 完整日期 -->
      <div class="date-full" v-if="formattedDate">
        <van-icon name="calendar-o" size="14" />
        <span>{{ formattedDate }}</span>
      </div>

      <!-- 标签 -->
      <div class="tags-area" v-if="displayTags.length > 0">
        <div class="area-header">
          <van-icon name="label-o" size="14" />
          <span>标签</span>
        </div>
        <div class="tags-list">
          <span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- 观影感受 -->
      <div class="note-area" v-if="ticket.note">
        <div class="area-header">
          <van-icon name="edit" size="14" />
          <span>观影感受</span>
        </div>
        <div class="note-box">
          <p>"{{ ticket.note }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.movie-detail {
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

// 电影票卡片
.ticket-card {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

// 顶部装饰条
.ticket-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, #f43f5e 100%);
  
  .header-text {
    font-size: 10px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 2px;
  }
  
  .header-dots {
    display: flex;
    gap: 8px;
    
    .dot {
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
    }
  }
}

// 主内容区域
.ticket-main {
  display: flex;
  gap: 16px;
  padding: 20px;
}

// 海报
.poster-wrapper {
  width: 120px;
  height: 170px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
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
      filter: blur(15px);
      transform: scale(1.1);
    }
  }
  
  .poster-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .version-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
  }
}

// 电影信息
.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  
  .movie-title {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 12px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 6px;
    
    .van-icon {
      flex-shrink: 0;
      color: rgba(255, 255, 255, 0.4);
    }
    
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 撕裂线
.tear-line {
  display: flex;
  align-items: center;
  margin: 0;
  
  .notch {
    width: 20px;
    height: 20px;
    background: var(--bg-page, #f1f5f9);
    border-radius: 50%;
    flex-shrink: 0;
    
    &.left { margin-left: -10px; }
    &.right { margin-right: -10px; }
  }
  
  .dashed {
    flex: 1;
    border-top: 2px dashed rgba(255, 255, 255, 0.1);
  }
}

// 票据信息
.ticket-info {
  padding: 20px;
}

.info-grid {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .label {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 1px;
  }
  
  .value {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    
    &.highlight {
      color: #fb7185;
      font-size: 24px;
    }
    
    &.price {
      color: #fbbf24;
    }
  }
  
  .sub {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
  }
}

// 条形码
.barcode-area {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.barcode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  height: 36px;
  padding: 6px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  
  .bar {
    height: 100%;
    background: #1a1a2e;
    
    &:nth-child(4n) {
      background: #f43f5e;
    }
  }
}

.barcode-text {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

// 扩展信息区域
.extended-section {
  margin-top: 16px;
  padding: 20px;
  background: var(--bg-card, #fff);
  border-radius: 20px;
  box-shadow: var(--shadow-card, 0 4px 6px -1px rgb(0 0 0 / 0.05));
}

.date-full {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--slate-50, #f8fafc);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--slate-600, #475569);
  
  .van-icon {
    color: #f43f5e;
  }
}

.area-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--slate-400, #94a3b8);
  
  .van-icon {
    color: #f43f5e;
  }
}

.tags-area {
  margin-bottom: 16px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag {
    padding: 6px 14px;
    background: linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%);
    border: 1px solid rgba(244, 63, 94, 0.1);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #f43f5e;
  }
}

.note-area {
  .note-box {
    background: var(--slate-50, #f8fafc);
    border-radius: 14px;
    padding: 14px 16px;
    
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
</style>
