<template>
  <view class="video-page-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <!-- 为了适配小程序顶部高度的盒子-->
    <StatusBarPlaceholder></StatusBarPlaceholder>

    <!-- 图片 -->
    <image
      v-show="useOldManModeStore.enabled"
      class="photo"
      src="@/static/video/swiper.png"
      mode="aspectFill"
    ></image>

    <!-- 切换标签栏（参考 forum.vue 风格） -->
    <view class="switch-tabs">
      <view
        v-for="(item, index) in lotteryTypes"
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
      :current="pickerIndex"
      easing-function="default"
      @change="swiperChange"
    >
      <swiper-item>
        <VideoList ref="fc3dVideoListRef" video-type="福彩3D" />
      </swiper-item>
      <swiper-item>
        <VideoList ref="plsVideoListRef" video-type="排列三" />
      </swiper-item>
      <swiper-item>
        <VideoList ref="plwVideoListRef" video-type="排列五" />
      </swiper-item>
      <swiper-item>
        <VideoList ref="qxcVideoListRef" video-type="七星彩" />
      </swiper-item>
      <swiper-item>
        <reviewContainer ref="reviewContainerRef" />
      </swiper-item>
    </swiper>

    <!-- 发布按钮 -->
    <view v-if="pickerIndex != 4" class="publish-btn" @click="gotoOss()">点我上传视频</view>
    <view
      v-else-if="pickerIndex == 4"
      class="publish-btn publish-btn-putreview"
      @click="goPutreview()"
    >
      点我上传精彩回顾
    </view>
    <bottomBar current-path="/pages/video/video" />
  </view>
</template>

<script setup>
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import { ref, onMounted, inject } from "vue";

// 导入 Pinia store
const useOldManModeStore = inject("useOldManModeStore");
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";

import VideoList from "@/components/video-list/video-list.vue";
import StatusBarPlaceholder from "@/components/StatusBarPlaceholder/StatusBarPlaceholder.vue";
import reviewContainer from "./components/review-container.vue";
import tool from "../../utils/tool.js";
import videoTool from "./video-tool.js";

// 选项与当前索引（用于与 forum.vue 一致的标签切换）
const pickerIndex = ref(2);

// 彩票类型与期号信息（与论坛页一致的请求逻辑）
const lotteryTypes = ref(["福彩3D", "排列三", "排列五", "七星彩", "精彩回顾"]);

const currentLotteryType = ref(lotteryTypes.value[0]);

const fc3dVideoListRef = ref(null);
const plsVideoListRef = ref(null);
const plwVideoListRef = ref(null);
const qxcVideoListRef = ref(null);
const reviewContainerRef = ref(null);

onPullDownRefresh(refreshCurrentTab);

function refreshCurrentTab() {
  switch (pickerIndex.value) {
    case 0:
      fc3dVideoListRef.value?.refreshVideoList();
      break;
    case 1:
      plsVideoListRef.value?.refreshVideoList();
      break;
    case 2:
      plwVideoListRef.value?.refreshVideoList();
      break;
    case 3:
      qxcVideoListRef.value?.refreshVideoList();
      break;
    case 4:
      reviewContainerRef.value?.refreshVideoList();
      break;
  }
}

function swiperChange(e) {
  switchTabByIndex(e.detail.current);
  if (e.detail.current === 4) {
    // 这里重置一下子swiper
    reviewContainerRef.value?.resetSwipe();
  }
}

// 标签切换（与 forum.vue 的交互一致）
const switchTabByIndex = async (index, isRefresh) => {
  pickerIndex.value = index;
  currentLotteryType.value = lotteryTypes.value[index];

  // 切换标签时重置并获取对应类型的视频列表
  if (isRefresh) {
    await refreshCurrentTab(1); // 重置到第一页
  }
};

let isNeedRefresh = false;
const gotoOss = () => {
  if (videoTool.checkIsBozhu()) {
    const url = tool.formatUrlParams(
      {
        tname: currentLotteryType.value,
      },
      "/pages/video/oss"
    );

    isNeedRefresh = true;
    uni.navigateTo({
      url: url,
    });
  }
};

function goPutreview() {
  if (videoTool.checkIsBozhu()) {
    const url = tool.formatUrlParams(
      {
        tname: reviewContainerRef.value.getNowTagName(),
      },
      "/pages/video/put-review-post"
    );

    isNeedRefresh = true;
    uni.navigateTo({
      url: url,
    });
  }
}

onShow(async (e) => {
  if (isNeedRefresh) {
    isNeedRefresh = false;
    refreshCurrentTab();
  }
});

// 生命周期钩子
onMounted(async () => {});
</script>

<style lang="scss" scoped>
// 公共样式
.photo {
  width: 100%;
  height: 90px;
}

