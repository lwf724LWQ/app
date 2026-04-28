<template>
  <view class="container">
    <!-- 比赛列表 -->
    <!-- <scroll-view scroll-y class="match-list" refresher-enabled @refresherrefresh="onRefresh"> -->
    <scroll-view scroll-y class="match-list">
      <view class="load-more-history-button" @click="loadMoreHistory">点击加载更多历史</view>
      <view v-for="(matchDay, index) in matchInfoList" :key="index" class="day-group">
        <view class="day-header">
          <text class="day-title">
            {{ matchDay.weekday }} {{ formatDate(matchDay.businessDate) }}
          </text>
          <text class="day-count">{{ matchDay.matchCount }}场</text>
        </view>
        <MatchCard v-for="match in matchDay.subMatchList" :key="match.matchId" :match="match" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import MatchCard from "./components/MatchCard.vue";
import type { Match, MatchInfoList, SubMatchList, PoolStatus } from "./types";
import dayjs from "dayjs";
// import mock from "./mock.js";
import { getFootBallList, getFootBallNewList } from "@/api/apis";

const matchInfoList = ref<MatchInfoList[]>([]);

// 方法
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const getMatchData = async (fdateStr: string) => {
  try {
    uni.showLoading({ title: "加载中..." });
    const res = await getFootBallList(fdateStr);
    const newArr = [
      ...matchInfoList.value,
      {
        businessDate: fdateStr,
        weekday: dayjs(fdateStr).format("dddd"),
        matchCount: res.data.length,
        subMatchList: res.data,
      },
    ];

    matchInfoList.value = newArr.sort(
      (a, b) => new Date(a.businessDate).getTime() - new Date(b.businessDate).getTime()
    );
  } catch (error) {
    console.error("获取比赛数据失败:", error);
    uni.showToast({ title: "获取比赛数据失败", icon: "none" });
  }
  uni.hideLoading();
};

const getMatchDataNew = async () => {
  try {
    uni.showLoading({ title: "加载中..." });
    console.log(0)
	const res = await getFootBallNewList();
    const newArr = [];
	console.log(1)
    res.data.forEach((match: SubMatchList) => {
      const mL = newArr.find((item) => item.businessDate === match.fdate);
      if (mL) {
        mL.subMatchList.push(match);
        mL.matchCount++;
        return;
      } else {
        newArr.push({
          businessDate: match.fdate,
          weekday: dayjs(match.fdate).format("dddd"),
          matchCount: 1,
          subMatchList: [match],
        });
      }
    });
	console.log(2)
    matchInfoList.value = newArr.sort(
      (a, b) => new Date(a.businessDate).getTime() - new Date(b.businessDate).getTime()
    );
console.log(3)
    if (newArr.length === 0) {
      getMatchData(dayjs().add(-1, "day").format("YYYY-MM-DD"));
    }
  } catch (error) {
    console.error("获取比赛数据失败:", error);
    uni.showToast({ title: "获取比赛数据失败", icon: "none" });
  }
  uni.hideLoading();
};

getMatchDataNew();

const loadMoreLock = ref(false);
function loadMoreHistory() {
  if (loadMoreLock.value) return;
  loadMoreLock.value = true;
  const fdateStr = dayjs(matchInfoList.value[0].businessDate).add(-1, "day").format("YYYY-MM-DD");
  getMatchData(fdateStr).finally(() => {
    loadMoreLock.value = false;
  });
}
</script>

<style>
page {
  background-color: #f5f5f5;
}

.container {
  padding-top: var(--status-bar-height);
  min-height: 100vh;
}

.page-header {
  background-color: #fff;
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.date-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.weekday {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.date {
  font-size: 32rpx;
  color: #333;
}

.count {
  font-size: 28rpx;
  color: #666;
}

.sub-date {
  font-size: 24rpx;
  color: #999;
}

.match-list {
  padding: 20rpx 0;
  box-sizing: border-box;
}

.day-group {
  margin-bottom: 30rpx;
}

.day-header {
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

.load-more-history-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx;
  font-size: 28rpx;
  color: #310bd7;
}
</style>
