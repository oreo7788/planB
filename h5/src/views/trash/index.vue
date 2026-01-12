<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, showSuccessToast, closeToast } from 'vant'
import { useTicketStore } from '@/stores/ticket'
import TicketCard from '@/components/TicketCard.vue'
import type { Ticket } from '@/api/ticket'

const router = useRouter()
const ticketStore = useTicketStore()

const loading = ref(true)

onMounted(async () => {
  try {
    await ticketStore.loadTrashTickets()
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
})

// 点击票据
const onTicketClick = (ticket: Ticket) => {
  // 回收站中的票据点击时显示操作选项
  showActions(ticket)
}

// 显示操作选项
const showActions = async (ticket: Ticket) => {
  try {
    const action = await showConfirmDialog({
      title: ticket.name,
      message: '选择操作',
      showCancelButton: true,
      cancelButtonText: '永久删除',
      confirmButtonText: '恢复票迹',
      cancelButtonColor: '#ee0a24'
    })
    
    // 用户点击了确认（恢复）
    await restoreTicket(ticket)
  } catch (error) {
    // 用户点击了取消（永久删除）或关闭
    if (error === 'cancel') {
      await permanentDeleteTicket(ticket)
    }
  }
}

// 恢复票据
const restoreTicket = async (ticket: Ticket) => {
  showLoadingToast({ message: '恢复中...', forbidClick: true })
  try {
    await ticketStore.recoverTicket(String(ticket.id))
    closeToast()
    showSuccessToast('已恢复')
  } catch (error) {
    closeToast()
    showToast('恢复失败')
  }
}

// 永久删除票据
const permanentDeleteTicket = async (ticket: Ticket) => {
  try {
    await showConfirmDialog({
      title: '确认永久删除',
      message: '删除后将无法恢复，确定要永久删除吗？'
    })
    
    showLoadingToast({ message: '删除中...', forbidClick: true })
    // TODO: 调用永久删除 API
    // await permanentDelete(String(ticket.id))
    ticketStore.trashTickets = ticketStore.trashTickets.filter(t => t.id !== ticket.id)
    closeToast()
    showSuccessToast('已永久删除')
  } catch (error) {
    closeToast()
  }
}

// 清空回收站
const onClearAll = async () => {
  if (ticketStore.trashTickets.length === 0) {
    showToast('回收站为空')
    return
  }
  
  try {
    await showConfirmDialog({
      title: '清空回收站',
      message: '此操作将永久删除回收站中的所有票迹，无法恢复！'
    })
    
    showLoadingToast({ message: '清空中...', forbidClick: true })
    // TODO: 调用批量永久删除 API
    ticketStore.trashTickets = []
    closeToast()
    showSuccessToast('已清空')
  } catch (error) {
    closeToast()
  }
}
</script>

<template>
  <div class="page-container trash-page">
    <!-- 导航栏 -->
    <van-nav-bar title="回收站" left-arrow @click-left="$router.back()">
      <template #right>
        <span class="clear-btn" @click="onClearAll">清空</span>
      </template>
    </van-nav-bar>

    <!-- 提示信息 -->
    <div class="tip-bar">
      <van-icon name="info-o" />
      <span>回收站中的票迹将在 30 天后自动永久删除</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrapper">
      <van-loading type="spinner" />
    </div>

    <template v-else>
      <!-- 空状态 -->
      <div v-if="ticketStore.trashTickets.length === 0" class="empty-state">
        <van-empty description="回收站是空的" />
      </div>

      <!-- 票据列表 -->
      <div v-else class="ticket-list">
        <TicketCard
          v-for="ticket in ticketStore.trashTickets"
          :key="ticket.id"
          :ticket="ticket"
          @click="onTicketClick"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.trash-page {
  background: var(--bg-page);
  min-height: 100vh;
}

.clear-btn {
  font-size: 14px;
  color: #ee0a24;
}

.tip-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #fffbe8;
  font-size: 13px;
  color: #ed6a0c;
  
  .van-icon {
    font-size: 16px;
  }
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
}

.ticket-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
