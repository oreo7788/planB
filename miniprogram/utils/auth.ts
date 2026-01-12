// 登录相关工具函数
const API_BASE_URL = 'https://your-api-domain.com/api'

/**
 * 微信登录，获取 token
 */
export async function login(): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. 调用 wx.login 获取 code
    wx.login({
      success: async (loginRes) => {
        if (loginRes.code) {
          try {
            // 2. 将 code 发送到后端换取 token
            const result = await wxRequest<{ token: string }>({
              url: `${API_BASE_URL}/auth/login`,
              method: 'POST',
              data: {
                code: loginRes.code
              }
            })
            resolve(result.token)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error('wx.login 失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 检查 token 是否有效
 */
export async function checkToken(token: string): Promise<boolean> {
  try {
    await wxRequest({
      url: `${API_BASE_URL}/auth/verify`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`
      }
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 绑定手机号
 */
export async function bindPhone(code: string, token: string): Promise<boolean> {
  try {
    await wxRequest({
      url: `${API_BASE_URL}/auth/bind-phone`,
      method: 'POST',
      data: { code },
      header: {
        Authorization: `Bearer ${token}`
      }
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 封装的 wx.request
 */
function wxRequest<T>(options: WechatMiniprogram.RequestOption): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data as { code: number; data: T; message?: string }
          if (data.code === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '请求失败'))
          }
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}
