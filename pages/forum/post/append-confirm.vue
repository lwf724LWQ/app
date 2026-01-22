<template>
  <view class="publish-container">
    <!-- 导航栏 -->
    <TopNavigationBar title="预测" bgColor="#28b389" color="#fff" @back="handlePageBack" />

    <!-- 主要内容区域 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 我的方案标题 -->
      <view class="title-section">
        <text class="title-text">{{ isAppendMode ? "追加方案" : "我的方案" }}</text>
      </view>

      <!-- 方案列表 -->
      <view class="scheme-list">
        <view class="scheme-item" v-for="(scheme, index) in schemes" :key="index">
          <view class="scheme-content">
            <view class="scheme-header">
              <text class="scheme-name">{{ scheme[0] }}</text>
              <!-- <view class="scheme-type">{{ scheme.id }}</view> -->
            </view>
            <view class="scheme-details">
              <view class="scheme-data">
                <view
                  class="position-info"
                  v-for="(info, index) in Object.entries(scheme[1])"
                  :key="index"
                >
                  <text>{{ info[0] }}：</text>
                  <text>{{ postTool.numberFormat(info[1].numbers, info[0]) }}</text>
                  <text v-if="info[1].mainAttack">主攻{{ info[1].mainAttack }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态提示 -->
        <view class="empty-state" v-if="schemes.length === 0">
          <text class="empty-text">暂无方案数据</text>
        </view>
      </view>

      <!-- 期号信息 -->
      <view class="period-info">
        <text class="period-text">
          {{ lotteryType ? lotteryType.name : "彩票类型" }} 第{{ getIssueNumber() }}期
        </text>
        <text class="period-status">{{ issueInfo.status }}</text>
      </view>

      <!-- 追帖功能区域 -->
      <view class="append-section" v-if="postId || isAppendMode">
        <view class="append-title">
          <text class="append-title-text">原贴内容</text>
          <text class="append-post-id">帖子ID: {{ postId }}</text>
        </view>
        <view class="append-info">
          <text class="append-info-text">{{ originalContent }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮区域 -->
    <view class="bottom-section">
      <!-- 警告信息 -->
      <view class="warning-section">
        <text class="warning-text" v-if="isAppendMode">追帖模式：追加内容到已发布的帖子</text>
        <text class="warning-text" v-else>注:帖子一旦发布,将不能进行修改或删除操作</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="modify-btn" @click="modifyScheme">修改</button>
        <button class="publish-btn" v-if="isAppendMode" @click="handleAppendPost">追加发帖</button>
        <button class="publish-btn" v-else @click="publishScheme">发布</button>
      </view>
    </view>

    <!-- 追帖模式底部提示 -->
    <!-- <view class="bottom-section" v-if="isAppendMode">
        <view class="warning-section">
          <text class="warning-text">追帖模式：追加内容到已发布的帖子</text>
        </view>
      </view> -->
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAccount } from "@/utils/request.js";
import { apiPost, apiGetIssueNo, apiPostUpdate, apiPostListQuery } from "@/api/apis.js";
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import postTool from "./post-tool";
import { onLoad } from "@dcloudio/uni-app";
import moment from "moment";
import tool from "@/utils/tool.js";

// 方案数据
const schemes = ref([]);

// 追帖相关数据
const postId = ref(""); // 当前帖子ID
const isAppending = ref(false); // 是否正在追帖
const originalContent = ref(""); // 追帖内容
const isAppendMode = ref(false); // 是否为追帖模式

// 彩票类型和期号信息
const lotteryType = ref(null);
const issueInfo = ref({
  id: null,
  number: null,
  status: "待开奖",
  time: "今天 21:30",
});

// 请求锁 - 防止重复请求
const isLoadingIssueInfo = ref(false);

// 修改方案
const modifyScheme = () => {
  // 将当前方案数据传递回上级页面进行修改
  uni.navigateBack({
    delta: 1,
  });
};

// 发布方案
const publishScheme = async () => {
  uni.showModal({
    title: "确认发布",
    content: "确定要发布这些方案吗？发布后将无法修改或删除。",
    success: async (res) => {
      if (res.confirm) {
        await handlePublish();
      }
    },
  });
};

// 处理追帖逻辑
const handleAppendPost = async () => {
  if (!postId.value) {
    uni.showToast({
      title: "帖子ID缺失",
      icon: "none",
    });
    return;
  }

  try {
    isAppending.value = true;
    uni.showLoading({
      title: "追加中...",
    });

    // 自动生成追加内容（包含原帖子内容）
    const appendText = generateAppendContent();

    // 调用追帖接口 - 只传递必要的参数，不包含pimg
    const response = await apiPostUpdate({
      id: postId.value,
      content: appendText,
    });

    uni.hideLoading();

    if (response.code === 200) {
      uni.showToast({
        title: "追加成功",
        icon: "success",
      });

      // 清理追帖相关数据
      uni.removeStorageSync("appendPostData");
      uni.removeStorageSync("currentAppendPostData");
      uni.removeStorageSync("appendModeTipShown");

      // 延迟返回论坛页面
      setTimeout(() => {
        uni.reLaunch({
          url: "/pages/forum/forum",
        });
      }, 1500);
    } else {
      uni.showToast({
        title: response.msg || "追加失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error(error);
    uni.hideLoading();
    uni.showToast({
      title: "追加失败，请重试",
      icon: "none",
    });
  } finally {
    isAppending.value = false;
  }
};

// 生成追加内容
const generateAppendContent = () => {
  // 首先获取原帖子的内容
  let content = originalContent.value;

  // 生成追加内容
  content += "\n\n--- 追加内容 ---\n";

  if (schemes.value.length > 0) {
    content += "\n追加方案:\n";

    content += postTool.generatePostContent(schemes.value);
  }

  content += `追加时间: ${moment().format("YYYY-MM-DD HH:mm:ss")}\n`;

  return content;
};

// 处理发布逻辑
const handlePublish = async () => {
  try {
    uni.showLoading({
      title: "发布中...",
    });

    let content = postTool.generatePostContent(schemes.value);
    content += `期号: 第${getIssueNumber()}期\n`;
    content += `发布时间: ${moment().format("YYYY-MM-DD HH:mm:ss")}`;
    // 准备发帖数据
    const postData = {
      tname: lotteryType.value ? lotteryType.value.name : "预测方案", // 彩票名称
      issueno: getIssueNumber(), // 期号 - 使用统一的期号获取函数
      content: content, // 发帖内容
      jsonStr: JSON.stringify(schemes.value),
      account: getAccount() || "", // 账号
      pimg: "", // 预测帖不需要图片
      flag: true, // 无需审核
    };

    const response = await apiPost(postData);

    uni.hideLoading();

    if (response.code === 200) {
      uni.showToast({
        title: "发布成功",
        icon: "success",
      });

      // 清除本地存储的方案数据
      uni.removeStorageSync("predict_schemes_data");

      // 延迟返回论坛页面
      setTimeout(() => {
        uni.reLaunch({
          url: "/pages/forum/forum",
        });
      }, 1500);
    } else {
      uni.showToast({
        title: response.msg || "发布失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("发布失败:", error);
    uni.hideLoading();
    uni.showToast({
      title: "发布失败，请重试",
      icon: "none",
    });
  }
};

// 获取期号显示
const getIssueNumber = () => {
  return issueInfo.value.number || issueInfo.value.id || "--";
};

// 加载期号信息
const loadIssueInfo = async () => {
  // 防止重复请求
  if (isLoadingIssueInfo.value) {
    console.log("正在加载期号信息，跳过重复请求");
    return;
  }

  try {
    isLoadingIssueInfo.value = true;

    // uni.showLoading({ title: "加载期号中..." });

    const response = await apiGetIssueNo({ tname: lotteryType.value.name });

    // uni.hideLoading();

    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      let issueNumber = null;
      let issueStatus = "待开奖";
      let issueTime = "今天 21:30";

      if (typeof response.data === "number" || typeof response.data === "string") {
        issueNumber = response.data.toString();
      } else if (typeof response.data === "object") {
        issueNumber = response.data.issueno || response.data.number || response.data.id;
        issueStatus = response.data.status || "待开奖";
        issueTime = response.data.time || "今天 21:30";
      }

      issueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime,
      };

      // uni.showToast({ title: `期号加载成功: ${issueNumber}`, icon: "success" });
    } else {
      // uni.showToast({ title: "期号数据为空", icon: "none" });
    }
  } catch (error) {
    uni.hideLoading();
    console.error("加载期号信息失败:", error);
    uni.showToast({ title: "期号加载异常", icon: "none" });
  } finally {
    isLoadingIssueInfo.value = false;
  }
};

const handlePageBack = (event) => {
  event.stop();
  uni.showModal({
    title: "提示",
    content: "返回会清空内容,确定返回吗?",
    confirmText: "确定",
    cancelText: "取消",
    confirmColor: "#ff4757",
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的方案数据
        try {
          uni.removeStorageSync("predict_schemes_data");
        } catch (error) {}

        uni.navigateBack({
          delta: 2,
        });
      }
    },
  });
};
onLoad(async (options) => {
  options = tool.optionsParamsDecode(options);

  if (!options.lotteryType) {
    uni.reLaunch({ url: "/pages/forum/forum" });
    return;
  }
  lotteryType.value = {
    name: options.lotteryType,
  };

  // 加载期号信息
  loadIssueInfo();

  console.log("=== 页面加载调试信息 ===");
  console.log("页面参数:", options);

  // 检查是否有帖子ID（用于追帖功能）
  if (options.id) {
    postId.value = options.id;
    console.log("接收到帖子ID，进入追帖模式:", options.id);

    // 进入追帖模式，隐藏发帖相关功能
    isAppendMode.value = true;
    console.log("追帖模式已设置:", isAppendMode.value);

    const appendPostData = uni.getStorageSync("appendPostData");
    originalContent.value = appendPostData.postContent;
  }

  console.log("最终状态 - 帖子ID:", postId.value, "追帖模式:", isAppendMode.value);
  schemes.value = await postTool.loadSchemesData();
});
</script>

<style scoped>
.publish-container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  background-color: #f5f5f5;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #28b389;
  z-index: 999;
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
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

/* 主要内容区域 */
.main-content {
  margin-top: 20rpx;
  margin-bottom: 200rpx; /* 为底部按钮留出空间 */
  padding-left: 30rpx;
  padding-right: 30rpx;

  box-sizing: border-box;

  flex: 1;
  overflow: hidden;
}

/* 标题区域 */
.title-section {
  margin-bottom: 30rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 方案列表 */
.scheme-list {
  margin-bottom: 40rpx;
}

.scheme-item {
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.scheme-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.scheme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.scheme-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4757;
}

.scheme-type {
  background-color: #28b389;
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.scheme-details {
  padding: 10rpx 0;
}

.scheme-data {
  background-color: #f8f9fa;
  padding: 15rpx;
  border-radius: 10rpx;
  border-left: 4rpx solid #28b389;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.position-info {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-all;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60rpx 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 期号信息 */
.period-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.period-status {
  font-size: 22rpx;
  color: #ff4757;
}

/* 底部区域 */
.bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 警告信息 */
.warning-section {
  margin-bottom: 20rpx;
  text-align: center;
}

.warning-text {
  font-size: 24rpx;
  color: #ff4757;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
}

.modify-btn,
.publish-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.modify-btn {
  background-color: #f0f0f0;
  color: #666;
}

.publish-btn {
  background-color: #ff4757;
  color: #fff;
}

/* 追帖功能样式 */
.append-section {
  margin-top: 40rpx;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.append-title {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.append-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.append-post-id {
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.append-info {
  margin: 20rpx 0;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 10rpx;
}

.append-info-text {
  font-size: 26rpx;
  color: #666;
}

.append-buttons {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 30rpx;
}

.append-btn {
  width: 200rpx;
  height: 70rpx;
  background-color: #28b389;
  color: #fff;
  border: none;
  border-radius: 35rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.append-btn.disabled {
  background-color: #ccc;
  color: #999;
}
</style>
