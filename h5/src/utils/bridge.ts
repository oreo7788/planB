// 小程序与 H5 通信桥接层

declare const wx: {
  miniProgram: {
    postMessage: (options: { data: any }) => void
    navigateTo: (options: { url: string }) => void
    navigateBack: () => void
    getEnv: (callback: (res: { miniprogram: boolean }) => void) => void
  }
}

// 消息类型
type MessageType = 'chooseImage' | 'chooseLocation' | 'bindPhone' | 'share' | 'getToken'

// 桥接消息
interface BridgeMessage {
  type: MessageType
  callbackId: string
  data?: any
}

// 桥接结果
interface BridgeResult {
  callbackId: string
  success: boolean
  data?: any
  error?: string
}

// 回调存储
const callbacks = new Map<string, { resolve: Function; reject: Function }>()

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

class MpBridge {
  private isMp: boolean | null = null
  private pollInterval: number | null = null
  
  /**
   * 检测是否在小程序环境
   */
  isMiniProgram(): boolean {
    if (this.isMp !== null) return this.isMp
    
    // 通过 userAgent 判断
    const ua = navigator.userAgent.toLowerCase()
    this.isMp = /miniprogram/i.test(ua) || /micromessenger/i.test(ua)
    
    return this.isMp
  }
  
  /**
   * 发送消息给小程序
   */
  private sendMessage(type: MessageType, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isMiniProgram()) {
        reject(new Error('不在小程序环境中'))
        return
      }
      
      const callbackId = generateId()
      
      // 存储回调
      callbacks.set(callbackId, { resolve, reject })
      
      // 发送消息
      wx.miniProgram.postMessage({
        data: {
          type,
          callbackId,
          data
        } as BridgeMessage
      })
      
      // 开始轮询结果
      this.startPolling(callbackId)
      
      // 超时处理
      setTimeout(() => {
        if (callbacks.has(callbackId)) {
          callbacks.delete(callbackId)
          reject(new Error('操作超时'))
        }
      }, 60000) // 60秒超时
    })
  }
  
  /**
   * 轮询检查结果
   */
  private startPolling(callbackId: string) {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
    
    this.pollInterval = window.setInterval(() => {
      const key = `bridge_result_${callbackId}`
      const resultStr = localStorage.getItem(key)
      
      if (resultStr) {
        // 清除存储
        localStorage.removeItem(key)
        
        // 停止轮询
        if (this.pollInterval) {
          clearInterval(this.pollInterval)
          this.pollInterval = null
        }
        
        // 处理结果
        try {
          const result: BridgeResult = JSON.parse(resultStr)
          const callback = callbacks.get(result.callbackId)
          
          if (callback) {
            callbacks.delete(result.callbackId)
            
            if (result.success) {
              callback.resolve(result.data)
            } else {
              callback.reject(new Error(result.error || '操作失败'))
            }
          }
        } catch (e) {
          console.error('[Bridge] 解析结果失败:', e)
        }
      }
    }, 200) // 每 200ms 检查一次
  }
  
  /**
   * 选择图片
   */
  async chooseImage(): Promise<{ url: string; thumbnailUrl: string }> {
    if (!this.isMiniProgram()) {
      // 非小程序环境，使用原生 input
      return this.chooseImageByInput()
    }
    
    // 跳转到小程序原生页面
    const callbackId = generateId()
    
    return new Promise((resolve, reject) => {
      callbacks.set(callbackId, { resolve, reject })
      
      wx.miniProgram.postMessage({
        data: { type: 'chooseImage', callbackId }
      })
      
      wx.miniProgram.navigateTo({
        url: `/pages/native/choose-image/index?callbackId=${callbackId}`
      })
      
      this.startPolling(callbackId)
      
      // 超时
      setTimeout(() => {
        if (callbacks.has(callbackId)) {
          callbacks.delete(callbackId)
          reject(new Error('操作超时'))
        }
      }, 120000)
    })
  }
  
  /**
   * 通过 input 选择图片（非小程序环境）
   */
  private chooseImageByInput(): Promise<{ url: string; thumbnailUrl: string }> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          reject(new Error('未选择文件'))
          return
        }
        
        // TODO: 上传文件到服务器
        // 这里暂时返回本地 URL
        const url = URL.createObjectURL(file)
        resolve({ url, thumbnailUrl: url })
      }
      
      input.click()
    })
  }
  
  /**
   * 选择位置
   */
  async chooseLocation(): Promise<{
    city: string
    address: string
    latitude: number
    longitude: number
  }> {
    if (!this.isMiniProgram()) {
      throw new Error('请在小程序中使用此功能')
    }
    
    const callbackId = generateId()
    
    return new Promise((resolve, reject) => {
      callbacks.set(callbackId, { resolve, reject })
      
      wx.miniProgram.postMessage({
        data: { type: 'chooseLocation', callbackId }
      })
      
      wx.miniProgram.navigateTo({
        url: `/pages/native/choose-location/index?callbackId=${callbackId}`
      })
      
      this.startPolling(callbackId)
      
      setTimeout(() => {
        if (callbacks.has(callbackId)) {
          callbacks.delete(callbackId)
          reject(new Error('操作超时'))
        }
      }, 120000)
    })
  }
  
  /**
   * 绑定手机号
   */
  async bindPhone(): Promise<{ bound: boolean }> {
    if (!this.isMiniProgram()) {
      throw new Error('请在小程序中使用此功能')
    }
    
    const callbackId = generateId()
    
    return new Promise((resolve, reject) => {
      callbacks.set(callbackId, { resolve, reject })
      
      wx.miniProgram.postMessage({
        data: { type: 'bindPhone', callbackId }
      })
      
      wx.miniProgram.navigateTo({
        url: `/pages/native/bind-phone/index?callbackId=${callbackId}`
      })
      
      this.startPolling(callbackId)
      
      setTimeout(() => {
        if (callbacks.has(callbackId)) {
          callbacks.delete(callbackId)
          reject(new Error('操作超时'))
        }
      }, 120000)
    })
  }
  
  /**
   * 更新分享信息
   */
  updateShareInfo(title: string, imageUrl?: string, path?: string) {
    if (!this.isMiniProgram()) return
    
    wx.miniProgram.postMessage({
      data: {
        type: 'share',
        data: { title, imageUrl, path }
      }
    })
  }
  
  /**
   * 返回小程序
   */
  navigateBack() {
    if (this.isMiniProgram()) {
      wx.miniProgram.navigateBack()
    }
  }
}

export const mpBridge = new MpBridge()
