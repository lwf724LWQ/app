<template>
  <!-- 即时列表 -->
  <scroll-view
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="true"
    :refresher-triggered="refresher"
    :lower-threshold="150"
    :scroll-top="scrollTop"
    @refresherrefresh="fetchVideoList"
    @scrolltolower="loadMore"
    @scroll="scroll"
    :data="matchListSorting"
    :item-height="itemHeight"
  >
    <view v-if="matchListSorting.length === 0">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <template
      v-for="(item, index) in matchListWithDay"
    >
    <view class="matchdatestr">{{ item.datestr }}</view>
    <MatchScoreCard
        v-for="(item, index) in item.list"
        :key="item.id"
        :match="item"
      />
  </template>
    
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue";
import { getFootBallList } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import { useMatchList, filterItem } from "../matchListHooks.js";
import CustomVirtualList from '@/components/custom-virtual-list/list.vue';

// 接收的props
const props = defineProps({
  limit: {
    type: Number,
    default: 10,
  },
  isActiveTab: {
    type: Boolean,
    default: -1
  },
  searchParams: {
    type: Object,
    default: {
      keyword: "",
      leagueList: []
    }
  }
});

const itemHeight = ref(uni.upx2px(160))

// 定义事件
const emit = defineEmits(["video-click", "updateMatchList"]);

// 响应式数据
const matchInfoList = ref([]);
const isLoading = ref(false);

const currentPageDate = ref(new Date());

const matchListSorting = computed(() => {
  return matchInfoList.value.filter(filterItem(props.searchParams)).sort((a,b) => dayjs(a.matchTime) - dayjs(b.matchTime)).sort((a, b) => b.flag - a.flag);
});

const matchListWithDay = computed(() => {
  const dayList = []
  for (let index = 0; index < matchListSorting.value.length; index++) {
    const element = matchListSorting.value[index];
    const formatDataStr = dayjs(element.matchTime).format("YYYY/MM/DD dddd")
    const daylistitem = dayList.find(i => i.datestr === formatDataStr)
    if (daylistitem) {
      daylistitem.list.push(element)
    }else{
      dayList.push({
        datestr: formatDataStr,
        list: [element]
      })
    }
  }
  return dayList
})

const matchListHooks = useMatchList()
watch([() => props.isActiveTab, matchInfoList], ([isActive, list]) => {
  if (isActive) {
    matchListHooks.setMatchList(list)
  }
})

watch(() => props.searchParams, (newVal, oldVal) => {
  if(newVal.onlyShijiebei != oldVal.onlyShijiebei){
    fetchVideoList()
  }
})

// 刷新视频列表
const refreshVideoList = async () => {
  await fetchVideoList(1);
};

