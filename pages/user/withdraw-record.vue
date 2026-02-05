<template>
  <scroll-view
    class="withdraw-record"
    scroll-y
    refresher-enabled
    :refresher-triggered="triggered"
    @scrolltolower="onScrolltolower"
    @refresherrefresh="onRefresh"
  >
    <view class="record-list">
      <view class="record-item" v-for="record in withdrawList" :key="record.id">
        <view class="record-info">
          <view class="amount">
            <text class="label">提现金额:</text>
            <text class="value">¥{{ record.amount.toFixed(2) }}</text>
          </view>
          <view class="bank-info">
            <text class="label">提现银行:</text>
            <text class="value">{{ record.bname }} ({{ record.bankNo.slice(-4) }})</text>
          </view>
          <view class="time">
            <text class="label">申请时间:</text>
            <text class="value">{{ record.createTime }}</text>
          </view>
        </view>
        <view class="record-status">
          <text :class="getStatusClass(record.flag)">{{ getStatusText(record.flag) }}</text>
        </view>
      </view>

      <view class="empty-state" v-if="withdrawList.length === 0">
        <text class="empty-text">暂无提现记录</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { getWithdrawListApi } from "@/api/apis";
import { ref } from "vue";

const usableHeight = uni.getSystemInfoSync().windowHeight;

const withdrawList = ref([]);
let page = 1;
let limit = 10;

const getWithdrawList = async (page, limit) => {
  const res = await getWithdrawListApi(page, limit);
  return res.data.records;
};

const setWithdrawList = async () => {
  withdrawList.value = await getWithdrawList(page, limit);
};

setWithdrawList();

// 追加数据
let isAppend = false;
const addWithdrawList = async () => {
  if (isAppend) return;
  isAppend = true;

  page++;
  const res = await getWithdrawList(page, limit);
  withdrawList.value = [...withdrawList.value, ...res];

  isAppend = false;
};

// 触底
const onScrolltolower = () => {
  addWithdrawList();
};
// 下拉
const triggered = ref(false);
const onRefresh = async () => {
  triggered.value = true;
  try {
    await setWithdrawList();
    triggered.value = false;
  } finally {
    triggered.value = false;
  }
};
const getStatusText = (flag) => {
  switch (flag) {
    case 0:
      return "审核中";
    case 1:
      return "提现中";
    case 2:
      return "提现失败";
    case 3:
      return "提现成功";
    default:
      return "未知状态";
  }
};

const getStatusClass = (flag) => {
  switch (flag) {
    case 0:
      return "status-pending";
    case 1:
      return "status-pending";
    case 2:
      return "status-fail";
    case 3:
      return "status-success";
    default:
      return "";
  }
};
</script>

<style lang="scss" scoped>
.withdraw-record {
  height: v-bind('usableHeight + "px"');
  background-color: #f7f7f7;
}

.record-list {
  padding: 20rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .record-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .amount {
      .label {
        font-size: 28rpx;
        color: #666;
        margin-right: 10rpx;
      }
      .value {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
      }
    }

    .bank-info,
    .time {
      .label {
        font-size: 24rpx;
        color: #999;
        margin-right: 10rpx;
      }
      .value {
        font-size: 28rpx;
        color: #555;
      }
    }
  }

  .record-status {
    text {
      font-size: 28rpx;
      font-weight: 500;
      padding: 8rpx 20rpx;
      border-radius: 12rpx;
    }

    .status-pending {
      background-color: #ffeb3b;
      color: #333;
    }

    .status-success {
      background-color: #4caf50;
      color: #fff;
    }

    .status-fail {
      background-color: #f44336;
      color: #fff;
    }
  }
}

.empty-state {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 80rpx 32rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .empty-text {
    display: block;
    font-size: 40rpx;
    // color: #999;
  }
}
</style>
