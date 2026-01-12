<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, showSuccessToast, closeToast } from 'vant'
import { useTicketStore } from '@/stores/ticket'
import ImageUploader from '@/components/ImageUploader.vue'
import LocationPicker from '@/components/LocationPicker.vue'
import { TICKET_TYPE_CONFIG, PRIVACY_CONFIG } from '@/types'
import type { TicketType, PrivacyLevel, Location } from '@/types'
import type { CreateTicketParams } from '@/api/ticket'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

// 是否编辑模式
const isEdit = computed(() => !!route.params.id)
const ticketId = computed(() => route.params.id as string)

// 表单数据
const form = ref<CreateTicketParams>({
  name: '',
  type: 'movie' as TicketType,
  tripNumber: undefined,
  seat: undefined,
  hall: undefined,
  version: undefined,
  showtime: undefined,
  tags: [],
  price: undefined,
  photo: undefined,
  date: undefined,
  location: undefined,
  note: undefined,
  privacy: 'public' as PrivacyLevel
})

// 标签输入
const tagsInput = ref('')

// 类型选项
const typeOptions = [
  { value: 'movie', label: '电影', icon: 'video-o' },
  { value: 'show', label: '演出', icon: 'music-o' },
  { value: 'exhibition', label: '展览', icon: 'photo-o' },
  { value: 'scenic', label: '景区', icon: 'flower-o' },
  { value: 'flight', label: '机票', icon: 'logistics' }, // 暂替
  { value: 'train', label: '高铁', icon: 'logistics' }, // 暂替
  { value: 'other', label: '其他', icon: 'coupon-o' }
]

// 隐私选项
const privacyOptions = [
  { value: 'public', label: '🌍 公开' },
  { value: 'masked', label: '👁‍🗨 脱敏' },
  { value: 'private', label: '🔒 私密' }
]

// 默认标签选项（根据票据类型分组）
const defaultTags: Record<string, string[]> = {
  movie: ['约会', '首映', '二刷', '独自观影', '家庭', '朋友'],
  show: ['演唱会', '音乐节', '话剧', '舞台剧', '脱口秀', '相声'],
  exhibition: ['艺术展', '摄影展', '科技展', '历史展', '亲子'],
  scenic: ['旅行', '打卡', '周末游', '亲子游', '自驾游', '度假'],
  flight: ['出差', '旅行', '回家', '度假', '出国'],
  train: ['出差', '旅行', '回家', '通勤', '周末'],
  other: ['纪念', '收藏', '特别', '生日', '节日']
}

// 当前类型的推荐标签
const recommendedTags = computed(() => {
  return defaultTags[form.value.type] || defaultTags.other
})

// 已选中的标签列表
const selectedTags = computed(() => {
  if (!tagsInput.value.trim()) return []
  return tagsInput.value.split(/[,，\s]+/).filter(Boolean)
})

// 切换标签选择
const toggleTag = (tag: string) => {
  const tags = selectedTags.value
  const index = tags.indexOf(tag)
  
  if (index > -1) {
    // 移除标签
    tags.splice(index, 1)
  } else {
    // 添加标签
    tags.push(tag)
  }
  
  tagsInput.value = tags.join(', ')
}

// 检查标签是否已选中
const isTagSelected = (tag: string) => {
  return selectedTags.value.includes(tag)
}

// 弹窗控制
const showDatePicker = ref(false)

// 当前类型配置
const currentTypeConfig = computed(() => TICKET_TYPE_CONFIG[form.value.type])

// 地点类型
const locationType = computed(() => {
  return ['train', 'flight'].includes(form.value.type) ? 'route' : 'single'
})

// 是否为交通票
const isTransportTicket = computed(() => {
  return ['train', 'flight'].includes(form.value.type)
})

// 是否为需要座位信息的票（电影票/演出票）
const needsSeatInfo = computed(() => {
  return ['movie', 'show'].includes(form.value.type)
})

// 是否为电影票
const isMovieTicket = computed(() => {
  return form.value.type === 'movie'
})

// 是否为火车票
const isTrainTicket = computed(() => {
  return form.value.type === 'train'
})

