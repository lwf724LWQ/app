<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">开奖结果</text>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell">游戏</view>
        <view class="header-cell flex-3">开奖结果</view>
        <view class="header-cell flex-3">奖金</view>
      </view>

      <view class="table-row" v-for="(match, index) in list" :key="index">
        <view class="cell">{{ match.gameName }}</view>
        <view class="cell flex-3">
          {{ match.combinationDesc }}
        </view>
        <view class="cell flex-3">
          {{ match.odds }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      isHalf: false,

      matches: [
        {
          code: "HHAD",
          combination: "H",
          combinationDesc: "(+1)胜",
          goalLine: "+1",
          lineStatus: "",
          matchId: 2038918,
          odds: "2.35",
          oddsGoalLine: "",
          oddsType: "F",
          poolId: 2185556,
          poolTotals: "0",
          refundStatus: "0",
        },
        {
          code: "HAFU",
          combination: "D:D",
          combinationDesc: "平平",
          goalLine: "",
          lineStatus: "",
          matchId: 2038918,
          odds: "5.40",
          oddsGoalLine: "",
          oddsType: "F",
          poolId: 2185574,
          poolTotals: "0",
          refundStatus: "0",
        },
        {
          code: "CRS",
          combination: "0:0",
          combinationDesc: "0:0",
          goalLine: "",
          lineStatus: "",
          matchId: 2038918,
          odds: "9.00",
          oddsGoalLine: "",
          oddsType: "F",
          poolId: 2185557,
          poolTotals: "0",
          refundStatus: "0",
        },
        {
          code: "TTG",
          combination: "0",
          combinationDesc: "0",
          goalLine: "",
          lineStatus: "",
          matchId: 2038918,
          odds: "9.00",
          oddsGoalLine: "",
          oddsType: "F",
          poolId: 2185559,
          poolTotals: "0",
          refundStatus: "0",
        },
        {
          code: "HAD",
          combination: "D",
          combinationDesc: "平",
          goalLine: "",
          lineStatus: "",
          matchId: 2038918,
          odds: "3.70",
          oddsGoalLine: "",
          oddsType: "F",
          poolId: 2185555,
          poolTotals: "0",
          refundStatus: "0",
        },
      ],
    };
  },
  computed: {
    list() {
      const indexMap = {
        HAD: { index: 0, gameName: "胜平负" },
        HHAD: { index: 1, gameName: "让球胜平负" },
        CRS: { index: 2, gameName: "比分" },
        TTG: { index: 3, gameName: "总进球" },
        HAFU: { index: 4, gameName: "半全场胜平负	" },
      };
      const newList = [];
      this.matches.forEach((match) => {
        const indexObj = indexMap[match.code];
        newList[indexObj.index] = {
          ...match,
          ...indexObj,
        };
      });
      return newList;
    },
  },
  methods: {
    pointClass(startPoint, nowPoint) {
      return startPoint == nowPoint ? "" : nowPoint > startPoint ? "up" : "down";
    },
  },
};
</script>

<style scoped lang="scss">
.detail-container {
  background-color: #121212;
}

@import url("./table.scss");

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.filter-buttons {
  display: flex;
  gap: 10rpx;
  font-size: 22rpx;
}

.filter-btn {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: #333333;
  color: #ffffff;
}

.filter-btn.active {
  background-color: #007aff;
  color: #ffffff;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #1e1e1e;
  border-radius: 10rpx;
}

.dropdown {
  display: flex;
  align-items: center;
  padding: 8rpx 15rpx;
  background-color: #2a2a2a;
  border-radius: 15rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.cell {
  display: flex;
  > view {
    flex: 1;
    &.up {
      color: #f00;
    }
    &.down {
      color: #0f0;
    }
  }
}
</style>
