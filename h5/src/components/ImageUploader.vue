<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast, showLoadingToast, showSuccessToast, closeToast } from 'vant'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
  'upload-success': [result: { url: string; thumbnailUrl: string }]
}>()

const imageUrl = ref(props.modelValue || '')
const uploading = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    imageUrl.value = val || ''
  }
)

// 压缩图片
const compressImage = (file: File, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 1200
        let { width, height } = img
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        
        // 返回 base64
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 选择并上传图片
const handleUpload = async () => {
  try {
    uploading.value = true
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        showLoadingToast({ message: '处理中...', forbidClick: true })
        
        // 压缩图片并转为 base64
        const base64Url = await compressImage(file, 0.8)
        
        imageUrl.value = base64Url
        emit('update:modelValue', base64Url)
        emit('upload-success', { url: base64Url, thumbnailUrl: base64Url })
        
        closeToast()
        showSuccessToast('添加成功')
      } catch (error) {
        closeToast()
        showToast({ message: '处理失败', type: 'fail' })
      }
    }
    
    input.click()
  } catch (error: any) {
    closeToast()
    if (error.message !== 'user_cancel') {
      showToast({ message: '处理失败', type: 'fail' })
    }
  } finally {
    uploading.value = false
  }
}

// 删除图片
const handleDelete = () => {
  imageUrl.value = ''
  emit('update:modelValue', undefined)
}

// 预览图片
const handlePreview = () => {
  if (imageUrl.value) {
    // 使用 Vant 的图片预览
  }
}
</script>

<template>
  <div class="image-uploader">
    <!-- 已上传的图片 -->
    <div v-if="imageUrl" class="image-preview" @click="handlePreview">
      <img :src="imageUrl" class="preview-img" />
      <div class="delete-btn" @click.stop="handleDelete">
        <van-icon name="cross" />
      </div>
    </div>
    
    <!-- 上传按钮 -->
    <div v-else class="upload-area group" @click="handleUpload">
      <van-loading v-if="uploading" type="spinner" color="#10b981" />
      <template v-else>
        <div class="icon-wrapper">
          <van-icon name="photograph" size="32" class="upload-icon" />
        </div>
        <div class="text-wrapper">
          <p class="main-text">添加票据照片</p>
          <p class="sub-text">支持 JPG, PNG, WEBP</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-uploader {
  width: 100%;
}

.image-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  background: #fff;
  
  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .delete-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &:active {
      transform: scale(0.95);
    }
    
    .van-icon {
      color: #fff;
      font-size: 16px;
    }
  }
}

.upload-area {
  width: 100%;
  aspect-ratio: 4/3;
  background: #ffffff;
  border-radius: 32px;
  border: 2px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:active {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.02);
    
    .icon-wrapper {
      background: #d1fae5;
      color: #10b981;
    }
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    transition: all 0.2s ease;
    
    .upload-icon {
      font-size: 32px;
    }
  }

  .text-wrapper {
    text-align: center;
    
    .main-text {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
    }
    
    .sub-text {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  }
}
</style>
