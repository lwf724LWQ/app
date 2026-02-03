<template>
  <view class="review-container">
    <view class="switch-tabs">
      <view
        v-for="(item, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: pickerIndex === index }"
        @click="switchTabByIndex(index, true)"
      >
        <text class="tab-text">{{ item }}</text>
      </view>
    </view>

    <swiper
      class="video-swiper"
      :indicator-dots="false"
      :autoplay="false"
      :circular="false"
      :vertical="false"
      :disable-touch="disableSwipe"
      :current="pickerIndex"
      easing-function="default"
      @change="swiperChange"
    >
      <swiper-item v-for="(item, index) in tabs" :key="index">
        <reviewList
          ref="reviewListRefs"
          :video-type="viewTypes[index]"
          @touchstart="swiperTouch"
          @touchmove="swiperTouch"
          @touchend="swiperTouch"
          @touchcancel="swiperTouch"
        />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import reviewList from "./review-list.vue";

// 接收的props
const props = defineProps({
  limit: {
    type: Number,
    default: 10,
  },
});
const tabs = ref(["娱乐", "教育", "生活", "其他"]);
const pickerIndex = ref(2);
const reviewListRefs = ref(null);
const flge = new Date() > new Date(1770220800000);
const viewTypes = flge
  ? ["福彩3D", "排列三", "排列五", "七星彩"]
  : ["娱乐", "教育", "生活", "其他"];

function getNowTagName() {
  return tabs.value[pickerIndex.value];
}
function switchTabByIndex(index) {
  pickerIndex.value = index;
  refreshVideoList();
}
function swiperChange(e) {
  pickerIndex.value = e.detail.current;
}

function refreshVideoList() {
  // 刷新列表
  reviewListRefs.value[pickerIndex.value].refreshVideoList();
}
function resetSwipe() {
  // 在app中，从七星彩滑过来会错位，需要重置
  if (pickerIndex.value == 0) {
    pickerIndex.value = 1;
    setTimeout(() => {
      pickerIndex.value = 0;
    }, 80);
  }
}

// 判断是否禁用swipe
// 目的是为了在"福彩3D"从左向右滑时，可以将精彩回顾的swipe禁止，让外部的swipe生效
// 使其从"精彩回顾"可以回到"七星彩"
let touchStartPoint = false;
const disableSwipe = ref(false);
function swiperTouch(e) {
  // app 的事件名称不一样
  if (e.type === "onTouchmove") {
    e.type = "touchmove";
  } else if (e.type === "onTouchstart") {
    e.type = "touchstart";
  } else if (e.type === "onTouchend") {
    e.type = "touchend";
  } else if (e.type === "onTouchcancel") {
    e.type = "touchcancel";
  }
  let toucheXY = { type: e.type };
  if (e.touches && e.touches[0]) {
    // 兼容app
    toucheXY.x = e.touches[0].x || e.touches[0].clientX;
    toucheXY.y = e.touches[0].y || e.touches[0].clientY;
  }

  if (toucheXY.type === "touchstart") {
    if (touchStartPoint !== false) return;
    touchStartPoint = toucheXY.x;
    return;
  }
  if (toucheXY.type === "touchmove" && touchStartPoint !== false) {
    if (touchStartPoint < toucheXY.x && pickerIndex.value == 0) {
      disableSwipe.value = true;
      // 阻止滑动
      e.preventDefault();
    } else {
      disableSwipe.value = false;
    }
    return;
  }
  if (toucheXY.type === "touchend" || toucheXY.type === "touchcancel") {
    disableSwipe.value = false;
    touchStartPoint = false;
    return;
  }
}

// 暴露 refreshVideoList 函数给父组件
defineExpose({
  getNowTagName,
  refreshVideoList,
  resetSwipe,
});
</script>

<style lang="scss" scoped>
.switch-tabs {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #fff;
  z-index: 10;
  display: flex;
}

.video-swiper {
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s ease;
  font-weight: bold;
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  color: #000000;
  font-weight: bold;
  font-size: 36rpx;
}

.tab-item.active .tab-text {
  color: #ff4757;
}

.review-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}
</style>
