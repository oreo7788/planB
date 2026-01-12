<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import type { Location } from '@/types'
import { mpBridge } from '@/utils/bridge'
import { searchAirports, type Airport } from '@/data/airports'
import { searchStations, type Station } from '@/data/stations'

const props = defineProps<{
  modelValue?: Location
  type?: 'single' | 'route'
  // 是否为机票类型（机票类型使用机场选择器）
  ticketType?: 'flight' | 'train' | 'other'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Location | undefined]
}>()

// 地点类型
const locationType = computed(() => props.type || 'single')

// 是否为机票（机票使用机场选择）
const isFlight = computed(() => props.ticketType === 'flight')

// 是否为火车票（火车票使用火车站选择）
const isTrain = computed(() => props.ticketType === 'train')

// 单一地点
const singleLocation = ref({
  city: '',
  address: '',
  latitude: 0,
  longitude: 0
})

// 路线地点
const routeLocation = ref({
  departure: { city: '', station: '', code: '', time: '', latitude: 0, longitude: 0 },
  arrival: { city: '', station: '', code: '', time: '', latitude: 0, longitude: 0 }
})

// 初始化
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (val.type === 'single') {
        singleLocation.value = {
          city: val.city || '',
          address: val.address || '',
          latitude: val.coordinate?.latitude || 0,
          longitude: val.coordinate?.longitude || 0
        }
      } else if (val.type === 'route') {
        routeLocation.value = {
          departure: {
            city: val.departure?.city || '',
            station: val.departure?.station || '',
            code: val.departure?.code || '',
            time: val.departure?.time || '',
            latitude: val.departure?.coordinate?.latitude || 0,
            longitude: val.departure?.coordinate?.longitude || 0
          },
          arrival: {
            city: val.arrival?.city || '',
            station: val.arrival?.station || '',
            code: val.arrival?.code || '',
            time: val.arrival?.time || '',
            latitude: val.arrival?.coordinate?.latitude || 0,
            longitude: val.arrival?.coordinate?.longitude || 0
          }
        }
      }
    }
  },
  { immediate: true }
)

// 弹窗控制
const showCityInput = ref(false)
const showDepartureInput = ref(false)
const showArrivalInput = ref(false)
const showDepartureTimePicker = ref(false)
const showArrivalTimePicker = ref(false)
const tempCity = ref('')
const tempCode = ref('')

// 机场搜索相关
const showAirportPicker = ref(false)
const airportSearchKeyword = ref('')
const airportPickerTarget = ref<'departure' | 'arrival'>('departure')
const airportSearchResults = computed(() => searchAirports(airportSearchKeyword.value))

// 火车站搜索相关
const showStationPicker = ref(false)
const stationSearchKeyword = ref('')
const stationPickerTarget = ref<'departure' | 'arrival'>('departure')
const stationSearchResults = computed(() => searchStations(stationSearchKeyword.value))

// 打开机场选择器
const openAirportPicker = (target: 'departure' | 'arrival') => {
  airportPickerTarget.value = target
  airportSearchKeyword.value = ''
  showAirportPicker.value = true
}

// 打开火车站选择器
const openStationPicker = (target: 'departure' | 'arrival') => {
  stationPickerTarget.value = target
  stationSearchKeyword.value = ''
  showStationPicker.value = true
}

// 选择机场
const onSelectAirport = (airport: Airport) => {
  const target = airportPickerTarget.value
  routeLocation.value[target] = {
    ...routeLocation.value[target],
    city: airport.city,
    station: airport.name,
    code: airport.code
  }
  showAirportPicker.value = false
  emitValue()
}

// 选择火车站
const onSelectStation = (station: Station) => {
  const target = stationPickerTarget.value
  routeLocation.value[target] = {
    ...routeLocation.value[target],
    city: station.city,
    station: station.name,
    code: station.code
  }
  showStationPicker.value = false
  emitValue()
}

// 选择单一地点
const chooseSingleLocation = async () => {
  if (mpBridge.isMiniProgram()) {
    try {
      const result = await mpBridge.chooseLocation()
      singleLocation.value = {
        city: result.city,
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude
      }
      emitValue()
    } catch (error: any) {
      if (error.message !== 'user_cancel') {
        showToast('选择位置失败')
      }
    }
  } else {
    // 浏览器环境：手动输入
    tempCity.value = singleLocation.value.city
    showCityInput.value = true
  }
}

