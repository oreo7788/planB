import request from '@/utils/request'

// 上传凭证响应
export interface UploadTokenResult {
  token: string
  domain: string
  key: string
  uploadUrl?: string  // 上传域名（可选，由后端返回）
}

// 七牛云上传域名（华南区域 z2）
// 不同区域对应不同域名：
// 华东 z0: https://upload.qiniup.com
// 华北 z1: https://up-z1.qiniup.com
// 华南 z2: https://up-z2.qiniup.com
// 北美 na0: https://up-na0.qiniup.com
// 东南亚 as0: https://up-as0.qiniup.com
const QINIU_UPLOAD_URL = 'https://up-z2.qiniup.com'

/**
 * 获取上传凭证
 */
export function getUploadToken(): Promise<UploadTokenResult> {
  return request.post('/upload/token')
}

/**
 * 上传图片到七牛云
 */
export async function uploadImage(file: File): Promise<{ url: string; thumbnailUrl: string }> {
  // 获取上传凭证
  const { token, domain, key, uploadUrl } = await getUploadToken()
  
  // 构建 FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', token)
  formData.append('key', key)
  
  // 上传到七牛云（优先使用后端返回的上传域名）
  const targetUrl = uploadUrl || QINIU_UPLOAD_URL
  const response = await fetch(targetUrl, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Upload] 上传失败:', errorText)
    throw new Error('上传失败')
  }
  
  const result = await response.json()
  const url = `${domain}/${result.key}`
  const thumbnailUrl = `${url}?imageView2/1/w/300/h/300/q/80`
  
  console.log('[Upload] 上传成功:', { url, thumbnailUrl })
  return { url, thumbnailUrl }
}

/**
 * 压缩图片
 */
export function compressImage(file: File, quality = 0.8, maxWidth = 1920): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        // 等比缩放
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建 canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('压缩失败'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}
