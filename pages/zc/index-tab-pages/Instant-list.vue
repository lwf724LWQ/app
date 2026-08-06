<template>
  <!-- 即时列表 -->
   <z-paging-swiper :fixed="false" :swiper-style="{height: '100%'}">
      <!-- 顶部固定的标签栏和搜索框 -->
      <template #top>
        <uv-sticky bgColor="#fff" customNavHeight="0">
          <uv-tabs :list="leagueList" lineColor="#30B544" :current="pickerIndex" @change="tagChange"></uv-tabs>
        </uv-sticky>
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
        <swiper-item v-for="(item, idx) in leagueList" :key="item.id">
          <template v-if="isInVisibleRange(idx)">
            <z-paging
              :ref="el => { if (el) swiperItemRefs[idx] = el }"
              :fixed="false"
              :auto="false"
              :loading-more-enabled="true"
              :use-virtual-list="true"
              :safe-area-inset-bottom="false"
              :hide-empty-view="true"
              v-model="matchInfoListMap[idx]"

              @query="(pageNo, pageSize, from) => onQuery(pageNo, pageSize, from, idx)"
              @listChange="(vList) => onVirtualListChange(vList, idx)"
              @virtualListChange="(vList) => onVirtualListChange(vList, idx)"

              :cellHeightMode="'dynamic'"
              :refresher-default-text="refresherText.default"
              :refresher-pulling-text="refresherText.pulling"
              :refresher-refreshing-text="refresherText.refreshing"
              :refresher-complete-text="refresherText.complete"
              :autoScrollToTopWhenReload="false"
            >
            <template v-for="(dayItem, index) in (matchListWithDayMap[idx] || [])" :key="dayItem.datestr" v-if="!isRefreshMode">
              <view class="matchdatestr" :id="`id_${dayItem.id}`">{{ dayItem.datestr }}</view>
              <view v-if="dayItem.list.length === 0" class="no-match-text">该天无匹配赛事</view>
              <MatchScoreCard
                v-for="(match, mIdx) in dayItem.list"
                :id="`id_${match.id}`"
                :key="match.id"
                :match="match"
                :isPro="searchParams.isProMode"
              />
            </template>

            <view class="toTop" @click="toTop(idx)">
              <text>回到今天</text>
            </view>
            </z-paging>
          </template>
        </swiper-item>
      </swiper>
    </z-paging-swiper>
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

// ========== Per-tab state maps ==========
const swiperItemRefs = ref({});
const matchInfoListMap = ref({});
const virtualListMap = ref({});
const matchListWithDayMap = ref({});
const currentBeforeDayMap = ref({});
const currentLastDayMap = ref({});
const firstLoadedMap = ref({});
const nowMatchInfoList = ref([]);

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

function dateFormatWithBackEnd(date){
  return dayjs(date).format("YYYY/M/D")
}

const isShijiebei = computed(()=>{
  return props.searchParams.onlyShijiebei;
})

// ========== League helpers ==========
function getLeagueName(idx) {
  const league = leagueList.value[idx]
  return league ? league.leagueChsShort || league.name : ""
}

// Only render z-paging for tabs within ±2 range of current pickerIndex
function isInVisibleRange(idx) {
  if (idx == 0) {
    return true
  }
  return Math.abs(idx - pickerIndex.value) <= 2
}

function initTabData(idx) {
  if (!matchInfoListMap.value[idx]) {
    matchInfoListMap.value = { ...matchInfoListMap.value, [idx]: [] }
  }
  if (!virtualListMap.value[idx]) {
    virtualListMap.value = { ...virtualListMap.value, [idx]: [] }
  }
  if (!matchListWithDayMap.value[idx]) {
    matchListWithDayMap.value = { ...matchListWithDayMap.value, [idx]: [] }
  }
  const currentDay = dayjs()
  if (!currentBeforeDayMap.value[idx]) {
    currentBeforeDayMap.value = { ...currentBeforeDayMap.value, [idx]: currentDay }
  }
  if (!currentLastDayMap.value[idx]) {
    currentLastDayMap.value = { ...currentLastDayMap.value, [idx]: currentDay }
  }
}

