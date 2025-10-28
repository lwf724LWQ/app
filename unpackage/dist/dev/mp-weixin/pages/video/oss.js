"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_tool = require("../../utils/tool.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "oss",
  setup(__props) {
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const fileList = common_vendor.ref([]);
    const uploadResults = common_vendor.ref([]);
    const uploadProgress = common_vendor.ref(0);
    const statusMessage = common_vendor.ref("请选择要上传的文件");
    const statusClass = common_vendor.ref("");
    const videoTitle = common_vendor.ref("");
    const isCharge = common_vendor.ref(1);
    const chargePrice = common_vendor.ref("");
    const coverImage = common_vendor.ref("");
    const coverFile = common_vendor.ref(null);
    const chooseFile = () => {
      common_vendor.index.chooseImage({
        count: 1,
        // 限制只能选择一个文件
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          res.tempFilePaths;
          common_vendor.index.__f__("log", "at pages/video/oss.vue:148", res.tempFilePaths);
          fileList.value = res.tempFiles;
          statusMessage.value = `已选择${fileList.value.length}个文件，点击"开始上传"按钮上传`;
          statusClass.value = "status-warning";
        }
      });
    };
    const chooseCover = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          coverImage.value = tempFilePath;
          coverFile.value = res.tempFiles[0];
        }
      });
    };
    const startUpload = async () => {
      if (fileList.value.length === 0) {
        statusMessage.value = "请先选择文件";
        statusClass.value = "status-error";
        return;
      }
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
      for (let i = 0; i < fileList.value.length; i++) {
        const file = fileList.value[i];
        try {
          const videoResult = await utils_tool.tool.oss.upload(file, {
            folder: "videos",
            // 视频存储文件夹
            progress: (percentage) => {
              uploadProgress.value = Math.floor(percentage * 100);
              statusMessage.value = `视频上传中: ${uploadProgress.value}%`;
            }
          });
          common_vendor.index.__f__("log", "at pages/video/oss.vue:209", "视频上传成功:", videoResult.name);
          let coverUrl = "";
          if (coverFile.value) {
            statusMessage.value = "正在上传封面...";
            const coverResult = await utils_tool.tool.oss.upload(coverFile.value, {
              folder: "vimg",
              // 已经在文件名中指定了路径，所以这里设为空
              progress: () => {
              }
              // 封面上传不需要显示进度
            });
            coverUrl = coverResult.name;
            common_vendor.index.__f__("log", "at pages/video/oss.vue:225", "封面上传成功:", coverUrl);
          }
          const videoData = {
            title: videoTitle.value,
            flag: isCharge.value === 2,
            price: isCharge.value === 2 ? Number(chargePrice.value) : 0,
            account: utils_request.getAccount(),
            url: videoResult.name,
            vimg: coverUrl
            // 添加封面URL
          };
          const submitResult = await api_apis.apiSubmitVideo(videoData);
          common_vendor.index.__f__("log", "at pages/video/oss.vue:240", "视频信息提交成功:", submitResult);
          uploadResults.value.push({
            name: file.name,
            size: file.size,
            url: videoResult.url,
            coverUrl
          });
          statusMessage.value = `文件"${file.name}"上传成功`;
          statusClass.value = "status-success";
          videoTitle.value = "";
          isCharge.value = 1;
          chargePrice.value = "";
          coverImage.value = "";
          coverFile.value = null;
        } catch (error) {
          statusMessage.value = `文件"${file.name}"上传失败: ${error.message}`;
          statusClass.value = "status-error";
        }
      }
    };
    const clearFiles = () => {
      fileList.value = [];
      uploadResults.value = [];
      uploadProgress.value = 0;
      coverImage.value = "";
      coverFile.value = null;
      statusMessage.value = "已清空所有文件";
      statusClass.value = "status-warning";
    };
    const formatFileSize = (bytes) => {
      if (bytes === 0)
        return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "30"
        }),
        b: common_vendor.o(goBack),
        c: videoTitle.value,
        d: common_vendor.o(($event) => videoTitle.value = $event.detail.value),
        e: isCharge.value === 1,
        f: common_vendor.o(($event) => isCharge.value = 1),
        g: isCharge.value === 2,
        h: common_vendor.o(($event) => isCharge.value = 2),
        i: isCharge.value === 2
      }, isCharge.value === 2 ? {
        j: chargePrice.value,
        k: common_vendor.o(($event) => chargePrice.value = $event.detail.value)
      } : {}, {
        l: common_vendor.p({
          name: "plus",
          size: "50",
          color: "#3498db"
        }),
        m: common_vendor.o(chooseFile),
        n: fileList.value.length > 0
      }, fileList.value.length > 0 ? common_vendor.e({
        o: coverImage.value
      }, coverImage.value ? {
        p: coverImage.value
      } : {
        q: common_vendor.p({
          name: "image",
          size: "40",
          color: "#ccc"
        })
      }, {
        r: common_vendor.o(chooseCover)
      }) : {}, {
        s: uploadProgress.value > 0
      }, uploadProgress.value > 0 ? {
        t: uploadProgress.value
      } : {}, {
        v: common_vendor.t(statusMessage.value),
        w: common_vendor.n(statusClass.value),
        x: common_vendor.o(startUpload),
        y: fileList.value.length === 0,
        z: common_vendor.o(clearFiles),
        A: fileList.value.length === 0,
        B: uploadResults.value.length > 0
      }, uploadResults.value.length > 0 ? {
        C: common_vendor.f(uploadResults.value, (result, index, i0) => {
          return {
            a: "b55ec0d4-3-" + i0,
            b: common_vendor.t(result.name),
            c: common_vendor.t(formatFileSize(result.size)),
            d: common_vendor.t(result.url),
            e: index
          };
        }),
        D: common_vendor.p({
          name: "file",
          size: "24",
          color: "#409eff"
        })
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/oss.js.map
