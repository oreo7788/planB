import request from '@/utils/request'
import type { TicketType, PrivacyLevel, Location } from '@/types'

// 后端返回的原始票据数据
interface RawTicket {
  id: number
  ticketClientId: string
  userId: number
  name: string
  type: TicketType
  tripNumber?: string
  seat?: string
  hall?: string
  version?: string
  showtime?: string
  tags: string | string[]  // 可能是 JSON 字符串或数组
  price?: number
  photo?: string
  thumbnail?: string
  date?: string
  sortTime: string
  location?: string | Location  // 可能是 JSON 字符串或对象
  note?: string
  privacy: PrivacyLevel
  isDeleted: boolean
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

// 票据接口（前端使用的格式）
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

// 转换后端数据为前端格式
function transformTicket(raw: RawTicket): Ticket {
  // 解析 tags
  let tags: string[] = []
  if (Array.isArray(raw.tags)) {
    tags = raw.tags
  } else if (typeof raw.tags === 'string') {
    try {
      tags = JSON.parse(raw.tags)
    } catch {
      tags = []
    }
  }

  // 解析 location
  let location: Location | undefined
  if (raw.location) {
    if (typeof raw.location === 'string') {
      try {
        location = JSON.parse(raw.location)
      } catch {
        location = undefined
      }
    } else {
      location = raw.location as Location
    }
  }

  return {
    id: String(raw.id),
    ticketClientId: raw.ticketClientId,
    userId: String(raw.userId),
    name: raw.name,
    type: raw.type,
    tripNumber: raw.tripNumber,
    seat: raw.seat,
    hall: raw.hall,
    version: raw.version,
    showtime: raw.showtime,
    tags,
    price: raw.price,
    photo: raw.photo,
    thumbnail: raw.thumbnail,
    date: raw.date,
    sortTime: raw.sortTime,
    location,
    note: raw.note,
    privacy: raw.privacy,
    isDeleted: raw.isDeleted,
    deletedAt: raw.deletedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  }
}

// 票据列表参数
export interface TicketListParams {
  cursor?: string
  limit?: number
  type?: TicketType
  tag?: string
  isDeleted?: boolean
}

// 票据列表响应
export interface TicketListResult {
  list: Ticket[]
  cursor: string | null
  hasMore: boolean
  total: number
}

// 创建票据参数
export interface CreateTicketParams {
  name: string
  type: TicketType
  tripNumber?: string  // 航班号/车次号
  seat?: string        // 座位信息（电影票/演出票）
  hall?: string        // 影厅信息（电影票）
  version?: string     // 电影版本（IMAX/3D/原版等）
  showtime?: string    // 场次时间（电影票）
  tags?: string[]
  price?: number
  photo?: string
  date?: string
  location?: Location
  note?: string
  privacy?: PrivacyLevel
}

/**
 * 获取票据列表
 */
export async function getTicketList(params: TicketListParams = {}): Promise<TicketListResult> {
  const result = await request.get<{ list: RawTicket[]; cursor: string; hasMore: boolean; total: number }>('/tickets', { params })
  return {
    list: result.list.map(transformTicket),
    cursor: result.cursor,
    hasMore: result.hasMore,
    total: result.total
  }
}

/**
 * 获取票据详情
 */
export async function getTicketDetail(id: string): Promise<Ticket> {
  const raw = await request.get<RawTicket>(`/tickets/${id}`)
  return transformTicket(raw)
}

/**
 * 创建票据
 */
export async function createTicket(data: CreateTicketParams): Promise<Ticket> {
  // 生成客户端 ID
  const ticketClientId = `${Date.now()}_${Math.random().toString(36).slice(2)}`
  const requestData = { ...data, ticketClientId }
  console.log('[API] 创建票据请求:', requestData)
  try {
    const raw = await request.post<RawTicket>('/tickets', requestData)
    console.log('[API] 创建票据成功:', raw)
    return transformTicket(raw)
  } catch (error) {
    console.error('[API] 创建票据失败:', error)
    throw error
  }
}

/**
 * 更新票据
 */
export async function updateTicket(id: string, data: Partial<CreateTicketParams>): Promise<Ticket> {
  const raw = await request.put<RawTicket>(`/tickets/${id}`, data)
  return transformTicket(raw)
}

/**
 * 删除票据（软删除）
 */
export function deleteTicket(id: string): Promise<void> {
  return request.delete(`/tickets/${id}`)
}

/**
 * 恢复票据
 */
export async function restoreTicket(id: string): Promise<Ticket> {
  const raw = await request.post<RawTicket>(`/tickets/${id}/restore`)
  return transformTicket(raw)
}

/**
 * 永久删除票据
 */
export function permanentDeleteTicket(id: string): Promise<void> {
  return request.delete(`/tickets/${id}/permanent`)
}
