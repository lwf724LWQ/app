<template>
  <view class="video-page-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <!-- 为了适配小程序顶部高度的盒子-->
    <StatusBarPlaceholder></StatusBarPlaceholder>

    <!-- 图片 -->
    <image
      v-show="useOldManModeStore.enabled"
      class="photo"
      src="@/static/zc/t.png"
      mode="aspectFill"
    ></image>

    <!-- 切换标签栏（参考 forum.vue 风格） -->
    <view class="switch-tabs">
      <view
        v-for="(item, index) in lotteryTypes"
        :key="index"
        class="tab-item"
        :class="{ active: pickerIndex === index, bigwidth: item.length > 2 }"
        @click="switchTabByIndex(index, true)"
      >
        <text class="tab-text">
          <view v-if="index === 5 && userStore.followCount > 0" class="redDot">
            {{ userStore.followCount }}
          </view>
          {{ item }}
        </text>
      </view>
    </view>

    <!-- 搜索 -->
    <view class="search-box" v-show="[0, 1, 2].includes(pickerIndex)">
      <search-input
        placeholder="请输入搜索内容"
        @search="onSearch"
        :indexde-data="leagueListWithPinyin"
        ref="searchInputRef"
      />
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
        <InstantList
          :isActiveTab="pickerIndex == 0"
          @updateMatchList="updateMatchList"
          :searchParams="searchParams"
        />
      </swiper-item>
      <swiper-item>
        <InprogressList
          ref="inprogressListRef"
          :pickerIndex="pickerIndex"
          :isActiveTab="pickerIndex == 1"
          :searchParams="searchParams"
        />
      </swiper-item>
      <swiper-item>
        <ResultList
          ref="resultList"
          :pickerIndex="pickerIndex"
          :isActiveTab="pickerIndex == 2"
          :searchParams="searchParams"
        />
      </swiper-item>
      <swiper-item>
        <PrognosisList ref="prognosisRef" />
      </swiper-item>
      <swiper-item>
        <PostList ref="postListRef" />
      </swiper-item>
      <swiper-item>
        <ForllowList ref="forllowListRef" :isActiveTab="pickerIndex == 5" />
      </swiper-item>
    </swiper>

    <!-- 发布按钮 -->
    <!-- <view v-if="pickerIndex != 4" class="publish-btn" @click="gotoPutreview">点我发布预测</view>
    <view v-if="pickerIndex == 4" class="publish-btn" @click="gotoPutPost">发表看法</view> -->
    <!-- <ActivityHover
      :src="
        userStore.getUserInfo.account
          ? '/static/images/activity-invite-2.png'
          : '/static/images/activity-registered.png'
      "
      @click="onHoverClick"
      v-if="userStore.videoCount <= 0"
    ></ActivityHover> -->
  </view>

  <!-- 进球/红黄牌底部弹窗通知 -->
  <MatchEventNotification ref="eventNotificationRef" />
</template>

<script setup>
import { onShow, onHide, onPullDownRefresh } from "@dcloudio/uni-app";
import { ref, onMounted, inject, computed, onUnmounted } from "vue";

// 导入 Pinia store
const useOldManModeStore = inject("useOldManModeStore");
import StatusBarPlaceholder from "@/components/StatusBarPlaceholder/StatusBarPlaceholder.vue";
import tool from "@/utils/tool.js";
import videoTool from "@/pages/video/video-tool.js";
import ActivityHover from "@/components/activity-hover.vue";
import { useUserStore } from "@/stores/userStore";
import { createShareUrl } from "@/utils/createShareUrl.js";
import { useZcSettingsStore } from "@/stores/zcSettings";

// tab的page页组件
import InprogressList from "./index-tab-pages/Inprogress-list.vue";
import ResultList from "./index-tab-pages/Result-list.vue";
import PrognosisList from "./index-tab-pages/prognosis-list.vue";
import PostList from "./index-tab-pages/Post-list.vue";
import InstantList from "./index-tab-pages/Instant-list.vue";
import ForllowList from "./index-tab-pages/forllow-list.vue";
import MatchEventNotification from "@/components/MatchEventNotification.vue";

import searchInput from "./components/search-input.vue";
import { getToken } from "../../utils/request.js";
import { nextTick } from "vue";

import { useMatchList } from "./matchListHooks.js";

const searchInputRef = ref(null);

