<template>
  <view class="instant-pane">
    <template v-if="isTabMounted(idx)">
      <z-paging
        v-if="tab.name === ALL_TAB_NAME"
        :ref="setAllPagingRef"
        class="match-scroll"
        :fixed="false"
        :auto="false"
        :refresher-enabled="true"
        :show-refresher-when-reload="true"
        :loading-more-enabled="true"
        :default-page-size="20"
        use-virtual-list
        :force-close-inner-list="true"
        :safe-area-inset-bottom="false"
        :hide-empty-view="true"
        :cellHeightMode="'dynamic'"
        :autoScrollToTopWhenReload="false"
        :auto-hide-loading-after-first-loaded="true"
        @query="onAllQuery"
        @virtualListChange="onAllVirtualListChange"
        @scrollTopChange="onAllScrollTopChange"
      >
        <template v-for="item in allVirtualList" :key="item.zpKey || item.id">
          <view
            v-if="item._cellType === 'date'"
            class="matchdatestr"
            :id="item.zpKey"
          >{{ item.datestr }}</view>
          <view
            v-else-if="item._cellType === 'empty'"
            class="no-match-text"
          >该天无匹配赛事</view>
          <view
            v-else-if="item._cellType === 'league'"
            class="league-section-title"
          >{{ item.name }}</view>
          <view
            v-else
            :id="`id_${item.id}`"
          >
            <MatchScoreCard
              :match="item"
              :isPro="isProMode"
              @flag-change="onMatchFlagChange"
            />
          </view>
        </template>

        <view v-if="isActive" class="toTop" @click="toTopAll">
          <text>刷新</text>
        </view>
      </z-paging>

      <scroll-view
        v-else
        class="match-scroll"
        scroll-y
        :show-scrollbar="false"
        :refresher-enabled="true"
        :refresher-triggered="refresherTriggered"
        refresher-default-style="none"
        :lower-threshold="100"
        :scroll-into-view="scrollIntoViewMap[idx] || ''"
        :scroll-with-animation="false"
        @refresherrefresh="onPullDown"
        @refresherrestore="onRefresherRestore"
        @refresherabort="onRefresherRestore"
        @scrolltolower="onLoadMore"
      >
        <view slot="refresher" class="refresher-slot">
          <text>{{ refresherStatusText }}</text>
        </view>

        <template v-for="dayItem in (matchListWithDayMap[idx] || [])" :key="dayItem.datestr">
          <view class="matchdatestr" :id="dayAnchorId(idx, dayItem.id)">{{ dayItem.datestr }}</view>
          <view v-if="dayItem.leagues.length === 0" class="no-match-text">该天无匹配赛事</view>
          <template v-for="league in dayItem.leagues" :key="`${dayItem.datestr}_${league.name}`">
            <view
              v-if="(dayItem.leagues.length > 1) && league.name"
              class="league-section-title"
            >{{ league.name }}</view>
            <MatchScoreCard
              v-for="match in league.list"
              :id="`id_${match.id}`"
              :key="match.id"
              :match="match"
              :isPro="isProMode"
              @flag-change="onMatchFlagChange"
            />
          </template>
        </template>

        <view v-if="isTabLoadingMore(idx)" class="list-footer-text">正在加载...</view>
        <view v-else-if="isTabNoMore(idx)" class="list-footer-text">没有更多了</view>

        <view v-if="isActive" class="toTop" @click="toTop(idx)">
          <text>回到今天</text>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script setup>
import MatchScoreCard from "../components/MatchScoreCard.vue";
import { ALL_TAB_NAME, useInstantList } from "../instantListHooks.js";

const props = defineProps({
  tab: {
    type: Object,
    required: true
  },
  idx: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const {
  pickerIndex,
  matchListWithDayMap,
  refresherTriggered,
  scrollIntoViewMap,
  allVirtualList,
  isProMode,
  refresherStatusText,
  setAllPagingRef,
  isTabMounted,
  isTabNoMore,
  isTabLoadingMore,
  dayAnchorId,
  onAllQuery,
  onAllVirtualListChange,
  onAllScrollTopChange,
  onPullDown,
  onRefresherRestore,
  onLoadMore,
  toTop,
  toTopAll,
  onMatchFlagChange
} = useInstantList();
</script>

<style lang="scss" scoped>
.instant-pane {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.match-scroll {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.refresher-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  font-size: 24rpx;
  color: #999;
}

.matchdatestr {
  position: sticky;
  top: 0;
  z-index: 99;
  text-align: center;
  font-size: 28rpx;
  background-color: #F5F6F7;
  padding: 16rpx 0;
}

.league-section-title {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #fff;
}

.no-match-text,
.list-footer-text {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  padding: 32rpx 0;
}

.toTop {
  position: fixed;
  right: 10rpx;
  bottom: 30rpx;
  background-color: #30B544;
  color: #fff;
  padding: 15rpx;
  border-radius: 20rpx;
  font-size: 35rpx;
  z-index: 100;
}
</style>
