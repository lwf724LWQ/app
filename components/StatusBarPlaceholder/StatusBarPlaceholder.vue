<!-- 为了适配移动端电量显示而写的 -->
<template>
  <view class="status-bar-white" :style="barStyle"></view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const statusBarHeight = ref('0px')
const safeAreaInsets = ref({ top: 0 })

// 计算样式
const barStyle = computed(() => {
  return {
    height: statusBarHeight.value,
    paddingTop: `${safeAreaInsets.value.top || 0}px`,
    backgroundColor: '#ffffff'
  }
})

// 获取系统信息
const getSystemInfo = () => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    
    // 获取状态栏高度
    statusBarHeight.value = `${systemInfo.statusBarHeight || 0}px`
    
    // 获取安全区域信息（iOS刘海屏等）
    if (systemInfo.safeArea) {
      safeAreaInsets.value = systemInfo.safeArea
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    // 设置默认值
    statusBarHeight.value = '20px'
  }
}

// 组件挂载时获取系统信息
onMounted(() => {
  getSystemInfo()
})
</script>

<style scoped>
.status-bar-white {
  width: 100%;
  top: 0;
  left: 0;
  box-sizing: border-box;
}
</style>