// 确认城市输入
const confirmCityInput = () => {
  singleLocation.value.city = tempCity.value
  showCityInput.value = false
  emitValue()
}

// 选择出发地
const chooseDeparture = async () => {
  // 机票类型：使用机场选择器
  if (isFlight.value) {
    openAirportPicker('departure')
    return
  }
  
  // 火车票类型：使用火车站选择器
  if (isTrain.value) {
    openStationPicker('departure')
    return
  }
  
  if (mpBridge.isMiniProgram()) {
    try {
      const result = await mpBridge.chooseLocation()
      routeLocation.value.departure = {
        ...routeLocation.value.departure,
        city: result.city,
        station: result.address,
        latitude: result.latitude,
        longitude: result.longitude
      }
      emitValue()
    } catch (error: any) {
      if (error.message !== 'user_cancel') {
        showToast('选择位置失败')
      }
    }
  } else {
    tempCity.value = routeLocation.value.departure.city
    tempCode.value = routeLocation.value.departure.code
    showDepartureInput.value = true
  }
}

const confirmDepartureInput = () => {
  routeLocation.value.departure.city = tempCity.value
  routeLocation.value.departure.code = tempCode.value.toUpperCase()
  showDepartureInput.value = false
  emitValue()
}

// 选择到达地
const chooseArrival = async () => {
  // 机票类型：使用机场选择器
  if (isFlight.value) {
    openAirportPicker('arrival')
    return
  }
  
  // 火车票类型：使用火车站选择器
  if (isTrain.value) {
    openStationPicker('arrival')
    return
  }
  
  if (mpBridge.isMiniProgram()) {
    try {
      const result = await mpBridge.chooseLocation()
      routeLocation.value.arrival = {
        ...routeLocation.value.arrival,
        city: result.city,
        station: result.address,
        latitude: result.latitude,
        longitude: result.longitude
      }
      emitValue()
    } catch (error: any) {
      if (error.message !== 'user_cancel') {
        showToast('选择位置失败')
      }
    }
  } else {
    tempCity.value = routeLocation.value.arrival.city
    tempCode.value = routeLocation.value.arrival.code
    showArrivalInput.value = true
  }
}

const confirmArrivalInput = () => {
  routeLocation.value.arrival.city = tempCity.value
  routeLocation.value.arrival.code = tempCode.value.toUpperCase()
  showArrivalInput.value = false
  emitValue()
}

// 选择出发时间
const onDepartureTimeConfirm = ({ selectedValues }: any) => {
  routeLocation.value.departure.time = selectedValues.join(':')
  showDepartureTimePicker.value = false
  emitValue()
}

// 选择到达时间
const onArrivalTimeConfirm = ({ selectedValues }: any) => {
  routeLocation.value.arrival.time = selectedValues.join(':')
  showArrivalTimePicker.value = false
  emitValue()
}

// 发送更新
const emitValue = () => {
  if (locationType.value === 'single') {
    if (singleLocation.value.city || singleLocation.value.address) {
      emit('update:modelValue', {
        type: 'single',
        city: singleLocation.value.city,
        address: singleLocation.value.address,
        coordinate: singleLocation.value.latitude
          ? {
              latitude: singleLocation.value.latitude,
              longitude: singleLocation.value.longitude
            }
          : undefined
      })
    } else {
      emit('update:modelValue', undefined)
    }
  } else {
    if (routeLocation.value.departure.city || routeLocation.value.arrival.city) {
      emit('update:modelValue', {
        type: 'route',
        departure: {
          city: routeLocation.value.departure.city,
          station: routeLocation.value.departure.station,
          code: routeLocation.value.departure.code || undefined,
          time: routeLocation.value.departure.time || undefined,
          coordinate: routeLocation.value.departure.latitude
            ? {
                latitude: routeLocation.value.departure.latitude,
                longitude: routeLocation.value.departure.longitude
              }
            : undefined
        },
        arrival: {
          city: routeLocation.value.arrival.city,
          station: routeLocation.value.arrival.station,
          code: routeLocation.value.arrival.code || undefined,
          time: routeLocation.value.arrival.time || undefined,
          coordinate: routeLocation.value.arrival.latitude
            ? {
                latitude: routeLocation.value.arrival.latitude,
                longitude: routeLocation.value.arrival.longitude
              }
            : undefined
        }
      })
    } else {
      emit('update:modelValue', undefined)
    }
  }
}

