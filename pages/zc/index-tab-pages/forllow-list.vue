<template>
  <!-- 关注列表 -->
  <z-paging-swiper-item
    ref="swiperItemRef"
    :tabIndex="5"
    :currentIndex="pickerIndex"
    @query="onQuery"
  >
    <view v-if="matchInfoList.length === 0 && !isLoading">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <view class="area">
      <view v-for="(match, index) in matchInfoList" :key="index" class="day-group">
        <MatchScoreCard
          :match="match"
          :expanded="expandedMatchId === (match.matchId || match.id)"
          @toggle-expand="handleToggleExpand"
          @height-change="handleHeightChange"
        />
      </view>
    </view>
    <view v-if="matchInfoList.length > 0 && !hasMore" class="no-more">— 没有更多了 —</view>

    <!-- 进球/红黄牌底部弹窗通知 -->
    <MatchEventNotification ref="eventNotificationRef" />
  </z-paging-swiper-item>
</template>

<script setup>
import { ref, onBeforeUnmount, watch } from "vue";
import { forllowFootballList } from "@/api/apis";
import { getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import MatchEventNotification from "@/components/MatchEventNotification.vue";

const eventNotificationRef = ref(null);
const swiperItemRef = ref(null);

const props = defineProps({
  pickerIndex: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    default: 20,
  },
  isActiveTab: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["video-click"]);

const matchInfoList = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const isNeedRefresh = ref(false);

const expandedMatchId = ref(null);

function handleToggleExpand(matchId) {
  if (expandedMatchId.value === matchId) {
    expandedMatchId.value = null;
    return;
  }
  expandedMatchId.value = matchId;
}

function handleHeightChange({ matchId, extraHeight }) {}

function closeExpanded() {
  expandedMatchId.value = null;
}

async function onQuery(pageNo, pageSize, from) {
  if (!getAccount()) {
    swiperItemRef.value?.complete([]);
    return;
  }
  try {
    isLoading.value = true;
    currentPage.value = pageNo;
    const form = {
      page: currentPage.value,
      limit: props.limit,
    };

    const res = await forllowFootballList(form);

    if (res.code === 200 && res.data && Array.isArray(res.data.list)) {
      const list = res.data.list.map((item) => ({ ...item, flag: true }));
      if (pageNo === 1) {
        matchInfoList.value = [...list];
      } else {
        matchInfoList.value = [...matchInfoList.value, ...list];
      }
      if (expandedMatchId.value) {
        const stillExists = [...list].some(
          (m) => (m.matchId || m.id) === expandedMatchId.value
        );
        if (!stillExists) {
          closeExpanded();
        }
      }
      userStore.setFollowCount(res.data.total);
      hasMore.value = list.length >= props.limit;
    }

    swiperItemRef.value?.complete(matchInfoList.value);
  } catch (error) {
    console.error("获取关注列表失败:", error);
    swiperItemRef.value?.complete([]);
  } finally {
    isLoading.value = false;
  }
}

function updateMatchList(list) {
  const newArr = [...matchInfoList.value];
  newArr.forEach((item, index) => {
    const a = list.find((newitem) => item.matchId == newitem.matchId);
    if (a) {
      newArr[index] = a;
    }
  });
  matchInfoList.value = newArr;
  if (expandedMatchId.value) {
    const stillExists = newArr.some(
      (m) => (m.matchId || m.id) === expandedMatchId.value
    );
    if (!stillExists) {
      closeExpanded();
    }
  }
}

const userStore = useUserStore();

watch(
  () => props.videoType,
  () => {
    swiperItemRef.value?.reload();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  eventNotificationRef.value?.destroy();
});

function onshow() {
  if (isNeedRefresh.value) {
    swiperItemRef.value?.reload();
    isNeedRefresh.value = false;
  }
}

defineExpose({
  updateMatchList,
  refreshVideoList: () => swiperItemRef.value?.reload(),
  onshow,
  closeExpanded,
});
</script>
<style lang="scss" scoped>
.area {
  padding: 10rpx;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10rpx;
}

.no-data-container {
  .no-data-text {
    text-align: center;
    font-size: 32rpx;
    color: #666;
    margin-top: 50rpx;
  }
}

.no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 28rpx;
  padding-bottom: 150rpx;
}
</style>