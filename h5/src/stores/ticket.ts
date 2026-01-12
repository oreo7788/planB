import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Ticket, TicketListParams, CreateTicketParams } from '@/api/ticket'
import { createTicket, updateTicket, deleteTicket, restoreTicket, permanentDeleteTicket, getTicketList, getTicketDetail } from '@/api/ticket'

const STORAGE_KEY = 'piaoji_tickets'
const TRASH_STORAGE_KEY = 'piaoji_trash'

// 从 localStorage 加载数据
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

// 保存到 localStorage
function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('[Storage] 保存失败:', e)
  }
}

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export const useTicketStore = defineStore('ticket', () => {
  // State - 从本地存储初始化
  const tickets = ref<Ticket[]>(loadFromStorage(STORAGE_KEY, []))
  const trashTickets = ref<Ticket[]>(loadFromStorage(TRASH_STORAGE_KEY, []))
  const currentTicket = ref<Ticket | null>(null)
  const loading = ref(false)
  const hasMore = ref(false)
  
  // 监听变化自动保存
  watch(tickets, (val) => saveToStorage(STORAGE_KEY, val), { deep: true })
  watch(trashTickets, (val) => saveToStorage(TRASH_STORAGE_KEY, val), { deep: true })
  
  // Getters
  const ticketCount = computed(() => tickets.value.length)
  
  // Actions
  async function loadTickets(params: TicketListParams = {}, refresh = false) {
    loading.value = true
    
    try {
      const result = await getTicketList(params)
      if (refresh) {
        tickets.value = result.list
      } else {
        tickets.value = [...tickets.value, ...result.list]
      }
      hasMore.value = result.hasMore
    } catch (error) {
      console.error('[TicketStore] 加载票据列表失败:', error)
      // 失败时从本地加载
      tickets.value.sort((a, b) => {
        const dateA = new Date(a.sortTime || a.createdAt).getTime()
        const dateB = new Date(b.sortTime || b.createdAt).getTime()
        return dateB - dateA
      })
    }
    
    loading.value = false
  }
  
  async function loadTrashTickets() {
    // 从本地存储加载回收站
    trashTickets.value = loadFromStorage(TRASH_STORAGE_KEY, [])
  }
  
  async function loadTicketDetail(id: string) {
    try {
      const ticket = await getTicketDetail(id)
      currentTicket.value = ticket
      // 更新本地列表中的票据
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = ticket
      }
      return ticket
    } catch (error) {
      // 失败时从本地查找
      const ticket = tickets.value.find(t => t.id === id)
      if (ticket) {
        currentTicket.value = ticket
        return ticket
      }
      throw new Error('票据不存在')
    }
  }
  
  async function addTicket(data: CreateTicketParams) {
    console.log('[TicketStore] addTicket 被调用，数据:', data)
    try {
      // 调用后端 API 创建票据
      console.log('[TicketStore] 准备调用 createTicket API')
      const ticket = await createTicket(data)
      console.log('[TicketStore] createTicket API 返回:', ticket)
      
      // 添加到列表开头
      tickets.value = [ticket, ...tickets.value]
      console.log('[TicketStore] 创建票据成功:', ticket.name)
      return ticket
    } catch (error) {
      console.error('[TicketStore] 创建票据失败:', error)
      throw error
    }
  }
  
  async function editTicket(id: string, data: Partial<CreateTicketParams>) {
    try {
      // 调用后端 API 更新票据
      const ticket = await updateTicket(id, data)
      
      // 更新本地列表
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = ticket
      }
      
      if (currentTicket.value?.id === id) {
        currentTicket.value = ticket
      }
      
      console.log('[TicketStore] 更新票据成功:', ticket.name)
      return ticket
    } catch (error) {
      console.error('[TicketStore] 更新票据失败:', error)
      throw error
    }
  }
  
  async function removeTicket(id: string) {
    try {
      // 调用后端 API 删除票据
      await deleteTicket(id)
      
      // 更新本地状态
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        const ticket = tickets.value[index]
        // 移动到回收站
        ticket.isDeleted = true
        ticket.deletedAt = new Date().toISOString()
        trashTickets.value = [ticket, ...trashTickets.value]
        // 从列表移除
        tickets.value = tickets.value.filter(t => t.id !== id)
        console.log('[TicketStore] 删除票据成功:', ticket.name)
      }
    } catch (error) {
      console.error('[TicketStore] 删除票据失败:', error)
      throw error
    }
  }
  
  async function recoverTicket(id: string) {
    try {
      // 调用后端 API 恢复票据
      const ticket = await restoreTicket(id)
      
      // 更新本地状态
      const index = trashTickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        // 恢复票据
        ticket.isDeleted = false
        ticket.deletedAt = undefined
        tickets.value = [ticket, ...tickets.value]
        // 从回收站移除
        trashTickets.value = trashTickets.value.filter(t => t.id !== id)
        console.log('[TicketStore] 恢复票据成功:', ticket.name)
      }
    } catch (error) {
      console.error('[TicketStore] 恢复票据失败:', error)
      throw error
    }
  }
  
  async function permanentDelete(id: string) {
    try {
      // 调用后端 API 永久删除票据
      await permanentDeleteTicket(id)
      
      // 更新本地状态
      trashTickets.value = trashTickets.value.filter(t => t.id !== id)
      console.log('[TicketStore] 永久删除票据成功')
    } catch (error) {
      console.error('[TicketStore] 永久删除票据失败:', error)
      throw error
    }
  }
  
  function resetList() {
    // 游客模式不需要重置
  }
  
  return {
    // State
    tickets,
    trashTickets,
    currentTicket,
    loading,
    hasMore,
    
    // Getters
    ticketCount,
    
    // Actions
    loadTickets,
    loadTrashTickets,
    loadTicketDetail,
    addTicket,
    editTicket,
    removeTicket,
    recoverTicket,
    permanentDelete,
    resetList
  }
})
