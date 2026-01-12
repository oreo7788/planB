/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    token: string
    userInfo: WechatMiniprogram.UserInfo | null
    h5BaseUrl: string
  }
  getToken(): Promise<string>
}

// 桥接消息类型
interface BridgeMessage {
  type: 'chooseImage' | 'chooseLocation' | 'bindPhone' | 'share' | 'getToken'
  callbackId?: string
  data?: any
}

// 桥接回调结果
interface BridgeResult {
  callbackId: string
  success: boolean
  data?: any
  error?: string
}

// 位置信息
interface LocationInfo {
  type: 'single' | 'route'
  city?: string
  address?: string
  latitude?: number
  longitude?: number
  departure?: {
    city: string
    station?: string
    latitude?: number
    longitude?: number
  }
  arrival?: {
    city: string
    station?: string
    latitude?: number
    longitude?: number
  }
}

// 图片上传结果
interface ImageUploadResult {
  url: string
  thumbnailUrl: string
}
