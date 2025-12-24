<template>
  <view class="userLayout" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <!-- 其他服务区域 -->
    <view class="services-section">
      <view class="section-title">其它</view>
      <view class="services-grid">
        <!-- <view class="service-item">
          <uni-icons type="headphones" size="24" color="#222"></uni-icons>
          <text class="service-text">联系客服</text>
        </view> -->
        <view class="service-item" @click="toFeedBack">
          <uni-icons type="compose" size="24" color="#222"></uni-icons>
          <text class="service-text">意见反馈</text>
        </view>
        <!-- #ifdef APP-PLUS -->
        <view class="service-item" @click="checkUpdate">
          <uni-icons type="cloud-upload" size="24" color="#222"></uni-icons>
          <text class="service-text">检查更新</text>
        </view>
        <!-- #endif -->
        <!-- <view class="service-item">
          <uni-icons type="gift" size="24" color="#222"></uni-icons>
          <text class="service-text">每日福利</text>
        </view> -->
        <view class="service-item" @click="toShare">
          <uni-icons type="redo" size="24" color="#222"></uni-icons>
          <text class="service-text">分享APP</text>
        </view>
        <view class="service-item" @click="toPrivacyPolicy">
          <uni-icons type="help" size="24" color="#222"></uni-icons>
          <text class="service-text">隐私政策</text>
        </view>
        <view class="service-item" @click="showAboutAs">
          <uni-icons type="link" size="24" color="#222"></uni-icons>
          <text class="service-text">关于我们</text>
        </view>
        <!-- <view class="service-item" @click="toggleoldManMode">
          <uni-icons type="settings" size="24" color="#222"></uni-icons>
          <text class="service-text">切换{{ useOldManModeStore.enabled ? "小字" : "大字" }}</text>
        </view> -->
        <!-- <view class="service-item" @click="logout">
          <uni-icons type="settings" size="24" color="#222"></uni-icons>
          <text class="service-text">退出登录</text>
        </view> -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getNavBarHeight } from "@/utils/system.js";
import { getToken, removeToken, getAccount } from "@/utils/request.js";
import { apiGetUserBalance, apiUserimg } from "@/api/apis.js";
import tool from "../../utils/tool";
import { useUserStore } from "@/stores/userStore";
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";
import { getUserFollowCountApi } from "@/api/apis";

const userStore = useUserStore();

const memberStore = reactive({
  profile: null,
});

// 金币显示状态
const isBalanceVisible = ref(false);
// 用户金币余额
const userBalance = ref(0);
// 请求锁 - 防止重复请求
const isLoadingBalance = ref(false);
const isLoadingLogin = ref(false);

// 处理头像加载错误
const handleAvatarError = (e) => {
  // 头像加载失败时使用默认头像
  if (memberStore.profile) {
    memberStore.profile.avatar = "http://video.caimizm.com/himg/user.png";
  }
};
const toShare = () => {
  uni.navigateTo({ url: "/pages/share/share" });
};
// 获取用户金币余额
const getUserBalance = async () => {
  // 防止重复请求
  if (isLoadingBalance.value) {
    console.log("正在加载余额，跳过重复请求");
    return;
  }

  try {
    isLoadingBalance.value = true;
    const account = getAccount();

    if (!account) {
      userBalance.value = 0;
      return;
    }

    const response = await apiGetUserBalance({ account });

    if (response.code === 200) {
      userBalance.value = response.data || 0;
    } else {
      userBalance.value = 0;
    }
  } catch (error) {
    console.error("获取余额失败:", error);
    userBalance.value = 0;
  } finally {
    isLoadingBalance.value = false;
  }
};

