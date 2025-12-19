<template>
  <view class="container">
    <TopNavigationBar bgColor="#222" color="#fff">
      <template #center>
        <view class="title-text">
          <text>{{ matchHeadData.homeTeamShortName }}</text>
          <text>VS</text>
          <text>{{ matchHeadData.awayTeamShortName }}</text>
        </view>
      </template>
    </TopNavigationBar>
    <scroll-view class="scroll-view" scroll-y>
      <matchHead :data="matchHeadData" />
      <dualAxis :data="matchFeature" />

      <historyTable
        :statis="matchHistory.value.statistics"
        :homeTeam="matchHeadData.homeTeamShortName"
        :matches="matchHistory.value.matchList"
      />
      <pointTable />
      <!-- <detailTable /> -->
      <!-- <detailTable /> -->
    </scroll-view>
  </view>
</template>

<script setup>
import TopNavigationBar from "../../components/TopNavigationBar.vue";
import detailTable from "./components/detail-table.vue";
import dualAxis from "./components/dual-axis.vue";
import pointTable from "./components/point-table.vue";
import matchHead from "./components/match-head.vue";
import historyTable from "./components/history-table.vue";

import zqApi from "../../api/zq.js";
import mock from "./mock.js";
import { reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
const sportteryMatchId = ref(2036064);

// 左右对称条状的数据
const matchFeature = ref(mock.matchFeature);
function loadMatchFeature() {
  zqApi
    .getMatchFeatureV1({
      termLimits: 10,
      sportteryMatchId: sportteryMatchId,
    })
    .then((res) => {
      matchFeature.value = res.value;
    });
}

// 顶部的数据
const matchHeadData = ref(mock.matchHeadData);
function loadtMatchHead() {
  zqApi
    .getMatchHeadV1({
      sportteryMatchId: sportteryMatchId,
      source: "web",
    })
    .then((res) => {
      matchHeadData.value = res.value;
    });
}

// 历史交锋显示的数据
const matchHistory = reactive({
  termLimits: 10,
  tournamentFlag: 0,
  homeAwayFlag: 0,
  value: mock.matchHistory,
});
function loadHistory() {
  zqApi
    .getResultHistoryV1({
      sportteryMatchId: sportteryMatchId,
      termLimits: matchHistory.termLimits,
      tournamentFlag: matchHistory.tournamentFlag,
      homeAwayFlag: matchHistory.homeAwayFlag,
    })
    .then((res) => {
      matchHistory.value = res.value;
    });
}

// 积分榜的数据
const matchTables = ref(mock.MatchTables)
function loadMatchTables(){
	
}

// 比赛近况
const matchResult = reactive({
  termLimits: 10, // 获取数量
  tournamentFlag: 0, // 是否相同赛制 0 = 不分 , 1= 相同赛制
  homeAwayFlag: 0, // 是否相同主客 0 = 不分 , 1= 相同主次
  value: mock.MatchResult,
});
function loadMatchResult(){
	
}

// 未来赛事
const futureMatches = ref(mock.FutureMatches)
function loadFutureMatches(){
	
}

// 射手信息
const matchPlayer = ref(mock.MatchPlayer)
function loadMatchPlayer(){
	
}

// 伤停一览
const injurySuspension = ref(mock.InjurySuspension)
function loadInjurySuspension(){
	
}

onLoad(() => {
  // loadtMatchHead();
  // loadHistory();
  // loadMatchFeature();
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .title-text {
    display: flex;
    color: #fff;
    font-size: 26rpx;
    align-items: center;
    justify-content: center;
    > text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .scroll-view {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .team-logo {
    margin-right: 15rpx;
  }

  .logo {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
  }
}
</style>