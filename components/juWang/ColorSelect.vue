<template>
  <view class="color-select" :class="{ open: isClose }">
    <view class="btn" @click="isClose = !isClose">
      <uni-icons
        custom-prefix="iconfont"
        :type="sizeIcon[sizes.indexOf(size)]"
        size="30"
        color="#FEFDF8"
      >
      </uni-icons>
    </view>

    <scroll-view scroll-y :show-scrollbar="false" class="list-top">
      <view
        class="item"
        v-for="c in colors"
        :key="c"
        :style="`background-color: ${c};`"
        :class="{ 'color-active': c === color }"
        @click="changeColor(c)"
      ></view>
    </scroll-view>
    <scroll-view scroll-x :show-scrollbar="false" class="list-right">
      <view class="list">
        <view
          class="item"
          v-for="(icon, index) in sizeIcon"
          :key="icon"
          :class="{ 'size-active': size === sizes[index] }"
          @click="changeSize(sizes[index])"
        >
          <uni-icons custom-prefix="iconfont" :type="icon" size="30" color="#FEFDF8"></uni-icons>
        </view>
      </view>
    </scroll-view>

    <view class="reset" v-if="previousColor" @click.stop="resetColor">
      <uni-icons custom-prefix="iconfont" type="icon-reset" size="15" color="#FEFDF8"> </uni-icons>
    </view>

    <view class="animation" :class="{ 'animation-active': animation }"></view>

    <!-- 全屏遮罩 -->
    <view class="mask" v-if="!isClose" @click="isClose = true"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 上一个颜色
const previousColor = ref('')
const animation = ref(false)

const color = defineModel('color', {
  type: String,
  default: '#f2232b'
})

const size = defineModel('size', {
  type: Number,
  default: 0
})
const colors = [
  '#f2232b',
  '#2f54eb',
  '#fa531c',
  '#13c2c2',
  '#fa8b15',
  '#1791ff',
  '#faad17',
  '#53c41a',
  '#fbdb16',
  '#722ed1',
  '#a0d911',
  '#ec2f96',
  '#bfbfbf',
  '#252628',
  '#795547',
  '#607d8b'
]
const sizeIcon = ['icon-cebianlan-bihuacu', 'icon-cebianlan-bihuazhong', 'icon-cebianlan-bihuaxi']
const sizes = [7, 5, 3]

const isClose = ref(true)

const changeColor = (c) => {
  previousColor.value = color.value
  color.value = c
  isClose.value = true
}
const changeSize = (s) => {
  size.value = s
  isClose.value = true
}

const resetColor = () => {
  const tmpColor = color.value
  color.value = previousColor.value
  previousColor.value = tmpColor
  animation.value = true
  setTimeout(() => {
    animation.value = false
  }, 250)
}
</script>

<style lang="scss" scoped>
@use 'sass:math';
.size-active {
  background-color: red;
}
.color-active {
  &::after {
    content: '✔';
    display: block;
    width: 100%;
    text-align: center;
    line-height: 60rpx;
    color: #fff;
  }
}
.open {
  .list-top {
    height: 0 !important;
    padding: 0 !important;
    opacity: 0 !important;
  }
  .list-right {
    width: 0 !important;
    opacity: 0 !important;
  }
}
.color-select {
  view,
  scroll-view {
    box-sizing: border-box;
  }
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 10rpx;
  position: relative;
  .btn {
    background-color: v-bind(color);
    border-radius: 50%;
  }
  .list-top {
    position: absolute;
    bottom: 90rpx;
    left: 0;
    background-color: rgba(0, 0, 0, 0.4);
    width: 80rpx;
    padding: 10rpx;
    border-radius: 40rpx;
    height: 500rpx;
    overflow-y: scroll;
    transition: all 0.3s ease-in;
    opacity: 1;
    .item {
      width: 100%;
      aspect-ratio: 1;
      background-color: red;
      border-radius: 50%;
      margin-bottom: 10rpx;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .list-right {
    position: absolute;
    bottom: 0;
    left: 90rpx;
    height: 80rpx;
    width: 220rpx;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 40rpx;
    transition: all 0.3s ease-in;
    opacity: 1;
    .list {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      height: 100%;
      .item {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
      }
    }
  }
  .reset {
    position: absolute;
    width: 65rpx;
    height: 65rpx;
    bottom: 100rpx;
    background-color: v-bind('previousColor');
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    left: math.div((80rpx - 65rpx), 2);
  }
  .animation {
    position: absolute;
    opacity: 0;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background-color: v-bind('previousColor');
  }
  .animation-active {
    animation: colorChange 0.25s ease-in;
  }
  @keyframes colorChange {
    0% {
      bottom: 300rpx;
      left: 0rpx;
      opacity: 0;
    }
    100% {
      bottom: 600rpx;
      left: 300rpx;
      opacity: 1;
    }
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
  }
}
</style>
