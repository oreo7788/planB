// pages/native/choose-image/index.ts
// 选择图片原生能力页面
import { uploadImageToQiniu, sendResultToH5 } from '../../../utils/bridge'

Page({
  data: {
    callbackId: '',
    uploading: false,
    uploadProgress: 0
  },

  onLoad(options) {
    this.setData({ callbackId: options.callbackId || '' })
    this.chooseImage()
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await this.wxChooseImage()
      
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        const filePath = res.tempFilePaths[0]
        
        // 压缩图片
        this.setData({ uploading: true, uploadProgress: 10 })
        const compressedPath = await this.compressImage(filePath)
        
        // 上传图片
        this.setData({ uploadProgress: 30 })
        const result = await uploadImageToQiniu(compressedPath)
        
        this.setData({ uploadProgress: 100 })
        
        // 返回结果给 H5
        sendResultToH5({
          callbackId: this.data.callbackId,
          success: true,
          data: result
        })
      } else {
        // 用户取消选择
        this.handleCancel()
      }
    } catch (error) {
      console.error('选择图片失败:', error)
      this.handleError(error)
    }
  },

  // 封装 wx.chooseImage
  wxChooseImage(): Promise<WechatMiniprogram.ChooseImageSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: reject
      })
    })
  },

  // 压缩图片
  async compressImage(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality: 80,
        success: (res) => resolve(res.tempFilePath),
        fail: () => resolve(filePath) // 压缩失败则使用原图
      })
    })
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
    wx.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    })
    
    sendResultToH5({
      callbackId: this.data.callbackId,
      success: false,
      error: error?.message || '上传失败'
    })
  },

  // 重新选择
  onRetry() {
    this.setData({ uploading: false, uploadProgress: 0 })
    this.chooseImage()
  },

  // 返回
  onBack() {
    this.handleCancel()
  }
})
