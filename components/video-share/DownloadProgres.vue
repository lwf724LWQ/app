<template>
  <!-- 使用 uni-popup，弹出方向 bottom -->
  <uni-popup ref="popupRef" type="bottom" :duration="300" @change="popupChange">
    <view class="dialog">
      <view class="title">文件下载中</view>

      <view class="bar-wrapper">
        <view class="progress-bar">
          <view class="filled" :style="{ width: progress + '%' }"></view>
        </view>
        <view class="percent">{{ progress }}%</view>
      </view>

      <view class="info">{{ statusText }}</view>

      <view class="actions">
        <button @click="cancel" class="btn-cancel">取消</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref, defineExpose } from "vue";
import { videoWatermark } from "@/api/apis";
import tool from "../../utils/tool";

/** ---------- 组件内部状态 ---------- **/
const popupRef = ref<InstanceType<typeof uniPopup> | null>(null); // uni-popup 实例
const progress = ref(0); // 0~100
const statusText = ref("准备下载...");
let downloadTask: UniApp.DownloadTask | null = null;
let onDoneCallback: ((filePath: string) => void) | null = null;

/** ---------- UI 控制 ---------- **/
function openPopup() {
  popupRef.value?.open();
}
function closePopup() {
  popupRef.value?.close();
  // 关闭后把状态复位，防止下次直接打开时 UI 仍残留
  setTimeout(reset, 300); // 与 uni-popup 的动画时长保持一致
}
function reset() {
  progress.value = 0;
  statusText.value = "准备下载...";
  downloadTask = null;
  onDoneCallback = null;
}

const popupIsShow = ref(false);
function popupChange(e) {
  popupIsShow.value = e.show;
}

/** ---------- 下载逻辑 ---------- **/
function cancel() {
  if (downloadTask) {
    downloadTask.abort();
    statusText.value = "已取消";
  }
  setTimeout(closePopup, 800);
}

/**
 * 对外暴露的 API
 * @param url    下载地址
 * @param onDone 下载成功后回调，返回本地临时文件路径
 */
async function startDownload(videoObj: {id: string|number, src: string}, onDone: (filePath: string) => void) {
  if (downloadTask) {
    console.warn("已有下载任务进行中");
    return;
  }

  onDoneCallback = onDone;
  openPopup();

  const tempFile: TempFile | false = await checkDownloaded({url: videoObj.src, id: videoObj.id});

  if (tempFile) {
    console.log("本地缓存存在", tempFile);
    statusText.value = "已下载";
    progress.value = 100;
    onDoneCallback && onDoneCallback(tempFile.filePath);
    setTimeout(closePopup, 1500);
    return;
  }
  console.log("本地缓存不存在，开始下载");
  // 先请求接口获取下载地址
  statusText.value = "视频处理中...";
  let res;
  try {
    res = await videoWatermark({url: videoObj.src, id: videoObj.id});
  } catch (error) {
    cancel();
    const errorMsg = error?.msg || ""
    uni.showToast({ title: "视频处理失败:" + errorMsg, icon: "none" });
    return;
  }
  console.log("videoWatermark res", res);
  if (typeof res.data !== "string") {
    statusText.value = "视频处理失败";
    setTimeout(closePopup, 1500);
    return;
  }
  if (popupIsShow.value === false) {
    console.log("弹窗已关闭");
    return;
  }

  const completeUrl = tool.oss.getFullUrl("/shuiyin/" + res.data);

  statusText.value = "正在下载...";
  downloadTask = uni.downloadFile({
    url: completeUrl,
    timeout: 1000000,
    success: (res) => {
      if (res.statusCode === 200) {
        statusText.value = "下载完成";
        saveToTempList(url, res.tempFilePath);
        onDoneCallback && onDoneCallback(res.tempFilePath);
      } else {
        statusText.value = `下载失败（${res.statusCode}）`;
      }
    },
    fail: (err) => {
      console.error("download fail", err);
      statusText.value = "下载失败";
      uni.showToast({ title: "下载失败:" + err.errMsg, icon: "none" });
    },
    complete: () => {
      // 1.5 s 后自动关闭弹框
      setTimeout(closePopup, 1500);
    },
  });

  // 进度监听
  downloadTask.onProgressUpdate((result) => {
    progress.value = Math.round(result.progress);
  });
}

function checkFileExist(filePath: string) {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      filePath,
      (entry) => {
        console.log("entry", entry);
        resolve(true);
      },
      (err) => {
        reject(err);
      }
    );
  });
}

function saveToTempList(urlKey: string, filePath: string) {
  const tempFilePath: TempFile[] = uni.getStorageSync("tempFilePath") || [];
  tempFilePath.push({
    urlKey,
    filePath,
  });
  uni.setStorageSync("tempFilePath", tempFilePath);
}

interface TempFile {
  urlKey: string;
  filePath: string;
}

async function checkDownloaded(videoObj: {id: string|number, url: string}) {
  const tempFilePath: TempFile[] = uni.getStorageSync("tempFilePath") || [];
  console.log("tempFilePath", tempFilePath);
  // 用 url 或自定义 key 做匹配
  const tempfile = tempFilePath.find((f: TempFile) => f.urlKey === videoObj.id);
  if (!tempfile) {
    return false;
  }
  try {
    await checkFileExist(tempfile.filePath);
    return tempfile;
  } catch (err) {
    uni.setStorageSync(
      "tempFilePath",
      tempFilePath.filter((f) => f.urlKey !== videoObj.id)
    );
    return false;
  }
}

// 让父组件通过 ref 调用 startDownload
defineExpose({
  startDownload,
});
</script>
<style scoped>
.dialog {
  background: #fff;
  width: 100%;
  border-radius: 16px 16px 0 0;
  padding: 24rpx;
  box-sizing: border-box;
}
.title {
  font-size: 38rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  text-align: center;
}
.bar-wrapper {
  display: flex;
  align-items: center;
}
.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}
.filled {
  height: 100%;
  background: #3c9cff;
}
.percent {
  width: 80rpx;
  text-align: right;
  margin-left: 12rpx;
  font-size: 28rpx;
}
.info {
  margin-top: 12rpx;
  font-size: 34rpx;
  color: #000;
  text-align: center;
}
.actions {
  width: 100%;
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
}
.btn-cancel {
  width: 100%;
  background: #ff4d4f;
  color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}
</style>
