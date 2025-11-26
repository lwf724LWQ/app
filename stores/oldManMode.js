// stores/oldManMode.js
import { defineStore } from 'pinia'
const storagValue = uni.getStorageSync('oldManMode')
export const useOldManModeStore = defineStore('oldManMode', {
  state: () => ({
    enabled: typeof storagValue === 'boolean' ? storagValue : true
  }),
  
  actions: {
    toggleMode() {
      this.enabled = !this.enabled
      uni.setStorageSync('oldManMode', this.enabled)
    },
    
    setMode(value) {
      this.enabled = value
      uni.setStorageSync('oldManMode', this.enabled)
    }
  }
})