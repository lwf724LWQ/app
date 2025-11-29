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
          <text class="method-text">微信支付</text>
        </label>
        <label class="payment-method">
          <radio value="1" :checked="orderData.payType === 1" />
          <text class="method-text">账户余额</text>
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
            <image v-if="qrCodeUrl" :src="qrCodeUrl" class="qr-image"
              :style="{ width: qrSize + 'px', height: qrSize + 'px' }" mode="aspectFit"></image>
            <view v-else class="qr-loading">
              <text class="loading-text">生成二维码中...</text>
            </view>
          </view>
          <text class="qr-tip">请使用微信扫描二维码完成支付</text>
          <text class="qr-amount">支付金额：¥{{ orderData.amount }}元</text>
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
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { apiRewardVideo, apiWxpay, apiCheckVideoPayment, apiGetUserBalance, apigoldpay, } from '@/api/apis';
import { getToken, getAccount } from '@/utils/request.js';


// 二维码相关数据
const showQRModal = ref(false)
const qrSize = ref(200)
const currentPaymentUrl = ref('')
const qrCodeUrl = ref('')
const paymentCheckTimer = ref(null)
const isCheckingPayment = ref(false)
const isRefreshing = ref(false)

// 订单数据
const orderData = ref({
  info: '',
  amount: '',
  type: 2, // 默认打赏类型
  account: '',
  payType: 0, // 默认微信支付
  channel: 1 // 默认微信小程序
});

// 支付结果
const paymentResult = ref(null);

// 获取路由参数
onLoad((options) => {
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
});

// 获取订单类型文本
const getOrderTypeText = (type) => {
  const types = {
    0: '充值',
    1: '提现',
    2: '打赏',
    3: '视频付费'
  };
  return types[type] || '未知类型';
};