.current-lottery-type {
  padding: 20rpx;
  background-color: #f5f5f5;
  text-align: center;
  font-size: 28rpx;
  color: #666;
  border-bottom: 1rpx solid #e0e0e0;
}

.current-lottery-type text {
  display: block;
  margin: 5rpx 0;
}

/* 头部容器 - 水平排列 */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #e0e0e0;
}

/* 下拉选择器样式 */
.picker-container {
  flex: 1;
  margin-right: 20rpx;
}

.picker {
  /* display: flex; */
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 20rpx;
  border: 1rpx solid #3498db;
  border-radius: 8rpx;
  background-color: #f8fafc;
  box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.2);
}

.picker-text {
  font-size: 32rpx;
  color: #3498db;
  font-weight: 500;
}

/* 精彩回顾文本样式 */
.review-text {
  width: 50%;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 20rpx;
  text-align: center;
  border: 1rpx solid #3498db;
  border-radius: 8rpx;
  background-color: #f8fafc;
  box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.2);
}

/* 下拉箭头样式 */
.picker:active .uni-icons {
  transform: rotate(180deg);
}

/* 标签切换栏（参照 forum.vue） */
.switch-tabs {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #fff;
  z-index: 10;
  display: flex;
  padding-top: var(--status-bar-height);

  padding: 0 10rpx;
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

/* 鼠标悬停效果 */
.video-image:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

/* ----------------------------------------------------------------- */
/* 点赞区域 */
.like-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 15px 15px;
}

.like-btn:hover {
  color: #ff4757;
}

.like-btn.liked {
  color: #ff4757;
}

.like-icon {
  font-size: 18px;
  margin-right: 5px;
}

.like-count {
  font-size: 14px;
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  right: 30rpx;
  bottom: calc(120rpx + var(--window-bottom));
  width: 250rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  background-color: #1642e3;
  border-radius: 10px;
  padding: 10rpx;
  border: 6rpx solid #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(11, 15, 14, 0.6);
  z-index: 999;

  &.publish-btn-putreview {
    width: 330rpx;
  }
}

.publish-btn:active {
  transform: scale(0.95);
}

.no-data-container {
  .no-data-text {
    text-align: center;
    font-size: 32rpx;
    color: #666;
    margin-top: 50rpx;
  }
}

// 非old-man-mode样式 :not(.old-man-mode)
.video-page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  .title {
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    font-size: 26rpx;
    padding-bottom: 20rpx;

    display: flex;
    flex-direction: column;

    .video-image {
      width: 100%;
      height: 200rpx;
    }

    .video-title {
      padding: 10rpx 20rpx 5rpx 20rpx;
      flex: 1;
    }

    .video-info {
      padding: 5rpx 20rpx;

      > text {
        padding: 5rpx;
        border-radius: 6rpx;
        color: #fff;
        font-size: 22rpx;
      }

      .video-price {
        background-color: #e74c3c;
      }

      .video-free {
        background-color: #2ecc71;
      }
    }
  }
}

.video-swiper {
  height: 100%;
  flex: 1;
  overflow: hidden;
}

// old-man-mode样式
// .old-man-mode {
//   min-height: 100vh;
//   font-weight: bold;

//   .video-title {
//     font-size: 30rpx;
//     font-weight: 600;
//     color: #333;
//     line-height: 1.3;
//     text-align: center;
//     margin: 12rpx 0 8rpx;
//     padding: 0 15rpx;

//     background-image: linear-gradient(180deg, #58db8e, #1abc9c);
//   }

//   .video-free {
//     font-size: 40rpx;
//     color: #27ae60;
//     font-weight: bold;
//     padding: 4rpx 12rpx;
//     background-color: #e8f6ef;
//     border-radius: 12rpx;
//   }

//   .video-info {
//     margin: 10rpx 0;
//     text-align: center;
//   }

//   .video-price {
//     font-size: 40rpx;
//     color: #e74c3c;
//     font-weight: bold;
//     padding: 4rpx 12rpx;
//     background-color: #ffeaea;
//     border-radius: 12rpx;
//   }

//   .tab-text {
//     font-size: 40rpx;
//     font-weight: bold;
//   }

//   .title {
//     display: block;
//     flex: 0 0 calc(50% - 30px);
//     width: 100%;
//     text-align: center;
//     background: rgba(255, 255, 255, 0.95);
//     border: 4rpx solid rgba(85, 255, 255, 0.9);
//   }

//   .video-image {
//     flex: 1 1 calc(50% - 30px);
//     width: 100%;
//     height: 80px;
//     /* 设置固定高度 */
//     background: rgba(255, 255, 255, 0.95);
//     border-radius: 16px;
//     overflow: hidden;
//     box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
//     transition: transform 0.3s ease, box-shadow 0.3s ease;
//     object-fit: cover;
//     /* 确保图片填充整个容器 */
//     cursor: pointer;
//     /* 添加指针样式，表示可点击 */
//   }
// }
</style>
