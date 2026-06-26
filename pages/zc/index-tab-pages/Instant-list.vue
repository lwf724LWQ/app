<template>
  <!-- 即时列表 -->
  <z-paging
    ref="swiperItemRef"
    :fixed="false"
    :auto="false"
    :loading-more-enabled="false"
    @query="onQuery"
  >
    <template v-for="(item, index) in matchListWithDay" :key="item.datestr">
      <view class="matchdatestr">{{ item.datestr }}</view>
      <MatchScoreCard
        v-for="(match, idx) in item.list"
        :key="match.id"
        :match="match"
      />
    </template>
  </z-paging>
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
let firstLoaded = false;

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

// 监听 pickerIndex 懒加载
watch(
  () => props.pickerIndex,
  (newVal) => {
    if (newVal === 0 && !firstLoaded) {
      swiperItemRef.value?.reload();
    }
  },
  { immediate: true }
);

// 监听 searchParams 变化，重新加载列表
watch(
  () => props.searchParams,
  () => {
    swiperItemRef.value?.reload();
  },
  { deep: true }
);

async function onQuery(pageNo, pageSize, from) {
  try {
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
    }

    swiperItemRef.value?.complete(matchInfoList.value);
    firstLoaded = true;
  } catch (error) {
    console.error("获取即时列表失败:", error);
    swiperItemRef.value?.complete([]);
    firstLoaded = true;
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
</script>
<style lang="scss" scoped>
.matchdatestr {
  text-align: center;
  font-size: 24rpx;
  background-color: #ececec;
  padding: 8rpx 0;
}
</style>