// 选项与当前索引（用于与 forum.vue 一致的标签切换）
const pickerIndex = ref(3);

// 彩票类型与期号信息（与论坛页一致的请求逻辑）
const lotteryTypes = ref(["即时", "赛程", "赛果", "预测", "评论", "关注"]);

const currentLotteryType = ref(lotteryTypes.value[2]);

onPullDownRefresh(refreshCurrentTab);

function refreshCurrentTab() {
  // 刷新当前标签页的列表
  //   ...todo
}

function swiperChange(e) {
  switchTabByIndex(e.detail.current);
}

// 标签切换（与 forum.vue 的交互一致）
const switchTabByIndex = async (index, isRefresh) => {
  if (index === 5 && !getToken()) {
    // 关注列表需要登录才能使用
    uni.showModal({
      title: "提示",
      content: "该功能需要注册才能使用",
      success: async (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: "/pages/reg/reg" + "?redirect=/pages/video/video" });
        }
      },
      showCancel: true,
    });
    return;
  }

  pickerIndex.value = index;
  currentLotteryType.value = lotteryTypes.value[index];

  // 切换标签时重置并获取对应类型的视频列表
  if (isRefresh) {
    await refreshCurrentTab(1); // 重置到第一页
  }
};

let isNeedRefresh = false;
const gotoPutreview = () => {
  if (videoTool.checkIsBozhu()) {
    const url = tool.formatUrlParams(
      {
        tname: currentLotteryType.value,
      },
      "/pages/zc/creaet-prognosis-post"
    );

    isNeedRefresh = true;
    uni.navigateTo({
      url: url,
    });
  }
};

const gotoPutPost = () => {
  isNeedRefresh = true;
  uni.navigateTo({
    url: "/pages/zc/creaet-post",
  });
};

const postListRef = ref(null);
const prognosisRef = ref(null);

const pageIsShow = ref(false);
onShow((e) => {
  pageIsShow.value = true;
  nextTick(() => {
    postListRef.value?.onshow();
    prognosisRef.value?.onshow();
  });
});

onHide(() => {
  pageIsShow.value = false;
});

// 生命周期钩子
onMounted(async () => {});

// 搜索事件
const searchParams = ref({});
function onSearch(params) {
  console.log(params);
  searchParams.value = params;
}

const userStore = useUserStore();

// 跳转到注册页面
const onHoverClick = () => {
  if (userStore.getUserInfo.account) {
    uni.showModal({
      title: "提示",
      content: "请分享后让好友将链接复制到浏览器中打开",
      showCancel: false,
      success: (res) => {
        uni.share({
          provider: "weixin",
          type: 1,
          summary: createShareUrl(),
          scene: "WXSceneSession",
          success(res) {},
          fail(err) {},
        });
      },
    });
  } else {
    uni.navigateTo({
      url: "/pages/reg/reg",
    });
  }
};

const matchList = useMatchList();
const zcSettings = useZcSettingsStore();
const eventNotificationRef = ref(null);
const updateMatchList = (list) => {
  if (pageIsShow.value) {
    if (zcSettings.onlyFollowed) {
      eventNotificationRef.value?.onDataUpdate(list.filter((item) => item.flag));
    } else {
      eventNotificationRef.value?.onDataUpdate(list);
    }
  }
};
const leagueListWithPinyin = ref({})
matchList.leagueListChangeCallback(function(list){
  leagueListWithPinyin.value = list
})
onUnmounted(()=>{
  matchList.unleagueListChangeCallback()
})
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

  &.bigwidth {
    flex: 1.6;
  }
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  color: #000000;
  font-weight: bold;
  font-size: 36rpx;
  position: relative;
}

.tab-text {
  .redDot {
    position: absolute;
    right: -15rpx;
    top: -15rpx;
    width: 35rpx;
    height: 35rpx;
    line-height: 35rpx;
    font-size: 25rpx;
    color: #fff;
    text-align: center;
    background-color: #f00;
    border-radius: 50%;
  }
}

.tab-item.active .tab-text {
  color: #ff4757;
}

.search-box {
  padding: 10rpx;
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
  // #ifdef H5
	height: calc(100vh - var(--tab-bar-height) - env(safe-area-inset-bottom));
  // #endif
  // #ifdef APP-PLUS
  height: 100vh;
  // #endif
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
  // position: fixed;
}
</style>
