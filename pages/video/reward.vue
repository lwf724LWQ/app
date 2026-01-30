<template>
  <view class="reward-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">打赏作者</text>
        </view>
      </view>
    </view>

    <!-- 作者信息 -->
    <view class="author-info">
      <view class="author-avatar">
        <!-- 使用从路由参数获取的头像 -->
        <image :src="getAvatarUrl(authorAvatar)" class="avatar"></image>
        <view class="v-badge">V</view>
      </view>
      <view class="author-details">
        <!-- 使用从路由参数获取的作者名称 -->
        <text class="author-name">{{ authorName }}</text>
        <text class="author-location">{{ authorLocation }}</text>
      </view>
    </view>

    <!-- 打赏金额选项 -->
    <view class="reward-options">
      <text class="section-title">选择打赏金额</text>
      <view class="amount-grid">
        <view
          v-for="(amount, index) in amountOptions"
          :key="index"
          class="amount-option"
          :class="{ active: selectedAmount === amount }"
          @click="selectAmount(amount)"
        >
          <text class="amount-text">¥{{ amount }}</text>
        </view>
      </view>

      <!-- 添加自定义金额区域 -->
      <!-- <view class="custom-amount-section">
        <text class="custom-title">自定义金额</text>
        <view class="custom-input-container">
          <text class="currency-symbol">¥</text>
          <input
            type="number"
            class="custom-input"
            placeholder="输入金额"
            v-model="customAmount"
            @input="validateCustomAmount"
          />
          <button class="confirm-custom-btn" @click="confirmCustomAmount">确定</button>
        </view>
      </view> -->
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-methods">
      <text class="section-title">支付方式</text>
      <radio-group @change="selectPaymentMethod">
        <label class="payment-method">
          <radio value="0" :checked="paymentMethod === '0'" />
          <text class="method-text">直接支付</text>
        </label>
        <label class="payment-method">
          <radio value="1" :checked="paymentMethod === '1'" />
          <text class="method-text">账户余额({{ Gold }}金币)</text>
        </label>
      </radio-group>
    </view>

    <!-- 支付按钮 -->
    <view class="payment-btn-container">
      <button class="payment-btn" @click="handleReward">支付 ¥{{ selectedAmount }}元</button>
    </view>
    <PaymentWrapper ref="PaymentWrapperRef" @payOver="payOver" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { apiRewardVideo, apiWxpay, apiCheckVideoPayment, apiGetUserBalance } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import QRCode from "qrcode";
import PaymentWrapper from "../../components/Payment-wrapper/Payment-wrapper.vue";

const PaymentWrapperRef = ref(null);

// 打赏金额选项
const amountOptions = ref([1.8, 3.8, 5.8, 6.8, 8.8, 18, 38, 58, 68]);

// 选中的金额
const selectedAmount = ref(8.8);

// 自定义金额
const customAmount = ref("");
const isCustomAmountSelected = ref(false);

// 支付方式 (0:微信 1:账户余额)
const paymentMethod = ref("0");

// 作者信息
const authorName = ref("追梦人");
const authorAvatar = ref("");
const authorLocation = ref("海南省 - 儋州市");

// 路由参数
const routeParams = ref({
  videoId: "",
  author: "",
  title: "",
  authorAvatar: "", // 添加作者头像参数
  authorName: "", // 添加作者名称参数
});

const Gold = ref(0);

// 获取路由参数
onLoad(async (options) => {
  if (options.videoId) routeParams.value.videoId = options.videoId;
  if (options.author) routeParams.value.author = decodeURIComponent(options.author);
  if (options.title) routeParams.value.title = decodeURIComponent(options.title);

  // 获取作者头像和名称
  if (options.authorAvatar) {
    authorAvatar.value = decodeURIComponent(options.authorAvatar);
  }
  if (options.authorName) {
    authorName.value = decodeURIComponent(options.authorName);
  }

  uni.showLoading({
    title: "加载中...",
  });
  Gold.value = await GetUserBalance();
  uni.hideLoading();

  selectAmount(8.8);
});

async function GetUserBalance() {
  const res = await apiGetUserBalance({
    account: getAccount(),
  });
  return res.data.gold;
}

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return "/static/default-avatar.png";
  return `http://video.caimizm.com/himg/${avatar}`;
};

// 选择金额
const selectAmount = (amount) => {
  selectedAmount.value = amount;
  isCustomAmountSelected.value = false;

  if (amount <= Gold.value) {
    paymentMethod.value = "1";
  } else {
    paymentMethod.value = "0";
  }
};