async function getUserInfo() {
  try {
    const savedUserInfo = userStore.getUserInfo;
    memberStore.profile = {
      avatar: savedUserInfo.avatar || "http://video.caimizm.com/himg/user.png",
      nickname: savedUserInfo.nickname || "欢迎您",
    };

    const res = await apiUserimg({ account: savedUserInfo.account });
    const avatar = `http://video.caimizm.com/himg/${res.data.himg}`;
    userStore.updateUserInfo({
      nickname: res.data.uname,
      avatar: avatar,
      account: res.data.account,
    });

    memberStore.profile = {
      avatar: avatar || "http://video.caimizm.com/himg/user.png",
      nickname: res.data.uname || "欢迎您",
    };
  } catch (error) {
    uni.showToast({
      title: "获取用户数据失败",
    });
  }
}

// 检查登录状态
const checkLoginStatus = async () => {
  // 防止重复请求
  if (isLoadingLogin.value) {
    console.log("正在检查登录状态，跳过重复请求");
    return;
  }

  try {
    isLoadingLogin.value = true;
    const token = getToken();
    if (token) {
      // 获取用户余额
      getUserBalance();

      // 获取用户数据
      getUserInfo();
    } else {
      // 没有token表示未登录
      memberStore.profile = null;
      userBalance.value = 0;
    }
  } finally {
    isLoadingLogin.value = false;
  }
};

// 判断是否登录，否则弹框
function requireLogin() {
  if (!memberStore.profile) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
      duration: 2000,
    });
    return false;
  }
  return true;
}

function toPrivacyPolicy() {
  uni.navigateTo({
    url: "/pages/login/agreement?type=PrivacyPolicy",
  });
}

