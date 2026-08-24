<template>
  <view class="video-page-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <z-paging-swiper>
      <!-- 顶部固定的标签栏和搜索框 -->
      <template #top>
        <!-- 为了适配小程序顶部高度的盒子-->
        <StatusBarPlaceholder></StatusBarPlaceholder>

        <!-- 图片 -->
        <!-- <image
          v-show="useOldManModeStore.enabled"
          class="photo"
          src="@/static/zc/t.png"
          mode="aspectFill"
        ></image> -->

        <!-- 搜索 -->
         <!-- 这个原本是搜索框，但是后面改了样式变成顶部栏 -->
        <view class="search-box">
          <search-input
            placeholder="请输入搜索内容"
            @search="onSearch"
            :indexde-data="leagueListWithPinyin"
            ref="searchInputRef"
          />
        </view>

        <!-- 切换标签栏（参考 forum.vue 风格） -->
        <view class="switch-tabs">
          <view
            v-for="(item, index) in lotteryTypes"
            :key="index"
            class="tab-item"
            :class="{ active: pickerIndex === index, bigwidth: item.length > 2 }"
            @click="switchTabByIndex(index)"
          >
            <text class="tab-text">
              <view v-if="index === 3 && userStore.followCount > 0" class="redDot">
                {{ userStore.followCount }}
              </view>
              {{ item }}
            </text>
          </view>
        </view>

        <uv-tabs
          v-show="pickerIndex === 0"
          :list="instantLeagueList"
          lineColor="#30B544"
          :current="instantLeagueIndex"
          @change="onLeagueTagChange"
        >
          <template #right>
            <view class="tab-expand-btn" @click.stop="openLeagueSelector">
              <uni-icons type="plusempty" size="22" color="#666"></uni-icons>
            </view>
          </template>
        </uv-tabs>
      </template>

      <swiper
        class="video-swiper"
        :indicator-dots="false"
        :autoplay="false"
        :circular="false"
        :vertical="false"
        :current="swiperCurrent"
        :duration="250"
        easing-function="default"
        @change="swiperChange"
      >
        <swiper-item v-for="(tab, idx) in instantLeagueList" :key="tab.name">
          <InstantList
            :tab="tab"
            :idx="idx"
            :isActive="pickerIndex === 0 && instantLeagueIndex === idx"
          />
        </swiper-item>

        <swiper-item>
          <PrognosisList :pickerIndex="pickerIndex" ref="prognosisRef" />
        </swiper-item>

        <swiper-item>
          <PostList :pickerIndex="pickerIndex" ref="postListRef" />
        </swiper-item>

        <swiper-item>
          <ForllowList
            :pickerIndex="pickerIndex"
            ref="forllowListRef"
            :isActiveTab="pickerIndex == 3"
            :searchParams="searchParams"
          />
        </swiper-item>
      </swiper>
    </z-paging-swiper>

    <!-- 进球/红黄牌底部弹窗通知 -->
    <MatchEventNotification ref="eventNotificationRef" />
  </view>
</template>

<script setup>
import { onShow, onHide, onPullDownRefresh } from "@dcloudio/uni-app";
import { ref, onMounted, inject, computed, onUnmounted, nextTick, watch } from "vue";

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
import { getToken, getAccount } from "../../utils/request.js";

import { useMatchList } from "./matchListHooks.js";
import { useInstantList, setInstantListEmitter } from "./instantListHooks.js";

const searchInputRef = ref(null);
const instant = useInstantList();
const instantLeagueList = instant.leagueList;
const instantLeagueIndex = instant.pickerIndex;

const pickerIndex = ref(0);
const swiperCurrent = ref(0);

function leagueCount() {
  return instantLeagueList.value.length;
}

function syncMainTabFromSwiper(index) {
  const n = leagueCount();
  if (index < n) {
    pickerIndex.value = 0;
    instant.setPickerIndex(index);
  } else {
    pickerIndex.value = index - n + 1;
  }
}

function jumpToMainTab(index) {
  pickerIndex.value = index;
  currentLotteryType.value = lotteryTypes.value[index];
  if (index === 0) {
    swiperCurrent.value = instant.pickerIndex.value;
  } else {
    swiperCurrent.value = leagueCount() + index - 1;
  }
}

// 彩票类型
const lotteryTypes = ref(["即时", "专家", "评论", "关注"]);

