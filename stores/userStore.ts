// stores/userStore.ts
import { defineStore } from 'pinia'

interface UserInfo {
    nickname: string
    avatar: string
    account: string
    agent: number
}

function hanldeAvatar(str: string): string {
	if (str) {
	  if (str.startsWith('http')) {
	    return str
	  } else {
	    // 相对路径，拼接完整URL
	    return `http://video.caimizm.com/himg/${str}`;
	  }
	}
	return 'http://video.caimizm.com/himg/user.png' // 默认头像
}

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: uni.getStorageSync('userInfo') as UserInfo | null,
        isLoggedIn: false,
        token: uni.getStorageSync('token') || ""
    }),

    getters: {
        getUserInfo(): UserInfo | null {
            return Object.assign({}, this.userInfo, {avatar: hanldeAvatar(this.userInfo?.avatar)})
        },

        getIsLoggedIn(): boolean {
            return this.isLoggedIn
        },

        getToken(): string {
            return this.token
        },
    },

    actions: {
        /**
         * 更新用户信息并持久化存储
         * @param info 用户信息对象
         */
        updateUserInfo(info: UserInfo, token?: string) {
            this.userInfo = {...this.userInfo,...info}
            this.isLoggedIn = true
            if (token) {
                this.setToken(token)
            }
            // 使用 uni.setStorageSync 持久化存储用户信息
            try {
				uni.setStorageSync('userInfo', this.userInfo)
            } catch (error) {
				console.error('存储用户信息失败:', error)
            }
        },
        upUserAgent(agent: number) {
            if (this.userInfo) {
                this.userInfo.agent = agent
                this.updateUserInfo(this.userInfo)
            }
        },

        /**
         * 从存储中获取用户信息
         */
        loadUserInfo() {
            try {
                const storedUserInfo = uni.getStorageSync('userInfo')
            if (storedUserInfo) {
                this.userInfo = storedUserInfo
                this.isLoggedIn = true
            } else {
                this.clearUserInfo()
            }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                this.clearUserInfo()
            }
        },

        /**
         * 修改头像
         */
        updateAvatar(avatar: string) {
            if (this.userInfo) {
                this.userInfo.avatar = avatar
                this.updateUserInfo(this.userInfo)
            }
        },

        /**
         * 清除用户信息
         */
        clearUserInfo() {
            this.userInfo = null
            this.isLoggedIn = false
            this.token = ""
            try {
                uni.removeStorageSync('userInfo')
                uni.removeStorageSync('token')
                uni.removeStorageSync('account')
                uni.removeStorageSync('password')
            } catch (error) {
                console.error('清除用户信息失败:', error)
            }
        },

        setToken(token: string){
            this.token = token
            uni.setStorageSync('token', token)
        }
    }
})