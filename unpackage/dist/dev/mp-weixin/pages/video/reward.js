"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "reward",
  setup(__props) {
    const amountOptions = common_vendor.ref([1.8, 3.8, 5.8, 6.8, 8.8, 18, 38, 58, 68]);
    const selectedAmount = common_vendor.ref(3.8);
    const customAmount = common_vendor.ref("");
    const isCustomAmountSelected = common_vendor.ref(false);
    const paymentMethod = common_vendor.ref("0");
    const authorName = common_vendor.ref("追梦人");
    const authorAvatar = common_vendor.ref("");
    const authorLocation = common_vendor.ref("海南省 - 儋州市");
    const routeParams = common_vendor.ref({
      videoId: "",
      author: "",
      title: "",
      authorAvatar: "",
      // 添加作者头像参数
      authorName: ""
      // 添加作者名称参数
    });
    const showQRModal = common_vendor.ref(false);
    const qrSize = common_vendor.ref(200);
    const currentPaymentUrl = common_vendor.ref("");
    const qrCodeUrl = common_vendor.ref("");
    const paymentCheckTimer = common_vendor.ref(null);
    const isCheckingPayment = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options.videoId)
        routeParams.value.videoId = options.videoId;
      if (options.author)
        routeParams.value.author = decodeURIComponent(options.author);
      if (options.title)
        routeParams.value.title = decodeURIComponent(options.title);
      if (options.authorAvatar) {
        authorAvatar.value = decodeURIComponent(options.authorAvatar);
      }
      if (options.authorName) {
        authorName.value = decodeURIComponent(options.authorName);
      }
    });
    const getAvatarUrl = (avatar) => {
      if (!avatar)
        return "/static/default-avatar.png";
      return `http://video.caimizm.com/himg/${avatar}`;
    };
    const selectAmount = (amount) => {
      selectedAmount.value = amount;
      isCustomAmountSelected.value = false;
    };
    const selectPaymentMethod = (e) => {
      paymentMethod.value = e.detail.value;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const validateCustomAmount = () => {
      if (customAmount.value < 0) {
        customAmount.value = "";
      }
    };
    const confirmCustomAmount = () => {
      if (!customAmount.value) {
        common_vendor.index.showToast({
          title: "请输入金额",
          icon: "none"
        });
        return;
      }
      const amount = parseFloat(customAmount.value);
      if (isNaN(amount) || amount <= 0) {
        common_vendor.index.showToast({
          title: "请输入有效金额",
          icon: "none"
        });
        return;
      }
      selectedAmount.value = amount;
      isCustomAmountSelected.value = true;
      common_vendor.index.showToast({
        title: "已选择自定义金额",
        icon: "success"
      });
    };
    const handleReward = async () => {
      const token = utils_request.getToken();
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/login/login"
          });
        }, 1500);
        return;
      }
      if (paymentMethod.value === "1") {
        await processReward();
        return;
      }
      common_vendor.index.showModal({
        title: "确认支付",
        content: `确认支付 ¥${selectedAmount.value}元 打赏作者？`,
        success: (res) => {
          if (res.confirm) {
            processReward();
          }
        }
      });
    };
    const processReward = async () => {
      common_vendor.index.showLoading({
        title: "处理中..."
      });
      try {
        const rewardData = {
          info: `打赏视频: ${routeParams.value.title}`,
          amount: selectedAmount.value.toString(),
          type: 2,
          // 2=打赏
          account: utils_request.getAccount(),
          payType: paymentMethod.value,
          channel: 1
          // 微信小程序
        };
        const response = await api_apis.apiRewardVideo(rewardData);
        if (response.code === 200 && response.data) {
          const wxPayResponse = await callWxPayApi(response.data);
          if (wxPayResponse.code === 200) {
            handleWxPayResponse(wxPayResponse.data);
          } else {
            common_vendor.index.showToast({
              title: wxPayResponse.msg || "微信支付请求失败",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: response.msg || "打赏失败",
            icon: "none"
          });
        }
        common_vendor.index.hideLoading();
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/video/reward.vue:308", "打赏接口调用失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      }
    };
    const callWxPayApi = async (orderNo) => {
      try {
        const wxPayData = {
          account: utils_request.getAccount(),
          orderNo,
          remark: routeParams.value.videoId
        };
        return await api_apis.apiWxpay(wxPayData);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/reward.vue:329", "微信支付接口调用失败:", error);
        return {
          code: 500,
          msg: "微信支付接口调用失败"
        };
      }
    };
    const handleWxPayResponse = (wxPayData) => {
      if (wxPayData && wxPayData.includes("weixin://wxpay")) {
        currentPaymentUrl.value = wxPayData;
        showQRModal.value = true;
        setTimeout(() => {
          generateQRCode(wxPayData);
          startPaymentCheck();
        }, 100);
      }
    };
    const generateQRCode = (url) => {
      try {
        "../../common/vendor.js".then((n) => n.browser).then((QRCode) => {
          QRCode.toDataURL(url, {
            width: qrSize.value,
            height: qrSize.value,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF"
            }
          }, (error, dataUrl) => {
            if (error) {
              common_vendor.index.__f__("error", "at pages/video/reward.vue:369", "二维码生成失败:", error);
              generateQRCodeOnline(url);
            } else {
              qrCodeUrl.value = dataUrl;
            }
          });
        }).catch((error) => {
          common_vendor.index.__f__("error", "at pages/video/reward.vue:378", "导入qrcode库失败:", error);
          generateQRCodeOnline(url);
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/reward.vue:383", "生成二维码失败:", error);
        generateQRCodeOnline(url);
      }
    };
    const generateQRCodeOnline = (url) => {
      try {
        const encodedUrl = encodeURIComponent(url);
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize.value}x${qrSize.value}&data=${encodedUrl}`;
        qrCodeUrl.value = qrApiUrl;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/reward.vue:397", "在线二维码生成失败:", error);
        common_vendor.index.showToast({
          title: "二维码生成失败",
          icon: "none"
        });
      }
    };
    const startPaymentCheck = () => {
      if (paymentCheckTimer.value) {
        clearInterval(paymentCheckTimer.value);
      }
      isCheckingPayment.value = true;
      let checkCount = 0;
      const maxChecks = 20;
      paymentCheckTimer.value = setInterval(async () => {
        try {
          checkCount++;
          const paymentStatus = await checkRealPaymentStatus();
          if (paymentStatus === true) {
            await handlePaymentSuccess();
            return;
          } else if (paymentStatus === false) {
            common_vendor.index.__f__("log", "at pages/video/reward.vue:430", "支付状态检查中...");
          }
          if (checkCount >= maxChecks) {
            common_vendor.index.__f__("log", "at pages/video/reward.vue:435", "支付检查超时，停止检查");
            stopPaymentCheck();
            common_vendor.index.showToast({
              title: "支付检查超时，请手动确认",
              icon: "none",
              duration: 3e3
            });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/video/reward.vue:444", "检查支付状态失败:", error);
        }
      }, 3e3);
    };
    const checkRealPaymentStatus = async () => {
      try {
        const response = await api_apis.apiCheckVideoPayment({
          videoId: routeParams.value.videoId,
          account: utils_request.getAccount()
        });
        if (response.code === 200) {
          return response.data;
        }
        return false;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/reward.vue:465", "支付状态检查API调用失败:", error);
        return false;
      }
    };
    const handlePaymentSuccess = async () => {
      try {
        stopPaymentCheck();
        common_vendor.index.showModal({
          title: "支付成功",
          content: `恭喜您！成功打赏${selectedAmount.value}金币`,
          showCancel: false,
          success: () => {
            closeQRModal();
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 500);
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/reward.vue:492", "处理支付成功失败:", error);
      }
    };
    const closeQRModal = () => {
      stopPaymentCheck();
      showQRModal.value = false;
      currentPaymentUrl.value = "";
      qrCodeUrl.value = "";
    };
    const stopPaymentCheck = () => {
      if (paymentCheckTimer.value) {
        clearInterval(paymentCheckTimer.value);
        paymentCheckTimer.value = null;
      }
      isCheckingPayment.value = false;
      common_vendor.index.__f__("log", "at pages/video/reward.vue:521", "停止检查支付状态");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: getAvatarUrl(authorAvatar.value),
        c: common_vendor.t(authorName.value),
        d: common_vendor.t(authorLocation.value),
        e: common_vendor.f(amountOptions.value, (amount, index, i0) => {
          return {
            a: common_vendor.t(amount),
            b: index,
            c: selectedAmount.value === amount ? 1 : "",
            d: common_vendor.o(($event) => selectAmount(amount), index)
          };
        }),
        f: common_vendor.o([($event) => customAmount.value = $event.detail.value, validateCustomAmount]),
        g: customAmount.value,
        h: common_vendor.o(confirmCustomAmount),
        i: paymentMethod.value === "0",
        j: paymentMethod.value === "1",
        k: common_vendor.o(selectPaymentMethod),
        l: common_vendor.t(selectedAmount.value),
        m: common_vendor.o(handleReward),
        n: showQRModal.value
      }, showQRModal.value ? common_vendor.e({
        o: common_vendor.o(closeQRModal),
        p: qrCodeUrl.value
      }, qrCodeUrl.value ? {
        q: qrCodeUrl.value,
        r: qrSize.value + "px",
        s: qrSize.value + "px"
      } : {}, {
        t: common_vendor.t(selectedAmount.value),
        v: isCheckingPayment.value
      }, isCheckingPayment.value ? {} : {}, {
        w: isCheckingPayment.value
      }, isCheckingPayment.value ? {} : {}, {
        x: common_vendor.o(() => {
        }),
        y: common_vendor.o(closeQRModal)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-99880d0a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/reward.js.map
