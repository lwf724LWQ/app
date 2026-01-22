<template>
  <view class="container">
    <top-navigation-bar title="上传视频" bgColor="#1677ff" color="#fff" />

    <!-- 视频信息表单 -->
    <view class="form-area">
      <!-- <view class="form-item">
        <text class="form-label">视频标题</text>
        <input class="form-input" v-model="videoTitle" placeholder="请输入视频标题" />
      </view> -->

      <view class="form-item">
        <text class="form-label">是否收费</text>
        <view class="radio-group">
          <label class="radio-label">
            <radio value="1" :checked="isCharge === 1" @click="setIsCharge(1)">免费</radio>
          </label>

          <label class="radio-label">
            <radio value="2" :checked="isCharge === 2" @click="setIsCharge(2)">收费</radio>
          </label>
        </view>
      </view>

      <view class="form-item price-box" v-if="isCharge === 2">
        <text class="form-label">收费价格</text>
        <NumberInput v-model="chargePrice" :min="10" :max="99999" :step="1" />
        <!-- <input class="form-input" v-model="chargePrice" type="number" placeholder="请输入价格" /> -->
        <text class="price-unit">金币</text>
      </view>
    </view>

    <!-- 视频上传区域 -->
    <view class="upload-area" @click="chooseFile">
      <video v-if="selectedVideoUrl" :src="selectedVideoUrl" class="video-preview" controls></video>
      <view v-if="selectedVideoName" class="video-info">
        <text class="video-name">{{ selectedVideoName }}</text>
        <text class="video-size" v-if="selectedVideoSize">
          {{ formatFileSize(selectedVideoSize) }}
        </text>
      </view>
      <view v-else class="upload-placeholder">
        <uni-icons name="plus" size="50" color="#3498db"></uni-icons>
        <view class="upload-text">点击选择视频文件</view>
        <view class="upload-hint">支持上传所有类型文件，大小不超过5MB</view>
      </view>
    </view>

    <!-- 封面选择区域 -->
    <!-- <view class="cover-area" v-if="selectedVideoUrl">
			<text class="section-title">视频封面</text>
			<view class="cover-preview" @click="chooseCover">
				<image v-if="coverImage" :src="coverImage" class="cover-image"></image>
				<view v-else class="cover-placeholder">
					<uni-icons name="image" size="40" color="#ccc"></uni-icons>
					<text>点击选择封面</text>
				</view>
			</view>
		</view> -->

    <!-- 上传进度 -->
    <view class="progress-area" v-if="uploadProgress > 0">
      <progress :percent="uploadProgress" active-color="#3498db" show-info />
    </view>

    <!-- 状态信息 -->
    <view class="status-message" :class="statusClass">
      {{ statusMessage }}
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button type="primary" @click="startUpload" :disabled="isUploading">开始上传</button>
      <button type="default" @click="clearFiles" :disabled="fileList.length === 0">清空文件</button>
    </view>

    <!-- 上传结果 -->
    <view class="result-area" v-if="uploadResults.length > 0">
      <view class="file-list">
        <view v-for="(result, index) in uploadResults" :key="index" class="file-item">
          <view class="file-icon">
            <uni-icons name="file" size="24" color="#409eff"></uni-icons>
          </view>
          <view class="file-info">
            <text class="file-name">{{ result.name }}</text>
            <text class="file-size">{{ formatFileSize(result.size) }}</text>
          </view>
          <view class="file-url">
            <text>{{ result.url }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import tool from "@/utils/tool.js";
import { apiSubmitVideo, apiUserimg } from "@/api/apis";
import { getAccount } from "@/utils/request.js";

import NumberInput from "../../components/number-input.vue";
import TopNavigationBar from "../../components/TopNavigationBar.vue";

import dayjs from "dayjs";
// 接收从 video.vue 传递的 tname 参数
const routeParams = ref({
  tname: "",
});

// 页面加载时接收参数
onLoad((options) => {
  options = tool.optionsParamsDecode(options);
  if (options.tname) {
    routeParams.value.tname = decodeURIComponent(options.tname);
  }

  apiUserimg({
    account: getAccount(),
  }).then((res) => {
    videoTitle.value = `${res.data.uname} - ${dayjs().format("MM月DD日")}第${isCharge.value}`;
    coverFile.value = res.data.himg ? `himg/${res.data.himg}` : "himg/user.png";
  });
});

function setIsCharge(value) {
  isCharge.value = value;
  setVideo();
}

function setVideo() {
  videoTitle.value = `${res.data.uname} - ${dayjs().format("MM月DD日")}第${isCharge.value}`;
}

//导航栏
const goBack = () => {
  uni.navigateBack({
    delta: 1,
  });
};

// 文件列表
const fileList = ref([]);
// 上传结果
const uploadResults = ref([]);
// 上传进度
const uploadProgress = ref(0);
// 状态信息
const statusMessage = ref("请选择要上传的文件");
const statusClass = ref("");

// 新增：视频信息表单
const videoTitle = ref("");
const isCharge = ref(1); // 1=免费，2=收费
const chargePrice = ref(10);

// 封面图片
const coverImage = ref("");
const coverFile = ref(null);

// 视频预览信息
const selectedVideoUrl = ref("");
const selectedVideoName = ref("");
const selectedVideoSize = ref(0);

// 选择视频文件（使用 chooseVideo API）
const chooseFile = () => {
  uni.chooseVideo({
    sourceType: ["album", "camera"],
    maxDuration: 60, // 最大时长60秒
    camera: "back",
    compressed: false,
    success: (res) => {
      selectedVideoUrl.value = res.tempFilePath;

      // 提取文件名，确保包含扩展名
      let fileName = res.tempFilePath.split("/").pop() || "video";
      // 如果没有扩展名，添加 .mp4
      if (!fileName.includes(".")) {
        fileName = fileName + ".mp4";
      }
      // 确保扩展名是视频格式，如果不是则改为 .mp4
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (!ext || !["mp4", "mov", "avi", "m4v", "webm"].includes(ext)) {
        fileName = fileName.split(".").slice(0, -1).join(".") + ".mp4";
      }

      selectedVideoName.value = fileName;
      selectedVideoSize.value = res.size || 0;

      // 构建文件对象，用于后续上传
      fileList.value = [
        {
          path: res.tempFilePath,
          name: fileName,
          size: selectedVideoSize.value,
        },
      ];

      statusMessage.value = `已选择视频，点击"开始上传"按钮上传`;
      statusClass.value = "status-warning";
    },
    fail: () => {
      statusMessage.value = "选择视频失败，请重试";
      statusClass.value = "status-error";
    },
  });
};

// 选择封面
const chooseCover = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["original", "compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      coverImage.value = tempFilePath;
      coverFile.value = res.tempFiles[0];
    },
  });
};
const isUploading = ref(false);
// 开始上传
const startUpload = async () => {
  if (fileList.value.length === 0) {
    statusMessage.value = "请先选择文件";
    statusClass.value = "status-error";
    return;
  }

  // 验证表单
  if (!videoTitle.value.trim()) {
    statusMessage.value = "请输入视频标题";
    statusClass.value = "status-error";
    return;
  }

  if (isCharge.value === 2 && (!chargePrice.value || Number(chargePrice.value) <= 0)) {
    statusMessage.value = "请输入有效的收费价格";
    statusClass.value = "status-error";
    return;
  }

  statusMessage.value = "正在上传...";
  statusClass.value = "status-warning";
  uploadProgress.value = 0;

  isUploading.value = true;

  for (let i = 0; i < fileList.value.length; i++) {
    const fileItem = fileList.value[i];
    try {
      // 处理文件对象：如果是路径，需要转换为文件对象（H5环境）
      let uploadFile = fileItem;
      // 确保文件名包含扩展名
      let fileName = fileItem.name || selectedVideoName.value || "video.mp4";
      if (!fileName.includes(".")) {
        fileName = fileName + ".mp4";
      }
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (!ext || !["mp4", "mov", "avi", "m4v", "webm"].includes(ext)) {
        fileName = fileName.split(".").slice(0, -1).join(".") + ".mp4";
      }
      console.log(fileItem);
      if (fileItem.path && typeof window !== "undefined") {
        // H5环境：将临时路径转换为File对象
        const response = await fetch(fileItem.path);
        const blob = await response.blob();
        uploadFile = new File([blob], fileName, {
          type: blob.type || "video/mp4",
        });
      } else if (fileItem.path) {
        // 小程序环境：直接使用路径
        uploadFile = fileItem.path;
      }

      // 执行视频上传
      const videoResult = await tool.oss.upload(uploadFile, {
        folder: "videos", // 视频存储文件夹
        progress: (percentage) => {
          uploadProgress.value = Math.floor(percentage * 100);
          statusMessage.value = `视频上传中: ${uploadProgress.value}%`;
        },
      });
      console.log("视频上传结果:", videoResult);
      // 上传封面图片到 vimg 文件夹
      let coverUrl = "";
      if (coverFile.value) {
        // statusMessage.value = '正在上传封面...'
        // const coverResult = await tool.oss.upload(coverFile.value, {
        // 	folder: 'vimg',
        // 	progress: () => { }
        // })

        // coverUrl = coverResult.name
        coverUrl = coverFile.value;
      }

      // 获取彩票名称（tname）- 优先使用 URL 参数，否则从本地存储获取
      let tname = routeParams.value.tname || "";
      if (!tname) {
        try {
          const currentLotteryType = uni.getStorageSync("currentLotteryType");
          if (currentLotteryType && currentLotteryType.name) {
            tname = currentLotteryType.name;
          }
        } catch (error) {
          // 静默处理错误
        }
      }

      // 准备发送到后端的数据
      const videoData = {
        title: videoTitle.value,
        flag: isCharge.value === 2,
        price: isCharge.value === 2 ? Number(chargePrice.value) : 0,
        account: getAccount(),
        url: videoResult.name,
        vimg: coverUrl || "", // 视频封面
        tname: tname || "", // 彩票名称，确保总是包含此字段
      };

      // 提交视频信息到后端
      const submitResult = await apiSubmitVideo(videoData);

      // 添加到上传结果
      uploadResults.value.push({
        name: fileItem.name || selectedVideoName.value,
        size: fileItem.size || selectedVideoSize.value,
        url: videoResult.url,
        coverUrl: coverUrl,
      });

      statusMessage.value = `文件"${fileItem.name || selectedVideoName.value}"上传成功`;
      statusClass.value = "status-success";

      // 如果是付费视频，保存数据并跳转到表单页面
      if (isCharge.value === 2 && submitResult.code === 200) {
        // 从 video.vue 的本地存储获取期号和彩票类型
        // let issueno = "";
        // let tname = "";
        // let opendate = "";

        try {
          // const currentIssueInfo = uni.getStorageSync("currentIssueInfo");
          // const currentLotteryType = uni.getStorageSync("currentLotteryType");
          // if (currentIssueInfo && currentIssueInfo.number) {
          //   issueno = currentIssueInfo.number;
          // }
          // if (currentLotteryType && currentLotteryType.name) {
          //   tname = currentLotteryType.name;
          // }
          // 开奖日期：如果没有，使用今天的日期
          // const today = new Date();
          // const year = today.getFullYear();
          // const month = String(today.getMonth() + 1).padStart(2, "0");
          // const day = String(today.getDate()).padStart(2, "0");
          // opendate = `${year}-${month}-${day}`;
        } catch (error) {
          // 静默处理错误
        }

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          const paramStr = tool.formatUrlParams({
            videoId: submitResult.data,
            tname: tname,
          });

          // 通过 URL 参数传递 videoId（作为备用）
          let url = `/pages/video/biaodan?${paramStr}`;

          uni.redirectTo({
            url: url,
            success: () => {
              // 重置表单
              videoTitle.value = "";
              isCharge.value = 1;
              chargePrice.value = "";
              coverImage.value = "";
              coverFile.value = null;
              selectedVideoUrl.value = "";
              selectedVideoName.value = "";
              selectedVideoSize.value = 0;
              fileList.value = [];
              uploadResults.value = [];
            },
            fail: () => {
              uni.showToast({
                title: "跳转失败",
                icon: "none",
              });
            },
          });
        }, 1500);
      } else {
        // 免费视频：重置表单
        videoTitle.value = "";
        isCharge.value = 1;
        chargePrice.value = "";
        coverImage.value = "";
        coverFile.value = null;
        selectedVideoUrl.value = "";
        selectedVideoName.value = "";
        selectedVideoSize.value = 0;

        // 延迟返回上一页
        setTimeout(() => {
          goBack();
        }, 1500);
      }
    } catch (error) {
      statusMessage.value = `文件"${fileItem.name || selectedVideoName.value || "视频"}"上传失败: ${
        error.message
      }`;
      statusClass.value = "status-error";
    }
    isUploading.value = false;
  }
};

