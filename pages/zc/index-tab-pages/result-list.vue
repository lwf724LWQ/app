<template>
  <!-- 赛果列表 - 使用 z-paging 虚拟列表 -->
  <z-paging
    ref="swiperItemRef"
    :fixed="false"
    :auto="false"
    :useVirtualList="true"
    :useInnerList="true"
    cell-height-mode="dynamic"
    @query="onQuery"
    @listChange="onListChange"
  >
    <template #cell="{ item, index }">
      <MatchScoreCard
        :key="item.id"
        :match="item"
        @height-update="handleHeightUpdate"
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

function handleHeightUpdate(matchId) {
  const idx = matchListSorting.value.findIndex(
    (m) => (m.matchId || m.id) === matchId
  );
  if (idx >= 0) {
    swiperItemRef.value?.didUpdateVirtualListCell(idx);
  }
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
  swiperItemRef.value?.reload();
}

// 监听 pickerIndex 懒加载
watch(
  () => props.pickerIndex,
  (newVal) => {
    if (newVal === 2 && !firstLoaded) {
      swiperItemRef.value?.reload();
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
  gap: 10rpx;
  padding: 10rpx 0;
  background-color: #fff;
  border-bottom: 1rpx solid #eaeaea;

  .recent-option {
    padding: 10rpx;
    border-radius: 6rpx;
    background-color: #f5f5f5;
    color: #111;
    font-size: 28rpx;
    text-align: center;

    &.active {
      background-color: hsl(92, 100%, 84%);
    }
  }
}
</style>