<template>
  <view class="my-income">
    <view class="container">
      <view class="header">
        <view class="title">可提现收益</view>
        <view class="income">
          <text class="number">{{ incomeCount.toFixed(2) }}</text>
        </view>
        <view class="withdraw-btn">
          <view class="withdraw-btn-item" @click="navigateToWithdrawRecord">
            <text>提现中</text>
            <uni-icons type="right" size="25" color="#666"></uni-icons>
          </view>
          <view class="withdraw-btn-item" @click="navigateToIncomeRecord">
            <text>收益记录</text>
            <uni-icons type="right" size="25" color="#666"></uni-icons>
          </view>
        </view>
      </view>
    </view>
    <view class="withdraw">
      <view class="title">提现收益</view>
      <input
        class="input"
        type="number"
        :placeholder="`最多可提现${incomeCount}收益`"
        v-model="withdrawAmount"
      />
      <view class="title">选择银行卡</view>
      <picker
        v-if="bankList.length"
        :range="bankList.map((item) => `${item.bname}(${item.bankNo.slice(-4)})`)"
        :value="pickIndex"
        @change="onPickerChange"
      >
        <view class="picker">
          {{ `${bankList[pickIndex]?.bname}(${bankList[pickIndex]?.bankNo.slice(-4)})` }}
        </view>
      </picker>
      <view class="picker" v-else @click="navigateToBankCard">请先绑定银行卡</view>
    </view>
    <view class="btn" @click="withdraw">立即提现</view>
  </view>
</template>

<script setup>
import { apiGetUserBalance, getUserBankListApi, withdrawApi } from "@/api/apis";
import { useUserStore } from "@/stores/userStore";
import { ref } from "vue";
import { onNavigationBarButtonTap, onShow } from "@dcloudio/uni-app";

const userStore = useUserStore();
// 获取收益总数
const incomeCount = ref(0);
const getUserIncomeCount = async () => {
  const res = await apiGetUserBalance({
    account: userStore.userInfo.account,
  });
  incomeCount.value = res.data.income;
};
getUserIncomeCount();

onNavigationBarButtonTap((e) => {
  if (e.text !== "绑定银行卡") return;
  navigateToBankCard();
});
// 跳转银行卡页面
const navigateToBankCard = () => {
  uni.navigateTo({
    url: "/pages/user/bank-card",
  });
};
// 提现
const bankList = ref([]);
const pickIndex = ref(0);
const withdrawAmount = ref(0);
const getBankList = async () => {
  const res = await getUserBankListApi();
  bankList.value = res.data;
};
// 刷新页面数据
onShow(async () => {
  await Promise.all([getUserIncomeCount(), getBankList()]);
  if (!bankList.value.length) currentBankCard.value = bankList.value[0];
});

const currentBankCard = ref(null);
const onPickerChange = (e) => {
  pickIndex.value = e.detail.value;
  currentBankCard.value = bankList.value[pickIndex.value];
};
// 提现
const withdraw = async () => {
  if (!incomeCount.value) {
    uni.showToast({
      title: "没有可提现收益",
      icon: "none",
    });
    return;
  }
  if (!withdrawAmount.value) {
    uni.showToast({
      title: "请输入提现金额",
      icon: "none",
    });
    return;
  }
  if (withdrawAmount.value > incomeCount.value) {
    uni.showToast({
      title: "提现金额不能大于可提现收益",
      icon: "none",
    });
    return;
  }
  if (withdrawAmount.value <= 0) {
    uni.showToast({
      title: "提现金额不能小于等于0",
      icon: "none",
    });
    return;
  }
  await getBankList();
  if (bankList.value.length === 0) {
    uni.showModal({
      title: "提示",
      content: "请先绑定银行卡",
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: "/pages/user/bank-card" });
        }
      },
    });
    return;
  }

  try {
    await withdrawApi({ amount: withdrawAmount.value, ...currentBankCard.value });
    uni.showToast({
      title: "提交成功",
      icon: "success",
    });
    await getUserIncomeCount();
  } catch {
    uni.showToast({
      title: "提交失败",
      icon: "none",
    });
  }
};

// 跳转提现记录
const navigateToWithdrawRecord = () => {
  uni.navigateTo({
    url: "/pages/user/withdraw-record",
  });
};
// 跳转收益记录
const navigateToIncomeRecord = () => {
  uni.navigateTo({
    url: "/pages/user/income-record",
  });
};
</script>

<style lang="scss" scoped>
view {
  box-sizing: border-box;
}

.my-income {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  width: 100%;
  padding: 40rpx 30rpx;
  background: #ff401c;

  .header {
    background-color: #fff;
    height: 350rpx;
    border-radius: 16rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
    justify-content: space-between;

    .title {
      color: #666;
      font-size: 28rpx;
      font-weight: 500;
    }

    .income {
      display: flex;
      align-items: baseline;

      .number {
        color: #ff401c;
        font-size: 80rpx;
        font-weight: bold;
        line-height: 1;
      }
    }

    .withdraw-btn {
      width: 500rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #666;
      .withdraw-btn-item {
        display: flex;
        align-items: center;
      }
    }
  }
}

.withdraw {
  margin: 40rpx 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .title {
    color: #333;
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 30rpx;
  }

  .input {
    width: 100%;
    height: 100rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 0 30rpx;
    font-size: 32rpx;
    color: #333;
    box-sizing: border-box;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    margin-bottom: 30rpx;

    &:focus {
      border-color: #ff401c;
      background-color: #fff;
    }
  }

  .picker {
    height: 100rpx;
    line-height: 100rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 0 30rpx;
    box-sizing: border-box;
  }
}

.btn {
  background: linear-gradient(135deg, #ff9900 0%, #ff7700 100%);
  color: #fff;
  width: 630rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  border-radius: 48rpx;
  margin: 60rpx auto 0;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(255, 153, 0, 0.3);
  transition: all 0.3s;

  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}
</style>