// 清空
const clearLocation = () => {
  if (locationType.value === 'single') {
    singleLocation.value = { city: '', address: '', latitude: 0, longitude: 0 }
  } else {
    routeLocation.value = {
      departure: { city: '', station: '', code: '', time: '', latitude: 0, longitude: 0 },
      arrival: { city: '', station: '', code: '', time: '', latitude: 0, longitude: 0 }
    }
  }
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div class="location-picker">
    <!-- 单一地点 -->
    <template v-if="locationType === 'single'">
      <div class="input-group">
        <label class="input-label">具体地点</label>
        <div class="relative" @click="chooseSingleLocation">
          <input 
            type="text" 
            class="custom-input pr-10" 
            :value="singleLocation.city || singleLocation.address" 
            placeholder="点击添加位置" 
            readonly
          >
          <van-icon name="location-o" class="input-icon" />
          <van-icon 
            v-if="singleLocation.city" 
            name="clear" 
            class="clear-icon" 
            @click.stop="clearLocation" 
          />
        </div>
      </div>
    </template>
    
    <!-- 路线（火车/机票） -->
    <template v-else>
      <div class="grid grid-cols-2 gap-4">
        <!-- 出发地 -->
        <div class="input-group">
          <label class="input-label">{{ isFlight ? '出发机场' : isTrain ? '出发车站' : '出发城市' }}</label>
          <div class="relative" @click="chooseDeparture">
            <input 
              type="text" 
              class="custom-input" 
              :value="(isFlight || isTrain) ? routeLocation.departure.station : routeLocation.departure.city"
              :placeholder="isFlight ? '选择机场' : isTrain ? '选择车站' : '选择城市'" 
              readonly
            >
            <span v-if="routeLocation.departure.code" class="code-badge">{{ routeLocation.departure.code }}</span>
          </div>
        </div>

        <!-- 到达地 -->
        <div class="input-group">
          <label class="input-label">{{ isFlight ? '到达机场' : isTrain ? '到达车站' : '目的城市' }}</label>
          <div class="relative" @click="chooseArrival">
            <input 
              type="text" 
              class="custom-input" 
              :value="(isFlight || isTrain) ? routeLocation.arrival.station : routeLocation.arrival.city"
              :placeholder="isFlight ? '选择机场' : isTrain ? '选择车站' : '选择城市'" 
              readonly
            >
             <span v-if="routeLocation.arrival.code" class="code-badge">{{ routeLocation.arrival.code }}</span>
          </div>
        </div>
      </div>

      <!-- 时间 (Hidden by default in basic view, but we show them here as per old logic, simplified style) -->
      <div class="grid grid-cols-2 gap-4 mt-4">
          <div class="input-group">
             <label class="input-label">出发时间</label>
             <div class="relative" @click="showDepartureTimePicker = true">
                <input type="text" class="custom-input" :value="routeLocation.departure.time" placeholder="选填" readonly>
             </div>
          </div>
          <div class="input-group">
             <label class="input-label">到达时间</label>
             <div class="relative" @click="showArrivalTimePicker = true">
                <input type="text" class="custom-input" :value="routeLocation.arrival.time" placeholder="选填" readonly>
             </div>
          </div>
      </div>

    </template>
    
    <!-- 城市输入弹窗 -->
    <van-dialog
      v-model:show="showCityInput"
      title="输入城市"
      show-cancel-button
      @confirm="confirmCityInput"
    >
      <van-field v-model="tempCity" placeholder="请输入城市名称" />
    </van-dialog>
    
    <!-- 出发地输入弹窗 -->
    <van-dialog
      v-model:show="showDepartureInput"
      title="输入出发地"
      show-cancel-button
      @confirm="confirmDepartureInput"
    >
      <van-field v-model="tempCity" label="城市" placeholder="如：北京" />
      <van-field v-model="tempCode" label="机场代码" placeholder="如：PEK（选填）" maxlength="3" />
    </van-dialog>
    
    <!-- 到达地输入弹窗 -->
    <van-dialog
      v-model:show="showArrivalInput"
      title="输入到达地"
      show-cancel-button
      @confirm="confirmArrivalInput"
    >
      <van-field v-model="tempCity" label="城市" placeholder="如：上海" />
      <van-field v-model="tempCode" label="机场代码" placeholder="如：SHA（选填）" maxlength="3" />
    </van-dialog>
    
    <!-- 出发时间选择器 -->
    <van-popup v-model:show="showDepartureTimePicker" position="bottom">
      <van-time-picker
        title="出发时间"
        @confirm="onDepartureTimeConfirm"
        @cancel="showDepartureTimePicker = false"
      />
    </van-popup>
    
    <!-- 到达时间选择器 -->
    <van-popup v-model:show="showArrivalTimePicker" position="bottom">
      <van-time-picker
        title="到达时间"
        @confirm="onArrivalTimeConfirm"
        @cancel="showArrivalTimePicker = false"
      />
    </van-popup>
    
    <!-- 机场选择器 -->
    <van-popup
      v-model:show="showAirportPicker"
      position="bottom"
      :style="{ height: '70%' }"
      round
    >
      <div class="airport-picker">
        <div class="airport-picker-header">
          <span class="title">{{ airportPickerTarget === 'departure' ? '选择出发机场' : '选择到达机场' }}</span>
          <van-icon name="cross" size="20" @click="showAirportPicker = false" />
        </div>
        <van-search
          v-model="airportSearchKeyword"
          placeholder="搜索城市、机场名称或三字码"
          shape="round"
          autofocus
        />
        <div class="airport-list">
          <van-cell
            v-for="airport in airportSearchResults"
            :key="airport.code"
            :title="airport.name"
            :label="airport.city"
            clickable
            @click="onSelectAirport(airport)"
          >
            <template #value>
              <span class="airport-code">{{ airport.code }}</span>
            </template>
          </van-cell>
          <van-empty v-if="airportSearchResults.length === 0" description="未找到相关机场" />
        </div>
      </div>
    </van-popup>
    
    <!-- 火车站选择器 -->
    <van-popup
      v-model:show="showStationPicker"
      position="bottom"
      :style="{ height: '70%' }"
      round
    >
      <div class="station-picker">
        <div class="station-picker-header">
          <span class="title">{{ stationPickerTarget === 'departure' ? '选择出发车站' : '选择到达车站' }}</span>
          <van-icon name="cross" size="20" @click="showStationPicker = false" />
        </div>
        <van-search
          v-model="stationSearchKeyword"
          placeholder="搜索城市、车站名称或电报码"
          shape="round"
          autofocus
        />
        <div class="station-list">
          <van-cell
            v-for="station in stationSearchResults"
            :key="station.code"
            :title="station.name"
            :label="station.city"
            clickable
            @click="onSelectStation(station)"
          >
            <template #value>
              <span class="station-code">{{ station.code }}</span>
            </template>
          </van-cell>
          <van-empty v-if="stationSearchResults.length === 0" description="未找到相关车站" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
/* Copied from add.html styles */
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
    cursor: pointer;
}
.custom-input:focus {
    outline: none;
    background: #ffffff;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.custom-input::placeholder {
    color: #cbd5e1;
}

