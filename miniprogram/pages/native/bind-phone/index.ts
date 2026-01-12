// pages/native/bind-phone/index.ts
// 绑定手机号原生能力页面
import { bindPhone } from '../../../utils/auth'
import { sendResultToH5 } from '../../../utils/bridge'

Page({
  data: {
    callbackId: '',
    loading: false
  },

  onLoad(options) {
    this.setData({ callbackId: options.callbackId || '' })
  },

  // 获取手机号回调
  async onGetPhoneNumber(e: WechatMiniprogram.ButtonGetPhoneNumber) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      const code = e.detail.code
      
      if (code) {
        this.setData({ loading: true })
        
        try {
          const app = getApp<IAppOption>()
          const token = await app.getToken()
          const success = await bindPhone(code, token)
          
          if (success) {
            wx.showToast({
              title: '绑定成功',
              icon: 'success'
            })
            
            // 返回结果给 H5
            sendResultToH5({
              callbackId: this.data.callbackId,
              success: true,
              data: { bound: true }
            })
          } else {
            throw new Error('绑定失败')
          }
        } catch (error) {
          console.error('绑定手机号失败:', error)
          wx.showToast({
            title: '绑定失败，请重试',
            icon: 'none'
          })
        } finally {
          this.setData({ loading: false })
        }
      }
    } else {
      // 用户拒绝授权
      console.log('用户拒绝授权手机号')
      this.handleCancel()
    }
  },

  // 用户取消
  handleCancel() {
    sendResultToH5({
      callbackId: this.data.callbackId,
      success: false,
      error: 'user_cancel'
    })
  },

  // 返回
  onBack() {
    this.handleCancel()
  }
})