const currentLotteryType = ref(lotteryTypes.value[2]);

const forllowListRef = ref(null);

onPullDownRefresh(refreshCurrentTab);

function refreshCurrentTab() {
  // 各子组件自行通过 z-paging-swiper-item 的懒加载机制刷新
  uni.stopPullDownRefresh();
}

function swiperChange(e) {
  const index = e.detail.current;
  swiperCurrent.value = index;
  syncMainTabFromSwiper(index);
  if (pickerIndex.value === 3) {
    nextTick(() => {
      try {
        forllowListRef.value.refreshVideoList();
      } catch (error) {}
    });
  }
}

function onLeagueTagChange(e) {
  const idx = e.index;
  instant.setPickerIndex(idx);
  pickerIndex.value = 0;
  swiperCurrent.value = idx;
}

// 标签切换
const switchTabByIndex = (index) => {
  if (index === 3 && !getToken()) {
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

  if (index === 3) {
    nextTick(() => {
      try {
        forllowListRef.value.refreshVideoList();
      } catch (error) {}
    });
  }

  jumpToMainTab(index);
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
const lastShowPageDate = ref(new Date().getTime())

onShow((e) => {
  
  pageIsShow.value = true;
  instant.setPageVisible?.(true);

  if (new Date().getTime() - new Date().getTime() > 20000) {
    instant.refresherAll()
  }

  if (uni.getStorageSync("openZcPostList")) {
    nextTick(() => {
      jumpToMainTab(1);
    });
    uni.setStorageSync("openZcPostList", false);
    return
  }
  if (uni.getStorageSync("toShijiebei")) {
    uni.setStorageSync("toShijiebei", false);
    nextTick(() => {
      searchInputRef.value.toShijiebei();
    });
    return
  }

  

  nextTick(() => {
    // postListRef.value?.onshow();
    // prognosisRef.value?.onshow();
  });
});

onHide((opt) => {
  pageIsShow.value = false;
  instant.setPageVisible?.(false);
});

watch((pageIsShow)=>{
  lastShowPageDate.value = new Date().getTime()
})

// 搜索事件
const searchParams = ref({});
function onSearch(params) {
  searchParams.value = params;
  instant.onSearch?.(params);
  if (params.onlyShijiebei) {
    jumpToMainTab(0);
  } else if (pickerIndex.value === 0) {
    swiperCurrent.value = instant.pickerIndex.value;
  }
}

function openLeagueSelector() {
  searchInputRef.value?.openIndexedList?.();
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
  if (pickerIndex.value === 3) {
    try {
      forllowListRef.value.updateMatchList(list);
    } catch (error) {}
  }
};
const leagueListWithPinyin = computed(()=>matchList.leagueListWithPinyin.value)

watch(
  () => instantLeagueList.value.length,
  (n, prev) => {
    if (pickerIndex.value > 0 && typeof prev === "number") {
      swiperCurrent.value = n + pickerIndex.value - 1;
    }
  }
);

watch(instantLeagueIndex, (idx) => {
  if (pickerIndex.value === 0) {
    swiperCurrent.value = idx;
  }
});

onMounted(() => {
  setInstantListEmitter(updateMatchList);
  instant.initInstantList();
  forllowListRef.value?.refreshVideoList();
})

onUnmounted(() => {
  instant.stopRefreshTimer();
  matchList.unleagueListChangeCallback();
});
</script>

<style lang="scss" scoped>
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

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #e0e0e0;
}

.picker-container {
  flex: 1;
  margin-right: 20rpx;
}

.picker {
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

.picker:active .uni-icons {
  transform: rotate(180deg);
}

.switch-tabs {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 62rpx;
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

  margin: 0 30rpx;

  &.bigwidth {
    flex: 1.6;
  }
}

.tab-item.active {
  border-bottom-color: #30B544;
  .tab-text {
    color: #30B544;
  }
}

.tab-text {
  color: #000000;
  font-weight: normal;
  font-size: 26rpx;
  position: relative;

  .redDot {
    position: absolute;
    right: -25rpx;
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
.search-box {
  padding: 10rpx;
  background-color: #fff;
}

.tab-expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  height: 100%;
  min-height: 80rpx;
}

.video-image:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

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

.video-swiper {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

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
}
</style>
