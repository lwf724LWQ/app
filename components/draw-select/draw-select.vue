<template>
  <view class="fab-container">
    <!-- FAB弹窗 -->
    <view
        class="fab-popup"
        :class="{ 'fab-popup-visible': showFab }"
        @click.stop
    >
      <!-- 关闭按钮 -->
      <view class="fab-close" @click="showFab = false">
        <i class="close-icon">×</i>
      </view>
      <view class="container">
        <!-- 号码选择区域 -->
        <view class="section">
          <view class="section-title">
            <i class="fa fa-hashtag"></i>
            <text class="section-title-text">选择号码</text>
          </view>
          <view class="circle-grid">
            <view 
              v-for="num in numbers" 
              :key="num"
              class="circle-item"
              @click="selectOption(num)"
            >
              <text>{{ num }}</text>
            </view>
          </view>
        </view>
        <!-- 对数选择区域 -->
        <view class="section">
          <view class="section-title">
            <i class="fa fa-exchange"></i>
            <text class="section-title-text">选择对数</text>
          </view>
          <view class="circle-grid">
            <view 
              v-for="pair in pairs" 
              :key="pair"
              class="circle-item"
              @click="selectOption(pair)"
            >
              <text>{{ pair }}</text>
            </view>
          </view>
        </view>
        <!-- 其他选择区域 -->
        <view class="section">
          <view class="section-title">
            <i class="fa fa-cog"></i>
            <text class="section-title-text">选择其他</text>
          </view>
          <view class="circle-grid">
            <view 
              v-for="item in others" 
              :key="item"
              class="circle-item"
              @click="selectOption(item)"
            >
              <text>{{ item }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 背景遮罩 -->
    <view
        class="fab-overlay"
        :class="{ 'fab-overlay-visible': showFab }"
        @click="showFab = false"
    ></view>
  </view>
</template>

<script setup>
import {ref, defineExpose, computed} from "vue"
// 获取emit函数
const  emit  = defineEmits(['message-from-child']);
// 数据定义
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const pairs = ['0/5', '1/6', '2/7', '3/8', '4/9'];
const others = ['单', '双', '大', '小', 'X'];

// 存储当前选择的选项
const selectedOption = ref('');

// 选择选项的方法
const selectOption = (option) => {
  selectedOption.value = option;
  showFab.value=false
  console.log('选择的内容:', option);
  emit('message-from-child', selectedOption.value);
};
// 控制FAB显示状态
const showFab = ref(false);
defineExpose({
  showFab,
})

</script>

<style lang="scss" scoped>
.container {
  background-color: #f3f4f6;
}

.card {
  background-color: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.title {
  text-align: center;
  margin-bottom: 32rpx;
}

.title-text {
  font-size: 24rpx;
  font-weight: bold;
  color: #1e293b;
}

.title-text i {
  color: #3b82f6;
  margin-right: 8rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title i {
  color: #3b82f6;
  font-size: 20rpx;
  margin-right: 8rpx;
}

.section-title-text {
  margin: 20rpx;
  font-size: 40rpx;
  font-weight: 600;
  color: #989898;
}

.circle-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
}

.circle-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 未选中状态 */
.unselected {
  background-color: #ffffff;
  border: 2rpx solid #d1d5db;
  color: #374151;
}

.unselected:active {
  transform: scale(0.95);
}

.unselected:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.2);
}

/* 选中状态 */
.selected {
  background-color: #8b5cf6;
  border: 2rpx solid #8b5cf6;
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.3);
  transform: scale(1.05);
}

.selected:active {
  transform: scale(1);
}

/* 结果区域 */
.result-section {
  margin-top: 24rpx;
  padding: 16rpx;
  background-color: #f8fafc;
  border-radius: 8rpx;
  border: 1rpx solid #e2e8f0;
}

.result-title {
  font-size: 16rpx;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12rpx;
}

.result-content {
  color: #64748b;
  line-height: 1.6;
}

.result-label {
  font-weight: 600;
  color: #334155;
  margin-right: 4rpx;
}

/* 触发按钮样式 */
.fab-trigger {
  position: fixed;
  bottom: 30rpx;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #007aff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.4);
  z-index: 999;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fab-trigger:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 5rpx rgba(0, 122, 255, 0.4);
}

/* 弹窗样式 */
.fab-popup {
  position: fixed;
  bottom: 100rpx;
  right: 30rpx;
  width: 500rpx;
  border-radius: 10rpx;
  background-color: white;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  transform: translateY(20rpx) scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

/* 弹窗显示状态 */
.fab-popup-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

/* 关闭按钮 */
.fab-close {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  cursor: pointer;
  z-index: 1001;
}

.fab-close:active {
  background-color: #e0e0e0;
}

/* 内容区域 */
.fab-content {
  padding: 15rpx 10rpx 10rpx;
}

/* FAB选项项 */
.fab-item {
  display: flex;
  align-items: center;
  padding: 10rpx 15rpx;
  border-radius: 6rpx;
  cursor: pointer;
  transition: background-color 0.2s;
}

.fab-item:active {
  background-color: #f5f5f5;
}

.item-icon {
  font-size: 20rpx;
  margin-right: 10rpx;
  width: 24rpx;
  text-align: center;
}

.item-text {
  font-size: 16rpx;
  color: #333;
}

/* 背景遮罩 */
.fab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 998;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.fab-overlay-visible {
  opacity: 1;
  pointer-events: auto;
}
</style>