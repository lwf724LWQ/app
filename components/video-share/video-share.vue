/pages/example/example.vue#L1-150
<template>
  <view class="container">
    <!-- 引入下载进度条组件 -->
    <DownloadProgress ref="downloadRef" />
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DownloadProgress from "./DownloadProgres.vue";

const downloadRef = ref<InstanceType<typeof DownloadProgress> | null>(null);

function share(url: string) {
  downloadRef.value?.startDownload(url, (localPath) => {
    console.log("临时文件路径:", localPath);
    const p = plus.io.convertLocalFileSystemURL(localPath);
    // 判断是否为ios
    if (uni.getSystemInfoSync().platform === "ios") {
		// 这个插件在安卓会打包失败
      const FileShare = uni.requireNativePlugin("life-FileShare");
      FileShare.render(
        {
          type: "SYSTEM", //QQ为QQ，微信为WX，系统默认是SYSTEM，不填写默认SYSTEM
          filePath: p,
        },
        (result) => {}
      );

      // const shareModule = uni.requireNativePlugin("ZYJ-IOS-Share");
      // shareModule.share({
      //   path: p, // 本地文件地址
      //   type: 3, // 1 分享文字  2 分享链接  3 分享文件 音频视频
      // });
    } else {
      const FileShare = uni.requireNativePlugin("life-FileShare");
      FileShare.render(
        {
          type: "WX", //QQ为QQ，微信为WX，系统默认是SYSTEM，不填写默认SYSTEM
          filePath: p,
        },
        (result) => {}
      );
      // const shareModule = uni.requireNativePlugin("ZYJ-Android-Share");
      // shareModule.shareFile(
      //   {
      //     packetName: "com.caimizm.app.wuqizaic", // 当前应用包名
      //     filePath: p, // 本地文件地址
      //     wxShare: true, // 是否分享微信
      //   },
      //   (result: any) => {
      //     console.log(result);
      //   }
      // );
    }
  });
}

defineExpose({
  share,
});
</script>

<style></style>
