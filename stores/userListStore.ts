// stores/userListStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiUserimg } from "@/api/apis"

// 定义用户信息类型
interface UserInfo {
  account: string
  username: string
  avatar?: string
  // 可以根据实际需求添加更多字段
}

// 定义缓存项类型
interface CachedUser {
  data: UserInfo
  timestamp: number
}

export const useUserListStore = defineStore('userList', () => {
  // 存储用户信息缓存
  const userCache = ref<Record<string, CachedUser>>({})
  
  // 存储正在进行的请求Promise
  const pendingRequests = ref<Record<string, Promise<UserInfo>>>({})
  
  // 过期时间（1分钟 = 60000毫秒）
  const EXPIRE_TIME = 1 * 60 * 1000

  /**
   * 获取用户信息
   * @param account 用户账号
   * @returns 用户信息
   */
  const getUserInfo = async (account: string): Promise<UserInfo> => {
    const now = Date.now()
    
    // 检查是否有正在进行的相同请求
    if (pendingRequests.value[account]) {
      return pendingRequests.value[account]
    }
    
    // 检查缓存是否存在且未过期
    if (userCache.value[account]) {
      const cached = userCache.value[account]
      
      // 如果未过期，直接返回缓存数据
      if (now - cached.timestamp < EXPIRE_TIME) {
        return cached.data
      }
    }
    
    // 缓存不存在或已过期，创建新的请求Promise
    const requestPromise = fetchUserInfoFromAPI(account)
    
    // 将Promise存入pendingRequests中
    pendingRequests.value[account] = requestPromise
    
    try {
      // 等待请求结果
      const userData = await requestPromise
      
      // 更新缓存
      userCache.value[account] = {
        data: userData,
        timestamp: now
      }
      
      return userData
    } finally {
      // 请求完成后从pendingRequests中移除
      delete pendingRequests.value[account]
    }
  }

  /**
   * 从 API 获取用户信息的接口
   * @param account 用户账号
   * @returns 用户信息
   */
  const fetchUserInfoFromAPI = async (account: string): Promise<UserInfo> => {
    const res = await apiUserimg({account})
    
    // 返回用户数据
    return {
      account,
      username: res.data.uname,
      avatar: res.data.himg ? `http://video.caimizm.com/himg/${res.data.himg}` : 'http://video.caimizm.com/himg/user.png'
    }
  }

  /**
   * 清除指定用户的缓存
   * @param account 用户账号
   */
  const clearUserCache = (account: string) => {
    delete userCache.value[account]
  }

  /**
   * 清除所有用户缓存
   */
  const clearAllCache = () => {
    userCache.value = {}
  }

  /**
   * 手动更新用户信息缓存
   * @param account 用户账号
   * @param userInfo 用户信息
   */
  const updateUserCache = (account: string, userInfo: UserInfo) => {
    userCache.value[account] = {
      data: userInfo,
      timestamp: Date.now()
    }
  }

  return {
    getUserInfo,
    clearUserCache,
    clearAllCache,
    updateUserCache,
    userCache
  }
})