// 票据名称占位符提示（根据类型区分）
const namePlaceholder = computed(() => {
  const placeholders: Record<string, string> = {
    movie: '例如：星际穿越 重映版',
    show: '例如：周杰伦演唱会',
    exhibition: '例如：梵高沉浸式艺术展',
    scenic: '例如：故宫博物院',
    other: '例如：上海迪士尼乐园'
  }
  return placeholders[form.value.type] || placeholders.other
})

// 火车票席别选项
const seatClassOptions = [
  { value: '', label: '请选择席别' },
  { value: '商务座', label: '商务座' },
  { value: '特等座', label: '特等座' },
  { value: '一等座', label: '一等座' },
  { value: '二等座', label: '二等座' },
  { value: '软卧', label: '软卧' },
  { value: '硬卧', label: '硬卧' },
  { value: '软座', label: '软座' },
  { value: '硬座', label: '硬座' },
  { value: '无座', label: '无座' }
]

// 火车票本地表单数据
const trainSeatInfo = ref({
  carriage: '',  // 车厢号
  seatNo: '',    // 座位号
  seatClass: ''  // 席别
})

// 日期显示
const dateDisplay = computed(() => {
  if (!form.value.date) return ''
  return form.value.date.split('T')[0]
})

onMounted(async () => {
  // 设置默认日期为今天
  if (!form.value.date) {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    form.value.date = `${y}-${m}-${d}T00:00:00Z`
  }

  if (isEdit.value) {
    try {
      const ticket = await ticketStore.loadTicketDetail(ticketId.value)
      form.value = {
        name: ticket.name,
        type: ticket.type,
        tripNumber: ticket.tripNumber,
        seat: ticket.seat,
        hall: ticket.hall,
        version: ticket.version,
        showtime: ticket.showtime,
        tags: Array.isArray(ticket.tags) ? ticket.tags : [],
        price: ticket.price,
        photo: ticket.photo,
        date: ticket.date,
        location: ticket.location || undefined,
        note: ticket.note,
        privacy: ticket.privacy
      }
      tagsInput.value = form.value.tags?.join(', ') || ''
      
      // 火车票：解析座位信息
      if (ticket.type === 'train') {
        // 解析车厢号
        if (ticket.hall) {
          const carriageMatch = ticket.hall.match(/(\d+)/)
          if (carriageMatch) {
            trainSeatInfo.value.carriage = carriageMatch[1]
          }
        }
        // 解析座位号和席别
        if (ticket.seat) {
          const seatTypes = ['商务座', '特等座', '一等座', '二等座', '软卧', '硬卧', '软座', '硬座', '无座']
          for (const type of seatTypes) {
            if (ticket.seat.includes(type)) {
              trainSeatInfo.value.seatClass = type
              trainSeatInfo.value.seatNo = ticket.seat.replace(type, '').trim()
              break
            }
          }
          if (!trainSeatInfo.value.seatClass) {
            trainSeatInfo.value.seatNo = ticket.seat
          }
        }
      }
    } catch (error) {
      showToast('加载失败')
      router.back()
    }
  }
})

// 选择类型
const selectType = (type: string) => {
  const newType = type as TicketType
  
  // 如果类型没变，不做任何处理
  if (form.value.type === newType) return
  
  // 新增模式下切换类型时清空数据
  if (!isEdit.value) {
    // 保留日期和隐私状态
    const currentDate = form.value.date
    const currentPrivacy = form.value.privacy
    
    // 重置表单
    form.value = {
      name: '',
      type: newType,
      tripNumber: undefined,
      seat: undefined,
      hall: undefined,
      version: undefined,
      showtime: undefined,
      tags: [],
      price: undefined,
      photo: undefined,
      date: currentDate,
      location: undefined,
      note: undefined,
      privacy: currentPrivacy
    }
    
    // 清空标签输入
    tagsInput.value = ''
    
    // 清空火车票座位信息
    trainSeatInfo.value = {
      carriage: '',
      seatNo: '',
      seatClass: ''
    }
    
    // 交通票自动设置名称
    if (['train', 'flight'].includes(newType)) {
      form.value.name = TICKET_TYPE_CONFIG[newType].label
    }
  } else {
    // 编辑模式只更新类型
    form.value.type = newType
    if (['train', 'flight'].includes(newType)) {
      form.value.name = TICKET_TYPE_CONFIG[newType].label
    } else if (['高铁', '机票'].includes(form.value.name)) {
      form.value.name = ''
    }
  }
}

