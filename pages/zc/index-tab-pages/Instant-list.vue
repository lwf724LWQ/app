<template>
  <!-- 即时列表 -->
  <z-paging
    ref="swiperItemRef"
    :fixed="false"
    :auto="false"
    :loading-more-enabled="true"
    :use-virtual-list="true"
    v-model="matchInfoList"

    @query="onQuery"
    @listChange="virtualListChange"
    @virtualListChange="virtualListChange"
    @refresherStatusChange="refresherStatusChange"

    :cellHeightMode="'dynamic'"
    :refresher-default-text="refresherText.default"
    :refresher-pulling-text="refresherText.pulling"
    :refresher-refreshing-text="refresherText.refreshing"
    :refresher-complete-text="refresherText.complete"
    :autoScrollToTopWhenReload="false"
    
  >

    <template v-for="(item, index) in matchListWithDay" :key="item.datestr" v-if="!isRefreshMode">
        <view class="matchdatestr">{{ item.datestr }}</view>
        <view v-if="item.list.length === 0" class="no-match-text">该天无匹配赛事</view>
        <MatchScoreCard
          v-for="(match, idx) in item.list"
          :id="`id_${match.id}`"
          :key="match.id"
          ref="zPagingItemRef"
          :match="match"
          :isPro="searchParams.isProMode"
        />
    </template>
    <view class="toTop" @click="toTop">
      <text>回到今天</text>
    </view>
  </z-paging>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick, getCurrentInstance  } from "vue";
import { getFootBallList, getNewFootBall  } from "@/api/apis";
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
const virtualList = ref([])
let firstLoaded = false;
let refreshTimer = null;
let refreshTimer2 = null;

const isRefreshMode = ref(false)
const refresherText = computed(()=>{
  if (isRefreshMode.value) {
    return {
      default: "继续下拉刷新",
      pulling: "松开立即刷新",
      refreshing: "正在刷新...",
      complete: "刷新成功"
    }
  }else{
    return {
      default: "继续下拉加载上一天",
      pulling: "松开开始加载",
      refreshing: "正在加载...",
      complete: "加载成功"
    }
  }
})

const zPagingItemRef = ref(null)

function dateFormatWithBackEnd(date){
  return dayjs(date).format("YYYY/M/D")
}

const isShijiebei = computed(()=>{
  return props.searchParams.onlyShijiebei;
})

const matchListSorting = computed(() => {
  return virtualList.value
    .filter(filterItem(props.searchParams))
    .sort((a, b) => dayjs(a.matchTime) - dayjs(b.matchTime))
    // .sort((a, b) => b.flag - a.flag);
});

const matchListWithDay = computed(() => {
  const dayList = [];

  // 先根据 currentbeforeDay 到 currentLastDay 时间段填充 dayList
  if (currentbeforeDay.value && currentLastDay.value) {
    let day = currentbeforeDay.value;
    while (dayjs(day).isBefore(currentLastDay.value) || dayjs(day).isSame(currentLastDay.value, "day")) {
      const formatDataStr = dayjs(day).format("YYYY/MM/DD dddd");
      dayList.push({
        datestr: formatDataStr,
        list: [],
      });
      day = dayjs(day).add(1, "day");
    }
  }

  // 再将匹配赛事填充到对应的日期中
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
  
  dayList.forEach(i => i.list = i.list.sort((a,b) => b.mstate - a.mstate).sort((a,b) => b.flag - a.flag))

  return dayList;
});


function virtualListChange(vList){
  virtualList.value = vList
}
const instance = getCurrentInstance();

// 往前加载
const currentbeforeDay = ref()
async function getBeforeDayData() {
  
  let list = []
  const newDay = currentbeforeDay.value.add(-1, "day")
  const fdateStr = dateFormatWithBackEnd(newDay)

  try {
    const res = await getFootBallList(fdateStr, 999, isShijiebei.value ? "世界杯" : "", getAccount());
    list = res.data
    
  } catch (error) {
    console.log(error)
  }
  
  swiperItemRef.value?.endRefresh()
  setTimeout(()=>{
    swiperItemRef.value?.scrollToY(1) 
    setTimeout(()=>{
      swiperItemRef.value?.addDataFromTop(list, false)
      currentbeforeDay.value = newDay
      setTimeout(()=>{
        const a = matchListWithDay.value[0].list
        console.log(a)
        if (a.length > 2) {
          swiperItemRef.value?.scrollIntoViewById(`id_${a[a.length-2].id}`,0, true) 
        }else{
          swiperItemRef.value?.scrollToTop()
        }
      }, 100)
    }, 100)
  }, 100)
  
  // nextTick(()=>{
  //   swiperItemRef.value?.scrollToY(500)
  // })
}