// ========== Day list computation ==========
function computeDayList(virtualList, beforeDay, lastDay) {
  const dayList = [];
  let i = 0
  if (beforeDay && lastDay) {
    let day = beforeDay;
    while (dayjs(day).isBefore(lastDay) || dayjs(day).isSame(lastDay, "day")) {
      const formatDataStr = dayjs(day).format("YYYY/MM/DD dddd");
      dayList.push({
        datestr: formatDataStr,
        id: i,
        list: [],
      });
      i++
      day = dayjs(day).add(1, "day");
    }
  }

  const sorted = [...virtualList]
    .sort((a, b) => dayjs(a.matchTime) - dayjs(b.matchTime));

  
  for (let index = 0; index < sorted.length; index++) {
    const element = sorted[index];
    const formatDataStr = dayjs(element.matchTime).format("YYYY/MM/DD dddd");
    const daylistitem = dayList.find((i) => i.datestr === formatDataStr);
    if (daylistitem) {
      daylistitem.list.push(element);
    } else {
      dayList.push({
        datestr: formatDataStr,
        id: i,
        list: [element],
      });
      i++
    }
  }

  dayList.forEach(i => i.list = i.list.sort((a,b) => b.mstate - a.mstate).sort((a,b) => b.flag - a.flag))

  return dayList;
}

function updateMatchListWithDayMap(idx) {
  const vList = virtualListMap.value[idx] || []
  const beforeDay = currentBeforeDayMap.value[idx]
  const lastDay = currentLastDayMap.value[idx]
  const dayList = computeDayList(vList, beforeDay, lastDay)
  matchListWithDayMap.value = { ...matchListWithDayMap.value, [idx]: dayList }
}

function onVirtualListChange(vList, idx) {
  virtualListMap.value = { ...virtualListMap.value, [idx]: vList }
  updateMatchListWithDayMap(idx)
}

const instance = getCurrentInstance();

// ========== Data fetching (per-tab) ==========

async function getBeforeDayData(tabIndex) {
  const swiperRef = swiperItemRefs.value[tabIndex]
  if (!swiperRef) return

  let list = []
  const beforeDay = currentBeforeDayMap.value[tabIndex]
  if (!beforeDay) return

  if (tabIndex == 0) {
    setTimeout(()=>{
      swiperRef.complete(nowMatchInfoList.value)
    }, 500)
    return
  }
  
  const newDay = beforeDay.add(-1, "day")
  const fdateStr = dateFormatWithBackEnd(newDay)
  const leagueName = getLeagueName(tabIndex)

  try {
    const res = await getFootBallList(
      fdateStr,
      999,
      leagueName,
      getAccount()
    );
    list = res.data
  } catch (error) {
    console.log(error)
  }

  swiperRef.endRefresh()
  setTimeout(()=>{
    swiperRef.scrollToY(1)
    setTimeout(()=>{
      swiperRef.addDataFromTop(list, false)
      currentBeforeDayMap.value = { ...currentBeforeDayMap.value, [tabIndex]: newDay }
      updateMatchListWithDayMap(tabIndex)
      setTimeout(()=>{
        const dayList = matchListWithDayMap.value[tabIndex] || []
        const a = dayList.length > 0 ? dayList[0].list : []
        if (a.length > 2) {
          swiperRef.scrollIntoViewById(`id_${a[a.length-2].id}`, 0, true)
        }else{
          swiperRef.scrollToTop()
        }
      }, 100)
    }, 100)
  }, 100)
}

async function getCurrentDay(tabIndex) {
  const swiperRef = swiperItemRefs.value[tabIndex]
  if (!swiperRef) return
  if (tabIndex == 0) {
    setTimeout(()=>{
      swiperRef.complete(nowMatchInfoList.value)
    }, 500)
    return
  }

  let list = []
  const leagueName = getLeagueName(tabIndex)

  try {
    const fdateStr = dateFormatWithBackEnd(dayjs())
    const res = await getFootBallList(
      leagueName === "世界杯" ? "" : fdateStr,
      999,
      leagueName,
      getAccount()
    );
    list = res.data
  } catch (error) {
    console.log(error)
  }

  swiperRef.complete(list)
}

const isLoadRefresh = ref(false)
async function refreshNewData(isFullRefresh) {
  if (isLoadRefresh.value) {
    return
  }
  isLoadRefresh.value = true

  try {
    // const res = await getNewFootBall();
    const fdateStr = dateFormatWithBackEnd(dayjs())
    const res = await getFootBallList(
      fdateStr,
      0,
      "",
      getAccount()
    )
    const list = res.data || []

    nowMatchInfoList.value = list
    emit("updateMatchList", list)

    // Update each loaded tab's matchInfoListMap with matching items
    const loadedTabs = Object.keys(firstLoadedMap.value).filter(k => firstLoadedMap.value[k])
    const newMap = { ...matchInfoListMap.value }
    newMap[0] = list
    for (const idx of loadedTabs) {
      const leagueName = getLeagueName(parseInt(idx))
      const tabList = [...(newMap[idx] || [])]

      list.forEach(item => {
        // Only merge items that belong to this tab's league
        if (item.leagueChsShort !== leagueName && !isShijiebei.value) return
        if (isShijiebei.value && item.leagueChsShort !== "世界杯") return

        const i = tabList.findIndex(m => m.id === item.id)
        if (i >= 0) {
          tabList[i] = { ...tabList[i], ...item }
        } else {
          tabList.push(item)
        }
      })

      newMap[idx] = tabList
    }

    matchInfoListMap.value = newMap
  } catch (error) {
    console.log(error)
  }
  isLoadRefresh.value = false
}

