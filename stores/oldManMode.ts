// stores/oldManMode.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { InjectionKey } from 'vue'

export const useOldManModeStore = defineStore('oldManMode', () => {
  // 从本地存储获取初始值
  const storagValue = uni.getStorageSync('oldManMode')
  const enabled = ref<boolean>(typeof storagValue === 'boolean' ? storagValue : false)
  
  // 切换模式
  function toggleMode(): void {
    enabled.value = !enabled.value
    uni.setStorageSync('oldManMode', enabled.value)
  }
  
  // 设置模式
  function setMode(value: boolean): void {
    enabled.value = value
    uni.setStorageSync('oldManMode', enabled.value)
  }
  
  return { enabled, toggleMode, setMode }
})


export const oldManModeStoreKey = Symbol() as InjectionKey<ReturnType<typeof useOldManModeStore>>