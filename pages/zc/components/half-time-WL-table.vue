<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">半全场胜平负固定奖金</text>
      <text class="title">赛果：{{ matchResult.combinationDesc }}</text>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell">发布时间</view>
        <view class="header-cell flex-3" v-for="fieldName in listhtwlTag" :key="fieldName">
          {{ fieldName }}
        </view>
      </view>

      <view class="table-row" v-for="(match, index) in matches" :key="index">
        <view class="cell">{{ match.updateTime }}</view>
        <view class="cell flex-3" v-for="fieldName in listHafu" :key="fieldName">
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

      listhtwlTag: ["胜胜", "胜平", "胜负", "平胜", "平平", "平负", "负胜", "负平", "负负"],
      listHafu: ["hh", "hd", "ha", "dh", "dd", "da", "ah", "ad", "aa"],
      matchResult: {
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

      //   hadList
      matches: [
        {
          aa: "2.20",
          dd: "5.25",
          hh: "10.00",
          updateDate: "2026-04-07",
          adf: "0",
          ad: "19.00",
          dhf: "0",
          dh: "12.00",
          aaf: "0",
          ah: "55.00",
          ddf: "0",
          hhf: "0",
          daf: "0",
          updateTime: "09:23:52",
          hdf: "0",
          haf: "0",
          goalLine: "",
          ha: "28.00",
          hd: "19.00",
          da: "3.80",
          ahf: "0",
        },
        {
          aa: "2.10",
          dd: "5.40",
          hh: "11.00",
          updateDate: "2026-04-07",
          adf: "0",
          ad: "19.00",
          dhf: "1",
          dh: "12.50",
          aaf: "-1",
          ah: "55.00",
          ddf: "1",
          hhf: "1",
          daf: "0",
          updateTime: "21:11:41",
          hdf: "0",
          haf: "0",
          goalLine: "",
          ha: "28.00",
          hd: "19.00",
          da: "3.80",
          ahf: "0",
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
