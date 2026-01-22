<template>
  <view class="payment-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">订单支付</text>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info">
      <view class="info-item">
        <text class="info-label">订单信息:</text>
        <text class="info-value">{{ orderData.info }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">订单金额:</text>
        <text class="info-value">{{ orderData.amount }}金币</text>
      </view>
      <view class="info-item">
        <text class="info-label">订单类型:</text>
        <text class="info-value">{{ getOrderTypeText(orderData.type) }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">下单渠道:</text>
        <text class="info-value">{{ getChannelText(orderData.channel) }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-methods">
      <text class="section-title">支付方式</text>
      <radio-group @change="selectPaymentMethod">
        <label class="payment-method">
          <radio value="0" :checked="orderData.payType === 0" />
          <text class="method-text">直接支付</text>
        </label>
        <label class="payment-method">
          <radio value="1" :checked="orderData.payType === 1" />
          <text class="method-text">账户余额（{{ Gold }}金币）</text>
        </label>
      </radio-group>
    </view>

    <!-- 支付按钮 -->
    <view class="payment-btn-container">
      <button class="payment-btn" @click="handlePayment">确认支付</button>
    </view>

    <!-- 二维码支付弹出层 -->
    <view class="qr-modal" v-if="showQRModal" @click="closeQRModal">
      <view class="qr-content" @click.stop>
        <view class="qr-header">
          <text class="qr-title">扫码支付</text>
          <text class="close-btn" @click="closeQRModal">×</text>
        </view>
        <view class="qr-body">
          <view class="qr-code-container">
            <image
              v-if="qrCodeUrl"
              :src="qrCodeUrl"
              class="qr-image"
              :style="{ width: qrSize + 'px', height: qrSize + 'px' }"
              mode="aspectFit"
            ></image>
            <view v-else class="qr-loading">
              <text class="loading-text">生成二维码中...</text>
            </view>
          </view>
          <text class="qr-tip">请使用微信扫描二维码完成支付</text>
          <text class="qr-amount">支付金额：¥{{ orderData.amount }}元</text>
          <text class="qr-status" v-if="isCheckingPayment">正在检查支付状态...</text>
          <text class="qr-hint" v-if="isCheckingPayment">
            如已支付完成，可点击下方"支付完成"按钮
          </text>
        </view>
        <!-- <view class="qr-footer">
	      <button class="cancel-qr-btn" @click="closeQRModal">取消支付</button>
	      <button class="refresh-qr-btn" @click="refreshQRCode">刷新二维码</button>
	      <button class="success-qr-btn" @click="handlePaymentSuccess">支付完成</button>
	    </view> -->
      </view>
    </view>

    <!-- 支付结果提示 -->
    <!--  <view class="payment-result" v-if="paymentResult">
      <uni-icons 
        :type="paymentResult.success ? 'checkmarkempty' : 'closeempty'" 
        size="60" 
        :color="paymentResult.success ? '#4CAF50' : '#F44336'"
      ></uni-icons>
      <text class="result-text">{{ paymentResult.message }}</text>
      <button class="result-btn" @click="handleResult">
        {{ paymentResult.success ? '查看订单' : '重新支付' }}
      </button>
    </view> -->
    <PaymentWrapper ref="PaymentWrapperRef" @payOver="payOver" />
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import {
  apiRewardVideo,
  apiWxpay,
  apiCheckVideoPayment,
  apiGetUserBalance,
  apigoldpay,
} from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import PaymentWrapper from "../../components/Payment-wrapper/Payment-wrapper.vue";

const PaymentWrapperRef = ref(null);

// 订单数据
const orderData = ref({
  info: "",
  amount: "",
  type: 2, // 默认打赏类型
  account: "",
  payType: 0, // 默认微信支付
  channel: 1, // 默认微信小程序
});

const Gold = ref(0);
// 获取路由参数
onLoad(async (options) => {
  // 从路由参数中获取订单数据
  if (options.info) orderData.value.info = decodeURIComponent(options.info);
  if (options.amount) orderData.value.amount = options.amount;
  if (options.type) orderData.value.type = parseInt(options.type);
  if (options.account) orderData.value.account = decodeURIComponent(options.account);
  if (options.payType) orderData.value.payType = parseInt(options.payType);
  if (options.channel) orderData.value.channel = parseInt(options.channel);
  if (options.videoId) orderData.value.videoId = options.videoId; // 获取视频ID

  // 如果没有账号信息，使用当前登录账号
  if (!orderData.value.account) {
    orderData.value.account = getAccount();
  }

  Gold.value = await GetUserBalance();
  if (Gold.value >= orderData.value.amount) {
    orderData.value.payType = 1;
  }
});

async function GetUserBalance() {
  const res = await apiGetUserBalance({
    account: getAccount(),
  });
  return res.data.gold;
}

// 获取订单类型文本
const getOrderTypeText = (type) => {
  const types = {
    0: "充值",
    1: "提现",
    2: "打赏",
    3: "视频付费",
  };
  return types[type] || "未知类型";
};

// 获取下单渠道文本
const getChannelText = (channel) => {
  const channels = {
    0: "电脑端",
    1: "微信小程序",
    2: "APP",
  };
  return channels[channel] || "未知渠道";
};

// 选择支付方式
const selectPaymentMethod = (e) => {
  orderData.value.payType = parseInt(e.detail.value);
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

//---------------------------------------------------------------------------

const handlePayment = () => {
  uni.showModal({
    title: "确认支付",
    content: `确认支付 ¥${orderData.value.amount}元 购买 ${orderData.value.amount}个金币？`,
    success: (res) => {
      if (res.confirm) {
        // 这里调用支付API
        processPayment();
      }
    },
  });
};
const processPayment = async () => {
  uni.showLoading({
    title: "处理中...",
  });
  // 准备充值数据
  const rechargeData = {
    info: `付费${orderData.value.amount.toString()}元观看视频:` + orderData.value.info,
    amount: orderData.value.amount.toString(),
    type: orderData.value.type, // 0表示充值
    remark: orderData.value.videoId,
  };
  if (orderData.value.payType == "1") {
    rechargeData.payType = "1";
  }

  PaymentWrapperRef.value.pay(rechargeData);
};

function payOver({ flag }) {
  if (flag) {
    goBack();
  }
}
</script>

<style scoped>
.payment-container {
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

/* 订单信息 */
.order-info {
  margin-top: calc(100rpx + var(--status-bar-height));
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  margin-bottom: 25rpx;
  padding-bottom: 25rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  width: 180rpx;
  font-size: 30rpx;
  color: #666;
}

.info-value {
  flex: 1;
  font-size: 30rpx;
  color: #333;
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

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
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

/* 支付结果 */
.payment-result {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
  text-align: center;
}

.result-text {
  font-size: 36rpx;
  color: #333;
  margin: 30rpx 0;
  font-weight: 500;
}

.result-btn {
  background-color: #3498db;
  color: white;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 32rpx;
  margin-top: 20rpx;
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
