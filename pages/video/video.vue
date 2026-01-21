<template>
  <view class="video-page-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <!-- 为了适配小程序顶部高度的盒子-->
    <StatusBarPlaceholder v-show="useOldManModeStore.enabled"></StatusBarPlaceholder>

    <!-- 图片 -->
    <image
      v-show="useOldManModeStore.enabled"
      class="photo"
      src="@/static/video/swiper.png"
      mode="aspectFill"
    ></image>

    <!-- 切换标签栏（参考 forum.vue 风格） -->
    <view class="switch-tabs">
      <view class="tab-item" :class="{ active: pickerIndex === 0 }" @click="switchTabByIndex(0)">
        <text class="tab-text">福彩3D</text>
      </view>
      <view class="tab-item" :class="{ active: pickerIndex === 1 }" @click="switchTabByIndex(1)">
        <text class="tab-text">排列三</text>
      </view>
      <view class="tab-item" :class="{ active: pickerIndex === 2 }" @click="switchTabByIndex(2)">
        <text class="tab-text">排列五</text>
      </view>
      <view class="tab-item" :class="{ active: pickerIndex === 3 }" @click="switchTabByIndex(3)">
        <text class="tab-text">七星彩</text>
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
    </swiper>

    <!-- 发布按钮 -->
    <view class="publish-btn" @click="gotoOss()">
      投稿
      <uni-icons type="cloud-upload" size="30" color="#fff"></uni-icons>
    </view>
    <bottomBar current-path="/pages/video/video" />
  </view>
</template>

<script setup>
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import { ref, onMounted, inject } from "vue";
import { apiGetIssueNo } from "../../api/apis";
import { getToken } from "@/utils/request.js"; // 导入setToken，账号
// 导入 Pinia store
const useOldManModeStore = inject("useOldManModeStore");
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";
import { useUserStore } from "@/stores/userStore";
import VideoList from "@/components/video-list/video-list.vue";
import StatusBarPlaceholder from "@/components/StatusBarPlaceholder/StatusBarPlaceholder.vue";

// 选项与当前索引（用于与 forum.vue 一致的标签切换）
const pickerIndex = ref(2);

// 响应式数据
const currentTab = ref("plw");

// 彩票类型与期号信息（与论坛页一致的请求逻辑）
const lotteryTypes = ref([
  { id: 17, name: "排列五", code: "plw", status: "待开奖", time: "今天 21:30" },
  { id: 16, name: "排列三", code: "pls", status: "待开奖", time: "今天 21:30" },
  { id: 15, name: "七星彩", code: "qxc", status: "待开奖", time: "今天 21:30" },
  { id: 12, name: "福彩3D", code: "fc", status: "待开奖", time: "今天 21:30" },
]);

const currentLotteryType = ref(lotteryTypes.value[0]);
const isLoadingLottery = ref(false);
const currentIssueInfo = ref({ id: null, number: null, status: "待开奖", time: "今天 21:30" });

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

onPullDownRefresh(refreshCurrentTab);

function refreshCurrentTab() {
  switch (pickerIndex.value) {
    case 0:
      fc3dVideoListRef.value.refreshVideoList();
      break;
    case 1:
      plsVideoListRef.value.refreshVideoList();
      break;
    case 2:
      plwVideoListRef.value.refreshVideoList();
      break;
    case 3:
      qxcVideoListRef.value.refreshVideoList();
      break;
  }
}

function swiperChange(e) {
  console.log(e);
  switchTabByIndex(e.detail.current);
}

// 标签切换（与 forum.vue 的交互一致）
const switchTabByIndex = async (index) => {
  pickerIndex.value = index;
  switch (index) {
    case 0:
      currentTab.value = "fc";
      currentLotteryType.value =
        lotteryTypes.value.find((t) => t.code === "fc") || lotteryTypes.value[0];
      break;
      break;
    case 1:
      currentTab.value = "pls";
      currentLotteryType.value =
        lotteryTypes.value.find((t) => t.code === "pls") || lotteryTypes.value[0];
      break;
    case 2:
      currentTab.value = "plw";
      currentLotteryType.value =
        lotteryTypes.value.find((t) => t.code === "plw") || lotteryTypes.value[0];
    case 3:
      currentTab.value = "qxc";
      currentLotteryType.value =
        lotteryTypes.value.find((t) => t.code === "qxc") || lotteryTypes.value[0];
      break;

    case 4:
      currentTab.value = "review";
      break;
  }
  refreshCurrentTab();

  // 与论坛相同：切换时请求期号信息
  // if (currentTab.value !== "review") {
  //   loadLotteryDataByType(currentLotteryType.value);
  // }
  // 切换标签时重置并获取对应类型的视频列表
  // await fetchVideoList(1); // 重置到第一页
};

const gotoOss = () => {
  // 判断当前有没有登录
  if (getToken()) {
    // 判断当前用户是否是为博主
    const userStore = useUserStore();
    if (userStore.getUserInfo.agent == 0) {
      uni.showModal({
        title: "提示",
        content: "目前不是博主身份，请先联系管理员注册成为博主",
        confirmText: "去联系管理员",
        success: async (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: "/pages/share/wxchat" });
          }
        },
      });
      return;
    }

    // 传递当前彩票类型名称（tname）到 oss.vue
    let url = `/pages/video/oss`;
    if (currentLotteryType.value && currentLotteryType.value.name) {
      url += `?tname=${encodeURIComponent(currentLotteryType.value.name)}`;
    }
    uni.navigateTo({
      url: url,
    });
  } else {
    uni.showModal({
      title: "提示",
      content: "该操作需要登录，是否前往",
      success: async (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: "/pages/login/login" + "?redirect=/pages/video/video" });
        }
      },
      showCancel: true,
    });
  }
};

const isShowPublishBtn = ref(false);

onShow(async () => {
  refreshCurrentTab();
});

// 生命周期钩子
onMounted(async () => {
  // 初次进入按默认标签请求期号和视频列表
  await loadLotteryDataByType(currentLotteryType.value);
});
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
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s ease;
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  color: #000000;
  font-weight: lighter;
  font-size: 32rpx;
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
  width: 190rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  background-color: #b3d35a;
  border-radius: 10px;
  padding: 10rpx;
  border: 6rpx solid #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(11, 15, 14, 0.6);
  z-index: 999;
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
  height: calc(100vh + 90px + var(--status-bar-height));
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
