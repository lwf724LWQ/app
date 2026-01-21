<template>
  <view class="pattern-predict-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <uni-icons type="left" size="20" color="#333"></uni-icons>
      </view>
      <view class="nav-title">规律预测</view>
      <view class="nav-right"></view>
    </view>

    <!-- 主要内容 -->
    <view class="main-content">
      <!-- 我的方案区域 -->
      <view class="scheme-section">
        <view class="section-title">我的方案 (必选)</view>
        <view class="scheme-input" @click="goToSchemePage">
          <view class="issue-info">
            <text class="issue-number">第{{ issueNumber }}期</text>
          </view>
          <!-- 显示已设置的方案 -->
          <view v-if="schemes.length > 0" class="scheme-display">
            <view class="scheme-content">
              <!-- 期号显示 -->
              <text class="issue-number">第{{ issueNumber }}期</text>

              <!-- 方案详情 -->
              <view v-for="(scheme, index) in schemes" :key="index" class="scheme-item">
                <text class="scheme-name">[{{ scheme[0] }}]</text>

                <text
                  class="scheme-detail"
                  v-for="(info, index) in Object.entries(scheme[1])"
                  :key="index"
                >
                  <text>{{ info[0] }}：</text>
                  <text>{{ postTool.numberFormat(info[1].numbers, info[0]) }}</text>
                  <text v-if="info[1].mainAttack">主攻{{ info[1].mainAttack }}</text>
                </text>
              </view>
            </view>
          </view>
          <!-- 未设置方案时的提示 -->
          <view v-else class="scheme-placeholder">
            <text class="placeholder-text">还没有添加方案噢,点击可添加方案</text>
          </view>
        </view>
      </view>

      <!-- 添加规律图片区域 -->
      <view class="image-section">
        <view class="section-title">添加规律图片 (必选，最多6张)</view>
        <view class="image-upload-container">
          <!-- 已选择的图片 -->
          <view v-if="selectedImages.length > 0" class="selected-images">
            <view v-for="(image, index) in selectedImages" :key="index" class="image-item">
              <image :src="image" class="uploaded-image" mode="aspectFit"></image>
              <view class="image-delete" @click="removeImage(index)">
                <uni-icons type="close" size="16" color="#fff"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 添加图片按钮 -->
          <view v-if="selectedImages.length < 6" class="add-image-btn" @click="selectImage">
            <uni-icons type="camera" size="40" color="#ccc"></uni-icons>
            <text class="add-text">添加图片</text>
            <text class="count-text">{{ selectedImages.length }}/6</text>
          </view>
        </view>
      </view>

      <!-- 免责声明 -->
      <view class="disclaimer">
        <text class="disclaimer-text">注: 帖子一旦发布, 将不能进行修改或删除操作</text>
      </view>

      <!-- 底部按钮区域 -->
      <view class="bottom-buttons">
        <button class="modify-btn" @click="goToSchemePage">修改</button>
        <button class="publish-btn" :class="{ disabled: !canPublish }" @click="handlePublish">
          发布
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { apiGetIssueNo, apiPost, getCOSSecretKey } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
import tool from "@/utils/tool.js";
import { onLoad } from "@dcloudio/uni-app";
import postTool from "./post-tool";
import moment from "moment";

// 响应式数据
const issueNumber = ref("");
const selectedImages = ref([]); // 改为数组支持多张图片
const schemes = ref([]);
const lotteryType = ref(null);
const uploadedImageUrls = ref([]); // 改为数组存储多张图片URL
const isUploadingImage = ref(false);

