<template>
  <view class="withdraw-detail-page">
    <view class="header">
      <text class="title">提现详情</text>
    </view>

    <view class="detail-card" v-if="withdrawDetail.id">
      <view class="detail-item">
        <text class="label">提现单号:</text>
        <text class="value">{{ withdrawDetail.id }}</text>
      </view>
      <view class="detail-item">
        <text class="label">提现金额:</text>
        <text class="value amount">
          ¥{{ withdrawDetail.amount ? withdrawDetail.amount.toFixed(2) : "0.00" }}
        </text>
      </view>
      <view class="detail-item">
        <text class="label">剩余收益:</text>
        <text class="value">
          ¥{{ withdrawDetail.income ? withdrawDetail.income.toFixed(2) : "0.00" }}
        </text>
      </view>
      <view class="detail-item">
        <text class="label">提现账户:</text>
        <text class="value">{{ withdrawDetail.account }}</text>
      </view>
      <view class="detail-item">
        <text class="label">提现类型:</text>
        <text class="value">{{ getTypeText(withdrawDetail.type) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">备注:</text>
        <text class="value">{{ withdrawDetail.remark || "无" }}</text>
      </view>
      <view class="detail-item">
        <text class="label">创建时间:</text>
        <text class="value">{{ withdrawDetail.createTime }}</text>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-text">未找到提现详情</text>
    </view>
  </view>
</template>

<script setup>
import { getWithdrawDetailApi } from "@/api/apis";
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

const withdrawDetail = ref({});

const getWithdrawDetail = async (id) => {
  const res = await getWithdrawDetailApi(id);
  withdrawDetail.value = res.data.records[0];
};

onLoad((options) => {
  getWithdrawDetail(options.id);
});

const getTypeText = (type) => {
  switch (type) {
    case 1:
      return "银行卡";
    case 2:
      return "支付宝";
    // 可以根据实际情况添加更多类型
    default:
      return "未知";
  }
};
</script>

<style lang="scss" scoped>
.withdraw-detail-page {
  min-height: 100vh;
  background-color: #f7f7f7;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + var(--status-bar-height));
}

.header {
  margin-bottom: 40rpx;

  .title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
  }
}

.detail-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 28rpx;
    color: #666;
    flex-shrink: 0;
    margin-right: 20rpx;
  }

  .value {
    font-size: 28rpx;
    color: #333;
    text-align: right;
    flex-grow: 1;
    word-break: break-all;

    &.amount {
      font-weight: 600;
      color: #ffa726;
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
