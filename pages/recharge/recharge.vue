<template>
  <view class="recharge-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">我的金币</text>
        <view class="nav-right" @click="showInstructions">
          <text class="help-text">说明</text>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <scroll-view
      class="main-content"
      scroll-y="true"
      refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      :refresher-threshold="100"
      refresher-default-style="black"
      refresher-background="#f5f5f5"
      :enable-passive="true"
    >
      <!-- 用户信息区域 -->
      <view class="user-info-section">
        <text class="user-text">当前用户: {{ currentUser }}</text>
        <view class="balance-section">
          <text class="balance-text">我的余额:</text>
          <text class="balance-amount">{{ userBalance }}金币</text>
          <button class="record-btn" @click.stop="viewTransactionRecord">金币交易记录</button>
        </view>
      </view>

      <!-- 充值选项区域 -->
      <view class="recharge-section">
        <text class="section-title">充值金币</text>

        <!-- 预设金额选项 -->
        <view class="amount-options">
          <view
            class="amount-option"
            :class="{ active: selectedAmount === 10 }"
            @click.stop="selectAmount(10)"
          >
            <text class="amount-text">10个金币</text>
            <text class="price-text">10元</text>
            <view class="check-icon" v-if="selectedAmount === 10">✓</view>
          </view>

          <view
            class="amount-option"
            :class="{ active: selectedAmount === 50 }"
            @click.stop="selectAmount(50)"
          >
            <text class="amount-text">50个金币</text>
            <text class="price-text">50元</text>
            <view class="check-icon" v-if="selectedAmount === 50">✓</view>
          </view>

          <view
            class="amount-option"
            :class="{ active: selectedAmount === 100 }"
            @click.stop="selectAmount(100)"
          >
            <text class="amount-text">100个金币</text>
            <text class="price-text">100元</text>
            <view class="check-icon" v-if="selectedAmount === 100">✓</view>
          </view>
        </view>

        <!-- 自定义金额 -->
        <view class="custom-amount-section">
          <input
            type="number"
            placeholder="自定义金额"
            class="custom-input"
            v-model="customAmount"
            @input="updateCustomAmount"
          />
          <text class="conversion-text">元={{ customAmount || 0 }}金币</text>
        </view>

        <!-- 服务协议 -->
        <view class="agreement-section">
          <view class="agreement-checkbox" @click.stop="toggleAgreement">
            <view class="checkbox" :class="{ checked: agreedToTerms }">
              <text class="check-mark" v-if="agreedToTerms">✓</text>
            </view>
            <text class="agreement-text">
              我已阅读并同意
              <text class="link-text" @click.stop.prevent="viewAgreement">《充值服务协议》</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 规则说明 -->
      <view class="rules-section">
        <text class="rule-item">1、1元=1金币</text>
        <text class="rule-item">2、金币仅限于平台内部使用,充值后不可退还,不可兑换,不可提现</text>
        <text class="rule-item">3、若有疑问、请联系管理员（联系方式：13637666646）</text>
      </view>

      <!-- 支付按钮 -->
      <view class="payment-section">
        <button class="payment-btn" @click.stop="handlePayment">支付 ¥{{ paymentAmount }}元</button>
      </view>
    </scroll-view>

	<PaymentWrapper ref="PaymentWrapperRef" @payOver="payOver"/>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { getToken, getAccount } from "@/utils/request.js";
import { apiGetUserBalance } from "@/api/apis.js";
import PaymentWrapper from "../../components/Payment-wrapper.vue";

const PaymentWrapperRef = ref(null)

// 老人模式
const useOldManModeStore = inject("useOldManModeStore");

// 响应式数据
const currentUser = ref("vfmumq");
const userBalance = ref(0);
const selectedAmount = ref(10);
const customAmount = ref("");
const agreedToTerms = ref(uni.getStorageSync("paymentAgreement") || false);

const isRefreshing = ref(false);
const isLoadingUserInfo = ref(false); // 请求锁 - 防止重复请求用户信息

// 计算属性
const paymentAmount = computed(() => {
  if (customAmount.value && customAmount.value > 0) {
    return customAmount.value;
  }
  return selectedAmount.value;
});

const canPay = computed(() => {
  return agreedToTerms.value && paymentAmount.value > 0;
});

// 方法
const goBack = () => {
  uni.navigateBack();
};

const showInstructions = () => {
  uni.showModal({
    title: "充值说明",
    content: "1元=1金币，金币仅限平台内使用，充值后不可退还。",
    showCancel: false,
  });
};

const selectAmount = (amount) => {
  selectedAmount.value = amount;
  customAmount.value = "";
};

const updateCustomAmount = () => {
  if (customAmount.value && customAmount.value > 0) {
    selectedAmount.value = 0;
  }
};

const toggleAgreement = () => {
  agreedToTerms.value = !agreedToTerms.value;
};

const viewAgreement = () => {
  uni.navigateTo({
    url: "/pages/login/agreement?type=topupAgreement",
  });
};

const viewTransactionRecord = () => {
  uni.navigateTo({ url: "/pages/transaction/transaction" });
};

