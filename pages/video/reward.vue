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
        <view v-for="(amount, index) in amountOptions" :key="index" class="amount-option"
          :class="{ 'active': selectedAmount === amount }" @click="selectAmount(amount)">
          <text class="amount-text">¥{{ amount }}</text>
        </view>
      </view>

      <!-- 添加自定义金额区域 -->
      <view class="custom-amount-section">
        <text class="custom-title">自定义金额</text>
        <view class="custom-input-container">
          <text class="currency-symbol">¥</text>
          <input type="number" class="custom-input" placeholder="输入金额" v-model="customAmount"
            @input="validateCustomAmount" />
          <button class="confirm-custom-btn" @click="confirmCustomAmount">确定</button>
        </view>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-methods">
      <text class="section-title">支付方式</text>
      <radio-group @change="selectPaymentMethod">
        <label class="payment-method">
          <radio value="0" :checked="paymentMethod === '0'" />
          <text class="method-text">微信支付</text>
        </label>
        <label class="payment-method">
          <radio value="1" :checked="paymentMethod === '1'" />
          <text class="method-text">账户余额</text>
        </label>
      </radio-group>
    </view>

    <!-- 支付按钮 -->
    <view class="payment-btn-container">
      <button class="payment-btn" @click="handleReward">支付 ¥{{ selectedAmount }}元</button>
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
            <image v-if="qrCodeUrl" :src="qrCodeUrl" class="qr-image"
              :style="{ width: qrSize + 'px', height: qrSize + 'px' }" mode="aspectFit"></image>
            <view v-else class="qr-loading">
              <text class="loading-text">生成二维码中...</text>
            </view>
          </view>
          <text class="qr-tip">请使用微信扫描二维码完成支付</text>
          <text class="qr-amount">支付金额：¥{{ selectedAmount }}元</text>
          <text class="qr-status" v-if="isCheckingPayment">正在检查支付状态...</text>
          <text class="qr-hint" v-if="isCheckingPayment">如已支付完成，可点击下方"支付完成"按钮</text>
        </view>
        <!-- <view class="qr-footer">
          <button class="cancel-qr-btn" @click="closeQRModal">取消支付</button>
          <button class="refresh-qr-btn" @click="refreshQRCode">刷新二维码</button>
          <button class="success-qr-btn" @click="handlePaymentSuccess">支付完成</button>
        </view> -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import { apiRewardVideo, apiWxpay, apiCheckVideoPayment } from '@/api/apis';
import { getToken, getAccount } from '@/utils/request.js';
import QRCode from 'qrcode';
// 打赏金额选项
const amountOptions = ref([1.8, 3.8, 5.8, 6.8, 8.8, 18, 38, 58, 68]);

// 选中的金额
const selectedAmount = ref(3.8);

// 自定义金额
const customAmount = ref('');
const isCustomAmountSelected = ref(false);

// 支付方式 (0:微信 1:账户余额)
const paymentMethod = ref('0');

// 作者信息
const authorName = ref('追梦人');
const authorAvatar = ref('');
const authorLocation = ref('海南省 - 儋州市');

// 路由参数
const routeParams = ref({
  videoId: '',
  author: '',
  title: '',
  authorAvatar: '', // 添加作者头像参数
  authorName: ''   // 添加作者名称参数
});

// 二维码相关数据
const showQRModal = ref(false);
const qrSize = ref(200);
const currentPaymentUrl = ref('');
const qrCodeUrl = ref('');
const paymentCheckTimer = ref(null);
const isCheckingPayment = ref(false);

// 获取路由参数
onLoad((options) => {
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
});

// 获取头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return '/static/default-avatar.png';
  return `http://video.caimizm.com/himg/${avatar}`;
};

// 选择金额
const selectAmount = (amount) => {
  selectedAmount.value = amount;
  isCustomAmountSelected.value = false;
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
    customAmount.value = '';
  }
};

