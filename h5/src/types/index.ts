// 票据类型
export type TicketType = 'movie' | 'show' | 'exhibition' | 'train' | 'flight' | 'scenic' | 'other'

// 隐私级别
export type PrivacyLevel = 'public' | 'private' | 'masked'

// 坐标
export interface Coordinate {
  latitude: number
  longitude: number
}

// 地点信息
export interface Location {
  type: 'single' | 'route'
  // 单一地点
  city?: string
  address?: string
  coordinate?: Coordinate
  // 路线（火车票/机票）
  departure?: {
    city: string
    station?: string
    code?: string      // 机场三字码（如 PEK/SHA）或车站代码
    time?: string      // 出发时间（HH:mm 格式）
    coordinate?: Coordinate
  }
  arrival?: {
    city: string
    station?: string
    code?: string      // 机场三字码（如 PEK/SHA）或车站代码
    time?: string      // 到达时间（HH:mm 格式）
    coordinate?: Coordinate
  }
}

// 票据
export interface Ticket {
  id: string
  ticketClientId: string
  userId: string
  name: string
  type: TicketType
  tripNumber?: string  // 航班号/车次号
  seat?: string        // 座位信息（电影票/演出票）
  hall?: string        // 影厅信息（电影票）
  version?: string     // 电影版本（IMAX/3D/原版等）
  showtime?: string    // 场次时间（电影票）
  tags: string[]
  price?: number
  photo?: string
  thumbnail?: string
  date?: string
  sortTime: string
  location?: Location
  note?: string
  privacy: PrivacyLevel
  isDeleted: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

// 用户信息
export interface UserInfo {
  id: string
  openid: string
  nickName?: string
  avatarUrl?: string
  phone?: string
  ticketCount: number
  photoCount: number
  photoQuota: number
  createdAt: string
  updatedAt: string
}

// 标签
export interface Tag {
  id: string
  name: string
  type: 'global' | 'custom'
  userId?: string
  color: string
  icon?: string
  usageCount: number
  isActive: boolean
}

// 票据类型配置
export const TICKET_TYPE_CONFIG: Record<TicketType, { label: string; icon: string; color: string }> = {
  movie: { label: '电影票', icon: 'video-o', color: '#FF6B6B' },
  show: { label: '演出票', icon: 'music-o', color: '#9B59B6' },
  exhibition: { label: '展览票', icon: 'photo-o', color: '#3498DB' },
  train: { label: '火车票', icon: 'logistics', color: '#1ABC9C' },
  flight: { label: '机票', icon: 'send-gift-o', color: '#2ECC71' },
  scenic: { label: '景区门票', icon: 'location-o', color: '#F39C12' },
  other: { label: '其他', icon: 'bookmark-o', color: '#95A5A6' }
}

// 隐私级别配置
export const PRIVACY_CONFIG: Record<PrivacyLevel, { label: string; icon: string }> = {
  public: { label: '公开', icon: 'eye-o' },
  private: { label: '私密', icon: 'eye-closed' },
  masked: { label: '脱敏', icon: 'shield-o' }
}
