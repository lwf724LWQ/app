<template>
  <view class="shijihao-list" :class="{ 'old-man-mode': useOldManModeStore.enabled }">
    <!-- 图例：说明高亮含义 -->
    <view class="sjh-legend" v-if="list.length">
      <view class="sjh-legend-item">
        <view class="sjh-legend-dot is-group3"></view>
        <text class="sjh-legend-text">灰底=组三</text>
      </view>
      <view class="sjh-legend-item">
        <view class="sjh-legend-dot is-single-hit"></view>
        <text class="sjh-legend-text">单选同位命中</text>
      </view>
      <view class="sjh-legend-item">
        <view class="sjh-legend-dot is-group-hit"></view>
        <text class="sjh-legend-text">组选中</text>
      </view>
    </view>

    <view class="sjh-card" v-for="item in list" :key="item.issueno">
      <!-- 期号 / 开奖日期 / 星期 -->
      <view class="sjh-head">
        <text class="sjh-issue">{{ item.issueno }}期</text>
        <text class="sjh-date">{{ item.opendate }} {{ item.week }}</text>
      </view>

      <!-- 试机号 / 奖号 对比 -->
      <view class="sjh-body">
        <view class="sjh-row" v-for="row in item.rows" :key="row.key">
          <view class="sjh-tag" :class="'is-' + row.key">{{ row.label }}</view>

          <view class="sjh-balls">
            <view
              class="sjh-ball"
              :class="{ 'is-group3': row.group3 }"
              v-for="(digit, index) in row.digits"
              :key="index"
            >
              {{ digit }}
            </view>
          </view>

          <view class="sjh-stat">
            <text class="sjh-stat-label">和</text>
            <text class="sjh-stat-value">{{ row.sum }}</text>
          </view>
          <view class="sjh-stat">
            <text class="sjh-stat-label">跨</text>
            <text class="sjh-stat-value">{{ row.span }}</text>
          </view>
        </view>
      </view>

      <!-- 命中情况 -->
      <view class="sjh-hit">
        <view class="sjh-hit-row">
          <text class="sjh-hit-label">单选同位</text>
          <view class="sjh-hit-cells">
            <view
              class="sjh-cell"
              :class="{ 'is-single-hit': cell.value }"
              v-for="cell in item.singleCells"
              :key="'single-' + cell.label"
            >
              <text class="sjh-cell-label">{{ cell.label }}</text>
              <text class="sjh-cell-value">{{ cell.value || "—" }}</text>
            </view>
          </view>
        </view>

        <view class="sjh-hit-row">
          <text class="sjh-hit-label">组选中</text>
          <view class="sjh-hit-cells">
            <view
              class="sjh-cell"
              :class="{ 'is-group-hit': cell.value }"
              v-for="cell in item.groupCells"
              :key="'group-' + cell.label"
            >
              <text class="sjh-cell-label">{{ cell.label }}</text>
              <text class="sjh-cell-value">{{ cell.value || "—" }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="sjh-empty" v-if="isLoaded && !list.length">
      <uni-icons type="info" size="60" color="#c8c8c8"></uni-icons>
      <text class="sjh-empty-text">暂无试机号数据</text>
    </view>
  </view>
</template>

<script>
// 试机号卡片列表
// 每个期号一张卡片，避免 14 列宽表在手机上必须横向滑动
export default {
  name: "ShijihaoList",
  inject: ["useOldManModeStore"],
  props: {
    // 已整理好的试机号列表（见 loadShijihaoHooks.js 的 normalizeRecord）
    list: {
      type: Array,
      default: () => [],
    },
    isLoaded: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.shijihao-list {
  padding: 20rpx;
}

/* 图例 */
.sjh-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8rpx 24rpx;
  padding: 0 4rpx 16rpx 4rpx;
}

.sjh-legend-item {
  display: flex;
  align-items: center;
}

.sjh-legend-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  margin-right: 8rpx;

  &.is-group3 {
    background-color: #e8e8e8;
  }
  &.is-single-hit {
    background-color: #f5222d;
  }
  &.is-group-hit {
    background-color: #2f7cf6;
  }
}

.sjh-legend-text {
  font-size: 22rpx;
  color: #999;
}

/* 卡片 */
.sjh-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 头部 */
.sjh-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.sjh-issue {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.sjh-date {
  font-size: 24rpx;
  color: #999;
}

/* 对比区 */
.sjh-body {
  padding: 20rpx 0;
}

.sjh-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.sjh-tag {
  width: 76rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 8rpx;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-right: 16rpx;

  &.is-test {
    color: #fa8c16;
    background-color: #fff7e6;
  }

  &.is-award {
    color: #e74c3c;
    background-color: #fdeceb;
  }
}

.sjh-balls {
  display: flex;
  align-items: center;
  flex: 1;
}

.sjh-ball {
  width: 62rpx;
  height: 62rpx;
  line-height: 58rpx;
  text-align: center;
  border-radius: 50%;
  font-size: 32rpx;
  font-weight: bold;
  color: #e74c3c;
  background-color: #fff;
  border: 2rpx solid #f6c9c4;
  margin-right: 12rpx;
  box-sizing: border-box;

  /* 组三/豹子：灰底 */
  &.is-group3 {
    color: #666;
    background-color: #e8e8e8;
    border-color: #e8e8e8;
  }
}

.sjh-stat {
  display: flex;
  align-items: center;
  padding: 6rpx 12rpx;
  margin-left: 10rpx;
  background-color: #f7f7f7;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.sjh-stat-label {
  font-size: 20rpx;
  color: #999;
  margin-right: 6rpx;
}

.sjh-stat-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

/* 命中区 */
.sjh-hit {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.sjh-hit-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.sjh-hit-label {
  width: 120rpx;
  font-size: 22rpx;
  color: #999;
  flex-shrink: 0;
}

.sjh-hit-cells {
  display: flex;
  flex: 1;
  gap: 12rpx;
}

.sjh-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 76rpx;
  border-radius: 10rpx;
  background-color: #f7f7f7;
}

.sjh-cell-label {
  font-size: 20rpx;
  color: #aaa;
}

.sjh-cell-value {
  font-size: 30rpx;
  font-weight: bold;
  color: #ccc;
  line-height: 1.1;
}

/* 单选同位命中：红底白字 */
.sjh-cell.is-single-hit {
  background-color: #f5222d;

  .sjh-cell-label {
    color: rgba(255, 255, 255, 0.75);
  }
  .sjh-cell-value {
    color: #fff;
  }
}

/* 组选中：蓝底白字 */
.sjh-cell.is-group-hit {
  background-color: #2f7cf6;

  .sjh-cell-label {
    color: rgba(255, 255, 255, 0.75);
  }
  .sjh-cell-value {
    color: #fff;
  }
}

/* 空态 */
.sjh-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  margin: 0 0 20rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
}

.sjh-empty-text {
  margin-top: 24rpx;
  font-size: 30rpx;
  color: #666;
}

/* 老年模式 */
.shijihao-list.old-man-mode {
  .sjh-legend-text {
    font-size: 32rpx;
  }

  .sjh-issue {
    font-size: 44rpx;
  }

  .sjh-date {
    font-size: 34rpx;
  }

  .sjh-tag {
    width: 96rpx;
    height: 56rpx;
    line-height: 56rpx;
    font-size: 34rpx;
  }

  .sjh-ball {
    width: 80rpx;
    height: 80rpx;
    line-height: 76rpx;
    font-size: 42rpx;
  }

  .sjh-stat-label {
    font-size: 28rpx;
  }

  .sjh-stat-value {
    font-size: 38rpx;
  }

  .sjh-hit-label {
    width: 140rpx;
    font-size: 30rpx;
  }

  .sjh-cell {
    height: 92rpx;
  }

  .sjh-cell-label {
    font-size: 26rpx;
  }

  .sjh-cell-value {
    font-size: 38rpx;
  }

  .sjh-empty-text {
    font-size: 40rpx;
  }
}
</style>