// 清空文件
const clearFiles = () => {
  fileList.value = [];
  uploadResults.value = [];
  uploadProgress.value = 0;
  coverImage.value = "";
  coverFile.value = null;
  selectedVideoUrl.value = "";
  selectedVideoName.value = "";
  selectedVideoSize.value = 0;
  statusMessage.value = "已清空所有文件";
  statusClass.value = "status-warning";
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
</script>

<style scoped>
.navbar {
  height: 44px;
  background-color: #1677ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 3rpx;
  position: relative;
  z-index: 10;
}

.navbar-left {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.navbar-left .uni-icons {
  color: #fff !important;
  font-size: 22px !important;
}

.navbar-title {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
}

.navbar-right {
  width: 44px;
  /* 与左侧相同的宽度 */
  height: 44px;
}

.container {
}

/* 新增：表单样式 */
.form-area {
  background: white;
  border-radius: 8px;
  padding: 20rpx;
  margin-bottom: 20px;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  display: flex;
  flex-direction: row;
  margin-bottom: 30rpx;
  align-items: center;
}

.form-label {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 15rpx;
  width: 160rpx;
  color: #333;
}

.form-input {
  border: 1px solid #e4e7ed;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 38rpx;
  font-weight: bold;
}

.radio-group {
  display: flex;
  gap: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.radio-label {
  display: flex;
  align-items: center;
  font-size: 30rpx;
}

.price-unit {
  margin-left: 10rpx;
  color: #999;
}

.upload-area {
  border: 2px dashed #3498db;
  border-radius: 8px;
  padding: 30px;
  margin: 20rpx;
  text-align: center;
  background: #f8fafc;
  margin-bottom: 20px;
  position: relative;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-preview {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.video-info {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.video-size {
  font-size: 14px;
  color: #666;
}

.upload-text {
  font-size: 18px;
  margin: 10px 0;
}

.upload-hint {
  font-size: 14px;
  color: #7f8c8d;
}

/* 新增：封面选择区域 */
.cover-area {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

.cover-preview {
  width: 100%;
  height: 200px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f8f8f8;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.progress-area {
  margin: 20px 0;
}

.status-message {
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 20px;
}

.status-success {
  background-color: #e8f6ef;
  color: #27ae60;
}

.status-error {
  background-color: #fdecea;
  color: #e74c3c;
}

.status-warning {
  background-color: #e8f4fc;
  color: #3498db;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.result-area {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
}

.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.file-icon {
  margin-right: 10px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: bold;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-url {
  word-break: break-all;
  font-size: 14px;
  color: #666;
}
</style>