window.testmyfn = getBeforeDayData

async function getCurrentDay() {
  let list = []

  try {
    const fdateStr = dateFormatWithBackEnd(dayjs())
    const res = await getFootBallList(
      isShijiebei.value ? "" : fdateStr ,
      999,
      isShijiebei.value ? "世界杯" : "",
      getAccount());
      list = res.data
  } catch (error) {
    console.log(error)
  }
  
  swiperItemRef.value?.complete(list)
}

async function refreshNewData(isFullRefresh) {
  let list = []

  try {
    const fdateStr = dateFormatWithBackEnd(dayjs())
    const res = await getNewFootBall();
      list = res.data

      // emit("updateMatchList", list)

      const _matchInfoList = [...matchInfoList.value]

      list.forEach(item => {
        const i = _matchInfoList.findIndex(m => m.id === item.id)
        if (i >= 0) {
          _matchInfoList[i] = { ..._matchInfoList[i], ...item} 
        }else{
          _matchInfoList.push(item)
        }
      })

      matchInfoList.value = _matchInfoList
  } catch (error) {
    console.log(error)
  }
}

const currentLastDay = ref()
async function getNextDayData() {
  let list = []
  //  世界杯本身就是加载了后面的赛程的
  if(!isShijiebei.value){
    const newDay = currentLastDay.value.add(1, "day")
    const fdateStr = dateFormatWithBackEnd(newDay)
    try {
      const res = await getFootBallList(fdateStr, 999, isShijiebei.value ? "世界杯" : "", getAccount());
      list = res.data
      currentLastDay.value = newDay
    } catch (error) {
      console.log(error)
    }
  }
  const isMore = isShijiebei.value ? true : dayjs().diff(currentLastDay.value, "day") > 5 || list.length === 0
  setTimeout(()=>{
    swiperItemRef.value?.completeByNoMore(list, isMore)
  }, 50)  
}

async function refresherAll() {
  isRefreshMode.value = true
  const currentDay = dayjs()
  currentLastDay.value = currentDay
  currentbeforeDay.value = currentDay

  swiperItemRef.value?.reload(true);
  isRefreshMode.value = false
}

function toTop(){
  const a = matchListWithDay.value.find(item => item.datestr === dayjs().format("YYYY/MM/DD dddd"))
  swiperItemRef.value?.scrollIntoViewById(`id_${a.list[0].id}`,0, true)
}

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
    refresherAll()
  },
  { deep: true }
);

async function onQuery(pageNo, pageSize, from) {
  if (from === "reload") {
    // 重新加载
    await getCurrentDay()
  }else if(from === "user-pull-down"){
    // 下拉
    await getBeforeDayData()
  }else if(from === "load-more"){
    // 触底加载
    await getNextDayData()
  }
}


function startRefreshTimer() {
  stopRefreshTimer();
  refreshTimer = setInterval(() => {
    refreshNewData()
  }, 3000);
}

function stopRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

window.tttt = refresherAll

onMounted(() => {
  refresherAll()
  startRefreshTimer();
});

onBeforeUnmount(() => {
  stopRefreshTimer();
});

defineExpose({
  refresherAll
})

</script>
<style lang="scss" scoped>
.matchdatestr {
  position: sticky;
  top: 0;
  z-index: 99;
  text-align: center;
  font-size: 28rpx;
  background-color: #F5F6F7;
  padding: 16rpx 0;
}

.no-match-text {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  padding: 32rpx 0;
}

.toTop{
  position: fixed;
  right: 10rpx;
  bottom: 30rpx;
  background-color: #30B544;
  color: #fff;
  padding: 15rpx;
  border-radius: 20rpx;
  font-size: 35rpx;
}
</style>
