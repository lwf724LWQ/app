<template>
  <view class="update-modal" v-if="showModal">
    <view class="modal-content">
      <view class="modal-header">
        <text class="modal-title">发现新版本</text>
      </view>

      <view class="modal-body">
        <text class="version-info">新版本：{{ serverVersionText }}</text>
        <text class="update-desc">更新内容：{{ updateDescription }}</text>

        <view class="progress-container" v-if="downloading">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: downloadProgress + '%' }"></view>
          </view>
          <text class="progress-text">{{ downloadProgress }}%</text>
        </view>
      </view>

      <view class="modal-footer">
        <button class="btn-cancel" @click="cancelUpdate" v-if="!downloading">暂不更新</button>
        <button class="btn-update" @click="startDownload" :disabled="downloading">
          {{ downloading ? "下载中..." : "立即更新" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { apiAppversionQuery } from "@/api/apis.js";

// 响应式数据
const showModal = ref(false);
const downloading = ref(false);
const downloadProgress = ref(0);
const serverVersionText = ref("");
const updateDescription = ref("");

// 版本比较函数
const compareVersions = (serverVersion, currentVersion, updateId) => {
  if (uni.getStorageSync("aftreUpdateId") === updateId) {
    console.log("跳过更新");
    return false;
  }
  uni.setStorageSync("aftreUpdateId", updateId);

  const server = serverVersion.split(".").map(Number);
  const current = currentVersion.split(".").map(Number);

  for (let i = 0; i < Math.max(server.length, current.length); i++) {
    const s = server[i] || 0;
    const c = current[i] || 0;

    if (s > c) return true; // 服务器版本更高
    if (s < c) return false; // 当前版本更高或相等
  }

  return false; // 相等
};

// 显示更新模态框
const showUpdateModal = (version, downloadUrl) => {
  serverVersionText.value = version;
  showModal.value = true;
  startDownload();
};

// 隐藏模态框
const hideModal = () => {
  showModal.value = false;
  downloading.value = false;
  downloadProgress.value = 0;
};

// 取消更新
const cancelUpdate = () => {
  hideModal();
};

// 开始下载更新
const startDownload = async () => {
  if (!downloading.value) {
    downloading.value = true;

    try {
      // 获取当前应用版本
      const widgetInfo = await new Promise((resolve) => {
        plus.runtime.getProperty(plus.runtime.appid, resolve);
      });

      // 获取服务器版本信息
      const res = await apiAppversionQuery();
      const downloadUrl = res.data.url;
      serverVersionText.value = res.data.remark;

      // 开始下载文件
      const downloadTask = uni.downloadFile({
        url: downloadUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            // 下载完成，开始安装
            plus.runtime.install(
              res.tempFilePath,
              { force: true },
              () => {
                console.log("安装成功");
                plus.runtime.restart();
              },
              (e) => {
                console.error("安装失败：" + e.message);
                uni.showModal({
                  title: "安装失败",
                  content: "请到官网下载后，手动安装",
                });
                hideModal();
              }
            );
          } else {
            console.error("下载失败");
            uni.showModal({
              content: "下载失败，请稍后再试",
            });
            hideModal();
          }
        },
        fail: () => {
          console.error("下载失败");
          uni.showModal({
            content: "下载失败，请稍后再试",
          });
          hideModal();
        },
      });

      // 监听下载进度
      downloadTask.onProgressUpdate((res) => {
        downloadProgress.value = res.progress;
      });
    } catch (error) {
      console.error("更新过程中出现错误：", error);
      uni.showModal({
        content: "更新失败，请稍后再试",
      });
      hideModal();
    }
  }
};

// 检查更新的方法，供外部调用
const check = () => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.runtime.getProperty(plus.runtime.appid, async function (widgetInfo) {
      try {
        const currentVersion = widgetInfo.version;
        const res = await apiAppversionQuery();
        const serverVersion = res.data.version;

        // 比较版本号
        if (compareVersions(serverVersion, currentVersion, res.data.id)) {
          // 服务器版本更高，显示更新提示
          showUpdateModal(serverVersion, res.data.url);
          resolve(); // 发现新版本
        } else {
          // 当前已是最新版本
          resolve("当前已经是最新版本" + currentVersion);
        }
      } catch (error) {
        console.error("检查更新失败：", error);
        reject(error);
      }
    });
    // #endif

    // #ifndef APP-PLUS
    // 非APP平台返回提示
    resolve("仅在APP中支持检查更新功能");
    // #endif
  });
};

// 向外部暴露方法
defineExpose({
  check,
});
</script>

<style lang="scss" scoped>
.update-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .modal-content {
    background-color: #fff;
    border-radius: 12rpx;
    width: 80%;
    max-width: 600rpx;
    overflow: hidden;

    .modal-header {
      padding: 40rpx 30rpx 20rpx;
      text-align: center;

      .modal-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .modal-body {
      padding: 0 30rpx 30rpx;
      text-align: center;

      .version-info {
        display: block;
        font-size: 30rpx;
        color: #666;
        margin-bottom: 20rpx;
      }

      .update-desc {
        display: block;
        font-size: 28rpx;
        color: #888;
        line-height: 1.5;
        margin-bottom: 30rpx;
      }

      .progress-container {
        display: flex;
        flex-direction: column;
        align-items: center;

        .progress-bar {
          width: 100%;
          height: 20rpx;
          background-color: #e0e0e0;
          border-radius: 10rpx;
          overflow: hidden;
          margin-bottom: 20rpx;

          .progress-fill {
            height: 100%;
            background: linear-gradient(to right, #409eff, #1890ff);
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 26rpx;
          color: #666;
        }
      }
    }

    .modal-footer {
      display: flex;
      padding: 0 30rpx 30rpx;
      gap: 20rpx;

      button {
        flex: 1;
        height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-cancel {
        background-color: #f5f5f5;
        color: #666;
      }

      .btn-update {
        background: linear-gradient(to right, #409eff, #1890ff);
        color: #fff;

        &:disabled {
          background: #ccc;
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
