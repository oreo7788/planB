import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

// API 响应结构
interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    console.log('[Request] 发送请求:', config.method?.toUpperCase(), config.url, config.data)
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[Request] 添加 token:', token.substring(0, 20) + '...')
    } else {
      console.log('[Request] 未找到 token，在 debug 模式下后端会自动使用测试用户')
    }
    return config
  },
  (error) => {
    console.error('[Request] 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('[Request] 收到响应:', response.config.url, response.status, response.data)
    const { code, data, message } = response.data
    
    if (code === 0) {
      return data
    }
    
    // 业务错误
    console.error('[Request] 业务错误:', code, message)
    showToast({
      message: message || '请求失败',
      type: 'fail'
    })
    
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    // 网络错误
    console.error('[Request] 请求错误:', error)
    console.error('[Request] 错误详情:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    })
    
    let message = '网络异常，请稍后重试'
    
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          message = '登录已过期，请重新登录'
          // 清除 token
          localStorage.removeItem('token')
          break
        case 403:
          message = '没有权限访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = `请求失败 (${status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请重试'
    }
    
    showToast({
      message,
      type: 'fail'
    })
    
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  }
}

// 带 loading 的请求
export const requestWithLoading = {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    showLoadingToast({ message: '加载中...', forbidClick: true })
    try {
      const result = await request.get<T>(url, config)
      closeToast()
      return result
    } catch (error) {
      closeToast()
      throw error
    }
  },
  
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    showLoadingToast({ message: '提交中...', forbidClick: true })
    try {
      const result = await request.post<T>(url, data, config)
      closeToast()
      return result
    } catch (error) {
      closeToast()
      throw error
    }
  }
}

export default request