const handlePayment = async () => {
  if (!canPay.value) {
    const res = await uni.showModal({
      title: "提示",
      content: "请阅读《充值服务协议》",
      showCancel: true,
      confirmText: "同意",
    });
    if (!res.confirm) {
      return;
    }
  }
  uni.setStorageSync("paymentAgreement", true);
  uni.showModal({
    title: "确认支付",
    content: `确认支付 ¥${paymentAmount.value}元 购买 ${paymentAmount.value}个金币？`,
    success: (res) => {
      if (res.confirm) {
        // 这里调用支付API
        PaymentWrapperRef.value.pay({
			info: `用户充值${paymentAmount.value}元`,
			amount: paymentAmount.value,
			type: 0
		})
      }
    },
  });
};


const payOver = async () => {
	// 重新获取用户余额
	await getUserInfo();
};


// 获取用户信息
const getUserInfo = async () => {
  // 防止重复请求
  if (isLoadingUserInfo.value) {
    console.log("正在加载用户信息，跳过重复请求");
    return;
  }

  try {
    isLoadingUserInfo.value = true;
    const account = getAccount();
    if (account) {
      currentUser.value = account;

      // 获取用户余额
      const balanceResponse = await apiGetUserBalance({ account });
      if (balanceResponse.code === 200) {
        userBalance.value = balanceResponse.data || 0;
      }
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    // 获取用户信息失败，静默处理
  } finally {
    isLoadingUserInfo.value = false;
  }
};


// 下拉刷新方法
const onRefresh = async () => {
  try {
    isRefreshing.value = true;

    // 重新获取用户信息
    await getUserInfo();

    // 重置表单状态
    selectedAmount.value = 10;
    customAmount.value = "";
    agreedToTerms.value = false;

    // 延迟结束刷新状态
    setTimeout(() => {
      isRefreshing.value = false;
    }, 1000);
  } catch (error) {
    isRefreshing.value = false;
    uni.showToast({
      title: "刷新失败",
      icon: "none",
      duration: 2000,
    });
  }
};

// 页面加载时获取用户信息
onMounted(async () => {
  const token = getToken();
  if (!token) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/login/login" });
    }, 1500);
  } else {
    // 获取用户信息
    await getUserInfo();
  }
});

</script>

<style scoped lang="scss">
.recharge-container {
  min-height: 100vh;
  background-color: #f5f5f5;

  &.old-man-mode {
    .payment-btn {
      font-size: 48rpx;
    }

    .user-text,
    .balance-text,
    .balance-amount,
    .custom-input {
      font-size: 38rpx;
      font-weight: bold;
    }

    .amount-text,
    .agreement-text,
    .price-text,
    .rule-item {
      font-size: 36rpx;
      font-weight: bold;
    }

    .conversion-text {
      font-size: 34rpx;
      font-weight: bold;
    }
  }

  &:not(.old-man-mode) {
  }
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #fff;
  z-index: 999;
  border-bottom: 1rpx solid #e8e8e8;
  padding-top: var(--status-bar-height);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left,
.nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.help-text {
  font-size: 24rpx;
  color: #666;
}

/* 主要内容区域 */
.main-content {
  height: calc(100vh - 88rpx);
  padding-top: 88rpx;
  padding: 88rpx 30rpx 30rpx;
  box-sizing: border-box;
  margin-top: calc(40rpx + var(--status-bar-height));
}

/* 用户信息区域 */
.user-info-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.user-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.balance-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.balance-text {
  font-size: 28rpx;
  color: #333;
}

.balance-amount {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: 600;
}

.record-btn {
  background-color: #f8f9fa;
  color: #666;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  border: none;
}

/* 充值选项区域 */
.recharge-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-top: -10rpx;
  margin-bottom: 40rpx;
  padding-bottom: 15rpx;
}

.amount-options {
  display: flex;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.amount-option {
  flex: 1;
  background-color: #f8f9fa;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.amount-option.active {
  border-color: #ff4757;
  background-color: #fff5f5;
}

.amount-text {
  display: block;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.price-text {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.check-icon {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  background-color: #ff4757;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: bold;
}

/* 自定义金额 */
.custom-amount-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.custom-input {
  flex: 1;
  background-color: #f8f9fa;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.conversion-text {
  font-size: 24rpx;
  color: #666;
}

/* 服务协议 */
.agreement-section {
  margin-bottom: 30rpx;
}

.agreement-checkbox {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.checkbox.checked {
  background-color: #ff4757;
  border-color: #ff4757;
}

.check-mark {
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
}

.link-text {
  color: #007aff;
}

/* 规则说明 */
.rules-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.rule-item {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

/* 支付按钮 */
.payment-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #e8e8e8;
}

.payment-btn {
  width: 100%;
  height: 88rpx;
  background-color: #ff4757;
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-btn.disabled {
  background-color: #ccc;
  color: #999;
}

.payment-btn:active:not(.disabled) {
  background-color: #ff3742;
}

/* 二维码弹出层样式 */
.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.qr-content {
  width: 100%;
  max-width: 500rpx;
  background-color: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
}

.qr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.qr-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  font-weight: bold;
  width: 60rpx;
  text-align: center;
}

.qr-body {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-container {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 15rpx;
}

.qr-image {
  display: block;
  border-radius: 10rpx;
}

.qr-loading {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 10rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.qr-tip {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 15rpx;
}

.qr-amount {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: 600;
  text-align: center;
}

.qr-status {
  font-size: 24rpx;
  color: #28b389;
  text-align: center;
  margin-top: 10rpx;
  animation: pulse 1.5s infinite;
}

.qr-hint {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-top: 8rpx;
  line-height: 1.4;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}
</style>