/* Helpers */
.relative {
  position: relative;
}
.pr-10 {
  padding-right: 40px;
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.gap-4 {
  gap: 16px;
}
.mt-4 {
  margin-top: 16px;
}

/* Icons */
.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
}
.clear-icon {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
}

.code-badge {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 600;
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 4px;
    letter-spacing: 0.5px;
}

// 机场选择器
.airport-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .airport-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 8px;
    
    .title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  .airport-list {
    flex: 1;
    overflow-y: auto;
    
    :deep(.van-cell) {
      padding: 12px 16px;
      
      .van-cell__title {
        font-size: 14px;
        font-weight: 500;
      }
      
      .van-cell__label {
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-placeholder);
      }
    }
    
    .airport-code {
      font-size: 14px;
      font-weight: 600;
      color: #3b82f6;
      letter-spacing: 1px;
    }
  }
}

// 火车站选择器
.station-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .station-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 8px;
    
    .title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }
  
  .station-list {
    flex: 1;
    overflow-y: auto;
    
    :deep(.van-cell) {
      padding: 12px 16px;
      
      .van-cell__title {
        font-size: 14px;
        font-weight: 500;
      }
      
      .van-cell__label {
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-placeholder);
      }
    }
    
    .station-code {
      font-size: 14px;
      font-weight: 600;
      color: #10b981;
      letter-spacing: 1px;
    }
  }
}
</style>