// 获取下单渠道文本
const getChannelText = (channel) => {
  const channels = {
    0: '电脑端',
    1: '微信小程序',
    2: 'APP'
  };
  return channels[channel] || '未知渠道';
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
    title: '确认支付',
    content: `确认支付 ¥${orderData.value.amount}元 购买 ${orderData.value.amount}个金币？`,
    success: (res) => {
      if (res.confirm) {
        // 这里调用支付API
        processPayment()
      }
    }
  })
}
const processPayment = async () => {
  uni.showLoading({
    title: '处理中...'
  })

  try {
    // 准备充值数据
    const rechargeData = {
      info: `用户充值${orderData.value.amount}元`,
      amount: orderData.value.amount.toString(),
      type: orderData.value.type, // 0表示充值
      account: getAccount() || currentUser.value,
      payType: orderData.value.payType// 0表示微信支付
    }


    // 如果是余额支付
    if (orderData.value.payType === 1) {
      // 1. 查询用户余额
      const balanceResponse = await apiGetUserBalance({
        account: getAccount()
      })
      if (balanceResponse.code !== 200) {
        uni.hideLoading()
        uni.showToast({
          title: balanceResponse.msg || '查询余额失败',
          icon: 'none'
        })
        return
      }

      const userBalance = parseFloat(balanceResponse.data || 0)
      const paymentAmount = parseFloat(orderData.value.amount)

      // 2. 检查余额是否足够
      if (userBalance < paymentAmount) {
        console.log(userBalance, paymentAmount)
        uni.hideLoading()
        uni.showToast({
          title: '余额不足，请充值',
          icon: 'none'
        })

        // 跳转到充值页面
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/recharge/recharge'
          })
        }, 1500)
        return
      }
      //  创建订单
      const orderResponse = await apiRewardVideo(rechargeData)
      if (orderResponse.code !== 200) {
        uni.hideLoading()
        uni.showToast({
          title: orderResponse.msg || '创建订单失败',
          icon: 'none'
        })
        return
      }
      // 获取订单号
      const orderNo = orderResponse.data
      // 3. 调用余额支付接口
      const goldPayResponse = await apigoldpay({
        account: getAccount(),
        orderNo: orderNo,
        remark: orderData.value.videoId
      })

      uni.hideLoading()

      if (goldPayResponse.code === 200) {
        // 余额支付成功
        uni.showModal({
          title: '支付成功',
          content: `成功支付${orderData.value.amount}金币`,
          showCancel: false,
          success: () => {
            // 返回上一页
            goBack()
          }
        })
      } else {
        uni.showToast({
          title: goldPayResponse.msg || '余额支付失败',
          icon: 'none'
        })
      }
      return
    }


    // 调用充值接口
    const response = await apiRewardVideo(rechargeData)
    // 如果充值接口返回订单号，调用微信支付接口
    if (response.code === 200 && response.data) {
      // 调用微信支付接口
      const wxPayResponse = await callWxPayApi(response.data)

      if (wxPayResponse.code === 200) {
        // 处理微信支付返回的数据
        handleWxPayResponse(wxPayResponse.data)
      } else {
        uni.showToast({
          title: wxPayResponse.msg || '微信支付请求失败',
          icon: 'none'
        })
      }
    } else {
      uni.showToast({
        title: response.msg || '充值失败',
        icon: 'none'
      })
    }
    uni.hideLoading()

    if (response.code === 200) {
      // 充值成功，处理微信支付
      if (response.data && response.data.includes('weixin://wxpay')) {
        // 显示二维码支付
        currentPaymentUrl.value = response.data
        showQRModal.value = true

        // 生成二维码
        setTimeout(() => {
          generateQRCode(response.data)
          // 开始检查支付状态
          startPaymentCheck()
        }, 100)
      }
    } else {
      // 充值失败
      uni.showToast({
        title: response.msg || '充值失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('充值接口调用失败:', error)
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  }
}

// 调用微信支付API
const callWxPayApi = async (orderNo) => {

  try {
    // 准备微信支付数据
    const wxPayData = {
      account: getAccount(),
      orderNo: orderNo,
      remark: orderData.value.videoId
    }
    // 调用微信支付API
    return await apiWxpay(wxPayData)
  } catch (error) {
    console.error('微信支付接口调用失败:', error)
    return {
      code: 500,
      msg: '微信支付接口调用失败'
    }
  }
}

// 处理微信支付返回的数据
const handleWxPayResponse = (wxPayData) => {
  if (wxPayData && wxPayData.includes('weixin://wxpay')) {
    // 显示二维码支付
    currentPaymentUrl.value = wxPayData
    showQRModal.value = true

    // 生成二维码
    setTimeout(() => {
      generateQRCode(wxPayData)
      // 开始检查支付状态
      startPaymentCheck()
    }, 100)
  }
}
// 二维码相关方法
const generateQRCode = (url) => {
  try {
    // 首先尝试使用qrcode库
    import('qrcode').then(QRCode => {
      // 生成二维码数据URL
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
          console.error('二维码生成失败:', error)
          // 使用在线服务作为备选
          generateQRCodeOnline(url)
        } else {
          // 直接设置二维码URL
          qrCodeUrl.value = dataUrl
        }
      })
    }).catch(error => {
      console.error('导入qrcode库失败:', error)
      // 使用在线服务作为备选
      generateQRCodeOnline(url)
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
    // 使用在线服务作为备选
    generateQRCodeOnline(url)
  }
}

