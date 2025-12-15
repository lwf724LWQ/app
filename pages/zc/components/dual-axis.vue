<template>
  <view class="dual-axis">
    <view class="header">
      <view>{{ leftName }}</view>
      <view>{{ rightName }}</view>
    </view>
    <view class="line-table">
      <view v-for="item in data" :key="item.id" class="line-item">
        <view class="line-text">
          <view>{{ item.left }}</view>
          <view>胜负</view>
          <view>{{ item.right }}</view>
        </view>
        <view class="line">
          <view
            class="left-line"
            :style="{ width: lineWidth(item, 'left') }"
          ></view>
          <view
            class="right-line"
            :style="{ width: lineWidth(item, 'right') }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    leftName: {
      type: String,
      default: "老虎大学",
    },
    rightName: {
      type: String,
      default: "蒂华纳",
    },
    data: {
      type: Array,
      default: () => [
        {
          id: 19,
          left: 3,
          right: 2,
        },
        {
          id: 11,
          left: 2,
          right: 2,
        },
        {
          id: 14,
          left: 3,
          right: 0,
        },
        {
          id: 13,
          left: 0,
          right: 2,
        },
      ],
    },
  },
  methods: {
    lineWidth(item, postion) {
      const count = (item.left + item.right) * 2;
      return `${(item[postion] / count) * 100}%`;
    },
  },
};
</script>

<style lang="scss" scoped>
.dual-axis {
  background-color: #111;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 25rpx;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx;
    color: #fff;
  }
  .line-table {
    width: 100%;
    color: #fff;

    .line-item {
      margin: 10rpx 0;
      .line-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .line {
        position: relative;
        width: 100%;
        height: 10rpx;
        background-color: #333;
        > view {
          height: 100%;
        }
        .left-line {
          position: absolute;
          right: 50%;
          background-color: #ff0000;
        }
        .right-line {
          position: absolute;
          left: 50%;
          background-color: #0000ff;
        }
      }
    }
  }
}
</style>