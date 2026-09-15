<template>
  <view class="master-rank-page" :class="{ 'old-man-mode': useOldManModeStore.enabled }">
    <!-- 顶部栏 -->
    <view class="mr-header">
      <view class="mr-back" @click="goBack">
        <uni-icons type="left" size="22" color="#333"></uni-icons>
      </view>

      <!-- 标题：点击打开筛选弹框 -->
      <view class="mr-title" @click="openFilter">
        <text class="mr-title-text">{{ tname }} · {{ position }}</text>
        <uni-icons type="bottom" size="14" color="#333"></uni-icons>
      </view>

      <view class="mr-help" @click="showHelp">
        <!-- <uni-icons type="help" size="22" color="#333"></uni-icons>
        <text class="mr-help-text">说明</text> -->
      </view>
    </view>

    <view class="mr-body">
      <!-- 左侧榜单分类 -->
      <scroll-view class="mr-sidebar" scroll-y :show-scrollbar="false">
        <view
          v-for="tab in sidebarTabs"
          :key="tab.key"
          class="mr-side-item"
          :class="{ active: tab.key === activeRankTab }"
          @click="selectRankTab(tab)"
        >
          <text class="mr-side-text">{{ tab.name }}</text>
          <uni-icons v-if="tab.locked" type="locked" size="14" color="#bbb"></uni-icons>
          <uni-icons v-else-if="tab.arrow" type="right" size="14" color="#bbb"></uni-icons>
        </view>
      </scroll-view>

      <!-- 右侧内容 -->
      <scroll-view
        class="mr-main"
        scroll-y
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        refresher-background="#f5f5f5"
        @refresherrefresh="onRefresh"
      >
        <!-- 期号 -->
        <view class="mr-period" @click="selectPeriod">
          <view class="mr-period-row">
            <text class="mr-period-text">第{{ issueno }}期</text>
            <text class="mr-period-status">{{ issuenoStatus }}</text>
            <uni-icons type="bottom" size="14" color="#666"></uni-icons>
          </view>
          <text class="mr-period-range" v-if="statRangeText">统计10期范围: {{ statRangeText }}</text>
        </view>

        <!-- 排序维度 -->
        <view class="mr-sorts">
          <view
            v-for="item in sortTabs"
            :key="item.key"
            class="mr-sort"
            :class="{ active: item.key === activeSort }"
            @click="activeSort = item.key"
          >
            {{ item.name }}
          </view>
        </view>

        <!-- 统计标题 -->
        <view class="mr-subhead">
          <text class="mr-subhead-text">
            {{ tname }} - {{ activeRankTabName }} - {{ position }} ({{ totalCount }}人)
          </text>
        </view>


        <!-- 榜单列表 -->
        <view class="mr-list" v-if="!collapsed">
          <view class="mr-item" v-for="item in list" :key="item.rank">
            <view class="mr-rank">{{ item.rank }}</view>

            <image class="mr-avatar" :src="item.avatar" mode="aspectFill"></image>
            <view class="mr-badge" v-if="item.published">已发帖</view>

            <view class="mr-info">
              <text class="mr-uname">{{ item.uname }}</text>
              <text class="mr-detail">{{ item.detailText }}</text>
            </view>

            <text class="mr-hit">{{ item.hitLabel }}</text>

            <view class="mr-foot">
              <text class="mr-foot-text">{{ item.periodText }}</text>
              <view class="mr-view-btn" @click="viewPost(item)">
                <text class="mr-view-text">查看{{ item.viewCount }}金币</text>
                <uni-icons type="right" size="12" color="#fff"></uni-icons>
              </view>
            </view>
          </view>

          <view class="mr-empty" v-if="isLoaded && !list.length">
            <uni-icons type="info" size="60" color="#c8c8c8"></uni-icons>
            <text class="mr-empty-text">暂无榜单数据</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选弹框（Vue3 用 v-model:visible 双向绑定） -->
    <rankFilterPopup
      v-model:visible="filterVisible"
      :tname="tname"
      :position="position"
      @confirm="onFilterConfirm"
    />

    <!-- 发帖按钮 -->
    <view class="mr-publish-btn" @click="showPublishModal">
      <text class="mr-publish-text">发帖</text>
      <uni-icons type="cloud-upload" size="26" color="#fff"></uni-icons>
    </view>

    <!-- 发布弹窗（与彩友圈共用，规范勾选逻辑只保留一份） -->
    <postPublishPopup ref="publishPopup" :lotteryType="tname" />
  </view>
</template>

<script>
import useMasterRank, {
  SIDEBAR_TABS,
  SORT_TABS,
  RANGE_TABS,
} from "./loadMasterRankHooks.js";
import tool from "@/utils/tool.js";
import rankFilterPopup from "./components/rank-filter-popup.vue";
import postPublishPopup from "@/components/post-publish-popup.vue";

