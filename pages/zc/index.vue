<template>
  <view
    class="container"
    :class="useOldManModeStore.enabled ? 'old-man-mode' : ''"
  >
    <view class="StatusBarPlaceholder"></view>
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="tabs">
        <view
          v-for="(tab, index) in categories"
          :key="index"
          class="tab-item"
          :class="{ 'active-tab': selectedCategory === tab }"
          @click="selectCategory(tab)"
        >
          {{ tab }}
        </view>
      </view>
    </view>

    <!-- 赛事状态标签 -->
    <view class="status-tabs">
      <view
        v-for="(status, index) in statuses"
        :key="index"
        class="status-item"
        :class="{ 'active-status': selectedStatus === status }"
        @click="selectStatus(status)"
      >
        {{ status }}
      </view>
    </view>
    <view class="date-tabs">
      <view class="date-item" v-for="date in dateList" :key="date">
        <view>
          <view>{{ formatTime(date, "MM:DD") }}</view>
          <view>{{ formatTime(date, "周d") }}</view>
        </view>
      </view>
    </view>

    <!-- 赛事列表 -->
    <scroll-view class="match-list" scroll-y>
      <view
        v-for="(match, index) in matches"
        :key="index"
        class="match-item"
        @click="toDetail"
      >
        <view class="match-content">
          <view class="match-info">
            <view class="match-teams">
              <text
                class="team-name left-team-name"
                :class="{
                  time: match.status === '未开始',
                  score: match.status === '赛果',
                  live: match.status === '进行中',
                  upcoming: match.status === '即将开始',
                }"
                >{{ match.time }}</text
              >
              <text class="vs">未开</text>
              <text class="team-name">预测1</text>
            </view>

            <view class="match-teams">
              <text class="team-name left-team-name">{{ match.home }}</text>
              <text class="vs">VS</text>
              <text class="team-name">{{ match.away }}</text>
            </view>

            <!-- <view v-if="match.status === '即将开始'" class="upcoming-tag">
              即将开始
            </view> -->
          </view>

          <!-- <view class="favorite-icon">
            <uni-icons
              :type="match.isFavorite ? 'star-filled' : 'star'"
              size="20"
              :color="match.isFavorite ? '#FFD700' : '#999'"
            ></uni-icons>
          </view> -->
        </view>
      </view>
    </scroll-view>
    <bottomBar current-path="/pages/zc/index" />
  </view>
</template>
  
  <script>
import moment from "moment";
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";
export default {
  inject: ["useOldManModeStore"],
  components: {
    bottomBar,
  },

  data() {
    return {
      selectedCategory: "足球",
      categories: ["热门", "足球", "篮球"],

      selectedStatus: "赛程",
      statuses: ["即时", "进行中", "赛果", "赛程", "关注"],

      dateList: (() =>
        new Array(8).fill(null).map((_, i) => moment().add(i, "days")))(),

      matches: [
        {
          type: "日职联",
          home: "阪南大学",
          away: "熊本深海大学",
          score: "1:0",
          time: "11:00",
          status: "赛果",
          isFavorite: false,
        },
        {
          type: "日大学",
          home: "大阪大学体育",
          away: "高松大学",
          score: "0:0",
          time: "74:45",
          status: "进行中",
          isFavorite: false,
        },
        {
          type: "澳女联",
          home: "纽卡斯尔喷气机",
          away: "布里斯本狮吼女足",
          score: "0:0",
          time: "11:00",
          status: "即将开始",
          isFavorite: false,
        },
        {
          type: "日职乙",
          home: "千叶市原",
          away: "德岛漩涡",
          score: "VS",
          time: "12:05",
          status: "未开始",
          isFavorite: false,
        },
        {
          type: "中女甲",
          home: "阳信汇竞女足",
          away: "台中樱花女足",
          score: "VS",
          time: "15:00",
          status: "未开始",
          isFavorite: false,
        },
        {
          type: "中女甲",
          home: "新北航源女足",
          away: "女武神女足",
          score: "VS",
          time: "15:00",
          status: "未开始",
          isFavorite: false,
        },
        {
          type: "日女乙",
          home: "墨尔联运动会",
          away: "奥克兰城",
          score: "VS",
          time: "15:30",
          status: "未开始",
          isFavorite: false,
        },
        {
          type: "日女乙",
          home: "筑波大学",
          away: "帝台大学",
          score: "VS",
          time: "15:30",
          status: "未开始",
          isFavorite: false,
        },
        {
          type: "日女乙",
          home: "关西学院大学",
          away: "仙台大学",
          score: "VS",
          time: "15:30",
          status: "未开始",
          isFavorite: false,
        },
      ],
    };
  },
  methods: {
    formatTime(time, formatStr) {
      return moment(time).format(formatStr);
    },
    selectCategory(tab) {
      this.selectedCategory = tab;
    },
    selectStatus(status) {
      this.selectedStatus = status;
    },
    toDetail() {
      uni.navigateTo({
        url: "/pages/zc/detail",
      });
    },
  },
};
</script>
  
  <style lang="scss" scoped>
