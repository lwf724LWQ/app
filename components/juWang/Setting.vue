<template>
  <uni-popup ref="settingPopup" type="bottom" border-radius="10px 10px 0 0">
    <view class="drawer">
      <view class="drawer-header">
        <view class="drawer-header-title">通用设置</view>
        <view class="drawer-header-title">皮肤设置</view>
        <view class="drawer-header-title">显示设置</view>
        <view class="drawer-header-title">智能多笔</view>
      </view>
      <view class="drawer-content">
        <view class="common" v-show="crurentPage === '通用设置'">
          <view class="title">字体大小</view>
          <view class="select-1">
            <view>标准</view>
            <view>大号</view>
            <view>超大号</view>
          </view>
          <view class="title">分割线</view>
          <view class="select-2">
            <view>常用分割</view>
            <view>本年分割</view>
            <view>全部分割</view>
          </view>
          <view class="title">号码样式</view>
          <view class="select-3">
            <view v-for="value in 4" :key="value">
              <view>0</view>
              <view>0</view>
              <view></view>
            </view>
          </view>
          <view class="switch">
            <text>数字选择器</text>
            <switch color="#fc3d44" checked />
          </view>
          <view class="switch">
            <text>固体字体</text>
            <switch color="#fc3d44" checked />
          </view>
          <view class="switch">
            <text>底部增加两行</text>
            <switch color="#fc3d44" checked />
          </view>
          <view class="switch">
            <text>去除水印</text>
            <switch color="#fc3d44" checked />
          </view>
          <view class="switch">
            <text>屏幕高亮</text>
            <switch color="#fc3d44" checked />
          </view>
        </view>

        <view class="theme" v-show="crurentPage === '皮肤设置'">
          <view class="title">选择皮肤</view>
          <view class="theme-content">
            <view v-for="value in themeList">
              <image class="image" :src="value.url" mode="aspectFill"></image>
              <view class="theme-text">{{ value.text }}</view>
            </view>
          </view>
        </view>
        <view class="show" v-show="crurentPage === '显示设置'"></view>
        <view class="multi" v-show="crurentPage === '智能多笔'"></view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const settingPopup = ref(null)

const crurentPage = ref('显示设置')

const options = ref({})

// const themeList = ['鸿运', '护眼', '怀旧', '金黄', '金玉', '经典', '护眼', '护眼', '护眼']
const themeList = [
  { text: '经典', url: new URL('@/static/images/draw-line/经典.jpg', import.meta.url).href },
  { text: '护眼', url: new URL('@/static/images/draw-line/护眼.jpg', import.meta.url).href },
  { text: '夜间', url: new URL('@/static/images/draw-line/夜间.jpg', import.meta.url).href },
  { text: '怀旧', url: new URL('@/static/images/draw-line/怀旧.jpg', import.meta.url).href },
  { text: '鸿运', url: new URL('@/static/images/draw-line/鸿运.jpg', import.meta.url).href },
  { text: '金玉', url: new URL('@/static/images/draw-line/金玉.jpg', import.meta.url).href },
  { text: '素棕', url: new URL('@/static/images/draw-line/鸿运.jpg', import.meta.url).href },
  { text: '金黄', url: new URL('@/static/images/draw-line/金黄.jpg', import.meta.url).href },
  { text: '浅蓝', url: new URL('@/static/images/draw-line/浅蓝.jpg', import.meta.url).href }
]

onMounted(() => {
  // settingPopup.value.open()
})
</script>

<style lang="scss" scoped>
.drawer {
  width: 100vw;
  display: flex;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
  view {
    box-sizing: border-box;
  }
  .title {
    font-size: 35rpx;
    font-weight: 600;
  }
  .switch {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
$background-color: #f6f6f6;
$background-color-active: #fc3d44;

.drawer-header {
  width: 170rpx;
  background-color: $background-color;
  .drawer-header-title {
    font-size: 35rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.drawer-content {
  flex: 1;
  height: 1000rpx;
  padding: 30rpx;
  .common {
    > view {
      margin-bottom: 30rpx;
    }
    .select-1,
    .select-2 {
      display: flex;
      justify-content: space-between;
      > view {
        background-color: $background-color;
        width: 160rpx;
        height: 70rpx;
        line-height: 70rpx;
        border-radius: 10rpx;
        text-align: center;
      }
    }
    .select-3 {
      display: flex;
      justify-content: space-between;
      > view {
        background-color: $background-color;
        width: 100rpx;
        height: 60rpx;
        border-radius: 10rpx;
      }
      %number-style {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        position: relative;
        > view:nth-child(-n + 2) {
          width: 35rpx;
          height: 35rpx;
          border: 5rpx solid $background-color-active;
          font-size: 25rpx;
          line-height: 35rpx - 10rpx;
          text-align: center;
          position: relative;
          z-index: 2;
          background-color: $background-color;
        }
        > view:nth-child(3) {
          position: absolute;
          width: 50%;
          height: 3rpx;
          top: 30rpx;
          background-color: $background-color-active;
        }
      }
      > view:nth-child(1) {
        @extend %number-style;
        color: $background-color-active;
      }
      > view:nth-child(2) {
        @extend %number-style;
        color: $background-color-active;
        > view:nth-child(-n + 2) {
          border-radius: 50%;
        }
      }
      > view:nth-child(3) {
        @extend %number-style;
        color: #fff;
        > view:nth-child(-n + 2) {
          width: 40rpx;
          height: 40rpx;
          border: 5rpx solid $background-color;
          background-color: $background-color-active;
          line-height: 40rpx - 10rpx;
        }
      }
      > view:nth-child(4) {
        @extend %number-style;
        color: #fff;
        > view:nth-child(-n + 2) {
          width: 40rpx;
          height: 40rpx;
          border: 5rpx solid #fff;
          background-color: $background-color-active;
          border-radius: 50%;
          line-height: 40rpx - 10rpx;
        }
      }
    }
  }
  .theme {
    .title {
      margin-bottom: 30rpx;
    }
    .theme-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 50rpx 0;
      > view {
        width: 150rpx;
        border-radius: 10rpx;
        .image {
          width: 150rpx;
          height: 100rpx !important;
          border-radius: 10rpx;
        }
        .theme-text {
          width: 100%;
          height: 70rpx;
          line-height: 70rpx;
          text-align: center;
          font-size: 30rpx;
        }
      }
    }
  }
}
</style>
