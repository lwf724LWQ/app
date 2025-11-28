<template>
  <view class="mode-select">
    <view class="setting" @click="openSetting = true">设置</view>
    <view class="icon" @click="hide = !hide">
      <uni-icons
        custom-prefix="iconfont"
        :type="data[currentIndex].icon"
        :size="data[currentIndex].size"
        color="#fff"
      ></uni-icons>
    </view>
    <view class="list" :class="{ hide: hide }">
      <view class="item" v-for="(item, index) in data" @click="change(index)" :key="index">
        <view class="item-text">{{ item.text }}</view>
        <uni-icons
          class="item-icon"
          custom-prefix="iconfont"
          :type="item.icon"
          :size="item.size"
          color="#fff"
        ></uni-icons>
      </view>
    </view>

    <!-- 全屏遮罩 -->
    <view class="mask" v-if="!hide" @click="hide = true"></view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const openSetting = defineModel('openSetting')

const mode = defineModel({
  type: String,
  default: '智能曲线'
})
// const index = ref(0)
const currentIndex = ref(0)
const data = [
  { text: '智能曲线', icon: 'icon-quxian', size: '20' },
  { text: '自由线', icon: 'icon-qianbi', size: '18' },
  { text: '直线', icon: 'icon-zhixian', size: '18' },
  { text: '添加文字', icon: 'icon-wenzi' },
  { text: '实心方框', icon: 'icon-shixinfangkuang', size: '18' },
  { text: '空心方框', icon: 'icon-kongxin-fangxing', size: '24' },
  { text: '实心圆框', icon: 'icon-shixinyuan', size: '20' },
  { text: '空心圆框', icon: 'icon-kongxinyuan', size: '20' }
]
const hide = ref(true)

const change = (index) => {
  currentIndex.value = index
  hide.value = true
}

watch(currentIndex, (newVal) => {
  mode.value = data[newVal].text
})
</script>

<style lang="scss" scoped>
.mode-select {
  view {
    box-sizing: border-box;
  }
  height: 80rpx;
  width: 260rpx;
  border-radius: 50rpx 0 0 50rpx;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: end;
  color: #fff;
  position: relative;
  .setting {
    font-size: 30rpx;
    line-height: 32rpx;
    border-right: 3rpx solid #fff;
    text-align: center;
    width: 140rpx;
  }
  .icon {
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    width: 70rpx;
    padding: 10rpx;
    margin-right: 25rpx;
    height: 70rpx;
    margin-left: 5rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .list {
    position: absolute;
    bottom: 83rpx;
    right: 25rpx;
    color: #fff;
    font-size: 25rpx;
    transition: all 0.3s ease-in;
    height: 630rpx;
    overflow: hidden;
    opacity: 1;
    .item {
      display: flex;

      .item-text,
      .item-icon {
        height: 70rpx;
        text-align: center;
        line-height: 70rpx;
      }
      &:not(:last-child) {
        margin-bottom: 10rpx;
      }
      .item-text {
        margin-right: 20rpx;
        background-color: rgba(0, 0, 0, 0.6);
        width: 170rpx;
        border-radius: 35rpx;
      }
      .item-icon {
        width: 70rpx;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
      }
    }
  }
  .hide {
    height: 0;
    opacity: 0;
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
}
</style>
