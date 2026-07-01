<template>
  <!-- 赛果列表 - 使用 z-paging 虚拟列表 -->
  <z-paging
    ref="swiperItemRef"
    :fixed="false"
    :auto="false"
    :useVirtualList="true"
    :useInnerList="true"
    :cellHeightMode="'dynamic'"
    @query="onQuery"
    @listChange="onListChange"
    :loading-more-enabled="false"
  >
    <template #cell="{ item, index }">
      <MatchScoreCard
        :key="item.id"
        :match="item"
        :isPro="searchParams.isProMode"
        @height-update="handleHeightUpdate(index)"
      />
    </template>
    <template #header>
      <view class="recent-options">
        <view
          class="recent-option"
          v-for="option in recentOptions"
          :key="option.date"
          :class="{ active: option.time === currentPageDate }"
          @click="switchDate(option.time)"
        >
          <view class="recent-option-text">{{ option.date }}</view>
          <view class="recent-option-text">{{ option.weekday }}</view>
        </view>
      </view>
    </template>
  </z-paging>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { getFootBallList } from "@/api/apis";
import { getAccount } from "@/utils/request.js";
import dayjs from "dayjs";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import { useMatchList, filterItem } from "../matchListHooks.js";

const props = defineProps({
  pickerIndex: {
    type: Number,
    default: 0
  },
  isActiveTab: {
    type: Boolean,
    default: false
  },
  searchParams: {
    type: Object,
    default: () => ({
      keyword: "",
      leagueList: []
    })
  }
});

const swiperItemRef = ref(null);

const matchInfoList = ref([]);
const currentPageDate = ref("");
const recentOptions = ref([]);
let firstLoaded = false;

const matchListSorting = computed(() => {
  return matchInfoList.value
    .filter(filterItem(props.searchParams))
    .sort((a, b) => b.flag - a.flag);
});

const matchListHooks = useMatchList();
watch([() => props.isActiveTab, matchInfoList], ([isActive, list]) => {
  if (isActive) {
    matchListHooks.setMatchList(list);
  }
});

function handleHeightUpdate(index) {
  // swiperItemRef.value?.didUpdateVirtualListCell(index);
}

function onListChange(list) {
  // list change callback
}

function initRecentOptions() {
  recentOptions.value = [];
  const nowDate = dayjs();
  for (let i = 0; i < 6; i++) {
    const date = nowDate.add(-i, "day");
    recentOptions.value.unshift({
      time: date.format("YYYY/M/D"),
      date: date.format("M-D"),
      weekday: date.format("dddd"),
    });
  }
  if (!recentOptions.value.map((item) => item.time).includes(currentPageDate.value)) {
    currentPageDate.value = nowDate.format("YYYY/M/D");
  }
}

function switchDate(dateStr) {
  currentPageDate.value = dateStr;
  swiperItemRef.value?.reload(true);
}

// 监听 pickerIndex 懒加载
watch(
  () => props.pickerIndex,
  (newVal) => {
    if (newVal === 2 && !firstLoaded) {
      swiperItemRef.value?.reload(true);
    }
  },
  { immediate: true }
);

async function onQuery(pageNo, pageSize, from) {
  if (!currentPageDate.value) {
    initRecentOptions();
  }
  try {
    const res = await getFootBallList(currentPageDate.value, 2, "", getAccount());
    if (res.code === 200 && res.data && Array.isArray(res.data)) {
      matchInfoList.value = res.data;
    }
    swiperItemRef.value?.complete(matchListSorting.value);
    firstLoaded = true;
  } catch (error) {
    console.error("获取赛果列表失败:", error);
    swiperItemRef.value?.complete([]);
    firstLoaded = true;
  }
}

// 监听 searchParams 变化，重新加载列表
watch(
  () => props.searchParams,
  () => {
    swiperItemRef.value?.reload();
  },
  { deep: true }
);

initRecentOptions();
</script>

<style lang="scss" scoped>
.recent-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 8rpx 12rpx;
  background-color: #fff;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .recent-option {
    flex-shrink: 0;
    padding: 14rpx 20rpx;
    border-radius: 20rpx;
    background-color: #f7f8fa;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    transform: all 0.3s ease;
    transform: translateY(0);
    box-shadow: 0 6rpx 20rpx rgba(67, 160, 71, 0);
    border: 1rpx solid #43a04800;
    .recent-option-text {
      &:first-child {
        font-size: 32rpx;
        font-weight: 700;
        color: #222;
        line-height: 1.3;
      }
      &:last-child {
        font-size: 22rpx;
        font-weight: 400;
        color: #999;
        line-height: 1.3;
      }
    }

    &.active {
      background-color: #fff;
      box-shadow: 0 6rpx 20rpx rgba(67, 160, 71, 0.3);
      transform: translateY(-2rpx);
      border: 1rpx solid #43a04881;
    }
  }
}
</style>