// 使用在线服务生成二维码
const generateQRCodeOnline = (url) => {
  try {
    // 使用qrcode.js在线服务
    const encodedUrl = encodeURIComponent(url)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize.value}x${qrSize.value}&data=${encodedUrl}`
    qrCodeUrl.value = qrApiUrl
  } catch (error) {
    console.error('在线二维码生成失败:', error)
    uni.showToast({
      title: '二维码生成失败',
      icon: 'none'
    })
  }
}



// 开始检查支付状态
const startPaymentCheck = () => {
  // 清除之前的定时器
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value)
  }

  isCheckingPayment.value = true
  let checkCount = 0
  const maxChecks = 20 // 最多检查20次（100秒）



  // 每3秒检查一次支付状态
  paymentCheckTimer.value = setInterval(async () => {
    try {
      checkCount++
      // 调用真实API检查支付状态
      const paymentStatus = await checkRealPaymentStatus()

      if (paymentStatus === true) {
        // 支付成功
        await handlePaymentSuccess()
        return
      } else if (paymentStatus === false) {
        // 支付失败或仍在处理中，继续检查
        console.log('支付状态检查中...')
      }
      // 如果检查次数达到上限，停止检查
      if (checkCount >= maxChecks) {
        console.log('支付检查超时，停止检查')
        stopPaymentCheck()
        uni.showToast({
          title: '支付检查超时，请手动确认',
          icon: 'none',
          duration: 3000
        })
      }

      // 实际项目中，这里应该调用后端接口检查支付状态
      // const paymentStatus = await checkPaymentStatus(currentPaymentUrl.value)
      // if (paymentStatus === 'success') {
      //   await handlePaymentSuccess()
      // }
    } catch (error) {
      console.error('检查支付状态失败:', error)
    }
  }, 3000)
}
// 检查真实支付状态
const checkRealPaymentStatus = async () => {
  try {
    // 调用支付状态检查API
    const response = await apiCheckVideoPayment({
      videoId: orderData.value.videoId,
      account: getAccount()
    })

    if (response.code === 200) {
      // 根据API返回的data字段判断支付状态
      return response.data // true表示已支付，false表示未支付
    }

    return false
  } catch (error) {
    console.error('支付状态检查API调用失败:', error)
    return false
  }
}

const closeQRModal = () => {
  // 停止检查支付状态
  stopPaymentCheck()
  goBack();
  // showQRModal.value = false
  // currentPaymentUrl.value = ''
  // qrCodeUrl.value = ''
}
//刷新二维码
const refreshQRCode = () => {
  if (currentPaymentUrl.value) {
    qrCodeUrl.value = '' // 清空当前二维码
    generateQRCode(currentPaymentUrl.value)
  }
}

//---------------------------------------------------------------------------

// 确认支付
const confirmPayment = async () => {
  try {
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

    // 调用支付API
    const response = await apiRewardVideo(orderData);

    if (response.success) {
      // 支付成功
      paymentResult.value = {
        success: true,
        message: '支付成功！'
      };
    } else {
      // 支付失败
      paymentResult.value = {
        success: false,
        message: response.message || '支付失败，请重试'
      };
    }
  } catch (error) {
    console.error('支付失败:', error);
    paymentResult.value = {
      success: false,
      message: error.message || '支付失败，请重试'
    };
  }
};

// 处理支付成功
const handlePaymentSuccess = async () => {
  try {
    // 关闭二维码弹窗
    closeQRModal()
    // 停止检查支付状态
    stopPaymentCheck()
    // 显示支付成功提示
    uni.showModal({
      title: '支付成功',
      content: `恭喜您！成功充值${orderData.value.amount}个金币`,
      showCancel: false,
      success: () => {
      }
    })

  } catch (error) {
    console.error('处理支付成功失败:', error)
  }
}


// 页面刷新方法（保留用于支付成功后调用）
const refreshPage = async () => {
  try {
    uni.navigateTo({
      url: '/pages/video/play'
    });
  } catch (error) {
    console.error('页面刷新失败:', error)
  }
}
// 处理支付结果
const handleResult = () => {
  if (paymentResult.value.success) {
    // 支付成功，跳转到订单页面
    uni.navigateTo({
      url: '/pages/video/play'
    });
  } else {
    // 支付失败，重置支付结果
    paymentResult.value = null;
  }
};
// 停止检查支付状态
const stopPaymentCheck = () => {
  if (paymentCheckTimer.value) {
    clearInterval(paymentCheckTimer.value)
    paymentCheckTimer.value = null
  }
  isCheckingPayment.value = false
  console.log('停止检查支付状态')
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