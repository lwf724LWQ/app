<template>
  <scroll-view
    class="income-record-page"
    scroll-y
    refresher-enabled
    :refresher-triggered="triggered"
    @scrolltolower="onScrolltolower"
    @refresherrefresh="onRefresh"
  >
    <view class="record-list">
      <view class="record-item" v-for="record in incomeList" :key="record.id">
        <view class="record-info">
          <view class="row">
            <text class="label">单号:</text>
            <text class="value">{{ record.id }}</text>
          </view>
          <view class="row">
            <text class="label">彩票名称:</text>
            <text class="value type">{{ record.tname || "暂无" }}</text>
          </view>
          <view class="row">
            <text class="label">收支类型:</text>
            <text class="value type">{{ getType(record.type) }}</text>
          </view>
          <view class="row">
            <text class="label">金额:</text>
            <text class="value amount">{{ record.amount.toFixed(2) }}</text>
          </view>
          <view class="row" v-if="record.income">
            <text class="label">账户金额:</text>
            <text class="value income">{{ record.income.toFixed(2) }}</text>
          </view>
          <view class="row">
            <text class="label">收益账户:</text>
            <text class="value">{{ record.account }}</text>
          </view>
          <view class="row" v-if="record.remark">
            <text class="label">备注:</text>
            <text class="value remark">{{ record.remark }}</text>
          </view>
          <view class="row">
            <text class="label">创建时间:</text>
            <text class="value">{{ record.createTime }}</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="incomeList.length === 0">
        <text class="empty-text">暂无收益记录</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { getIncomeListApi } from "@/api/apis";
import { ref } from "vue";

const usableHeight = uni.getSystemInfoSync().windowHeight;

const incomeList = ref([]);
let page = 1;
let limit = 10;

const getIncomeList = () => {
  return getIncomeListApi(page, limit);
};

const setIncomeList = async () => {
  const res = await getIncomeList();
  incomeList.value = res.data.records;
};

setIncomeList();

// 追加收益记录
let isAppend = false;
const addIncomeRecord = async () => {
  if (isAppend) return;
  isAppend = true;

  page++;
  const res = await getIncomeList();
  incomeList.value = [...incomeList.value, ...res.data.records];

  isAppend = false;
};

const getType = (type) => {
  switch (type) {
    case 0:
      return "收入";
    case 1:
      return "支出";
    default:
      return "其他";
  }
};

const triggered = ref(false);

const onRefresh = async () => {
  triggered.value = true;
  await setIncomeList();
  triggered.value = false;
};

const onScrolltolower = () => {
  addIncomeRecord();
};
</script>

<style lang="scss" scoped>
.income-record-page {
  height: v-bind('usableHeight + "px"');
  background-color: #f7f7f7;
}

.record-list {
  display: flex;
  flex-direction: column;
  padding: 20rpx 32rpx;
  gap: 24rpx;
}

.record-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);

  .record-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .label {
        font-size: 28rpx;
        color: #666;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;

        &.amount {
          font-size: 32rpx;
          font-weight: 600;
          color: #f44336; // Red for amount
        }

        &.income {
          font-size: 32rpx;
          font-weight: 600;
          color: #4caf50; // Green for income
        }
        &.type {
          color: #2196f3; // Blue for type
        }
        &.remark {
          color: #9e9e9e;
          font-size: 24rpx;
        }
      }
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
    font-size: 32rpx;
    color: #999;
  }
}
</style>
