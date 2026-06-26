<template>
  <!-- 即时列表 - 使用 z-paging-swiper-item，内部 z-paging 处理滚动 -->
  <z-paging-swiper-item
    ref="swiperItemRef"
    :tabIndex="0"
    :currentIndex="pickerIndex"
    @query="onQuery"
  >
    <!-- 内容通过默认 slot 插入，展示日期分组列表 -->
    <template v-for="(item, index) in matchListWithDay" :key="item.datestr">
      <view class="matchdatestr">{{ item.datestr }}</view>
      <MatchScoreCard
        v-for="(match, idx) in item.list"
        :key="match.id"
        :match="match"
        :expanded="expandedMatchId === (match.matchId || match.id)"
        @toggle-expand="handleToggleExpand"
        @height-change="handleHeightChange"
      />
    </template>
    <view v-if="matchInfoList.length === 0 && !loading">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
  </z-paging-swiper-item>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
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
      leagueList: [],
      onlyShijiebei: false
    })
  }
});

const emit = defineEmits(["updateMatchList"]);

const swiperItemRef = ref(null);
const matchInfoList = ref([]);
const loading = ref(false);
const expandedMatchId = ref(null);

const matchListSorting = computed(() => {
  return matchInfoList.value
    .filter(filterItem(props.searchParams))
    .sort((a, b) => dayjs(a.matchTime) - dayjs(b.matchTime))
    .sort((a, b) => b.flag - a.flag);
});

const matchListWithDay = computed(() => {
  const dayList = [];
  for (let index = 0; index < matchListSorting.value.length; index++) {
    const element = matchListSorting.value[index];
    const formatDataStr = dayjs(element.matchTime).format("YYYY/MM/DD dddd");
    const daylistitem = dayList.find((i) => i.datestr === formatDataStr);
    if (daylistitem) {
      daylistitem.list.push(element);
    } else {
      dayList.push({
        datestr: formatDataStr,
        list: [element],
      });
    }
  }
  return dayList;
});

const matchListHooks = useMatchList();
watch([() => props.isActiveTab, matchInfoList], ([isActive, list]) => {
  if (isActive) {
    matchListHooks.setMatchList(list);
  }
});

// 监听 searchParams 变化，重新加载列表
watch(
  () => props.searchParams,
  () => {
    swiperItemRef.value?.reload();
  },
  { deep: true }
);

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
  try {
    loading.value = true;
    const currentPageDate = dayjs(new Date());
    const fdateStr = currentPageDate.format("YYYY/M/D");
    const onlyShijiebei = props.searchParams.onlyShijiebei;

    const Videoinfo = onlyShijiebei
      ? await getFootBallList("", 0, "世界杯", getAccount())
      : await getFootBallList(fdateStr, 0, "", getAccount());

    let videoInfo2 = [];
    const fdateStr2 = dayjs(new Date()).add(1, "day").format("YYYY/M/D");
    if (!onlyShijiebei) {
      try {
        const res = await getFootBallList(fdateStr2, 0, "", getAccount());
        if (res.code === 200 && res.data && res.data instanceof Array) {
          videoInfo2 = res.data;
        }
      } catch (error) {}
    }

    if (Videoinfo.code === 200 && Videoinfo.data && Array.isArray(Videoinfo.data)) {
      const counArr = [...Videoinfo.data, ...videoInfo2];
      matchInfoList.value = counArr;
      emit("updateMatchList", counArr);
      if (expandedMatchId.value) {
        const stillExists = counArr.some((m) => (m.matchId || m.id) === expandedMatchId.value);
        if (!stillExists) {
          closeExpanded();
        }
      }
    }

    swiperItemRef.value?.complete(matchInfoList.value);
  } catch (error) {
    console.error("获取即时列表失败:", error);
    swiperItemRef.value?.complete([]);
  } finally {
    loading.value = false;
  }
}

let refreshTimer = null;
onMounted(() => {
  refreshTimer = setInterval(() => {
    swiperItemRef.value?.reload();
  }, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});

defineExpose({
  closeExpanded,
});
</script>
<style lang="scss" scoped>
.scroll-view {
  height: 100%;
}

.matchdatestr {
  text-align: center;
  font-size: 24rpx;
  background-color: #ececec;
  padding: 8rpx 0;
}

.no-data-container {
  .no-data-text {
    text-align: center;
    font-size: 32rpx;
    color: #666;
    margin-top: 50rpx;
  }
}
</style>