// 确认自定义金额
const confirmCustomAmount = () => {
  if (!customAmount.value) {
    uni.showToast({
      title: '请输入金额',
      icon: 'none'
    });
    return;
  }

  const amount = parseFloat(customAmount.value);
  if (isNaN(amount) || amount <= 0) {
    uni.showToast({
      title: '请输入有效金额',
      icon: 'none'
    });
    return;
  }

  selectedAmount.value = amount;
  isCustomAmountSelected.value = true;
  uni.showToast({
    title: '已选择自定义金额',
    icon: 'success'
  });
};

// 处理打赏
const handleReward = async () => {
  // 检查是否登录
  const token = getToken();
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 1500);
    return;
  }

  // 如果选择账户余额支付，直接调用打赏API
  if (paymentMethod.value === '1') {
    await processReward();
    return;
  }

  // 如果选择微信支付，显示确认支付弹窗
  uni.showModal({
    title: '确认支付',
    content: `确认支付 ¥${selectedAmount.value}元 打赏作者？`,
    success: (res) => {
      if (res.confirm) {
        processReward();
      }
    }
  });
};

// 处理打赏流程
const processReward = async () => {
  uni.showLoading({
    title: '处理中...'
  });

  try {
    // 准备打赏数据
    const rewardData = {
      info: `打赏视频: ${routeParams.value.title}`,
      amount: selectedAmount.value.toString(),
      type: 2, // 2=打赏
      account: getAccount(),
      payType: paymentMethod.value,
      channel: 1 // 微信小程序
    };

    // 调用打赏API
    const response = await apiRewardVideo(rewardData);

    if (response.code === 200 && response.data) {
      // 如果选择微信支付，处理微信支付流程
      // 调用微信支付API
      const wxPayResponse = await callWxPayApi(response.data);

      if (wxPayResponse.code === 200) {
        // 处理微信支付返回的数据
        handleWxPayResponse(wxPayResponse.data);
      } else {
        uni.showToast({
          title: wxPayResponse.msg || '微信支付请求失败',
          icon: 'none'
        });
      }
    } else {
      uni.showToast({
        title: response.msg || '打赏失败',
        icon: 'none'
      });
    }

    uni.hideLoading();
  } catch (error) {
    uni.hideLoading();
    console.error('打赏接口调用失败:', error);
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    });
  }
};

// 调用微信支付API
const callWxPayApi = async (orderNo) => {
  try {
    // 准备微信支付数据
    const wxPayData = {
      account: getAccount(),
      orderNo: orderNo,
      remark: routeParams.value.videoId
    };

    // 调用微信支付API
    return await apiWxpay(wxPayData);
  } catch (error) {
    console.error('微信支付接口调用失败:', error);
    return {
      code: 500,
      msg: '微信支付接口调用失败'
    };
  }
};

// 处理微信支付返回的数据
const handleWxPayResponse = (wxPayData) => {
  if (wxPayData && wxPayData.includes('weixin://wxpay')) {
    // 显示二维码支付
    currentPaymentUrl.value = wxPayData;
    showQRModal.value = true;

    // 生成二维码
    setTimeout(() => {
      generateQRCode(wxPayData);
      // 开始检查支付状态
      startPaymentCheck();
    }, 100);
  }
};

// 二维码相关方法
const generateQRCode = (url) => {

  // 首先尝试使用qrcode库
  QRCode.toDataURL(url, {
    width: qrSize.value,
    height: qrSize.value,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }, (error, dataUrl) => {
    if (error) {
      console.error('二维码生成失败:', error);
      // 使用在线服务作为备选
      generateQRCodeOnline(url);
    } else {
      // 直接设置二维码URL
      qrCodeUrl.value = dataUrl;
    }
  });
  //   import('qrcode').then(QRCode => {
  //     // 生成二维码数据URL
  //     QRCode.toDataURL(url, {
  //       width: qrSize.value,
  //       height: qrSize.value,
  //       margin: 2,
  //       color: {
  //         dark: '#000000',
  //         light: '#FFFFFF'
  //       }
  //     }, (error, dataUrl) => {
  //       if (error) {
  //         console.error('二维码生成失败:', error);
  //         // 使用在线服务作为备选
  //         generateQRCodeOnline(url);
  //       } else {
  //         // 直接设置二维码URL
  //         qrCodeUrl.value = dataUrl;
  //       }
  //     });
  //   }).catch(error => {
  //     console.error('导入qrcode库失败:', error);
  //     // 使用在线服务作为备选
  //     generateQRCodeOnline(url);
  //   });
  // } catch (error) {
  //   console.error('生成二维码失败:', error);
  //   // 使用在线服务作为备选
  //   generateQRCodeOnline(url);
  // }
};