// 大师榜单页面
// 数据为 MOCK（见 loadMasterRankHooks.js），接口就绪后只需替换 hook 里的请求
export default {
  inject: ["useOldManModeStore"],
  components: { rankFilterPopup, postPublishPopup },
  data() {
    this.rankHooks = useMasterRank();
    return {
      sidebarTabs: SIDEBAR_TABS,
      sortTabs: SORT_TABS,
      rangeTabs: RANGE_TABS,
      activeRankTab: "10",
      activeSort: "hitCount",
      activeRange: 6,
      collapsed: false,
      refreshing: false,
      filterVisible: false,
    };
  },
  computed: {
    list() {
      return this.rankHooks.list.value;
    },
    isLoaded() {
      return this.rankHooks.isLoaded.value;
    },
    totalCount() {
      return this.rankHooks.totalCount.value;
    },
    issueno() {
      return this.rankHooks.issueno.value;
    },
    issuenoStatus() {
      return this.rankHooks.issuenoStatus.value;
    },
    statRangeText() {
      return this.rankHooks.statRangeText.value;
    },
    tname() {
      return this.rankHooks.tname.value;
    },
    position() {
      return this.rankHooks.position.value;
    },
    activeRankTabName() {
      const tab = this.sidebarTabs.find((item) => item.key === this.activeRankTab);
      return tab ? tab.name : "";
    },
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack();
      } else {
        uni.switchTab({ url: "/pages/index/index" });
      }
    },
    // 切换榜单分类（数据未接入前统一用同一份 MOCK）
    selectRankTab(tab) {
      if (tab.locked) {
        uni.showToast({ title: "该榜单暂未开放", icon: "none" });
        return;
      }
      if (tab.key === this.activeRankTab) return;
      this.activeRankTab = tab.key;
      this.rankHooks.rankTab.value = tab.key;
      this.loadList();
    },
    async loadList() {
      await this.rankHooks.getList();
    },
    openFilter() {
      this.filterVisible = true;
    },
    // 筛选确认：更新彩种 / 定位后重新拉取
    onFilterConfirm(payload) {
      this.rankHooks.tname.value = payload.tname;
      this.rankHooks.position.value = payload.position;
      this.loadList();
    },
    // 期号下拉
    selectPeriod() {
      const current = Number(this.issueno) || 0;
      const items = [0, 1, 2].map((i) => `第${current - i}期`);
      uni.showActionSheet({
        itemList: items,
        success: () => {
          // TODO: 接口就绪后按选中的期号请求
          this.loadList();
        },
      });
    },
    // 更多范围码
    showMoreRange() {
      uni.showActionSheet({
        itemList: ["范围3码", "范围2码", "范围1码"],
        success: (res) => {
          uni.showToast({ title: `已选择${["范围3码", "范围2码", "范围1码"][res.tapIndex]}`, icon: "none" });
        },
      });
    },
    showFaultTolerance() {
      uni.showModal({
        title: "容错查询",
        content: "容错查询功能开发中，敬请期待",
        showCancel: false,
      });
    },
    // 发帖：未登录先去登录，登录后打开发布弹窗（当前彩种带到发布页）
    showPublishModal() {
      if (tool.isLogin(false, "/pages/master-rank/master-rank")) {
        this.$refs.publishPopup.open();
      }
    },
    showHelp() {
      uni.showModal({
        title: "说明",
        content:
          "榜单按所选彩种与定位统计大师近期的发帖命中情况。\n点击顶部“彩种 · 定位”可切换筛选条件。",
        showCancel: false,
      });
    },
    // 查看：跳彩友圈帖子详情
    viewPost(item) {
      if (!item.published) {
        uni.showToast({ title: "该期尚未发帖", icon: "none" });
        return;
      }
      const postData = encodeURIComponent(JSON.stringify(item.post));
      uni.navigateTo({
        url: `/pages/forum/post/detail?postData=${postData}`,
      });
    },
    async onRefresh() {
      if (this.refreshing) return;
      this.refreshing = true;
      try {
        await this.loadList();
      } finally {
        setTimeout(() => {
          this.refreshing = false;
        }, 200);
      }
    },
  },
  onLoad() {
    this.loadList();
  },
};
</script>

<style lang="scss" scoped>
.master-rank-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--window-bottom, 0px));
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f5f5f5;
  padding-top: var(--status-bar-height);
}

/* 顶部栏 */
.mr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 20rpx;
  background-color: #fff;
  flex-shrink: 0;
}

.mr-back {
  width: 60rpx;
  display: flex;
  align-items: center;
}

.mr-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.mr-title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.mr-help {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80rpx;
}

.mr-help-text {
  font-size: 20rpx;
  color: #666;
  margin-top: 2rpx;
}

