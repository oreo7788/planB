import request from '@/utils/request'

// 上传凭证响应
export interface UploadTokenResult {
  token: string
  domain: string
  key: string
}

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
  const { token, domain, key } = await getUploadToken()
  
  // 构建 FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', token)
  formData.append('key', key)
  
  // 上传到七牛云
  const response = await fetch('https://upload.qiniup.com', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('上传失败')
  }
  
  const result = await response.json()
  const url = `${domain}/${result.key}`
  const thumbnailUrl = `${url}?imageView2/1/w/300/h/300/q/80`
  
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
