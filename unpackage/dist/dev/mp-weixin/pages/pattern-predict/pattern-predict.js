"use strict";
const common_vendor = require("../../common/vendor.js");
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
  __name: "pattern-predict",
  setup(__props) {
    const issueNumber = common_vendor.ref("");
    const selectedImages = common_vendor.ref([]);
    const schemes = common_vendor.ref([]);
    const lotteryType = common_vendor.ref(null);
    const uploadedImageUrls = common_vendor.ref([]);
    const isUploadingImage = common_vendor.ref(false);
    const canPublish = common_vendor.computed(() => {
      return schemes.value.length > 0 && selectedImages.value.length > 0;
    });
    common_vendor.onMounted(() => {
      loadIssueInfo();
      loadSchemesFromStorage();
    });
    common_vendor.onShow(() => {
      loadSchemesFromStorage();
    });
    const uploadObject = async (file, callback) => {
      try {
        let fileName = file.name || "";
        const origin_file_name = fileName.split(".").slice(0, fileName.split(".").length - 1).join(".");
        const upload_file_name = (/* @__PURE__ */ new Date()).getTime() + "." + fileName.split(".")[fileName.split(".").length - 1];
        let res = await api_apis.getCOSSecretKey({});
        if (res.code !== 200) {
          throw new Error("获取上传凭证失败");
        }
        const OSS = await "../../common/vendor.js".then((n) => n.aliyunOssSdk);
        const ossConfig = {
          region: res.data.region || "cn-guangzhou",
          accessKeyId: res.data.STSaccessKeyId,
          accessKeySecret: res.data.STSsecretAccessKey,
          stsToken: res.data.security_token,
          bucket: res.data.bucket || "cjvd",
          // 使用正确的endpoint
          endpoint: "https://oss-cn-guangzhou.aliyuncs.com",
          // 添加STS token刷新机制
          refreshSTSToken: async () => {
            const newRes = await api_apis.getCOSSecretKey({});
            return {
              accessKeyId: newRes.data.STSaccessKeyId,
              accessKeySecret: newRes.data.STSsecretAccessKey,
              stsToken: newRes.data.security_token
            };
          },
          refreshSTSTokenInterval: 3e5
          // 5分钟刷新一次
        };
        const client = new OSS.default(ossConfig);
        const result = await client.put(`himg/${upload_file_name}`, file);
        if (result && result.url) {
          const customUrl = `http://video.caimizm.com/himg/${upload_file_name}`;
          callback(customUrl);
        } else {
          throw new Error("上传失败");
        }
      } catch (error) {
        throw error;
      }
    };
    const getSchemeDisplayData = (scheme) => {
      const data = scheme.data;
      const result = [];
      if (scheme.id === "二字现" || scheme.id === "三字现") {
        if (data.combinations && data.combinations.length > 0) {
          result.push(`组合: ${data.combinations.join(",")}`);
        } else {
          result.push("组合: 未选择");
        }
      } else {
        if (data.thousands && data.thousands.length > 0) {
          let thousandsInfo = `千位: ${data.thousands.join("")}`;
          if (data.thousandsMainAttack && data.thousandsMainAttack.length > 0) {
            thousandsInfo += ` 主攻${data.thousandsMainAttack.join("")}`;
          }
          if (data.thousandsKeyPoint && data.thousandsKeyPoint.length > 0) {
            thousandsInfo += ` 重点${data.thousandsKeyPoint.join("")}`;
          }
          result.push(thousandsInfo);
        }
        if (data.hundreds && data.hundreds.length > 0) {
          let hundredsInfo = `百位: ${data.hundreds.join("")}`;
          if (data.hundredsMainAttack && data.hundredsMainAttack.length > 0) {
            hundredsInfo += ` 主攻${data.hundredsMainAttack.join("")}`;
          }
          if (data.hundredsKeyPoint && data.hundredsKeyPoint.length > 0) {
            hundredsInfo += ` 重点${data.hundredsKeyPoint.join("")}`;
          }
          result.push(hundredsInfo);
        }
        if (data.tens && data.tens.length > 0) {
          let tensInfo = `十位: ${data.tens.join("")}`;
          if (data.tensMainAttack && data.tensMainAttack.length > 0) {
            tensInfo += ` 主攻${data.tensMainAttack.join("")}`;
          }
          if (data.tensKeyPoint && data.tensKeyPoint.length > 0) {
            tensInfo += ` 重点${data.tensKeyPoint.join("")}`;
          }
          result.push(tensInfo);
        }
        if (data.units && data.units.length > 0) {
          let unitsInfo = `个位: ${data.units.join("")}`;
          if (data.unitsMainAttack && data.unitsMainAttack.length > 0) {
            unitsInfo += ` 主攻${data.unitsMainAttack.join("")}`;
          }
          if (data.unitsKeyPoint && data.unitsKeyPoint.length > 0) {
            unitsInfo += ` 重点${data.unitsKeyPoint.join("")}`;
          }
          result.push(unitsInfo);
        }
        if (result.length === 0) {
          result.push("未选择");
        }
      }
      return result;
    };
    const loadSchemesFromStorage = () => {
      try {
        const savedData = common_vendor.index.getStorageSync("predict_schemes_data");
        if (savedData && savedData.addedSchemes && Array.isArray(savedData.addedSchemes)) {
          schemes.value = savedData.addedSchemes;
        } else {
          schemes.value = [];
        }
      } catch (error) {
        schemes.value = [];
      }
    };
    const loadIssueInfo = async () => {
      try {
        const savedLotteryType = common_vendor.index.getStorageSync("currentLotteryType");
        if (savedLotteryType) {
          lotteryType.value = savedLotteryType;
        } else {
          lotteryType.value = { id: 16, code: 16, name: "排列三" };
        }
        if (!lotteryType.value || !lotteryType.value.id) {
          return;
        }
        common_vendor.index.showLoading({ title: "加载期号中..." });
        const response = await api_apis.apiGetIssueNo({ cpid: lotteryType.value.id });
        common_vendor.index.hideLoading();
        if (response.code === 200 && response.data !== null && response.data !== void 0) {
          let issueNumberValue = null;
          let issueStatus = "待开奖";
          let issueTime = "今天 21:30";
          if (typeof response.data === "number" || typeof response.data === "string") {
            issueNumberValue = response.data.toString();
          } else if (typeof response.data === "object") {
            issueNumberValue = response.data.issueno || response.data.number || response.data.id;
            issueStatus = response.data.status || "待开奖";
            issueTime = response.data.time || "今天 21:30";
          }
          issueNumber.value = issueNumberValue || "0";
          common_vendor.index.showToast({ title: `期号加载成功: ${issueNumber.value}`, icon: "success" });
        } else {
          issueNumber.value = "0";
          common_vendor.index.showToast({ title: "使用默认期号: 0", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        issueNumber.value = "0";
        common_vendor.index.showToast({ title: "期号加载异常，使用默认期号: 0", icon: "none" });
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToSchemePage = () => {
      common_vendor.index.__f__("log", "at pages/pattern-predict/pattern-predict.vue:329", "=== 规律帖跳转到方案页面 ===");
      common_vendor.index.__f__("log", "at pages/pattern-predict/pattern-predict.vue:330", "当前页面:", "pages/pattern-predict/pattern-predict");
      const publishData = {
        lotteryType: lotteryType.value,
        issueInfo: {
          id: issueNumber.value,
          number: issueNumber.value,
          status: "待开奖",
          time: "今天 21:30"
        },
        schemes: schemes.value
      };
      common_vendor.index.navigateTo({
        url: `/pages/predict-scheme/predict-scheme?data=${encodeURIComponent(JSON.stringify(publishData))}`,
        success: () => {
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "跳转失败",
            icon: "none"
          });
        }
      });
    };
    const selectImage = async () => {
      if (isUploadingImage.value) {
        common_vendor.index.showToast({
          title: "图片正在上传中，请稍候",
          icon: "none"
        });
        return;
      }
      const remainingCount = 6 - selectedImages.value.length;
      if (remainingCount <= 0) {
        common_vendor.index.showToast({
          title: "最多只能选择6张图片",
          icon: "none"
        });
        return;
      }
      try {
        const chooseResult = await common_vendor.index.chooseImage({
          count: remainingCount,
          // 最多选择剩余数量
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
          common_vendor.index.showLoading({
            title: "上传图片中..."
          });
          isUploadingImage.value = true;
          const uploadPromises = chooseResult.tempFilePaths.map(async (tempFilePath, index) => {
            try {
              let fileToUpload;
              if (true) {
                const response = await fetch(tempFilePath);
                const blob = await response.blob();
                fileToUpload = new File([blob], `pattern-image-${index}.jpg`, { type: "image/jpeg" });
              }
              return new Promise((resolve, reject) => {
                uploadObject(fileToUpload, (url) => {
                  resolve({ tempFilePath, url });
                });
              });
            } catch (error) {
              throw error;
            }
          });
          const uploadResults = await Promise.all(uploadPromises);
          uploadResults.forEach(({ tempFilePath, url }) => {
            selectedImages.value.push(tempFilePath);
            uploadedImageUrls.value.push(url);
          });
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: `成功上传${uploadResults.length}张图片`,
            icon: "success"
          });
          isUploadingImage.value = false;
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        isUploadingImage.value = false;
        common_vendor.index.showToast({
          title: "图片上传失败",
          icon: "none"
        });
      }
    };
    const removeImage = (index) => {
      selectedImages.value.splice(index, 1);
      uploadedImageUrls.value.splice(index, 1);
    };
    const generatePostContent = () => {
      let content = "【规律预测】\n\n";
      if (schemes.value.length > 0) {
        schemes.value.forEach((scheme, index) => {
          content += `${index + 1}. [${scheme.id}]
`;
          const schemeDetails = getSchemeDisplayData(scheme);
          schemeDetails.forEach((detail) => {
            content += `   ${detail}
`;
          });
          content += "\n";
        });
      }
      const validIssueNumber = issueNumber.value || "0";
      content += `期号: 第${validIssueNumber}期
`;
      content += `发布时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
      return content;
    };
    const handlePublish = async () => {
      if (!canPublish.value) {
        common_vendor.index.showToast({
          title: "请完善方案和图片",
          icon: "none"
        });
        return;
      }
      if (!uploadedImageUrls.value || uploadedImageUrls.value.length === 0) {
        common_vendor.index.showToast({
          title: "请等待图片上传完成",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "发布中..."
        });
        let currentUserAvatar = "";
        const loginData = common_vendor.index.getStorageSync("loginData") || {};
        if (loginData.himg) {
          currentUserAvatar = loginData.himg;
        }
        const postData = {
          tname: lotteryType.value ? `${lotteryType.value.name}-规律预测` : "规律预测",
          // 彩票名称 - 添加"规律预测"标识
          issueno: parseInt(issueNumber.value) || 0,
          // 期号转换为数字
          content: generatePostContent(),
          // 发帖内容
          account: utils_request.getAccount() || "",
          // 账号
          pimg: uploadedImageUrls.value.join(","),
          // 多张图片URL用逗号分隔
          flag: false
          // 需要审核
        };
        if (!postData.account) {
          common_vendor.index.showToast({
            title: "账号信息缺失，请重新登录",
            icon: "none"
          });
          return;
        }
        if (postData.issueno === null || postData.issueno === void 0 || postData.issueno === "") {
          common_vendor.index.showToast({
            title: "期号信息缺失",
            icon: "none"
          });
          return;
        }
        if (!postData.content) {
          common_vendor.index.showToast({
            title: "发帖内容为空",
            icon: "none"
          });
          return;
        }
        if (!postData.pimg || postData.pimg.trim() === "") {
          common_vendor.index.showToast({
            title: "请至少上传一张图片",
            icon: "none"
          });
          return;
        }
        const response = await api_apis.apiPost(postData);
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          try {
            const userAvatars = common_vendor.index.getStorageSync("userAvatars") || {};
            userAvatars[utils_request.getAccount()] = currentUserAvatar;
            common_vendor.index.setStorageSync("userAvatars", userAvatars);
          } catch (error) {
          }
          common_vendor.index.showToast({
            title: "规律帖已提交审核",
            icon: "success"
          });
          common_vendor.index.removeStorageSync("predict_schemes_data");
          selectedImages.value = [];
          uploadedImageUrls.value = [];
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: response.msg || "发布失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "发布失败，请重试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "20",
          color: "#333"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.t(issueNumber.value),
        d: schemes.value.length > 0
      }, schemes.value.length > 0 ? {
        e: common_vendor.t(issueNumber.value),
        f: common_vendor.f(schemes.value, (scheme, index, i0) => {
          return {
            a: common_vendor.t(scheme.id),
            b: common_vendor.f(getSchemeDisplayData(scheme), (detail, detailIndex, i1) => {
              return {
                a: common_vendor.t(detail),
                b: detailIndex
              };
            }),
            c: index
          };
        })
      } : {}, {
        g: common_vendor.o(goToSchemePage),
        h: selectedImages.value.length > 0
      }, selectedImages.value.length > 0 ? {
        i: common_vendor.f(selectedImages.value, (image, index, i0) => {
          return {
            a: image,
            b: "fe65a6f0-1-" + i0,
            c: common_vendor.o(($event) => removeImage(index), index),
            d: index
          };
        }),
        j: common_vendor.p({
          type: "close",
          size: "16",
          color: "#fff"
        })
      } : {}, {
        k: selectedImages.value.length < 6
      }, selectedImages.value.length < 6 ? {
        l: common_vendor.p({
          type: "camera",
          size: "40",
          color: "#ccc"
        }),
        m: common_vendor.t(selectedImages.value.length),
        n: common_vendor.o(selectImage)
      } : {}, {
        o: common_vendor.o(goToSchemePage),
        p: !canPublish.value ? 1 : "",
        q: common_vendor.o(handlePublish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fe65a6f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pattern-predict/pattern-predict.js.map