async function getNextDayData(tabIndex) {
  const swiperRef = swiperItemRefs.value[tabIndex]
  if (!swiperRef) return

  let list = []
  const leagueName = getLeagueName(tabIndex)

  if(!isShijiebei.value){
    const lastDay = currentLastDayMap.value[tabIndex]
    if (!lastDay) {
      swiperRef.completeByNoMore([], true)
      return
    }
    const newDay = lastDay.add(1, "day")
    const fdateStr = dateFormatWithBackEnd(newDay)
    try {
      const res = await getFootBallList(
        fdateStr,
        999,
        leagueName,
        getAccount()
      );
      list = res.data
      currentLastDayMap.value = { ...currentLastDayMap.value, [tabIndex]: newDay }
    } catch (error) {
      console.log(error)
    }
  }
  const isMore = isShijiebei.value ? true : dayjs().diff(currentLastDayMap.value[tabIndex] || dayjs(), "day") > 5 || list.length === 0
  setTimeout(()=>{
    swiperRef.completeByNoMore(list, isMore)
  }, 50)
}

async function refresherAll() {
  console.log(props.searchParams.leagueList)
  const nowLeagueIndex = leagueList.value.findIndex(item=>item.name === props.searchParams.leagueList)
  if (props.searchParams.leagueList != "" && nowLeagueIndex !== pickerIndex.value) {
      pickerIndex.value = nowLeagueIndex
  }

  isRefreshMode.value = true
  const currentDay = dayjs()

  const loadedTabs = Object.keys(firstLoadedMap.value).filter(k => firstLoadedMap.value[k])
  
  for (const idx of loadedTabs) {
    const i = parseInt(idx)
    currentLastDayMap.value = { ...currentLastDayMap.value, [i]: currentDay }
    currentBeforeDayMap.value = { ...currentBeforeDayMap.value, [i]: currentDay }
  }

  // Reload the current active tab, others will lazy-load on switch
  const activeIdx = pickerIndex.value
  const swiperRef = swiperItemRefs.value[activeIdx]
  if (swiperRef) {
    swiperRef.reload(true)
  }

  isRefreshMode.value = false
}

function toTop(idx){
  const dayList = matchListWithDayMap.value[idx] || []
  const a = dayList.find(item => item.datestr === dayjs().format("YYYY/MM/DD dddd"))
  
    const swiperRef = swiperItemRefs.value[idx]
    if (swiperRef) {
      swiperRef.scrollIntoViewById(`id_${a.id}`, 0, true)
    }
  
}

// ========== League list ==========
const matchListHooks = useMatchList();
const leagueList = computed(()=>matchListHooks.leagueList.value)

// ========== Tab lifecycle ==========
function ensureTabLoaded(idx) {
  if (idx == null || idx < 0) return
  if (!isInVisibleRange(idx)) return
  initTabData(idx)
  if (!firstLoadedMap.value[idx]) {
    firstLoadedMap.value = { ...firstLoadedMap.value, [idx]: true }
    const swiperRef = swiperItemRefs.value[idx]
    if (swiperRef) {
      nextTick(() => {
        swiperRef.reload()
      })
    }
  }
}

// 监听 searchParams 变化，重新加载所有已加载的列表
watch(
  () => props.searchParams,
  () => {
    refresherAll()
  },
  { deep: true }
);

async function onQuery(pageNo, pageSize, from, tabIndex) {
  if (from === "reload") {
    await getCurrentDay(tabIndex)
  }else if(from === "user-pull-down"){
    await getBeforeDayData(tabIndex)
  }else if(from === "load-more"){
    await getNextDayData(tabIndex)
  }
}


function startRefreshTimer() {
  stopRefreshTimer();
  refreshNewData()
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

// 选项与当前索引
const pickerIndex = ref(0);
function tagChange(e){
  const newIndex = e.index;
  pickerIndex.value = newIndex;
  nextTick(() => ensureTabLoaded(newIndex))
}

function swiperChange(e){
  const index = e.detail.current
  pickerIndex.value = index
  nextTick(() => ensureTabLoaded(index))
}

onMounted(() => {
  nextTick(() => {
    // Load the first tab on mount
    ensureTabLoaded(0)
    startRefreshTimer();
  })
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


.video-swiper {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.video-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>