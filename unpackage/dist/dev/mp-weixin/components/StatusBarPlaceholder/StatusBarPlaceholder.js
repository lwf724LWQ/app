"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "StatusBarPlaceholder",
  setup(__props) {
    const statusBarHeight = common_vendor.ref("0px");
    const safeAreaInsets = common_vendor.ref({ top: 0 });
    const barStyle = common_vendor.computed(() => {
      return {
        height: statusBarHeight.value,
        paddingTop: `${safeAreaInsets.value.top || 0}px`,
        backgroundColor: "#ffffff"
      };
    });
    const getSystemInfo = () => {
      try {
        const systemInfo = common_vendor.index.getSystemInfoSync();
        statusBarHeight.value = `${systemInfo.statusBarHeight || 0}px`;
        if (systemInfo.safeArea) {
          safeAreaInsets.value = systemInfo.safeArea;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/StatusBarPlaceholder/StatusBarPlaceholder.vue:35", "获取系统信息失败:", error);
        statusBarHeight.value = "20px";
      }
    };
    common_vendor.onMounted(() => {
      getSystemInfo();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.s(barStyle.value)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-60cf0b88"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/StatusBarPlaceholder/StatusBarPlaceholder.js.map
