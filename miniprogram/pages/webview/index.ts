// pages/webview/index.ts
// web-view 容器页面
import { handleH5Message } from '../../utils/bridge'

Page({
  data: {
    webviewUrl: '',
    shareInfo: {
      title: '票迹 - 记录你的精彩人生',
      imageUrl: '',
      path: ''
    }
  },

  onLoad(options) {
    const app = getApp<IAppOption>()
    const { token, path = '' } = options
    
    // 构建 H5 URL
    let h5Url = app.globalData.h5BaseUrl
    if (path) {
      h5Url += path
    }
    
    // 添加 token 参数
    const separator = h5Url.includes('?') ? '&' : '?'
    h5Url += `${separator}token=${encodeURIComponent(token || '')}`
    
    console.log('[WebView] 加载 H5:', h5Url)
    
    this.setData({ webviewUrl: h5Url })
    
    // 检查是否有桥接回调结果需要处理
    this.checkBridgeResult()
  },

  onShow() {
    // 页面显示时检查桥接结果
    this.checkBridgeResult()
  },

  // 检查并处理桥接结果
  checkBridgeResult() {
    // 从本地存储获取所有桥接结果
    const storageInfo = wx.getStorageInfoSync()
    const bridgeKeys = storageInfo.keys.filter(k => k.startsWith('bridge_result_'))
    
    if (bridgeKeys.length > 0) {
      console.log('[WebView] 发现桥接结果:', bridgeKeys)
      // 结果会通过 H5 轮询获取，这里只是日志记录
    }
  },

  // 接收 H5 发送的消息
  onMessage(e: WechatMiniprogram.WebViewMessage) {
    console.log('[WebView] 收到 H5 消息:', e.detail)
    
    const messages = e.detail.data
    if (messages && messages.length > 0) {
      // 处理最新的消息
      const latestMessage = messages[messages.length - 1] as BridgeMessage
      
      // 更新分享信息
      if (latestMessage.type === 'share' && latestMessage.data) {
        this.setData({
          shareInfo: {
            title: latestMessage.data.title || '票迹',
            imageUrl: latestMessage.data.imageUrl || '',
            path: latestMessage.data.path || ''
          }
        })
      } else {
        // 处理其他消息
        handleH5Message(latestMessage)
      }
    }
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: this.data.shareInfo.title,
      imageUrl: this.data.shareInfo.imageUrl,
      path: `/pages/webview/index?path=${encodeURIComponent(this.data.shareInfo.path)}`
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.data.shareInfo.title,
      imageUrl: this.data.shareInfo.imageUrl,
      query: `path=${encodeURIComponent(this.data.shareInfo.path)}`
    }
  },

  // H5 页面加载完成
  onWebviewLoad() {
    console.log('[WebView] H5 页面加载完成')
  },

  // H5 页面加载失败
  onWebviewError(e: WechatMiniprogram.WebViewError) {
    console.error('[WebView] H5 页面加载失败:', e.detail)
    wx.showToast({
      title: '页面加载失败',
      icon: 'none'
    })
  }
})
