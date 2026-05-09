<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">胜平负固定奖金</text>
      <text class="title">让球:{{ matchResult.goalLine }} 赛果：{{ matchResultDesc }}</text>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell">发布时间</view>
        <view class="header-cell flex-3">胜</view>
        <view class="header-cell flex-3">平</view>
        <view class="header-cell flex-3">负</view>
      </view>

      <view class="table-row" v-for="(match, index) in matches" :key="index">
        <view class="cell">{{ match.updateTime }}</view>
        <view class="cell flex-3">
          {{ match.h }}
          <uni-icons
            class="dateIcon"
            :class="iconClass(match.hf)"
            :type="iconName(match.hf)"
            :color="iconColor(match.hf)"
            size="24rpx"
          />
        </view>
        <view class="cell flex-3">
          {{ match.d }}
          <uni-icons
            class="dateIcon"
            :class="iconClass(match.df)"
            :type="iconName(match.df)"
            :color="iconColor(match.df)"
            size="24rpx"
          />
        </view>
        <view class="cell flex-3">
          {{ match.a }}
          <uni-icons
            class="dateIcon"
            :class="iconClass(match.af)"
            :type="iconName(match.af)"
            :color="iconColor(match.af)"
            size="24rpx"
          />
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
      //   HHAD
      matchResult: {
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

      //   hadList
      matches: [
        {
          a: "2.68",
          updateDate: "2026-04-07",
          df: "0",
          d: "3.15",
          af: "0",
          h: "2.28",
          updateTime: "09:23:52",
          hf: "0",
          goalLine: "+1",
        },
        {
          a: "2.66",
          updateDate: "2026-04-07",
          df: "-1",
          d: "3.10",
          af: "-1",
          h: "2.32",
          updateTime: "16:52:48",
          hf: "1",
          goalLine: "+1",
        },
        {
          a: "2.66",
          updateDate: "2026-04-07",
          df: "-1",
          d: "3.05",
          af: "0",
          h: "2.35",
          updateTime: "19:09:43",
          hf: "1",
          goalLine: "+1",
        },
        {
          a: "2.74",
          updateDate: "2026-04-07",
          df: "-1",
          d: "2.95",
          af: "1",
          h: "2.35",
          updateTime: "21:09:01",
          hf: "0",
          goalLine: "+1",
        },
      ],
    };
  },
  computed: {
    matchResultDesc() {
      return { h: "让胜", d: "让平", a: "让负" }[this.matchResult.combination?.toLowerCase()];
    },
  },
  methods: {
    pointClass(startPoint, nowPoint) {
      return startPoint == nowPoint ? "" : nowPoint > startPoint ? "up" : "down";
    },
    iconName(point) {
      if (point == 1) return "arrow-up";
      if (point == -1) return "arrow-down";
      return "";
    },
    iconClass(point) {
      if (point == 1) return "up";
      if (point == -1) return "down";
      return "";
    },
    iconColor(point) {
      if (point == 1) return "#f00";
      if (point == -1) return "#00f";
      return "";
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

.dateIcon {
  font-size: 20rpx;
  &.up {
    color: #f00;
  }
  &.down {
    color: #0f0;
  }
}
</style>