/* 主体 */
.mr-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧分类 */
.mr-sidebar {
  width: 176rpx;
  flex-shrink: 0;
  background-color: #f5f5f5;
  height: 100%;
}

.mr-side-item {
  position: relative;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.mr-side-text {
  font-size: 28rpx;
  color: #333;
}

.mr-side-item.active {
  background-color: #f5f5f5;

  .mr-side-text {
    color: #ff3b30;
    font-weight: bold;
    font-size: 30rpx;
  }

  /* 左侧红色标记 */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 40rpx;
    background-color: #ff3b30;
    border-radius: 0 4rpx 4rpx 0;
  }
}

/* 右侧内容 */
.mr-main {
  flex: 1;
  height: 100%;
  background-color: #f5f5f5;
}

/* 期号 */
.mr-period {
  margin: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
}

.mr-period-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.mr-period-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.mr-period-status {
  font-size: 26rpx;
  color: #ff3b30;
}

.mr-period-range {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #999;
}

/* 排序维度 */
.mr-sorts {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 20rpx 20rpx 20rpx;
}

.mr-sort {
  flex: 1;
  min-width: 150rpx;
  height: 64rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
  background-color: #fff;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  box-sizing: border-box;

  &.is-link {
    flex: none;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    color: #2f7cf6;
    background-color: transparent;
    border: none;
    padding: 0 10rpx;
  }
}

.mr-sort.active {
  color: #ff3b30;
  border-color: #ff3b30;
  background-color: #fff5f5;
  font-weight: bold;
}

/* 统计标题 */
.mr-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx 16rpx 20rpx;
}

.mr-subhead-text {
  font-size: 26rpx;
  color: #333;
}

.mr-collapse {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  background-color: #fff;
}

.mr-collapse-text {
  font-size: 24rpx;
  color: #666;
}

/* 范围码 */
.mr-ranges {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 0 20rpx 20rpx 20rpx;
}

.mr-range {
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 56rpx;
  text-align: center;
  font-size: 26rpx;
  color: #666;
  background-color: #fff;
  border: 2rpx solid #eee;
  border-radius: 30rpx;
  box-sizing: border-box;

  &.is-more {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }
}

.mr-range.active {
  color: #ff3b30;
  border-color: #ff3b30;
  background-color: #fff5f5;
}

/* 榜单条目 */
.mr-list {
  /* 底部留出悬浮发帖按钮的高度，避免最后一条被遮住 */
  padding: 0 20rpx 180rpx 20rpx;
}

.mr-item {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 10rpx;
}

.mr-rank {
  width: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  flex-shrink: 0;
}

.mr-avatar {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background-color: #eee;
  flex-shrink: 0;
}

/* 已发帖角标 */
.mr-badge {
  position: absolute;
  left: 78rpx;
  top: 18rpx;
  padding: 0 8rpx;
  height: 28rpx;
  line-height: 28rpx;
  font-size: 18rpx;
  color: #fff;
  background-color: #ff3b30;
  border-radius: 4rpx;
  z-index: 2;
}

.mr-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 16rpx;
  min-width: 0;
}

.mr-uname {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.mr-detail {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.mr-hit {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff3b30;
  flex-shrink: 0;
  margin-left: 10rpx;
}

/* 底部一行 */
.mr-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #f2f2f2;
}

.mr-foot-text {
  font-size: 24rpx;
  color: #999;
}

.mr-view-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 0 22rpx;
  height: 56rpx;
  background-color: #ffb800;
  border-radius: 8rpx;
}

.mr-view-text {
  font-size: 26rpx;
  color: #fff;
}

/* 发帖按钮 */
.mr-publish-btn {
  position: fixed;
  right: 30rpx;
  bottom: calc(60rpx + var(--window-bottom, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 0 30rpx;
  height: 84rpx;
  background-color: #ff3b30;
  border-radius: 42rpx;
  border: 6rpx solid #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.25);
  z-index: 20;

  &:active {
    transform: scale(0.95);
  }
}

.mr-publish-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

/* 空态 */
.mr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  background-color: #fff;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
}

.mr-empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666;
}

/* 老年模式 */
.master-rank-page.old-man-mode {
  .mr-title-text {
    font-size: 38rpx;
  }

  .mr-side-text {
    font-size: 34rpx;
  }

  .mr-side-item {
    height: 110rpx;
  }

  .mr-side-item.active .mr-side-text {
    font-size: 38rpx;
  }

  .mr-period-text,
  .mr-uname {
    font-size: 38rpx;
  }

  .mr-period-range,
  .mr-detail,
  .mr-foot-text,
  .mr-sort,
  .mr-range,
  .mr-subhead-text {
    font-size: 32rpx;
  }

  .mr-hit {
    font-size: 36rpx;
  }

  .mr-view-btn {
    height: 68rpx;
  }

  .mr-view-text {
    font-size: 32rpx;
  }
}
</style>
