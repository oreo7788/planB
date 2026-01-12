import request from '@/utils/request'

// 标签接口
export interface Tag {
  id: string
  name: string
  type: 'global' | 'custom'
  userId?: string
  color: string
  icon?: string
  usageCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 创建标签参数
export interface CreateTagParams {
  name: string
  color?: string
  icon?: string
}

// 更新标签参数
export interface UpdateTagParams {
  name?: string
  color?: string
  icon?: string
  isActive?: boolean
}

/**
 * 获取标签列表
 */
export function getTagList(): Promise<Tag[]> {
  return request.get('/tags')
}

/**
 * 获取全局标签
 */
export function getGlobalTags(): Promise<Tag[]> {
  return request.get('/tags/global')
}

/**
 * 获取用户自定义标签
 */
export function getUserTags(): Promise<Tag[]> {
  return request.get('/tags/custom')
}

/**
 * 创建标签
 */
export function createTag(data: CreateTagParams): Promise<Tag> {
  return request.post('/tags', data)
}

/**
 * 更新标签
 */
export function updateTag(id: string, data: UpdateTagParams): Promise<Tag> {
  return request.put(`/tags/${id}`, data)
}

/**
 * 删除标签
 */
export function deleteTag(id: string): Promise<void> {
  return request.delete(`/tags/${id}`)
}