// 退出登录
const logout = () => {
  uni.showModal({
    title: "确认退出",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        userStore.clearUserInfo();
        // 更新登录状态
        checkLoginStatus();
        // 显示退出成功提示
        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};
const showAboutAs = () => {
  uni.navigateTo({
    url: "/pages/login/agreement?type=AboutAs",
  });
};
// 跳转到帖子列表
const goToPostlist = () => {
  if (requireLogin()) {
    uni.navigateTo({ url: "/pages/user/post-list" });
  }
};

// 跳转到关注列表
const goToFollowlist = () => {
  if (requireLogin()) {
    uni.navigateTo({ url: "/pages/user/follow-list?type=follow" });
  }
};
const goToFanslist = () => {
  if (requireLogin()) {
    uni.navigateTo({ url: "/pages/user/follow-list?type=fans" });
  }
};
// 跳转到反馈页面
const toFeedBack = () => {
    uni.navigateTo({ url: "/pages/user/feedbackPage" });
};

// 跳转到充值页面
const goToRecharge = () => {
  if (requireLogin()) {
    uni.navigateTo({ url: "/pages/recharge/recharge" });
  }
};

// 跳转到交易记录页面
const goToTransaction = () => {
  if (requireLogin()) {
    uni.navigateTo({ url: "/pages/transaction/transaction" });
  }
};

// 跳转到订单页面
const goToOrders = () => {
  if (requireLogin()) {
    uni.navigateTo({ url: "/pages/orders/orders" });
  }
};

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({ url: "/pages/login/login" });
};

// 跳转到编辑用户信息页面
const goToEditProfile = () => {
  if (!memberStore.profile) {
    uni.showToast({
      title: "请先登录",
      icon: "none",
    });
    return;
  }
  uni.navigateTo({ url: "/pages/user/edit-profile" });
};

// 切换金币显示状态
const toggleBalanceVisibility = (e) => {
  e.stopPropagation(); // 阻止事件冒泡
  isBalanceVisible.value = !isBalanceVisible.value;

  // 如果显示余额且已登录，刷新余额数据
  if (isBalanceVisible.value && memberStore.profile) {
    getUserBalance();
  }
};

// 功能栏点击事件
const handleFeatureClick = (featureName) => {
  if (featureName === "充值") {
    uni.showToast({
      title: '请点击上方的"我的金币"进行充值',
      icon: "none",
    });
  } else {
    uni.showToast({
      title: `点击了「${featureName}」`,
      icon: "none",
    });
  }
};

// 菜单项点击事件
const handleMenuClick = (item) => {
  if (item.title === "设置") {
    // 设置菜单项直接调用退出登录功能
    logout();
  } else {
    // 其他菜单项显示提示
    uni.showToast({
      title: `点击了「${item.title}」`,
      icon: "none",
    });
  }

  // 示例：跳转页面（需提前配置 pages.json 路由）
  // if (item.title === '联系客服') {
  //   uni.navigateTo({ url: '/pages/customer-service/index' });
  // }
};

// 页面显示时也检查登录状态（确保从登录页面返回时能更新状态）
onShow(() => {
  // 只刷新登录状态，避免重复请求余额
  checkLoginStatus();
  getUserFollowCount();
});

const useOldManModeStore = inject("useOldManModeStore");
function toggleoldManMode() {
  useOldManModeStore.toggleMode();
}

function checkUpdate() {
  tool.checkAppUpdate().then((msg) => {
    if (msg) {
      uni.showToast({
        title: msg,
      });
    }
  });
}

const followCount = ref(0);
const fansCount = ref(0);
const postCount = ref(0);
const getUserFollowCount = async () => {
  const res = await getUserFollowCountApi();
  followCount.value = res.data.guanzhu;
  fansCount.value = res.data.fensi;
  postCount.value = res.data.fatie;
};
</script>

<style lang="scss" scoped>
.userLayout:not(.old-man-mode) {
  background: linear-gradient(180deg, #fffbcbf0 0%, #f7f7f7 50%, #f0ecec00 100%);
  min-height: 100vh;
  overflow-y: auto;
  padding-top: var(--status-bar-height);

  .userInfo {
    background: transparent;
    padding: 60rpx 32rpx 40rpx;
    margin-top: 0;

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30rpx;

      .avatar-section {
        display: flex;
        align-items: center;

        .avatar {
          width: 120rpx;
          height: 120rpx;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 20rpx;

          image {
            width: 100%;
            height: 100%;
          }
        }

        .user-details {
          .username {
            font-size: 36rpx;
            font-weight: 600;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
          }

          .vip-tag {
            background-color: #ffa726;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;

            .vip-text {
              font-size: 20rpx;
              color: #fff;
              font-weight: 500;
            }
          }

          .login-btn {
            background-color: #ffa726;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;

            .login-text {
              font-size: 20rpx;
              color: #fff;
              font-weight: 500;
            }
          }
        }
      }

      .edit-btn {
        background-color: #ffa726;
        padding: 12rpx 20rpx;
        border-radius: 20rpx;

        .edit-text {
          font-size: 24rpx;
          color: #fff;
        }
      }
    }

    .user-stats {
      display: flex;
      justify-content: space-between;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 24rpx;
          color: #999;
          display: block;
          margin-bottom: 8rpx;
        }

        .stat-value {
          font-size: 32rpx;
          color: #333;
          font-weight: 600;
        }
      }
    }

    .gray {
      filter: grayscale(100%);
    }
  }

  /* 邀请好友横幅 */
  .invite-banner {
    margin: 20rpx 32rpx;
    background: linear-gradient(135deg, #ffa726 0%, #ffeb3b 100%);
    border-radius: 16rpx;
    padding: 30rpx;

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .banner-text {
        .banner-title {
          font-size: 32rpx;
          color: #fff;
          font-weight: 600;
          display: block;
          margin-bottom: 8rpx;
        }

        .banner-subtitle {
          font-size: 24rpx;
          color: #fff;
          opacity: 0.9;
        }
      }

      .invite-btn {
        background-color: #fff;
        border: 2rpx solid #ffa726;
        padding: 16rpx 24rpx;
        border-radius: 20rpx;

        .invite-btn-text {
          font-size: 24rpx;
          color: #ffa726;
          font-weight: 500;
        }
      }
    }
  }

  /* 数据展示区域样式 */
  .data-section {
    display: flex;
    gap: 20rpx;
    margin: 20rpx 32rpx;
  }

  .data-card {
    flex: 1;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.3s ease;
  }

  .data-card:active {
    transform: scale(0.95);
    background-color: #f8f9fa;
  }

  .data-number {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }

  .data-label {
    font-size: 28rpx;
    color: #666;
    font-weight: 400;
  }

  .eye-icon {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx;
    border-radius: 50%;
    background-color: #f8f9fa;
  }

  /* 功能栏样式 */
  .feature-bar {
    background-color: #fff;
    margin: 20rpx 32rpx;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 10rpx;
    transition: all 0.3s ease;
  }

  .feature-item:active {
    transform: scale(0.95);
  }

  .feature-icon {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-bottom: 12rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }

  .feature-icon.trophy {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: #fff;
  }

  .feature-icon.diamond {
    background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
    color: #fff;
  }

  .feature-icon.star {
    background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);
    color: #fff;
  }

  .feature-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    text-align: center;
  }

  .menu-container {
    background-color: #fff;
    padding: 0 16rpx;
  }

  /* 单个菜单项布局 */
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1px solid #f5f5f5;
    /* 分隔线 */
  }

  /* 文字区域（主标题 + 副标题） */
  .text-area {
    display: flex;
    flex-direction: column;
    margin-left: 12rpx;
    flex: 1;
    /* 让文字区域占满中间空间 */
  }

  .title {
    font-size: 32rpx;
    color: #333;
    font-weight: 400;
  }

  .sub-title {
    font-size: 28rpx;
    color: #999;
    margin-top: 4rpx;
  }

  /* 我的充值区域 */
  .recharge-section {
    margin: 20rpx 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 40rpx;
    }

    .recharge-items {
      display: flex;
      justify-content: space-between;

      .recharge-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;

        .recharge-icon {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          margin-bottom: 12rpx;

          &.purple {
            background-color: #9c27b0;
            color: #fff;
          }

          &.blue {
            background-color: #2196f3;
            color: #fff;
          }

          &.yellow {
            background-color: #ffeb3b;
            color: #333;
          }

          &.red {
            background-color: #f44336;
            color: #fff;
          }
        }

        .recharge-text {
          font-size: 24rpx;
          color: #333;
          text-align: center;
        }
      }
    }
  }

  /* 其他服务区域 */
  .services-section {
    margin: 40rpx 32rpx 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 20rpx;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30rpx;

      .service-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .service-text {
          font-size: 22rpx;
          color: #333;
          text-align: center;
          margin-top: 12rpx;
        }
      }
    }
  }
}