// 选择日期
const onDateConfirm = ({ selectedValues }: any) => {
  const [year, month, day] = selectedValues
  form.value.date = `${year}-${month}-${day}T00:00:00Z`
  showDatePicker.value = false
}

// 图片上传成功
const onUploadSuccess = (result: { url: string; thumbnailUrl: string }) => {
  form.value.photo = result.url
}

// 提交表单
const onSubmit = async () => {
  console.log('[Add] onSubmit 被调用')
  console.log('[Add] 当前表单数据:', form.value)
  
  if (isTransportTicket.value && !form.value.name.trim()) {
    form.value.name = currentTypeConfig.value.label
  }
  
  if (!form.value.name.trim()) {
    console.log('[Add] 验证失败: 票据名称为空')
    showToast('请输入票据名称')
    return
  }
  
  console.log('[Add] 表单验证通过，准备提交')

  // 处理标签
  if (tagsInput.value.trim()) {
    form.value.tags = tagsInput.value.split(/[,，\s]+/).filter(Boolean)
  } else {
    form.value.tags = []
  }

  // 处理火车票的座位信息
  if (isTrainTicket.value) {
    // 车厢号存到 hall
    if (trainSeatInfo.value.carriage) {
      form.value.hall = trainSeatInfo.value.carriage + '车厢'
    }
    // 座位号和席别组合存到 seat
    const seatParts: string[] = []
    if (trainSeatInfo.value.seatNo) {
      seatParts.push(trainSeatInfo.value.seatNo)
    }
    if (trainSeatInfo.value.seatClass) {
      seatParts.push(trainSeatInfo.value.seatClass)
    }
    if (seatParts.length > 0) {
      form.value.seat = seatParts.join(' ')
    }
  }

  showLoadingToast({ message: '保存中...', forbidClick: true })

  try {
    console.log('[Add] 提交表单数据:', form.value)
    if (isEdit.value) {
      await ticketStore.editTicket(ticketId.value, form.value)
    } else {
      await ticketStore.addTicket(form.value)
    }
    closeToast()
    showSuccessToast('保存成功')
    router.back()
  } catch (error) {
    closeToast()
    console.error('[Add] 保存失败:', error)
    const errorMessage = error instanceof Error ? error.message : '保存失败'
    showToast(errorMessage)
  }
}