// 计算属性
const canPublish = computed(() => {
  return schemes.value.length > 0 && selectedImages.value.length > 0;
});
const isLoad = ref(false);
// 页面加载时获取期号
onLoad(async (option) => {
  lotteryType.value = { name: option.lotteryType };
  uni.showLoading({ title: "加载中..." });
  let postData = {};
  try {
    postData = await postTool.getTodayNewPost(option.lotteryType);
  } catch (error) {}
  uni.hideLoading();
  const content = postData?.content;
  if (content) {
    uni.showModal({
      title: "提示",
      content: "当期已经发过贴子，只支持追贴模式",
      confirmText: "去追贴",
      cancelText: "返回",
      success: (res) => {
        if (res.confirm) {
          const urlParams = tool.formatUrlParams({
            lotteryType: lotteryType.value.name,
          });
          // 跳转到追贴页面
          uni.redirectTo({
            url: `/pages/forum/post/created-scheme?` + urlParams,
          });
        } else {
          // 返回
          uni.navigateBack();
        }
      },
    });
  }
  postTool.clearSchemesData();
  loadIssueInfo();
  isLoad.value = true;
});
onMounted(() => {
  if (isLoad.value) {
    loadSchemesFromStorage();
  }
});

// 页面显示时重新加载方案数据
onShow(() => {
  if (isLoad.value) {
    loadSchemesFromStorage();
  }
});

// 从本地存储加载方案数据
const loadSchemesFromStorage = () => {
  schemes.value = postTool.loadSchemesData();
};

// 加载期号信息
const loadIssueInfo = async () => {
  try {
    const response = await apiGetIssueNo({ tname: lotteryType.value.name });
    issueNumber.value = response.data.issueno;
  } catch (error) {
    console.error("加载期号信息失败:", error);
    uni.showToast({
      title: "加载期号信息失败",
      icon: "none",
    });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到方案页面
const goToSchemePage = () => {
  console.log("=== 规律帖跳转到方案页面 ===");

  const urlParams = tool.formatUrlParams({
    lotteryType: lotteryType.value.name,
    from: "upload-diagram",
  });

  uni.navigateTo({
    url: `/pages/forum/post/created-scheme?${urlParams}`,
    success: () => {
      // 跳转成功
    },
    fail: (err) => {
      uni.showToast({
        title: "跳转失败",
        icon: "none",
      });
    },
  });
};

// 选择图片
const selectImage = async () => {
  if (isUploadingImage.value) {
    uni.showToast({
      title: "图片正在上传中，请稍候",
      icon: "none",
    });
    return;
  }

  // 计算还能选择多少张图片
  const remainingCount = 6 - selectedImages.value.length;
  if (remainingCount <= 0) {
    uni.showToast({
      title: "最多只能选择6张图片",
      icon: "none",
    });
    return;
  }

  try {
    // 选择图片
    const chooseResult = await uni.chooseImage({
      count: remainingCount, // 最多选择剩余数量
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
    });

    if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
      // 显示上传进度
      uni.showLoading({
        title: "上传图片中...",
      });

      isUploadingImage.value = true;

      // 批量上传图片
      const uploadPromises = chooseResult.tempFilePaths.map(async (tempFilePath, index) => {
        const url = await tool.oss.uploadImgForTempPath(tempFilePath, "pimg");
        return { tempFilePath, url: `http://video.caimizm.com/${url}` };
      });

      // 等待所有图片上传完成
      const uploadResults = await Promise.all(uploadPromises);

      // 更新图片列表
      uploadResults.forEach(({ tempFilePath, url }) => {
        selectedImages.value.push(tempFilePath);
        uploadedImageUrls.value.push(url);
      });

      uni.hideLoading();
      uni.showToast({
        title: `成功上传${uploadResults.length}张图片`,
        icon: "success",
      });

      isUploadingImage.value = false;
    }
  } catch (error) {
    console.log(error);
    uni.hideLoading();
    isUploadingImage.value = false;
    uni.showToast({
      title: "图片上传失败",
      icon: "none",
    });
  }
};

// 删除图片
const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  uploadedImageUrls.value.splice(index, 1);
};

// 生成帖子内容
const generatePostContent = () => {
  let content = postTool.generatePostContent(schemes.value);
  // 使用获取到的期号，即使是0也使用
  const validIssueNumber = issueNumber.value || "0";
  content += `期号: 第${validIssueNumber}期\n`;
  content += `发布时间: ${moment().format("YYYY-MM-DD HH:mm:ss")}`;

  return content;
};

