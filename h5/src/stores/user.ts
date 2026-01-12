import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo, type UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const ticketCount = computed(() => userInfo.value?.ticketCount || 0)
  const photoCount = computed(() => userInfo.value?.photoCount || 0)
  const photoQuota = computed(() => userInfo.value?.photoQuota || 100)
  const usagePercent = computed(() => {
    if (!photoQuota.value) return 0
    return Math.min(100, Math.round((photoCount.value / photoQuota.value) * 100))
  })
  
  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    // 同时存储到 localStorage
    localStorage.setItem('token', newToken)
  }
  
  function clearToken() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }
  
  async function fetchUserInfo() {
    if (!token.value) return
    
    try {
      const info = await getUserInfo()
      userInfo.value = info
    } catch (error) {
      console.error('[UserStore] 获取用户信息失败:', error)
    }
  }
  
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }
  
  // 初始化：从 localStorage 恢复 token
  function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }
  
  // 执行初始化
  init()
  
  return {
    // State
    token,
    userInfo,
    
    // Getters
    isLoggedIn,
    ticketCount,
    photoCount,
    photoQuota,
    usagePercent,
    
    // Actions
    setToken,
    clearToken,
    fetchUserInfo,
    updateUserInfo
  }
})
