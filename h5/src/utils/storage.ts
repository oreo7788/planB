// 本地存储工具

const PREFIX = 'piaoji_'

export const storage = {
  /**
   * 设置存储项
   */
  set(key: string, value: any, expire?: number): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null
    }
    localStorage.setItem(PREFIX + key, JSON.stringify(data))
  },
  
  /**
   * 获取存储项
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const item = localStorage.getItem(PREFIX + key)
    if (!item) return defaultValue
    
    try {
      const data = JSON.parse(item)
      
      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        localStorage.removeItem(PREFIX + key)
        return defaultValue
      }
      
      return data.value as T
    } catch {
      return defaultValue
    }
  },
  
  /**
   * 移除存储项
   */
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },
  
  /**
   * 清空所有存储项
   */
  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Session 存储（仅当前会话有效）
export const sessionStorage = {
  set(key: string, value: any): void {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
  },
  
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const item = window.sessionStorage.getItem(PREFIX + key)
    if (!item) return defaultValue
    
    try {
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  },
  
  remove(key: string): void {
    window.sessionStorage.removeItem(PREFIX + key)
  }
}
