"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/juWang/drawLine/drawLine.js";
  "./pages/index/index.js";
  "./pages/classify/classify.js";
  "./pages/user/user.js";
  "./pages/video/play.js";
  "./pages/video/reward.js";
  "./pages/video/payment.js";
  "./components/NumberSelector/NumberSelector.js";
  "./pages/classlist/classlist.js";
  "./pages/user/edit-profile.js";
  "./pages/video/oss.js";
  "./pages/video/biaodan.js";
  "./pages/notice/notice.js";
  "./pages/notice/detail.js";
  "./pages/search/search.js";
  "./pages/reg/reg.js";
  "./pages/code-login/code-login.js";
  "./pages/video/video.js";
  "./pages/forum/forum.js";
  "./pages/predict-scheme/predict-scheme.js";
  "./pages/predict-publish/predict-publish.js";
  "./pages/pattern-predict/pattern-predict.js";
  "./pages/dream-interpretation/dream-interpretation.js";
  "./pages/recharge/recharge.js";
  "./pages/transaction/transaction.js";
  "./pages/orders/orders.js";
}
const _sfc_main = {
  onLaunch: function() {
  },
  onShow: function() {
  },
  onHide: function() {
  }
};
const platform = common_vendor.index.getSystemInfoSync().platform;
const isH5 = platform === "web" || platform === "windows" || platform === "mac";
const isApp = platform === "android" || platform === "ios" || platform === "mp-weixin";
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return {
    app,
    Pinia: common_vendor.Pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
exports.isApp = isApp;
exports.isH5 = isH5;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