// 加载更多
const loadMore = async () => {
  if (isLoading.value) return;
  await fetchVideoList();
};

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const oldScrollTop = ref(0);
function scroll(e) {
  oldScrollTop.value = e.detail.scrollTop;
}
const scrollTop = ref(0);
const refresher = ref(false);
// 获取视频列表的函数
const fetchVideoList = async (isShowRefresher = true) => {
  try {
    if (isLoading.value) return;
    isLoading.value = true;
    refresher.value = isShowRefresher;
    // 构建请求参数
    currentPageDate.value = dayjs(new Date());
    const fdateStr = currentPageDate.value.format("YYYY/M/D");
    let onlyShijiebei = props.searchParams.onlyShijiebei;
    

    const Videoinfo = onlyShijiebei ? await getFootBallList("", 0, "世界杯", getAccount())
                                    : await getFootBallList(fdateStr, 0, "", getAccount());
    let videoInfo2 = []
    const fdateStr2 = dayjs(new Date()).add(1, "day").format("YYYY/M/D")
    if (!onlyShijiebei) {
      try {
       const res = await getFootBallList(fdateStr2, 0, "", getAccount())
        if(res.code === 200 && res.data && res.data instanceof Array){
          videoInfo2 = res.data
        } 
      } catch (error) {
        
      }
    }
    

    if (Videoinfo.code === 200 && Videoinfo.data && Array.isArray(Videoinfo.data)) {
      const counArr = [...Videoinfo.data, ...videoInfo2]
      matchInfoList.value = counArr;
      emit("updateMatchList", counArr);
    } else {
      console.warn("API 返回数据格式不符合预期:", Videoinfo);
      uni.showToast({
        title: Videoinfo.msg || "数据格式错误",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("获取视频失败:", error);
    if (currentPage.value === 1) {
      uni.showToast({
        title: "获取视频失败，请检查网络",
        icon: "none",
      });
    }
  } finally {
    
      isLoading.value = false;
    setTimeout(() => {
      
    refresher.value = false;
    }, 150);

    // 停止下拉刷新
    uni.stopPullDownRefresh();
  }
};

// 播放视频方法 - 新增付费检查
const userStore = useUserStore();
const playVideo = async (video) => {
  const token = getToken();

  if (userStore.videoCount <= 0 && !token && video.flag) {
    uni.showModal({
      title: "提示",
      content: "付费视频观看次数已用完，需要注册才能继续观看",
      success: async (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: "/pages/reg/reg" + "?redirect=/pages/video/video" });
        }
      },
      showCancel: true,
    });
    return;
  }

  // 记录视频已经点击过
  recodeVideoId(video);

  // 将当前视频保存到 Pinia store
  videoStore.setCurrentVideo(video);
  uni.navigateTo({
    url: `/pages/video/play?id=${video.id}`,
  });
};

// 记录视频已经点击过
function recodeVideoId(video) {
  try {
    const r = uni.getStorageSync("videoClickList") || [];
    r.push(video.id);
    video.isClicked = true;
    uni.setStorageSync("videoClickList", r);
  } catch (error) {}
}
function videoMenu(video) {
  if (video.account == getAccount()) {
    uni.showActionSheet({
      itemList: ["删除"],
      success: async (res) => {
        if (res.tapIndex === 0) {
          uni.showLoading({
            title: "正在处理...",
          });
          await delVideo(video.id)
            .then((res) => {
              uni.showToast({
                title: "删除成功",
                icon: "success",
              });

              videoList.value = videoList.value.filter((item) => item.id !== video.id);
            })
            .catch((res) => {
              uni.showToast({
                title: "删除失败",
                icon: "error",
              });
            });
          uni.hideLoading();
        }
      },
    });
  }
}

// 监听类型变化，重新获取数据
watch(
  () => props.videoType,
  (newType) => {
    refreshVideoList(false);
  },
  { immediate: true }
);

// 组件挂载时加载数据
let refreshTimer = null;
onMounted(() => {
  refreshVideoList();
  // 每5秒自动刷新
  refreshTimer = setInterval(() => {
    refreshVideoList();
  }, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  // eventNotificationRef.value?.destroy();
});

// 暴露 refreshVideoList 函数给父组件
defineExpose({
  refreshVideoList,
});
</script>
<style lang="scss" scoped>
.area {
  padding: 10rpx;
  display: grid;
  grid-template-columns: 1fr;
  /* 两列等宽 */
  gap: 10rpx;
  /* 间距 */
  .title {
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 10rpx;
    box-sizing: border-box;
  }
}

.video-image {
  width: 100%;
  height: 200rpx;
}

.video-title {
  padding: 10rpx 20rpx 5rpx 20rpx;
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
}

.video-clicked {
  .video-title {
    color: #192afe;
  }
}

.video-info {
  padding: 5rpx 20rpx;
  > text {
    padding: 5rpx 10rpx;
    border-radius: 6rpx;
    font-size: 26rpx;
  }

  .video-price {
    background-color: #e74c3c;
    color: #fff;
  }

  .video-free {
    background-color: #2ecc71;
    color: #fff;
  }
}

.scroll-view {
  height: 100%;
}

.matchdatestr{
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

.loading-more,
.no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 28rpx;
  padding-bottom: 150rpx;
}

.day-header {
  position: sticky;
  top: 0;
  z-index: 1;

  background-color: #fff;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.day-title {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.day-count {
  font-size: 24rpx;
  color: #999;
}
</style>
