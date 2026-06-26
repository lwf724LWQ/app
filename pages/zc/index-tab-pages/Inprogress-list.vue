<template>
  <!-- 赛程列表 - 使用 z-paging-swiper-item 虚拟列表 -->
  <z-paging-swiper-item
    ref="swiperItemRef"
    :tabIndex="1"
    :currentIndex="pickerIndex"
    :useVirtualList="true"
    :useInnerList="true"
    cell-height-mode="dynamic"
    @query="onQuery"
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
  </z-paging-swiper-item>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { getFootBallList } from "@/api/apis";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import dayjs from "dayjs";
import { getAccount } from "../../../utils/request.js";
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

const footBallList = ref([]);
const currentPageDate = ref("");
const recentOptions = ref([]);

const matchListSorting = computed(() => {
  return footBallList.value
    .filter(filterItem(props.searchParams))
    .sort((a, b) => b.flag - a.flag);
});

const matchListHooks = useMatchList();
watch([() => props.isActiveTab, footBallList], ([isActive, list]) => {
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

function initRecentOptions() {
  recentOptions.value = [];
  const nowDate = dayjs();
  for (let i = 0; i < 6; i++) {
    const date = nowDate.add(i, "day");
    recentOptions.value.push({
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

async function onQuery(pageNo, pageSize, from) {
  if (!currentPageDate.value) {
    initRecentOptions();
  }
  try {
    const res = await getFootBallList(currentPageDate.value, 1, "", getAccount());
    if (res.code === 200 && res.data && Array.isArray(res.data)) {
      footBallList.value = res.data;
    }
    swiperItemRef.value?.complete(matchListSorting.value);
  } catch (error) {
    console.error("获取赛程列表失败:", error);
    swiperItemRef.value?.complete([]);
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &.active {
      background-color: hsl(92, 100%, 84%);
    }
  }
}
</style>