<template>
  <view class="function-area" :class="{ 'old-man-mode': useOldManModeStore.enabled }">
    <view class="function-grid">
      <view class="icon-item" @click="drawGui">
        <uni-icons type="compose" :size="iconSize" color="#4A90E2"></uni-icons>
        <view class="text">画规</view>
      </view>
      <view class="icon-item" @click="goToLive">
        <uni-icons type="videocam" :size="iconSize" color="#4A90E2"></uni-icons>
        <view class="text">开奖直播</view>
      </view>
      <view class="icon-item" @click="goToDashiRank">
        <uni-icons type="medal" :size="iconSize" color="#4A90E2"></uni-icons>
        <view class="text">大师榜单</view>
      </view>
      <view class="icon-item" @click="goToUpload">
        <uni-icons type="cloud-upload" :size="iconSize" color="#4A90E2"></uni-icons>
        <view class="text">彩友上传</view>
      </view>
      <view class="icon-item" @click="dowApp">
        <uni-icons type="download" :size="iconSize" color="#4A90E2"></uni-icons>
        <view class="text">下载地址</view>
      </view>
      <view class="icon-item" @click="toShare">
        <uni-icons type="redo" :size="iconSize" color="#4A90E2"></uni-icons>
        <view class="text">软件分享</view>
      </view>
    </view>
  </view>
</template>

<script>
// 首页功能图标区：4 列 × 2 行，6 个入口
// 各彩种板块复用同一个组件，通过 tname 决定“彩友上传”跳到视频页的哪个彩种
export default {
  name: "FunctionIcons",
  inject: ["useOldManModeStore"],
  props: {
    // 当前板块对应的彩种，用于“彩友上传”定位
    tname: {
      type: String,
      default: "排列五",
    },
  },
  computed: {
    // uni-icons 的 size 是内联样式，必须在 prop 上放大，CSS 覆盖不了
    iconSize() {
      return this.useOldManModeStore.enabled ? 46 : 34;
    },
  },
  methods: {
    drawGui() {
      uni.navigateTo({
        url: `/pages/juWang/peng-liao/drawLine/drawLine?type=排列五`,
      });
    },
    goToLive() {
      // #ifdef H5
      uni.showModal({
        title: "提示",
        content: "收看直播功能仅支持APP内使用",
      });
      // #endif
      // #ifdef APP-PLUS
      uni.navigateTo({
        url: "/pages/index/live",
      });
      // #endif
    },
    // 大师榜单
    goToDashiRank() {
      uni.navigateTo({
        url: "/pages/master-rank/master-rank",
      });
    },
    // 彩友上传：跳到视频页对应的彩种
    goToUpload() {
      uni.setStorageSync("videoLotteryType", this.tname || "排列五");
      uni.switchTab({
        url: "/pages/video/video",
      });
    },
    // 下载地址
    dowApp() {
      const url = "http://demo-dow.caimizm.com/";
      // #ifdef H5
      window.open(url);
      // #endif
      // #ifndef H5
      uni.showModal({
        title: "下载地址",
        content: `请在手机浏览器中打开：${url}`,
        confirmText: "复制地址",
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({ data: url });
          }
        },
      });
      // #endif
    },
    // 软件分享
    toShare() {
      uni.navigateTo({ url: "/pages/share/share" });
    },
  },
};
</script>

<style lang="scss" scoped>
.function-area {
  padding: 20rpx;
  background-color: #f5f5f5;
}

/* 4 列 × 2 行 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx 10rpx;
  background-color: #fff;
  padding: 30rpx 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-item uni-icons {
  margin-bottom: 14rpx;
}

.icon-item .text {
  font-size: 36rpx;
  font-weight: bold;
  color: #000;
}

/* 老年模式 */
.function-area.old-man-mode {
  background-color: #f5f5f5;

  .function-grid {
    gap: 40rpx 10rpx;
    padding: 40rpx 20rpx;
  }

  .icon-item text {
    font-size: 44rpx;
    font-weight: bold;
    color: #353434;
  }
}
</style>
