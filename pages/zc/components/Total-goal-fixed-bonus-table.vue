<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">总进球固定奖金</text>
      <text class="title">总进球：{{ matchResult.combinationDesc }}</text>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell">发布时间</view>
        <view class="header-cell flex-3">0</view>
        <view class="header-cell flex-3">1</view>
        <view class="header-cell flex-3">2</view>
        <view class="header-cell flex-3">3</view>
        <view class="header-cell flex-3">4</view>
        <view class="header-cell flex-3">5</view>
        <view class="header-cell flex-3">6</view>
        <view class="header-cell flex-3">7+</view>
      </view>

      <view class="table-row" v-for="(match, index) in matches" :key="index">
        <view class="cell">{{ match.updateTime }}</view>
        <view class="cell flex-3" v-for="fieldName in listTtg" :key="fieldName">
          {{ match[fieldName] }}
          <uni-icons
            class="dateIcon"
            :class="iconClass(match[fieldName + 'f'])"
            :type="iconName(match[fieldName + 'f'])"
            :color="iconColor(match[fieldName + 'f'])"
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

      listTtg: ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"],
      matchResult: {
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

      //   hadList
      matches: [
        {
          s3: "3.70",
          s4: "6.50",
          updateDate: "2026-04-07",
          s5: "13.00",
          s6f: "0",
          s6: "23.00",
          s7f: "0",
          s4f: "0",
          s7: "40.00",
          s5f: "0",
          s2f: "0",
          s3f: "0",
          s0f: "0",
          s1f: "0",
          updateTime: "09:23:52",
          goalLine: "",
          s0: "9.00",
          s1: "4.00",
          s2: "3.10",
        },
        {
          s3: "3.65",
          s4: "6.50",
          updateDate: "2026-04-07",
          s5: "13.00",
          s6f: "1",
          s6: "24.00",
          s7f: "1",
          s4f: "0",
          s7: "44.00",
          s5f: "0",
          s2f: "-1",
          s3f: "-1",
          s0f: "0",
          s1f: "1",
          updateTime: "14:43:45",
          goalLine: "",
          s0: "9.00",
          s1: "4.15",
          s2: "3.00",
        },
        {
          s3: "3.60",
          s4: "6.50",
          updateDate: "2026-04-07",
          s5: "13.50",
          s6f: "1",
          s6: "27.00",
          s7f: "1",
          s4f: "0",
          s7: "49.00",
          s5f: "1",
          s2f: "-1",
          s3f: "-1",
          s0f: "0",
          s1f: "0",
          updateTime: "19:03:02",
          goalLine: "",
          s0: "9.00",
          s1: "4.15",
          s2: "2.95",
        },
      ],
    };
  },
  computed: {},
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
