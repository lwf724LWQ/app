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
      <view class="tab-item" :class="{ active: currentTab === 'fc' }" @click="switchTabByIndex(3)">
        <text class="tab-text">娱乐</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'pls' }" @click="switchTabByIndex(1)">
        <text class="tab-text">教育</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'plw' }" @click="switchTabByIndex(0)">
        <text class="tab-text">生活</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'qxc' }" @click="switchTabByIndex(2)">
        <text class="tab-text">其他</text>
      </view>
    </view>
    <view v-if="videoList.length === 0">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>

    <!-- 功能图标区 -->
    <view class="area" v-if="currentTab !== 'review'">
      <view
        class="title"
        v-for="(video, index) in videoList"
        :key="index"
        @click="playVideo(video)"
      >
        <view class="video-title" v-if="useOldManModeStore.enabled">{{ video.title }}</view>
        <!-- 将 video 标签改为 img 标签 -->
        <image
          mode="aspectFill"
          :src="video.imgurl"
          class="video-image"
          :class="{ 'paid-video': video.hasPaid, 'free-video': !video.flag }"
        />
        <view class="video-title" v-if="!useOldManModeStore.enabled">{{ video.title }}</view>
        <view class="video-info">
          <text class="video-price" v-if="video.flag && video.price > 0">
            {{ video.hasPaid ? "已付费" : `付费视频 ${video.price}金币` }}
          </text>
          <text class="video-free" v-else>免费视频</text>
        </view>
      </view>
    </view>

    <!-- 精彩回顾内容 -->
    <view class="area" v-else>
      <view class="title" v-for="(video, index) in videoList" :key="index">
        <view class="video-title">{{ video.title }}</view>
        <img
          :src="video.imgurl"
          class="video-image"
          @click="playVideo(video)"
          :class="{ 'paid-video': video.hasPaid, 'free-video': !video.flag }"
        />

        <view class="video-info">
          <text class="video-price" v-if="video.flag && video.price > 0">
            {{ video.hasPaid ? "已付费" : `付费视频 ${video.price}金币` }}
          </text>
          <text class="video-free" v-else>免费视频</text>
        </view>
      </view>
    </view>

    <!-- 发布按钮 -->
    <!-- <view class="publish-btn" @click="gotoOss()">
      <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
    </view> -->
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
const isLoadingLottery = ref(false);
const currentIssueInfo = ref({ id: null, number: null, status: "待开奖", time: "今天 21:30" });

// 下拉刷新钩子
onPullDownRefresh(async () => {
  console.log("下拉刷新触发");
  // 执行刷新数据的函数
  await fetchVideoList();
  // 停止下拉刷新
  uni.stopPullDownRefresh();
});

// 获取视频列表的函数(页面开始加载的数据)
const fetchVideoList = async () => {
  try {
    // 构建请求参数
    const videoinfo = {
      page: 1,
      limit: 10,
    };

    // 添加彩票类型参数
    if (
      currentTab.value !== "review" &&
      currentLotteryType.value &&
      currentLotteryType.value.name
    ) {
      videoinfo.tname = currentLotteryType.value.name;
    } else if (currentTab.value === "review") {
      console.log("精彩回顾模式，不限制彩票类型");
    } else {
      console.warn("无法获取彩票类型信息");
    }

    const Videoinfo = await apiGetVideo(videoinfo);

    if (
      Videoinfo.code === 200 &&
      Videoinfo.data &&
      Videoinfo.data.records &&
      Array.isArray(Videoinfo.data.records)
    ) {
      videoList.value = Videoinfo.data.records.map((item) => ({
        title: item.title,
        src: "http://video.caimizm.com/" + item.url,
        id: item.id,
        account: item.account,
        likeCount: item.likeCount,
        createTime: item.createTime,
        flag: item.price > 0 ? item.flag : false,
        price: item.price,
        updateTime: item.updateTime,
        imgurl: "http://video.caimizm.com/" + item.vimg,
      }));

      uni.showToast({
        title: `已加载 ${videoList.value.length} 个视频`,
        position: "bottom",
        icon: "none",
      });
    } else {
      console.warn("API 返回数据格式不符合预期:", Videoinfo);
      uni.showToast({
        title: Videoinfo.msg || "数据格式错误",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("获取视频失败:", error);
    uni.showToast({
      title: "获取视频失败，请检查网络",
      icon: "none",
    });
  }
};

const loadLotteryDataByType = async (lotteryType) => {
  if (isLoadingLottery.value || !lotteryType || !lotteryType.name) return;
  try {
    isLoadingLottery.value = true;
    uni.showLoading({ title: "加载中..." });
    const response = await apiGetIssueNo({ tname: lotteryType.name });
    uni.hideLoading();
    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      let issueNumber = null;
      let issueStatus = "待开奖";
      let issueTime = "今天 21:30";
      if (typeof response.data === "number" || typeof response.data === "string") {
        issueNumber = response.data.toString();
      } else if (typeof response.data === "object") {
        issueNumber = response.data.issueno || response.data.number || response.data.id;
        issueStatus = response.data.status || "待开奖";
        issueTime = response.data.time || "今天 21:30";
      }
      lotteryType.status = issueStatus;
      lotteryType.time = issueTime;
      const idx = lotteryTypes.value.findIndex((t) => t.code === lotteryType.code);
      if (idx !== -1) {
        lotteryTypes.value[idx].status = issueStatus;
        lotteryTypes.value[idx].time = issueTime;
      }
      currentIssueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime,
      };

      // 保存到本地存储，供 biaodan.vue 使用
      try {
        uni.setStorageSync("currentIssueInfo", currentIssueInfo.value);
        uni.setStorageSync("currentLotteryType", lotteryType);
      } catch (error) {
        console.error("保存期号信息失败:", error);
      }
    } else {
      uni.showToast({ title: response.msg || "数据加载失败", icon: "none" });
    }
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error?.msg || error?.message || "网络错误，请重试",
      icon: "none",
      duration: 3000,
    });
  } finally {
    isLoadingLottery.value = false;
  }
};

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
  width: 80rpx;
  text-align: center;
  height: 80rpx;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  background-color: #b3d35a;
  border-radius: 50%;
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