const onBack = () => {
  router.back()
}
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="glass-nav">
      <div class="nav-left">
        <div class="close-btn" @click="onBack">
          <van-icon name="cross" />
        </div>
        <h1 class="page-title">{{ isEdit ? '编辑票迹' : '记录新票迹' }}</h1>
      </div>
      <button class="save-btn" @click="onSubmit" type="button">
        完成保存
      </button>
    </header>

    <main class="main-content">
      <!-- Upload Section -->
      <div class="mb-8">
        <div class="relative group">
          <ImageUploader
            v-model="form.photo"
            @upload-success="onUploadSuccess"
          />
        </div>
      </div>

      <!-- Type Selector -->
      <div class="mb-8">
        <div class="flex justify-between items-end mb-4 px-2">
          <span class="section-label mb-0">票据类型</span>
          <span class="badge-required">必选</span>
        </div>
        <div class="type-scroll-container no-scrollbar">
          <div 
            v-for="item in typeOptions" 
            :key="item.value"
            class="type-item"
            :class="{ active: form.type === item.value }"
            @click="selectType(item.value)"
          >
            <van-icon :name="item.icon" class="type-icon" />
            <span class="type-text">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Form Cards -->
      <div class="space-y-6">
        <!-- Card 1: Basic Info -->
        <div class="form-card">
          <!-- Name (Non-transport) -->
          <div v-if="!isTransportTicket" class="input-group">
            <label class="input-label">票据名称</label>
            <input 
              v-model="form.name" 
              type="text" 
              class="custom-input" 
              :placeholder="namePlaceholder"
            >
          </div>

          <!-- Transport Info -->
          <div v-if="isTransportTicket" class="grid grid-cols-2 gap-4">
            <div class="input-group">
              <label class="input-label">{{ form.type === 'flight' ? '航班号' : '车次' }}</label>
              <input 
                v-model="form.tripNumber" 
                type="text" 
                class="custom-input" 
                :placeholder="form.type === 'flight' ? 'CA1234' : 'G1234'"
              >
            </div>
            <div class="input-group">
              <label class="input-label">价格 (¥)</label>
              <input 
                v-model.number="form.price" 
                type="number" 
                class="custom-input" 
                placeholder="0.00"
              >
            </div>
          </div>

          <!-- General Fields (Date + Price/Duration) -->
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="input-group">
              <label class="input-label">活动日期</label>
              <div class="relative" @click="showDatePicker = true">
                <input 
                  :value="dateDisplay" 
                  type="text" 
                  class="custom-input" 
                  readonly
                >
                <van-icon name="calendar-o" class="input-icon-right" />
              </div>
            </div>
            <div v-if="!isTransportTicket" class="input-group">
              <label class="input-label">票价 (¥)</label>
              <input 
                v-model.number="form.price" 
                type="number" 
                class="custom-input" 
                placeholder="0.00"
              >
            </div>
          </div>

          <!-- Movie Specific Fields -->
          <div v-if="isMovieTicket" class="mt-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="input-group">
                <label class="input-label">电影版本</label>
                <input 
                  v-model="form.version" 
                  type="text" 
                  class="custom-input" 
                  placeholder="如：IMAX 3D"
                >
              </div>
              <div class="input-group">
                <label class="input-label">场次时间</label>
                <input 
                  v-model="form.showtime" 
                  type="text" 
                  class="custom-input" 
                  placeholder="如：14:30"
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="input-group">
                <label class="input-label">影厅</label>
                <input 
                  v-model="form.hall" 
                  type="text" 
                  class="custom-input" 
                  placeholder="如：3号厅"
                >
              </div>
              <div class="input-group">
                <label class="input-label">座位</label>
                <input 
                  v-model="form.seat" 
                  type="text" 
                  class="custom-input" 
                  placeholder="如：5排8座"
                >
              </div>
            </div>
          </div>

          <!-- Seat Info (Show only) -->
          <div v-else-if="needsSeatInfo" class="mt-4">
            <div class="input-group">
              <label class="input-label">座位信息</label>
              <input 
                v-model="form.seat" 
                type="text" 
                class="custom-input" 
                placeholder="例如：A区 10排15座"
              >
            </div>
          </div>

          <!-- Train Specific Fields -->
          <div v-if="isTrainTicket" class="mt-4">
            <div class="grid grid-cols-3 gap-3">
              <div class="input-group">
                <label class="input-label">车厢</label>
                <input 
                  v-model="trainSeatInfo.carriage" 
                  type="text" 
                  class="custom-input" 
                  placeholder="05"
                >
              </div>
              <div class="input-group">
                <label class="input-label">座位</label>
                <input 
                  v-model="trainSeatInfo.seatNo" 
                  type="text" 
                  class="custom-input" 
                  placeholder="08F"
                >
              </div>
              <div class="input-group">
                <label class="input-label">席别</label>
                <div class="relative">
                  <select v-model="trainSeatInfo.seatClass" class="custom-input appearance-none bg-slate-50 pr-8">
                    <option v-for="opt in seatClassOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <van-icon name="arrow-down" class="input-icon-right" />
                </div>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="mt-4">
             <!-- LocationPicker component handles its own layout, but we need to ensure it matches styles -->
             <LocationPicker
               v-model="form.location"
               :type="locationType"
               :ticket-type="form.type"
             />
          </div>
        </div>

        <!-- Card 2: Feelings -->
        <div class="form-card">
          <div class="input-group">
            <label class="input-label">此时此刻的心情</label>
            <textarea 
              v-model="form.note" 
              class="custom-input min-h-[120px] resize-none" 
              placeholder="这一刻，有什么想留下的文字吗？"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Card 3: Settings -->
        <div class="form-card">
          <!-- 隐私状态 -->
          <div class="input-group mb-4">
            <label class="input-label">隐私状态</label>
            <div class="relative" style="max-width: 200px;">
              <select v-model="form.privacy" class="custom-input appearance-none bg-slate-50 pr-10">
                <option v-for="opt in privacyOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <van-icon name="arrow-down" class="input-icon-right" />
            </div>
          </div>

          <!-- 添加标签 -->
          <div class="input-group">
            <label class="input-label">添加标签</label>
            <input 
              v-model="tagsInput" 
              type="text" 
              class="custom-input" 
              placeholder="输入自定义标签，用逗号分隔"
            >
            <!-- 推荐标签 -->
            <div class="tag-suggestions">
              <span 
                v-for="tag in recommendedTags" 
                :key="tag"
                class="tag-chip"
                :class="{ active: isTagSelected(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="h-12"></div>
    </main>

    <!-- Date Picker -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
