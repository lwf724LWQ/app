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
    const routeParams = common_vendor.ref({
      tname: ""
    });
    common_vendor.onLoad((options) => {
      if (options.tname) {
        routeParams.value.tname = decodeURIComponent(options.tname);
      }
    });
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
    const selectedVideoUrl = common_vendor.ref("");
    const selectedVideoName = common_vendor.ref("");
    const selectedVideoSize = common_vendor.ref(0);
    const chooseFile = () => {
      common_vendor.index.chooseVideo({
        sourceType: ["album", "camera"],
        maxDuration: 60,
        // 最大时长60秒
        camera: "back",
        success: (res) => {
          var _a;
          selectedVideoUrl.value = res.tempFilePath;
          let fileName = res.tempFilePath.split("/").pop() || "video";
          if (!fileName.includes(".")) {
            fileName = fileName + ".mp4";
          }
          const ext = (_a = fileName.split(".").pop()) == null ? void 0 : _a.toLowerCase();
          if (!ext || !["mp4", "mov", "avi", "m4v", "webm"].includes(ext)) {
            fileName = fileName.split(".").slice(0, -1).join(".") + ".mp4";
          }
          selectedVideoName.value = fileName;
          selectedVideoSize.value = res.size || 0;
          fileList.value = [{
            path: res.tempFilePath,
            name: fileName,
            size: selectedVideoSize.value
          }];
          statusMessage.value = `已选择视频，点击"开始上传"按钮上传`;
          statusClass.value = "status-warning";
        },
        fail: () => {
          statusMessage.value = "选择视频失败，请重试";
          statusClass.value = "status-error";
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
      var _a;
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
        const fileItem = fileList.value[i];
        try {
          let uploadFile = fileItem;
          let fileName = fileItem.name || selectedVideoName.value || "video.mp4";
          if (!fileName.includes(".")) {
            fileName = fileName + ".mp4";
          }
          const ext = (_a = fileName.split(".").pop()) == null ? void 0 : _a.toLowerCase();
          if (!ext || !["mp4", "mov", "avi", "m4v", "webm"].includes(ext)) {
            fileName = fileName.split(".").slice(0, -1).join(".") + ".mp4";
          }
          if (fileItem.path && typeof window !== "undefined") {
            const response = await fetch(fileItem.path);
            const blob = await response.blob();
            uploadFile = new File([blob], fileName, { type: blob.type || "video/mp4" });
          } else if (fileItem.path) {
            uploadFile = fileItem.path;
          }
          const videoResult = await utils_tool.tool.oss.upload(uploadFile, {
            folder: "videos",
            // 视频存储文件夹
            progress: (percentage) => {
              uploadProgress.value = Math.floor(percentage * 100);
              statusMessage.value = `视频上传中: ${uploadProgress.value}%`;
            }
          });
          let coverUrl = "";
          if (coverFile.value) {
            statusMessage.value = "正在上传封面...";
            const coverResult = await utils_tool.tool.oss.upload(coverFile.value, {
              folder: "vimg",
              progress: () => {
              }
            });
            coverUrl = coverResult.name;
          }
          let tname = routeParams.value.tname || "";
          if (!tname) {
            try {
              const currentLotteryType = common_vendor.index.getStorageSync("currentLotteryType");
              if (currentLotteryType && currentLotteryType.name) {
                tname = currentLotteryType.name;
              }
            } catch (error) {
            }
          }
          const videoData = {
            title: videoTitle.value,
            flag: isCharge.value === 2,
            price: isCharge.value === 2 ? Number(chargePrice.value) : 0,
            account: utils_request.getAccount(),
            url: videoResult.name,
            vimg: coverUrl || "",
            // 视频封面
            tname: tname || ""
            // 彩票名称，确保总是包含此字段
          };
          const submitResult = await api_apis.apiSubmitVideo(videoData);
          uploadResults.value.push({
            name: fileItem.name || selectedVideoName.value,
            size: fileItem.size || selectedVideoSize.value,
            url: videoResult.url,
            coverUrl
          });
          statusMessage.value = `文件"${fileItem.name || selectedVideoName.value}"上传成功`;
          statusClass.value = "status-success";
          if (isCharge.value === 2 && submitResult.code === 200) {
            let issueno = "";
            let tname2 = "";
            let opendate = "";
            try {
              const currentIssueInfo = common_vendor.index.getStorageSync("currentIssueInfo");
              const currentLotteryType = common_vendor.index.getStorageSync("currentLotteryType");
              if (currentIssueInfo && currentIssueInfo.number) {
                issueno = currentIssueInfo.number;
              }
              if (currentLotteryType && currentLotteryType.name) {
                tname2 = currentLotteryType.name;
              }
              const today = /* @__PURE__ */ new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, "0");
              const day = String(today.getDate()).padStart(2, "0");
              opendate = `${year}-${month}-${day}`;
            } catch (error) {
            }
            let videoId = null;
            if (submitResult.data) {
              videoId = submitResult.data.id || submitResult.data.videoId || submitResult.data.video_id || submitResult.data.vId || submitResult.id || (typeof submitResult.data === "number" ? submitResult.data : null) || (typeof submitResult.data === "string" ? submitResult.data : null) || null;
            }
            if (!videoId && submitResult.code === 200) {
              if (typeof submitResult.data === "string" || typeof submitResult.data === "number") {
                videoId = submitResult.data;
              }
            }
            const videoInfo = {
              videoId,
              title: videoTitle.value,
              price: Number(chargePrice.value) || 0,
              account: utils_request.getAccount(),
              videoUrl: videoResult.url || `http://video.caimizm.com/${videoResult.name}`,
              coverUrl: coverUrl || "",
              issueno,
              // 期号
              tname: tname2,
              // 彩票名称
              opendate,
              // 开奖日期
              timestamp: Date.now()
            };
            try {
              common_vendor.index.setStorageSync("paidVideoInfo", videoInfo);
            } catch (error) {
            }
            setTimeout(() => {
              let url = "/pages/video/biaodan";
              if (videoId) {
                url += `?videoId=${videoId}`;
              }
              common_vendor.index.navigateTo({
                url,
                success: () => {
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
                  common_vendor.index.showToast({
                    title: "跳转失败",
                    icon: "none"
                  });
                }
              });
            }, 1500);
          } else {
            videoTitle.value = "";
            isCharge.value = 1;
            chargePrice.value = "";
            coverImage.value = "";
            coverFile.value = null;
            selectedVideoUrl.value = "";
            selectedVideoName.value = "";
            selectedVideoSize.value = 0;
            setTimeout(() => {
              goBack();
            }, 1500);
          }
        } catch (error) {
          statusMessage.value = `文件"${fileItem.name || selectedVideoName.value || "视频"}"上传失败: ${error.message}`;
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
      selectedVideoUrl.value = "";
      selectedVideoName.value = "";
      selectedVideoSize.value = 0;
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
        l: selectedVideoUrl.value
      }, selectedVideoUrl.value ? {
        m: selectedVideoUrl.value
      } : {}, {
        n: selectedVideoName.value
      }, selectedVideoName.value ? common_vendor.e({
        o: common_vendor.t(selectedVideoName.value),
        p: selectedVideoSize.value
      }, selectedVideoSize.value ? {
        q: common_vendor.t(formatFileSize(selectedVideoSize.value))
      } : {}) : {
        r: common_vendor.p({
          name: "plus",
          size: "50",
          color: "#3498db"
        })
      }, {
        s: common_vendor.o(chooseFile),
        t: selectedVideoUrl.value
      }, selectedVideoUrl.value ? common_vendor.e({
        v: coverImage.value
      }, coverImage.value ? {
        w: coverImage.value
      } : {
        x: common_vendor.p({
          name: "image",
          size: "40",
          color: "#ccc"
        })
      }, {
        y: common_vendor.o(chooseCover)
      }) : {}, {
        z: uploadProgress.value > 0
      }, uploadProgress.value > 0 ? {
        A: uploadProgress.value
      } : {}, {
        B: common_vendor.t(statusMessage.value),
        C: common_vendor.n(statusClass.value),
        D: common_vendor.o(startUpload),
        E: fileList.value.length === 0,
        F: common_vendor.o(clearFiles),
        G: fileList.value.length === 0,
        H: uploadResults.value.length > 0
      }, uploadResults.value.length > 0 ? {
        I: common_vendor.f(uploadResults.value, (result, index, i0) => {
          return {
            a: "42af48bd-3-" + i0,
            b: common_vendor.t(result.name),
            c: common_vendor.t(formatFileSize(result.size)),
            d: common_vendor.t(result.url),
            e: index
          };
        }),
        J: common_vendor.p({
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
