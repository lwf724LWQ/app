"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
const _sfc_main = {
  __name: "recharge",
  setup(__props) {
    const currentUser = common_vendor.ref("vfmumq");
    const userBalance = common_vendor.ref(0);
    const selectedAmount = common_vendor.ref(10);
    const customAmount = common_vendor.ref("");
    const agreedToTerms = common_vendor.ref(false);
    const showQRModal = common_vendor.ref(false);
    const qrSize = common_vendor.ref(200);
    const currentPaymentUrl = common_vendor.ref("");
    const qrCodeUrl = common_vendor.ref("");
    const paymentCheckTimer = common_vendor.ref(null);
    const isCheckingPayment = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const currentOrderNo = common_vendor.ref("");
    const paymentAmount = common_vendor.computed(() => {
      if (customAmount.value && customAmount.value > 0) {
        return customAmount.value;
      }
      return selectedAmount.value;
    });
    const canPay = common_vendor.computed(() => {
      return agreedToTerms.value && paymentAmount.value > 0;
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const showInstructions = () => {
      common_vendor.index.showModal({
        title: "充值说明",
        content: "1元=1金币，金币仅限平台内使用，充值后不可退还。",
        showCancel: false
      });
    };
    const selectAmount = (amount) => {
      selectedAmount.value = amount;
      customAmount.value = "";
    };
    const updateCustomAmount = () => {
      if (customAmount.value && customAmount.value > 0) {
        selectedAmount.value = 0;
      }
    };
    const toggleAgreement = () => {
      agreedToTerms.value = !agreedToTerms.value;
    };
    const viewAgreement = () => {
      common_vendor.index.showModal({
        title: "充值服务协议",
        content: "这里是充值服务协议的内容...",
        showCancel: false
      });
    };
    const viewTransactionRecord = () => {
      common_vendor.index.navigateTo({ url: "/pages/transaction/transaction" });
    };
    const handlePayment = () => {
      if (!canPay.value)
        return;
      common_vendor.index.showModal({
        title: "确认支付",
        content: `确认支付 ¥${paymentAmount.value}元 购买 ${paymentAmount.value}个金币？`,
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
          info: `用户充值${paymentAmount.value}元`,
          // 订单信息（可选）
          amount: paymentAmount.value.toString(),
          // 订单金额（必需）
          type: 0,
          // 订单类型：0充值（可选）
          account: utils_request.getAccount() || currentUser.value,
          // 账号（可选）
          payType: 0,
          // 支付方式：0微信（可选）
          channel: 0
          // 下单渠道：0电脑端（可选）
        };
        const response = await api_apis.apiUserRecharge(rechargeData);
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          if (response.data && response.data.coreUrl && response.data.coreUrl.includes("weixin://wxpay")) {
            currentOrderNo.value = response.data.orderNo || `ORDER_${Date.now()}`;
            currentPaymentUrl.value = response.data.coreUrl;
            showQRModal.value = true;
            setTimeout(() => {
              generateQRCode(response.data.coreUrl);
              startPaymentCheck();
            }, 100);
          } else {
            common_vendor.index.showToast({
              title: response.msg || "充值成功",
              icon: "success"
            });
            await getUserInfo();
            common_vendor.index.showModal({
              title: "支付成功",
              content: `恭喜您！成功充值${paymentAmount.value}个金币`,
              showCancel: false,
              success: () => {
                refreshPage();
                setTimeout(() => {
                  common_vendor.index.navigateTo({
                    url: "/pages/orders/orders"
                  });
                }, 500);
              }
            });
            selectedAmount.value = 10;
            customAmount.value = "";
            agreedToTerms.value = false;
          }
        } else {
          common_vendor.index.showToast({
            title: response.msg || "充值失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      }
    };
    const getUserInfo = async () => {
      try {
        const account = utils_request.getAccount();
        if (account) {
          currentUser.value = account;
          const balanceResponse = await api_apis.apiGetUserBalance({ account });
          if (balanceResponse.code === 200) {
            userBalance.value = balanceResponse.data || 0;
          }
        }
      } catch (error) {
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
              generateQRCodeOnline(url);
            } else {
              qrCodeUrl.value = dataUrl;
            }
          });
        }).catch((error) => {
          generateQRCodeOnline(url);
        });
      } catch (error) {
        generateQRCodeOnline(url);
      }
    };
    const generateQRCodeOnline = (url) => {
      try {
        const encodedUrl = encodeURIComponent(url);
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize.value}x${qrSize.value}&data=${encodedUrl}`;
        qrCodeUrl.value = qrApiUrl;
      } catch (error) {
        common_vendor.index.showToast({
          title: "二维码生成失败",
          icon: "none"
        });
      }
    };
    const closeQRModal = () => {
      stopPaymentCheck();
      showQRModal.value = false;
      currentPaymentUrl.value = "";
      qrCodeUrl.value = "";
      currentOrderNo.value = "";
    };
    const onRefresh = async () => {
      try {
        isRefreshing.value = true;
        await getUserInfo();
        selectedAmount.value = 10;
        customAmount.value = "";
        agreedToTerms.value = false;
        setTimeout(() => {
          isRefreshing.value = false;
        }, 1e3);
      } catch (error) {
        isRefreshing.value = false;
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none",
          duration: 2e3
        });
      }
    };
    const refreshPage = async () => {
      try {
        await getUserInfo();
        selectedAmount.value = 10;
        customAmount.value = "";
        agreedToTerms.value = false;
      } catch (error) {
      }
    };
    const handlePaymentSuccess = async () => {
      try {
        stopPaymentCheck();
        await getUserInfo();
        common_vendor.index.showModal({
          title: "支付成功",
          content: `恭喜您！成功充值${paymentAmount.value}个金币`,
          showCancel: false,
          success: () => {
            refreshPage();
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: "/pages/orders/orders"
              });
            }, 500);
          }
        });
        closeQRModal();
        selectedAmount.value = 10;
        customAmount.value = "";
        agreedToTerms.value = false;
      } catch (error) {
      }
    };
    const startPaymentCheck = () => {
      if (paymentCheckTimer.value) {
        clearInterval(paymentCheckTimer.value);
      }
      isCheckingPayment.value = true;
      let checkCount = 0;
      const maxChecks = 20;
      const startTime = Date.now();
      paymentCheckTimer.value = setInterval(async () => {
        try {
          checkCount++;
          const paymentStatusResponse = await api_apis.apiGetOrderPayStatus({
            orderNo: currentOrderNo.value
          });
          if (paymentStatusResponse.code === 200) {
            const paymentStatus = paymentStatusResponse.data;
            if (paymentStatus === "success" || paymentStatus === "paid" || paymentStatus === 1) {
              stopPaymentCheck();
              await handlePaymentSuccess();
              return;
            } else if (paymentStatus === "failed" || paymentStatus === "cancelled" || paymentStatus === 0) {
              if (checkCount >= 5) {
                stopPaymentCheck();
                common_vendor.index.showToast({
                  title: "支付失败，请重试",
                  icon: "none",
                  duration: 3e3
                });
                closeQRModal();
                return;
              }
            }
          }
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime >= 6e4) {
            stopPaymentCheck();
            try {
              const finalCheckResponse = await api_apis.apiGetOrderPayStatus({
                orderNo: currentOrderNo.value
              });
              if (finalCheckResponse.code === 200) {
                const finalStatus = finalCheckResponse.data;
                if (finalStatus === "success" || finalStatus === "paid" || finalStatus === 1) {
                  await handlePaymentSuccess();
                } else {
                  common_vendor.index.showToast({
                    title: "支付失败，请重试",
                    icon: "none",
                    duration: 3e3
                  });
                  closeQRModal();
                }
              } else {
                common_vendor.index.showToast({
                  title: "支付失败，请重试",
                  icon: "none",
                  duration: 3e3
                });
                closeQRModal();
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "支付失败，请重试",
                icon: "none",
                duration: 3e3
              });
              closeQRModal();
            }
            return;
          }
        } catch (error) {
          if (checkCount >= maxChecks) {
            stopPaymentCheck();
            common_vendor.index.showToast({
              title: "支付检查失败，请重试",
              icon: "none",
              duration: 3e3
            });
            closeQRModal();
          }
        }
      }, 1e4);
    };
    const stopPaymentCheck = () => {
      if (paymentCheckTimer.value) {
        clearInterval(paymentCheckTimer.value);
        paymentCheckTimer.value = null;
      }
      isCheckingPayment.value = false;
    };
    common_vendor.onMounted(async () => {
      const token = utils_request.getToken();
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 1500);
      } else {
        await getUserInfo();
      }
    });
    common_vendor.onUnmounted(() => {
      stopPaymentCheck();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(showInstructions),
        c: common_vendor.t(currentUser.value),
        d: common_vendor.t(userBalance.value),
        e: common_vendor.o(viewTransactionRecord),
        f: selectedAmount.value === 10
      }, selectedAmount.value === 10 ? {} : {}, {
        g: selectedAmount.value === 10 ? 1 : "",
        h: common_vendor.o(($event) => selectAmount(10)),
        i: selectedAmount.value === 50
      }, selectedAmount.value === 50 ? {} : {}, {
        j: selectedAmount.value === 50 ? 1 : "",
        k: common_vendor.o(($event) => selectAmount(50)),
        l: selectedAmount.value === 100
      }, selectedAmount.value === 100 ? {} : {}, {
        m: selectedAmount.value === 100 ? 1 : "",
        n: common_vendor.o(($event) => selectAmount(100)),
        o: common_vendor.o([($event) => customAmount.value = $event.detail.value, updateCustomAmount]),
        p: customAmount.value,
        q: common_vendor.t(customAmount.value || 0),
        r: agreedToTerms.value
      }, agreedToTerms.value ? {} : {}, {
        s: agreedToTerms.value ? 1 : "",
        t: common_vendor.o(viewAgreement),
        v: common_vendor.o(toggleAgreement),
        w: common_vendor.t(paymentAmount.value),
        x: !canPay.value ? 1 : "",
        y: common_vendor.o(handlePayment),
        z: !canPay.value,
        A: isRefreshing.value,
        B: common_vendor.o(onRefresh),
        C: showQRModal.value
      }, showQRModal.value ? common_vendor.e({
        D: common_vendor.o(closeQRModal),
        E: qrCodeUrl.value
      }, qrCodeUrl.value ? {
        F: qrCodeUrl.value,
        G: qrSize.value + "px",
        H: qrSize.value + "px"
      } : {}, {
        I: common_vendor.t(paymentAmount.value),
        J: isCheckingPayment.value
      }, isCheckingPayment.value ? {} : {}, {
        K: isCheckingPayment.value
      }, isCheckingPayment.value ? {} : {}, {
        L: common_vendor.o(() => {
        }),
        M: common_vendor.o(closeQRModal)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2984a38c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map
