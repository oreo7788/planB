// pages/index/index.ts
// 启动页：检测登录状态，跳转到 webview

Page({
  data: {
    loading: true,
    loadingText: '正在加载...'
  },

  onLoad() {
    this.initApp()
  },

  async initApp() {
    const app = getApp<IAppOption>()
    
    try {
      this.setData({ loadingText: '正在登录...' })
      
      // 获取 token（如果没有会自动登录）
      const token = await app.getToken()
      
      this.setData({ loadingText: '登录成功，正在跳转...' })
      
      // 跳转到 webview 页面
      wx.redirectTo({
        url: `/pages/webview/index?token=${encodeURIComponent(token)}`
      })
    } catch (error) {
      console.error('初始化失败:', error)
      this.setData({
        loading: false,
        loadingText: '加载失败，请重试'
      })
      
      wx.showModal({
        title: '提示',
        content: '登录失败，请重试',
        showCancel: false,
        success: () => {
          this.initApp()
        }
      })
    }
  },

  // 点击重试
  onRetry() {
    this.setData({ loading: true })
    this.initApp()
  }
})
