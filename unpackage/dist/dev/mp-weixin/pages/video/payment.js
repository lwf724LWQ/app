"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = {
  __name: "payment",
  setup(__props) {
    const showQRModal = common_vendor.ref(false);
    const qrSize = common_vendor.ref(200);
    const currentPaymentUrl = common_vendor.ref("");
    const qrCodeUrl = common_vendor.ref("");
    const paymentCheckTimer = common_vendor.ref(null);
    const isCheckingPayment = common_vendor.ref(false);
    common_vendor.ref(false);
    const orderData = common_vendor.ref({
      info: "",
      amount: "",
      type: 2,
      // 默认打赏类型
      account: "",
      payType: 0,
      // 默认微信支付
      channel: 1
      // 默认微信小程序
    });
    common_vendor.ref(null);
    common_vendor.onLoad((options) => {
      if (options.info)
        orderData.value.info = decodeURIComponent(options.info);
      if (options.amount)
        orderData.value.amount = options.amount;
      if (options.type)
        orderData.value.type = parseInt(options.type);
      if (options.account)
        orderData.value.account = decodeURIComponent(options.account);
      if (options.payType)
        orderData.value.payType = parseInt(options.payType);
      if (options.channel)
        orderData.value.channel = parseInt(options.channel);
      if (options.videoId)
        orderData.value.videoId = options.videoId;
      if (!orderData.value.account) {
        orderData.value.account = utils_request.getAccount();
      }
    });
    const getOrderTypeText = (type) => {
      const types = {
        0: "充值",
        1: "提现",
        2: "打赏",
        3: "视频付费"
      };
      return types[type] || "未知类型";
    };
    const getChannelText = (channel) => {
      const channels = {
        0: "电脑端",
        1: "微信小程序",
        2: "APP"
      };
      return channels[channel] || "未知渠道";
    };
    const selectPaymentMethod = (e) => {
      orderData.value.payType = parseInt(e.detail.value);
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handlePayment = () => {
      common_vendor.index.showModal({
        title: "确认支付",
        content: `确认支付 ¥${orderData.value.amount}元 购买 ${orderData.value.amount}个金币？`,
        success: (res) => {
          if (res.confirm) {
            processPayment();
          }
        }
      });
    };
    const processPayment = async () => {
      common_vendor.index.showLoading({
        title: "处理中..."
      });
      try {
        const rechargeData = {
          info: `用户充值${orderData.value.amount}元`,
          amount: orderData.value.amount.toString(),
          type: orderData.value.type,
          // 0表示充值
          account: utils_request.getAccount() || currentUser.value,
          payType: orderData.value.payType
          // 0表示微信支付
        };
        if (orderData.value.payType === 1) {
          const balanceResponse = await api_apis.apiGetUserBalance({
            account: utils_request.getAccount()
          });
          if (balanceResponse.code !== 200) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: balanceResponse.msg || "查询余额失败",
              icon: "none"
            });
            return;
          }
          const userBalance = parseFloat(balanceResponse.data || 0);
          const paymentAmount = parseFloat(orderData.value.amount);
          if (userBalance < paymentAmount) {
            common_vendor.index.__f__("log", "at pages/video/payment.vue:234", userBalance, paymentAmount);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "余额不足，请充值",
              icon: "none"
            });
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: "/pages/recharge/recharge"
              });
            }, 1500);
            return;
          }
          const orderResponse = await api_apis.apiRewardVideo(rechargeData);
          if (orderResponse.code !== 200) {
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: orderResponse.msg || "创建订单失败",
              icon: "none"
            });
            return;
          }
          const orderNo = orderResponse.data;
          const goldPayResponse = await api_apis.apigoldpay({
            account: utils_request.getAccount(),
            orderNo,
            remark: orderData.value.videoId
          });
          common_vendor.index.hideLoading();
          if (goldPayResponse.code === 200) {
            common_vendor.index.showModal({
              title: "支付成功",
              content: `成功支付${orderData.value.amount}金币`,
              showCancel: false,
              success: () => {
                goBack();
              }
            });
          } else {
            common_vendor.index.showToast({
              title: goldPayResponse.msg || "余额支付失败",
              icon: "none"
            });
          }
          return;
        }
        const response = await api_apis.apiRewardVideo(rechargeData);
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
            title: response.msg || "充值失败",
            icon: "none"
          });
        }
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          if (response.data && response.data.includes("weixin://wxpay")) {
            currentPaymentUrl.value = response.data;
            showQRModal.value = true;
            setTimeout(() => {
              generateQRCode(response.data);
              startPaymentCheck();
            }, 100);
          }
        } else {
          common_vendor.index.showToast({
            title: response.msg || "充值失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/video/payment.vue:338", "充值接口调用失败:", error);
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
          remark: orderData.value.videoId
        };
        return await api_apis.apiWxpay(wxPayData);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/payment.vue:359", "微信支付接口调用失败:", error);
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
              common_vendor.index.__f__("error", "at pages/video/payment.vue:398", "二维码生成失败:", error);
              generateQRCodeOnline(url);
            } else {
              qrCodeUrl.value = dataUrl;
            }
          });
        }).catch((error) => {
          common_vendor.index.__f__("error", "at pages/video/payment.vue:407", "导入qrcode库失败:", error);
          generateQRCodeOnline(url);
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/payment.vue:412", "生成二维码失败:", error);
        generateQRCodeOnline(url);
      }
    };
    const generateQRCodeOnline = (url) => {
      try {
        const encodedUrl = encodeURIComponent(url);
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize.value}x${qrSize.value}&data=${encodedUrl}`;
        qrCodeUrl.value = qrApiUrl;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/payment.vue:426", "在线二维码生成失败:", error);
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
            common_vendor.index.__f__("log", "at pages/video/payment.vue:462", "支付状态检查中...");
          }
          if (checkCount >= maxChecks) {
            common_vendor.index.__f__("log", "at pages/video/payment.vue:466", "支付检查超时，停止检查");
            stopPaymentCheck();
            common_vendor.index.showToast({
              title: "支付检查超时，请手动确认",
              icon: "none",
              duration: 3e3
            });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/video/payment.vue:481", "检查支付状态失败:", error);
        }
      }, 3e3);
    };
    const checkRealPaymentStatus = async () => {
      try {
        const response = await api_apis.apiCheckVideoPayment({
          videoId: orderData.value.videoId,
          account: utils_request.getAccount()
        });
        if (response.code === 200) {
          return response.data;
        }
        return false;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/payment.vue:501", "支付状态检查API调用失败:", error);
        return false;
      }
    };
    const closeQRModal = () => {
      stopPaymentCheck();
      goBack();
    };
    const handlePaymentSuccess = async () => {
      try {
        closeQRModal();
        stopPaymentCheck();
        common_vendor.index.showModal({
          title: "支付成功",
          content: `恭喜您！成功充值${orderData.value.amount}个金币`,
          showCancel: false,
          success: () => {
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/payment.vue:584", "处理支付成功失败:", error);
      }
    };
    const stopPaymentCheck = () => {
      if (paymentCheckTimer.value) {
        clearInterval(paymentCheckTimer.value);
        paymentCheckTimer.value = null;
      }
      isCheckingPayment.value = false;
      common_vendor.index.__f__("log", "at pages/video/payment.vue:618", "停止检查支付状态");
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.t(orderData.value.info),
        c: common_vendor.t(orderData.value.amount),
        d: common_vendor.t(getOrderTypeText(orderData.value.type)),
        e: common_vendor.t(getChannelText(orderData.value.channel)),
        f: orderData.value.payType === 0,
        g: orderData.value.payType === 1,
        h: common_vendor.o(selectPaymentMethod),
        i: common_vendor.o(handlePayment),
        j: showQRModal.value
      }, showQRModal.value ? common_vendor.e({
        k: common_vendor.o(closeQRModal),
        l: qrCodeUrl.value
      }, qrCodeUrl.value ? {
        m: qrCodeUrl.value,
        n: qrSize.value + "px",
        o: qrSize.value + "px"
      } : {}, {
        p: common_vendor.t(orderData.value.amount),
        q: isCheckingPayment.value
      }, isCheckingPayment.value ? {} : {}, {
        r: isCheckingPayment.value
      }, isCheckingPayment.value ? {} : {}, {
        s: common_vendor.o(() => {
        }),
        t: common_vendor.o(closeQRModal)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7964329c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/payment.js.map
