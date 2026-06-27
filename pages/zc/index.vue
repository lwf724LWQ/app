<template>
  <view class="video-page-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <z-paging-swiper>
      <!-- 顶部固定的标签栏和搜索框 -->
      <template #top>
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
            @click="switchTabByIndex(index)"
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
      </template>

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
        <!-- 即时 (index=0) -->
        <swiper-item>
          <InstantList
            :pickerIndex="pickerIndex"
            :isActiveTab="pickerIndex == 0"
            @updateMatchList="updateMatchList"
            :searchParams="searchParams"
          />
        </swiper-item>

        <!-- 赛程 (index=1) -->
        <swiper-item>
          <InprogressList
            :pickerIndex="pickerIndex"
            :isActiveTab="pickerIndex == 1"
            :searchParams="searchParams"
          />
        </swiper-item>

        <!-- 赛果 (index=2) -->
        <swiper-item>
          <ResultList
            :pickerIndex="pickerIndex"
            :isActiveTab="pickerIndex == 2"
            :searchParams="searchParams"
          />
        </swiper-item>

        <!-- 预测 (index=3) -->
        <swiper-item>
          <PrognosisList
            :pickerIndex="pickerIndex"
            ref="prognosisRef"
          />
        </swiper-item>

        <!-- 评论 (index=4) -->
        <swiper-item>
          <PostList
            :pickerIndex="pickerIndex"
            ref="postListRef"
          />
        </swiper-item>

        <!-- 关注 (index=5) -->
        <swiper-item>
          <ForllowList
            :pickerIndex="pickerIndex"
            ref="forllowListRef"
            :isActiveTab="pickerIndex == 5"
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
import { ref, onMounted, inject, computed, onUnmounted, nextTick } from "vue";

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

const searchInputRef = ref(null);

// 选项与当前索引
const pickerIndex = ref(0);

// 彩票类型
const lotteryTypes = ref(["即时", "赛程", "赛果", "专家", "评论", "关注"]);

const currentLotteryType = ref(lotteryTypes.value[2]);

const forllowListRef = ref(null);

onPullDownRefresh(refreshCurrentTab);

function refreshCurrentTab() {
  // 各子组件自行通过 z-paging-swiper-item 的懒加载机制刷新
  uni.stopPullDownRefresh();
}

function swiperChange(e) {
  switchTabByIndex(e.detail.current);
}

// 标签切换
const switchTabByIndex = (index) => {
  if (index === 5 && !getToken()) {
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

  if (index === 5) {
    nextTick(() => {
      try {
        forllowListRef.value.refreshVideoList();
      } catch (error) {}
    });
  }

  pickerIndex.value = index;
  currentLotteryType.value = lotteryTypes.value[index];
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
  if (uni.getStorageSync("openZcPostList")) {
    nextTick(()=>{
      pickerIndex.value = 4
    })
    uni.setStorageSync("openZcPostList", false)
  }
  if(uni.getStorageSync("toShijiebei")){
    uni.setStorageSync("toShijiebei", false)
    nextTick(()=>{
      searchInputRef.value.toShijiebei()
    })
  }
  pageIsShow.value = true;
  nextTick(() => {
    // postListRef.value?.onshow();
    // prognosisRef.value?.onshow();
  });
});

onHide(() => {
  pageIsShow.value = false;
});

// 搜索事件
const searchParams = ref({});
function onSearch(params) {
  searchParams.value = params;
  if (params.onlyShijiebei) {
    pickerIndex.value = 0;
  }
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
  if (pickerIndex.value === 5) {
    try {
      forllowListRef.value.updateMatchList(list);
    } catch (error) {}
  }
};
const leagueListWithPinyin = ref({});
matchList.leagueListChangeCallback(function (list) {
  if (searchParams.value.onlyShijiebei) {
    return;
  }
  leagueListWithPinyin.value = list;
});

onUnmounted(() => {
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
  background-color: #fff;
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
