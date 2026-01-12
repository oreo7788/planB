// 小程序与 H5 通信桥接层
const API_BASE_URL = 'https://your-api-domain.com/api'

/**
 * 处理来自 H5 的消息
 */
export function handleH5Message(message: BridgeMessage): void {
  console.log('[Bridge] 收到 H5 消息:', message)
  
  switch (message.type) {
    case 'chooseImage':
      // 跳转到选择图片页面
      wx.navigateTo({
        url: `/pages/native/choose-image/index?callbackId=${message.callbackId || ''}`
      })
      break
    
    case 'chooseLocation':
      // 跳转到选择位置页面
      wx.navigateTo({
        url: `/pages/native/choose-location/index?callbackId=${message.callbackId || ''}`
      })
      break
    
    case 'bindPhone':
      // 跳转到绑定手机号页面
      wx.navigateTo({
        url: `/pages/native/bind-phone/index?callbackId=${message.callbackId || ''}`
      })
      break
    
    case 'getToken':
      // 获取 token 并返回给 H5
      const app = getApp<IAppOption>()
      app.getToken().then(token => {
        sendResultToH5({
          callbackId: message.callbackId || '',
          success: true,
          data: { token }
        })
      })
      break
    
    default:
      console.warn('[Bridge] 未知消息类型:', message.type)
  }
}

/**
 * 将结果发送回 H5
 * 通过 URL 参数传递给 webview 页面
 */
export function sendResultToH5(result: BridgeResult): void {
  const pages = getCurrentPages()
  const webviewPage = pages.find(p => p.route === 'pages/webview/index')
  
  if (webviewPage) {
    // 存储结果到本地，H5 通过轮询获取
    const key = `bridge_result_${result.callbackId}`
    wx.setStorageSync(key, JSON.stringify(result))
    
    // 返回到 webview 页面
    wx.navigateBack()
  }
}

/**
 * 上传图片到七牛云
 */
export async function uploadImageToQiniu(filePath: string): Promise<ImageUploadResult> {
  const app = getApp<IAppOption>()
  const token = await app.getToken()
  
  // 1. 获取上传凭证
  const uploadToken = await getUploadToken(token)
  
  // 2. 上传到七牛云
  return new Promise((resolve, reject) => {
    const key = `tickets/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
    
    wx.uploadFile({
      url: 'https://upload.qiniup.com',
      filePath: filePath,
      name: 'file',
      formData: {
        token: uploadToken.token,
        key: key
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          const baseUrl = uploadToken.domain
          resolve({
            url: `${baseUrl}/${data.key}`,
            thumbnailUrl: `${baseUrl}/${data.key}?imageView2/1/w/300/h/300/q/80`
          })
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取七牛云上传凭证
 */
async function getUploadToken(authToken: string): Promise<{ token: string; domain: string }> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}/upload/token`,
      method: 'POST',
      header: {
        Authorization: `Bearer ${authToken}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data as { code: number; data: { token: string; domain: string } }
          if (data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error('获取上传凭证失败'))
          }
        } else {
          reject(new Error('获取上传凭证失败'))
        }
      },
      fail: reject
    })
  })
}