/* Fonts & Reset handled by global or Vant, we focus on layout */

.app-container {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.glass-nav {
    position: sticky;
    top: 0;
    z-index: 30;
    background: rgba(248, 250, 252, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
}

.nav-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.close-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    color: #475569;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.2s;
    
    &:active {
        transform: scale(0.95);
    }
}

.page-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
}

.save-btn {
    padding: 10px 24px;
    background: #10b981;
    color: white;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
    cursor: pointer;
    transition: all 0.2s;
    
    &:active {
        transform: scale(0.95);
    }
}

/* Main */
.main-content {
    flex: 1;
    padding: 24px 16px;
}

.mb-8 {
    margin-bottom: 32px;
}
.mt-4 {
    margin-top: 16px;
}

/* Typography */
.section-label {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge-required {
    font-size: 10px;
    font-weight: 700;
    color: #10b981;
    background: #ecfdf5;
    padding: 2px 8px;
    border-radius: 999px;
    text-transform: uppercase;
}

/* Type Selector */
.type-scroll-container {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 4px;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
        display: none;
    }
}

.type-item {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    width: 80px;
    transition: all 0.2s ease;
    cursor: pointer;
    
    .type-icon {
        font-size: 24px;
        color: #94a3b8;
        transition: color 0.2s;
    }
    
    .type-text {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
    }
    
    &.active {
        background: #10b981;
        border-color: #10b981;
        box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        transform: translateY(-2px);
        
        .type-icon, .type-text {
            color: #ffffff !important;
        }
    }
}

/* Form Cards */
.form-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.space-y-6 > * + * {
    margin-top: 24px;
}

/* Inputs */
.input-group {
    margin-bottom: 0;
}

.input-label {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    display: block;
}

.custom-input {
    width: 100%;
    background: #f1f5f9;
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 15px;
    font-weight: 500;
    color: #334155;
    transition: all 0.2s ease;
    
    &:focus {
        outline: none;
        background: #ffffff;
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }
    
    &::placeholder {
        color: #cbd5e1;
    }
}

/* 隐藏 select 原生下拉箭头 */
select.custom-input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: none;
    
    /* 移除 IE/Edge 的箭头 */
    &::-ms-expand {
        display: none;
    }
}

textarea.custom-input {
    font-family: inherit;
}

.relative {
    position: relative;
}

.input-icon-right {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    pointer-events: none;
}

/* Grid System */
.grid {
    display: grid;
}
.grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}
.gap-3 {
    gap: 12px;
}
.gap-4 {
    gap: 16px;
}

.h-12 {
    height: 48px;
}

.mb-4 {
    margin-bottom: 16px;
}

/* Helper */
.no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

/* 推荐标签样式 */
.tag-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    
    &:active {
        transform: scale(0.95);
    }
    
    &.active {
        background: #10b981;
        border-color: #10b981;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
    }
}
</style>