// 处理发布
const handlePublish = async () => {
  if (!canPublish.value) {
    uni.showToast({
      title: "请完善方案和图片",
      icon: "none",
    });
    return;
  }

  if (!uploadedImageUrls.value || uploadedImageUrls.value.length === 0) {
    uni.showToast({
      title: "请等待图片上传完成",
      icon: "none",
    });
    return;
  }

  try {
    uni.showLoading({
      title: "发布中...",
    });

    // 获取当前登录用户的头像URL
    let currentUserAvatar = "";
    const loginData = uni.getStorageSync("loginData") || {};
    if (loginData.himg) {
      currentUserAvatar = loginData.himg;
    }

    // 准备发帖数据
    const postData = {
      tname: lotteryType.value.name,
      // tname: lotteryType.value ? `${lotteryType.value.name}-规律预测` : '规律预测', // 彩票名称 - 添加"规律预测"标识
      issueno: parseInt(issueNumber.value) || 0, // 期号转换为数字
      content: generatePostContent(), // 发帖内容
      account: getAccount() || "", // 账号
      pimg: uploadedImageUrls.value.join(","), // 多张图片URL用逗号分隔
      flag: true, // 需要审核
    };
    // 检查必要参数
    if (!postData.account) {
      uni.showToast({
        title: "账号信息缺失，请重新登录",
        icon: "none",
      });
      return;
    }

    if (postData.issueno === null || postData.issueno === undefined || postData.issueno === "") {
      uni.showToast({
        title: "期号信息缺失",
        icon: "none",
      });
      return;
    }

    if (!postData.content) {
      uni.showToast({
        title: "发帖内容为空",
        icon: "none",
      });
      return;
    }

    if (!postData.pimg || postData.pimg.trim() === "") {
      uni.showToast({
        title: "请至少上传一张图片",
        icon: "none",
      });
      return;
    }

    const response = await apiPost(postData);

    uni.hideLoading();

    if (response.code === 200) {
      uni.showToast({
        title: "规律帖已发布",
        icon: "success",
      });

      // 清除本地存储的方案数据和图片URL
      uni.removeStorageSync("predict_schemes_data");
      selectedImages.value = [];
      uploadedImageUrls.value = [];

      // postData.clearSchemesData();

      // 延迟返回规律预测页面
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({
        title: response.msg || "发布失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error(error);
    uni.hideLoading();
    uni.showToast({
      title: error?.msg || "发布失败，请重试",
      icon: "none",
    });
  }
};
</script>

<style scoped>
.pattern-predict-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

.main-content {
  padding: 30rpx;
}

.scheme-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.scheme-input {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  border: 2rpx solid #eee;
}

.issue-info {
  margin-bottom: 20rpx;
}

.issue-number {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.scheme-placeholder {
  padding: 20rpx 0;
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

.scheme-display {
  padding: 20rpx 0;
}

.scheme-content {
  background-color: #f8f8f8;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-top: 20rpx;
}

.scheme-item {
  margin-bottom: 15rpx;
}

.scheme-name {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.scheme-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.scheme-detail {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.image-section {
  margin-bottom: 40rpx;
}

.image-upload-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  border: 2rpx solid #eee;
}

.selected-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  background-color: #f8f8f8;
}

.add-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.count-text {
  font-size: 20rpx;
  color: #ccc;
  margin-top: 5rpx;
}

.disclaimer {
  margin-bottom: 40rpx;
}

.disclaimer-text {
  font-size: 24rpx;
  color: #ff4757;
  line-height: 1.5;
}

.bottom-buttons {
  margin-top: 40rpx;
  display: flex;
  gap: 20rpx;
}

.modify-btn,
.publish-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modify-btn {
  background-color: #f0f0f0;
  color: #666;
}

.publish-btn {
  background-color: #ff4757;
  color: #fff;
}

.publish-btn.disabled {
  background-color: #ccc;
  color: #999;
}
</style>
