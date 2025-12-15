<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">赛前指数</text>
      <view class="filter-buttons">
        <view class="filter-btn">同主客</view>
        <view class="filter-btn">同赛事</view>
        <view class="filter-btn active">全场</view>
        <view class="filter-btn">半场</view>
      </view>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell">指数</view>
        <view class="header-cell flex-3">初始</view>
        <view class="header-cell flex-3">即时</view>
      </view>

      <view class="table-row" v-for="(match, index) in matches" :key="index">
        <view class="cell">{{ match.pointType }}</view>
        <view class="cell flex-3"
          ><view v-for="(point, index) in match.startPoint" :key="index">{{
            point
          }}</view></view
        >
        <view class="cell flex-3"
          ><view
            v-for="(point, index) in match.nowPoint"
            :key="index"
            :class="pointClass(match.startPoint[index], point)"
            >{{ point }}</view
          ></view
        >
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
          pointType: "胜负平",
          startPoint: ["1.34", "5.10", "7.20"],
          nowPoint: ["1.31", "5.20", "7.90"],
        },
        {
          pointType: "让球",
          startPoint: ["1.34", "5.10", "7.20"],
          nowPoint: ["1.31", "5.20", "7.90"],
        },
        {
          pointType: "进球数",
          startPoint: ["1.34", "5.10", "7.20"],
          nowPoint: ["1.31", "5.10", "7.90"],
        },
        {
          pointType: "角球",
          startPoint: ["1.34", "5.10", "7.20"],
          nowPoint: ["1.31", "5.20", "7.90"],
        },
      ],
    };
  },
  methods: {
    pointClass(startPoint, nowPoint) {
      return startPoint == nowPoint
        ? ""
        : nowPoint > startPoint
        ? "up"
        : "down";
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