.old-man-mode.container {
  .tab-item,
  .status-item {
    font-size: 38rpx;
  }
  .date-item {
    font-size: 32rpx;
    font-weight: bold;
    color: #ccc;
  }
  .match-content,
  .match-teams {
    font-size: 35rpx;
  }
}
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #191919;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica,
    "PingFang SC", "Microsoft YaHei", sans-serif;

  box-sizing: border-box;
}
.StatusBarPlaceholder {
  min-height: var(--status-bar-height);
  width: 100%;
  background: #fff;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100rpx;
  padding: 0 20rpx;
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabs {
  display: flex;
  justify-content: center;
  margin: 0 30rpx;

  border: 1px solid #888;
  border-radius: 15rpx;
}

.tab-item {
  box-sizing: border-box;
  padding: 0 34rpx;
  height: 50rpx;
  line-height: 50rpx;
  color: #fff;
  font-size: 26rpx;

  border-right: 1px solid #888;
  &:last-child {
    border-right: none;
  }
}

.active-tab {
  color: #fff;
  background-color: #007adc;
  font-weight: bold;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 6rpx;
    background-color: #007aff;
    border-radius: 2rpx;
  }
  &::before {
    content: "";
    position: absolute;
    right: -1rpx;
    top: 0;
    width: 8rpx;
    height: 100%;
    background-color: #007aff;
    border-radius: 2rpx;
  }
}

.notification-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-tabs {
  display: flex;
  min-height: 60rpx;

  border-bottom: 1px solid #888;
}

.status-item {
  padding: 0 25rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 28rpx;
  color: #fff;
  white-space: nowrap;
  flex: 1;
  text-align: center;
}

.active-status {
  font-weight: bold;
  position: relative;
}

.active-status::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background-color: #007aff;
  border-radius: 2rpx;
}

.date-tabs {
  display: flex;
  min-height: 60rpx;
  color: #888;
  font-size: 24rpx;
  padding: 10rpx 0;
  .date-item {
    flex: 1;
    text-align: center;
  }
}

.match-list {
  flex: 1;
  padding: 20rpx 0;
  overflow: hidden;
}

.match-item {
  border-radius: 12rpx;
  overflow: hidden;
}

.match-type {
  padding: 15rpx 20rpx;
  font-size: 24rpx;
  color: #666;
}

.match-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.match-info {
  flex: 1;
  min-width: 0;
}

.match-teams {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.team-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff;
}

.left-team-name {
  text-align: right;
}

.vs {
  margin: 0 15rpx;
  color: #999;
  font-weight: bold;
}

.match-time-score {
  display: flex;
  align-items: center;
  font-size: 26rpx;
}
.match-time {
  text-align: right;
}
.time {
  color: #666;
}

.score {
  color: #333;
  font-weight: bold;
}

.live {
  color: #ff4d4f;
  font-weight: bold;
}

.upcoming {
  color: #1890ff;
  font-weight: bold;
}

.score-text {
  margin-left: 20rpx;
  font-weight: bold;
}

.upcoming-tag {
  display: inline-block;
  background-color: #1890ff;
  font-size: 22rpx;
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  margin-top: 10rpx;
}

.favorite-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>