// 选择支付方式
const selectPaymentMethod = (e) => {
  paymentMethod.value = e.detail.value;
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 验证自定义金额
const validateCustomAmount = () => {
  // 确保金额为正数
  if (customAmount.value < 0) {
    customAmount.value = "";
  }
};

// 确认自定义金额
const confirmCustomAmount = () => {
  if (!customAmount.value) {
    uni.showToast({
      title: "请输入金额",
      icon: "none",
    });
    return;
  }

  const amount = parseFloat(customAmount.value);
  if (isNaN(amount) || amount <= 0) {
    uni.showToast({
      title: "请输入有效金额",
      icon: "none",
    });
    return;
  }

  selectedAmount.value = amount;
  isCustomAmountSelected.value = true;
  uni.showToast({
    title: "已选择自定义金额",
    icon: "success",
  });
};

// 处理打赏
const handleReward = async () => {
  // 检查是否登录
  const token = getToken();
  if (!token) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateTo({
        url: "/pages/login/login",
      });
    }, 1500);
    return;
  }

  // 准备打赏数据
  const rewardData = {
    info: `打赏视频: ${routeParams.value.title}`,
    amount: selectedAmount.value.toString(),
    type: 2, // 2=打赏
    remark: routeParams.value.videoId,
  };

  // 选择账户余额支付
  if (paymentMethod.value === "1") {
    rewardData.payType = "1";
  }

  if (!rewardData.payType) {
    // 如果选择微信支付，显示确认支付弹窗
    uni.showModal({
      title: "确认支付",
      content: `确认支付 ¥${selectedAmount.value}元 打赏作者？`,
      success: (res) => {
        if (res.confirm) {
          PaymentWrapperRef.value.pay(rewardData);
        }
      },
    });
  } else {
    PaymentWrapperRef.value.pay(rewardData);
  }
};
function payOver({ flag }) {
  if (flag) {
    setTimeout(() => {
      // 延迟2秒后返回，让用户看到打赏成功的提示
      goBack();
    }, 2000);
  }
}
</script>

<style scoped>
.reward-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
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

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
}

/* 作者信息 */
.author-info {
  margin-top: 100rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.author-avatar {
  position: relative;
  margin-right: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.v-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24rpx;
  height: 24rpx;
  background-color: #ffd700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: bold;
  color: #fff;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.author-location {
  font-size: 24rpx;
  color: #666;
}

/* 打赏金额选项 */
.reward-options {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.amount-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.amount-option {
  flex: 1;
  min-width: 150rpx;
  padding: 20rpx;
  border: 2rpx solid #3498db;
  border-radius: 16rpx;
  text-align: center;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
}

.amount-option.active {
  background-color: #3498db;
  color: #fff;
  transform: translateY(-5rpx);
  box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.2);
}

.amount-text {
  font-size: 28rpx;
  font-weight: bold;
}

/* 自定义金额区域 */
.custom-amount-section {
  margin-top: 20rpx;
}

.custom-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  display: block;
}

.custom-input-container {
  display: flex;
  align-items: center;
  border: 2rpx solid #3498db;
  border-radius: 16rpx;
  padding: 10rpx 15rpx;
  background-color: #f8f8f8;
}

.currency-symbol {
  font-size: 32rpx;
  font-weight: bold;
  color: #3498db;
  margin-right: 10rpx;
}

.custom-input {
  flex: 1;
  font-size: 32rpx;
  height: 60rpx;
  padding: 0 15rpx;
  background-color: transparent;
}

.confirm-custom-btn {
  background-color: #3498db;
  color: white;
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* 支付方式选择 */
.payment-methods {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.payment-method {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  font-size: 28rpx;
  color: #333;
}

.method-text {
  margin-left: 15rpx;
}

/* 支付按钮 */
.payment-btn-container {
  margin-top: 40rpx;
  padding: 0 30rpx;
}

.payment-btn {
  background-color: #3498db;
  color: white;
  border-radius: 50rpx;
  padding: 25rpx;
  font-size: 34rpx;
  font-weight: 500;
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

.qr-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-qr-btn,
.refresh-qr-btn,
.success-qr-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.cancel-qr-btn {
  background-color: #f5f5f5;
  color: #666;
}

.refresh-qr-btn {
  background-color: #28b389;
  color: #fff;
}

.success-qr-btn {
  background-color: #ff4757;
  color: #fff;
}
</style>
