// app.ts
import { login, checkToken } from './utils/auth'

App<IAppOption>({
  globalData: {
    token: '',
    userInfo: null,
    h5BaseUrl: 'https://your-domain.com' // H5 页面的基础 URL
  },

  onLaunch() {
    // 检查本地 token
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      // 验证 token 有效性
      checkToken(token).then(valid => {
        if (!valid) {
          // token 失效，清除并重新登录
          wx.removeStorageSync('token')
          this.globalData.token = ''
        }
      })
    }
  },

  // 获取 token，如果没有则进行登录
  async getToken(): Promise<string> {
    if (this.globalData.token) {
      return this.globalData.token
    }
    const token = await login()
    this.globalData.token = token
    wx.setStorageSync('token', token)
    return token
  }
})
