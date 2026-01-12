<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog, showLoadingToast, showSuccessToast, closeToast } from 'vant'
import { getTagList, createTag, updateTag, deleteTag, type Tag } from '@/api/tag'

const loading = ref(true)
const tags = ref<Tag[]>([])

// 分类标签
const globalTags = computed(() => tags.value.filter(t => t.type === 'global'))
const customTags = computed(() => tags.value.filter(t => t.type === 'custom'))

// 弹窗控制
const showAddPopup = ref(false)
const showEditPopup = ref(false)
const editingTag = ref<Tag | null>(null)

// 表单数据
const form = ref({
  name: '',
  color: '#07c160'
})

// 预设颜色
const colorOptions = [
  '#07c160', '#FF6B6B', '#9B59B6', '#3498DB', '#1ABC9C',
  '#2ECC71', '#F39C12', '#E74C3C', '#34495E', '#95A5A6'
]

onMounted(async () => {
  await loadTags()
})

// 加载标签
const loadTags = async () => {
  try {
    tags.value = await getTagList()
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 打开添加弹窗
const openAddPopup = () => {
  form.value = { name: '', color: '#07c160' }
  showAddPopup.value = true
}

// 打开编辑弹窗
const openEditPopup = (tag: Tag) => {
  if (tag.type === 'global') {
    showToast('全局标签不可编辑')
    return
  }
  editingTag.value = tag
  form.value = { name: tag.name, color: tag.color }
  showEditPopup.value = true
}

// 添加标签
const onAdd = async () => {
  if (!form.value.name.trim()) {
    showToast('请输入标签名称')
    return
  }

  showLoadingToast({ message: '创建中...', forbidClick: true })
  try {
    const newTag = await createTag({
      name: form.value.name,
      color: form.value.color
    })
    tags.value.push(newTag)
    showAddPopup.value = false
    closeToast()
    showSuccessToast('创建成功')
  } catch (error) {
    closeToast()
    showToast('创建失败')
  }
}

// 更新标签
const onUpdate = async () => {
  if (!form.value.name.trim() || !editingTag.value) {
    showToast('请输入标签名称')
    return
  }

  showLoadingToast({ message: '更新中...', forbidClick: true })
  try {
    const updated = await updateTag(String(editingTag.value.id), {
      name: form.value.name,
      color: form.value.color
    })
    const index = tags.value.findIndex(t => t.id === editingTag.value?.id)
    if (index !== -1) {
      tags.value[index] = updated
    }
    showEditPopup.value = false
    closeToast()
    showSuccessToast('更新成功')
  } catch (error) {
    closeToast()
    showToast('更新失败')
  }
}

// 删除标签
const onDelete = async () => {
  if (!editingTag.value) return

  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '删除后，所有使用此标签的票迹将同步移除该标签'
    })

    showLoadingToast({ message: '删除中...', forbidClick: true })
    await deleteTag(String(editingTag.value.id))
    tags.value = tags.value.filter(t => t.id !== editingTag.value?.id)
    showEditPopup.value = false
    closeToast()
    showSuccessToast('删除成功')
  } catch (error) {
    closeToast()
  }
}
</script>

<template>
  <div class="page-container tags-page">
    <!-- 导航栏 -->
    <van-nav-bar title="标签管理" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="openAddPopup" />
      </template>
    </van-nav-bar>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-wrapper">
      <van-loading type="spinner" />
    </div>

    <template v-else>
      <!-- 全局标签 -->
      <div class="tag-section">
        <h3 class="section-title">推荐标签</h3>
        <div class="tag-list">
          <div
            v-for="tag in globalTags"
            :key="tag.id"
            class="tag-item"
            :style="{ borderColor: tag.color }"
          >
            <span class="tag-dot" :style="{ backgroundColor: tag.color }"></span>
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">{{ tag.usageCount }}</span>
          </div>
        </div>
      </div>

      <!-- 自定义标签 -->
      <div class="tag-section">
        <h3 class="section-title">我的标签</h3>
        <div v-if="customTags.length === 0" class="empty-tip">
          暂无自定义标签，点击右上角添加
        </div>
        <div v-else class="tag-list">
          <div
            v-for="tag in customTags"
            :key="tag.id"
            class="tag-item editable"
            :style="{ borderColor: tag.color }"
            @click="openEditPopup(tag)"
          >
            <span class="tag-dot" :style="{ backgroundColor: tag.color }"></span>
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">{{ tag.usageCount }}</span>
            <van-icon name="arrow" class="tag-arrow" />
          </div>
        </div>
      </div>
    </template>

    <!-- 添加标签弹窗 -->
    <van-popup
      v-model:show="showAddPopup"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <h3 class="popup-title">添加标签</h3>
      <van-field
        v-model="form.name"
        label="名称"
        placeholder="请输入标签名称"
        maxlength="10"
      />
      <div class="color-picker">
        <span class="color-label">颜色</span>
        <div class="color-options">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-item"
            :class="{ active: form.color === color }"
            :style="{ backgroundColor: color }"
            @click="form.color = color"
          >
            <van-icon v-if="form.color === color" name="success" color="#fff" />
          </div>
        </div>
      </div>
      <van-button block type="primary" @click="onAdd">确定</van-button>
    </van-popup>

    <!-- 编辑标签弹窗 -->
    <van-popup
      v-model:show="showEditPopup"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <h3 class="popup-title">编辑标签</h3>
      <van-field
        v-model="form.name"
        label="名称"
        placeholder="请输入标签名称"
        maxlength="10"
      />
      <div class="color-picker">
        <span class="color-label">颜色</span>
        <div class="color-options">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-item"
            :class="{ active: form.color === color }"
            :style="{ backgroundColor: color }"
            @click="form.color = color"
          >
            <van-icon v-if="form.color === color" name="success" color="#fff" />
          </div>
        </div>
      </div>
      <div class="popup-actions">
        <van-button block type="primary" @click="onUpdate">保存</van-button>
        <van-button block plain type="danger" @click="onDelete">删除标签</van-button>
      </div>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.tags-page {
  background: var(--bg-page);
  min-height: 100vh;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
}

.tag-section {
  padding: 16px;
  
  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0 0 12px;
  }
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border-left: 3px solid;
  
  &.editable {
    cursor: pointer;
  }
  
  .tag-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 12px;
  }
  
  .tag-name {
    flex: 1;
    font-size: 15px;
    color: var(--text-primary);
  }
  
  .tag-count {
    font-size: 13px;
    color: var(--text-placeholder);
    margin-right: 8px;
  }
  
  .tag-arrow {
    color: var(--text-placeholder);
  }
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: var(--text-placeholder);
}

.popup-title {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 20px;
}

.color-picker {
  padding: 12px 16px;
  
  .color-label {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .color-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }
  
  .color-item {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &.active {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
    }
  }
}

.popup-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}
</style>