.userLayout.old-man-mode {
  background: linear-gradient(180deg, #fffbcbf0 0%, #f7f7f7 50%, #f0ecec00 100%);
  min-height: 100vh;
  overflow-y: auto;
  padding-top: var(--status-bar-height);

  .userInfo {
    background: transparent;
    padding: 60rpx 32rpx 40rpx;
    margin-top: 0;

    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30rpx;

      .avatar-section {
        display: flex;
        align-items: center;

        .avatar {
          width: 120rpx;
          height: 120rpx;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 20rpx;

          image {
            width: 100%;
            height: 100%;
          }
        }

        .user-details {
          .username {
            font-size: 36rpx;
            font-weight: 600;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
          }

          .vip-tag {
            background-color: #ffa726;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;

            .vip-text {
              font-size: 20rpx;
              color: #fff;
              font-weight: 500;
            }
          }

          .login-btn {
            background-color: #ffa726;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;

            .login-text {
              font-size: 20rpx;
              color: #fff;
              font-weight: 500;
            }
          }
        }
      }

      .edit-btn {
        background-color: #ffa726;
        padding: 12rpx 20rpx;
        border-radius: 20rpx;

        .edit-text {
          font-size: 24rpx;
          color: #fff;
        }
      }
    }

    .user-stats {
      display: flex;
      justify-content: space-between;

      .stat-item {
        text-align: center;

        .stat-label {
          font-size: 40rpx;
          color: #414141;
          display: block;
          margin-bottom: 8rpx;
        }

        .stat-value {
          font-size: 50rpx;
          color: #333;
          font-weight: 600;
        }
      }
    }

    .gray {
      filter: grayscale(100%);
    }
  }

  /* 邀请好友横幅 */
  .invite-banner {
    margin: 20rpx 32rpx;
    background: linear-gradient(135deg, #ffa726 0%, #ffeb3b 100%);
    border-radius: 16rpx;
    padding: 30rpx;

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .banner-text {
        .banner-title {
          font-size: 32rpx;
          color: #fff;
          font-weight: 600;
          display: block;
          margin-bottom: 8rpx;
        }

        .banner-subtitle {
          font-size: 24rpx;
          color: #fff;
          opacity: 0.9;
        }
      }

      .invite-btn {
        background-color: #fff;
        border: 2rpx solid #ffa726;
        padding: 16rpx 24rpx;
        border-radius: 20rpx;

        .invite-btn-text {
          font-size: 24rpx;
          color: #ffa726;
          font-weight: 500;
        }
      }
    }
  }

  /* 数据展示区域样式 */
  .data-section {
    display: flex;
    gap: 20rpx;
    margin: 20rpx 32rpx;
  }

  .data-card {
    flex: 1;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.3s ease;
  }

  .data-card:active {
    transform: scale(0.95);
    background-color: #f8f9fa;
  }

  .data-number {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }

  .data-label {
    font-size: 28rpx;
    color: #666;
    font-weight: 400;
  }

  .eye-icon {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    padding: 8rpx;
    border-radius: 50%;
    background-color: #f8f9fa;
  }

  /* 功能栏样式 */
  .feature-bar {
    background-color: #fff;
    margin: 20rpx 32rpx;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 10rpx;
    transition: all 0.3s ease;
  }

  .feature-item:active {
    transform: scale(0.95);
  }

  .feature-icon {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-bottom: 12rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }

  .feature-icon.trophy {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    color: #fff;
  }

  .feature-icon.diamond {
    background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
    color: #fff;
  }

  .feature-icon.star {
    background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);
    color: #fff;
  }

  .feature-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    text-align: center;
  }

  .menu-container {
    background-color: #fff;
    padding: 0 16rpx;
  }

  /* 单个菜单项布局 */
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1px solid #f5f5f5;
    /* 分隔线 */
  }

  /* 文字区域（主标题 + 副标题） */
  .text-area {
    display: flex;
    flex-direction: column;
    margin-left: 12rpx;
    flex: 1;
    /* 让文字区域占满中间空间 */
  }

  .title {
    font-size: 32rpx;
    color: #333;
    font-weight: 400;
  }

  .sub-title {
    font-size: 28rpx;
    color: #999;
    margin-top: 4rpx;
  }

  /* 我的充值区域 */
  .recharge-section {
    margin: 20rpx 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 40rpx;
      display: block;
    }

    .recharge-items {
      display: flex;
      justify-content: space-between;

      .recharge-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;

        .recharge-icon {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          margin-bottom: 12rpx;

          &.purple {
            background-color: #9c27b0;
            color: #fff;
          }

          &.blue {
            background-color: #2196f3;
            color: #fff;
          }

          &.yellow {
            background-color: #ffeb3b;
            color: #333;
          }

          &.red {
            background-color: #f44336;
            color: #fff;
          }
        }

        .recharge-text {
          font-size: 40rpx;
          font-weight: bold;
          color: #000000;
          text-align: center;
        }
      }
    }
  }

  /* 其他服务区域 */
  .services-section {
    margin: 40rpx 32rpx 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 20rpx;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30rpx;

      .service-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .service-text {
          font-size: 50rpx;
          font-weight: bold;
          color: #000000;
          text-align: center;
          margin-top: 12rpx;
        }
      }
    }
  }
}
</style>
