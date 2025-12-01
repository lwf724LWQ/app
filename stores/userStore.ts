// stores/userStore.ts
import { defineStore } from 'pinia'

interface UserInfo {
    nickname: string
    avatar: string
    account: string
}

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: uni.getStorageSync('userInfo') as UserInfo | null,
        isLoggedIn: false,
        token: uni.getStorageSync('token') || ""
    }),

    getters: {
        getUserInfo(): UserInfo | null {
            return this.userInfo
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
            this.userInfo = info
            this.isLoggedIn = true
            if (token) {
                this.setToken(token)
            }
            // 使用 uni.setStorageSync 持久化存储用户信息
            try {
            uni.setStorageSync('userInfo', info)
            } catch (error) {
            console.error('存储用户信息失败:', error)
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