import request from '@/utils/request'

// 用户信息接口
export interface UserInfo {
  id: string
  openid: string
  nickName?: string
  avatarUrl?: string
  phone?: string
  ticketCount: number
  photoCount: number
  photoQuota: number
  createdAt: string
  updatedAt: string
}

// 更新用户信息参数
export interface UpdateUserParams {
  nickName?: string
  avatarUrl?: string
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return request.get('/user/profile')
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: UpdateUserParams): Promise<UserInfo> {
  return request.put('/user/profile', data)
}

/**
 * 绑定手机号
 */
export function bindPhone(code: string): Promise<{ phone: string }> {
  return request.post('/auth/bind-phone', { code })
}

/**
 * 解绑手机号
 */
export function unbindPhone(): Promise<void> {
  return request.post('/auth/unbind-phone')
}
