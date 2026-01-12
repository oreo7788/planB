// pages/native/choose-location/index.ts
// 选择位置原生能力页面
import { sendResultToH5 } from '../../../utils/bridge'

Page({
  data: {
    callbackId: '',
    locationType: 'single' as 'single' | 'route', // single: 单一地点, route: 路线
    location: null as LocationInfo | null
  },

  onLoad(options) {
    this.setData({
      callbackId: options.callbackId || '',
      locationType: (options.type as 'single' | 'route') || 'single'
    })
    
    this.chooseLocation()
  },

  // 选择位置
  async chooseLocation() {
    try {
      const res = await this.wxChooseLocation()
      
      const location: LocationInfo = {
        type: 'single',
        address: res.address,
        latitude: res.latitude,
        longitude: res.longitude
      }
      
      // 从地址中提取城市（简单处理）
      location.city = this.extractCity(res.address)
      
      this.setData({ location })
      
      // 返回结果给 H5
      sendResultToH5({
        callbackId: this.data.callbackId,
        success: true,
        data: location
      })
    } catch (error: any) {
      if (error?.errMsg?.includes('cancel')) {
        this.handleCancel()
      } else {
        this.handleError(error)
      }
    }
  },

  // 封装 wx.chooseLocation
  wxChooseLocation(): Promise<WechatMiniprogram.ChooseLocationSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
      wx.chooseLocation({
        success: resolve,
        fail: reject
      })
    })
  },

  // 从地址中提取城市名
  extractCity(address: string): string {
    // 简单的城市提取逻辑
    const cityMatch = address.match(/(.+?(?:市|自治州|地区|盟))/);
    if (cityMatch) {
      // 去掉省份前缀
      const city = cityMatch[1].replace(/^.+?(?:省|自治区|特别行政区)/, '')
      return city
    }
    return ''
  },

  // 用户取消
  handleCancel() {
    sendResultToH5({
      callbackId: this.data.callbackId,
      success: false,
      error: 'user_cancel'
    })
  },

  // 处理错误
  handleError(error: any) {
    console.error('选择位置失败:', error)
    
    // 检查是否是权限问题
    if (error?.errMsg?.includes('auth')) {
      wx.showModal({
        title: '提示',
        content: '需要授权位置信息才能选择地点，是否去设置？',
        success: (res) => {
          if (res.confirm) {
            wx.openSetting()
          } else {
            this.handleCancel()
          }
        }
      })
    } else {
      wx.showToast({
        title: '选择位置失败',
        icon: 'none'
      })
      this.handleCancel()
    }
  },

  // 重新选择
  onRetry() {
    this.chooseLocation()
  },

  // 返回
  onBack() {
    this.handleCancel()
  }
})