// 使用在线服务生成二维码
const generateQRCodeOnline = (url) => {
  try {
    // 使用qrcode.js在线服务
    const encodedUrl = encodeURIComponent(url);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize.value}x${qrSize.value}&data=${encodedUrl}`;
    qrCodeUrl.value = qrApiUrl;
  } catch (error) {
    console.error('在线二维码生成失败:', error);
    uni.showToast({
      title: '二维码生成失败',
      icon: 'none'
    });
  }
};

// 开始检查支付状态
const startPaymentCheck = () => {
  // 清除之前的定时器
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value);
  }

  isCheckingPayment.value = true;
  let checkCount = 0;
  const maxChecks = 20; // 最多检查20次（100秒）

  // 每3秒检查一次支付状态
  paymentCheckTimer.value = setInterval(async () => {
    try {
      checkCount++;

      // 调用真实API检查支付状态
      const paymentStatus = await checkRealPaymentStatus();

      if (paymentStatus === true) {
        // 支付成功
        await handlePaymentSuccess();
        return;
      } else if (paymentStatus === false) {
        // 支付失败或仍在处理中，继续检查
        console.log('支付状态检查中...');
      }

      // 如果检查次数达到上限，停止检查
      if (checkCount >= maxChecks) {
        console.log('支付检查超时，停止检查');
        stopPaymentCheck();
        uni.showToast({
          title: '支付检查超时，请手动确认',
          icon: 'none',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('检查支付状态失败:', error);
    }
  }, 3000);
};

// 检查真实支付状态
const checkRealPaymentStatus = async () => {
  try {
    // 调用支付状态检查API
    const response = await apiCheckVideoPayment({
      videoId: routeParams.value.videoId,
      account: getAccount()
    });

    if (response.code === 200) {
      // 根据API返回的data字段判断支付状态
      return response.data; // true表示已支付，false表示未支付
    }

    return false;
  } catch (error) {
    console.error('支付状态检查API调用失败:', error);
    return false;
  }
};

// 处理支付成功
const handlePaymentSuccess = async () => {
  try {
    // 停止检查支付状态
    stopPaymentCheck();

    // 显示支付成功提示
    uni.showModal({
      title: '支付成功',
      content: `恭喜您！成功打赏${selectedAmount.value}金币`,
      showCancel: false,
      success: () => {
        // 关闭二维码弹窗
        closeQRModal();

        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      }
    });
  } catch (error) {
    console.error('处理支付成功失败:', error);
  }
};

// 关闭二维码弹窗
const closeQRModal = () => {
  // 停止检查支付状态
  stopPaymentCheck();

  showQRModal.value = false;
  currentPaymentUrl.value = '';
  qrCodeUrl.value = '';
};

// 刷新二维码
const refreshQRCode = () => {
  if (currentPaymentUrl.value) {
    qrCodeUrl.value = ''; // 清空当前二维码
    generateQRCode(currentPaymentUrl.value);
  }
};

// 停止检查支付状态
const stopPaymentCheck = () => {
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value);
    paymentCheckTimer.value = null;
  }
  isCheckingPayment.value = false;
  console.log('停止检查支付状态');
};
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
  color: #28B389;
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
  background-color: #28B389;
  color: #fff;
}

.success-qr-btn {
  background-color: #ff4757;
  color: #fff;
}
</style>