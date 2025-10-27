"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "custom-juwang-nav-bar",
  props: {
    title: {
      type: String,
      default: "壁纸"
    },
    onSubmit: {
      type: Function,
      required: true
      // 要求父组件必须传递该函数
    }
  },
  emits: ["child-event", "share-event"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const callParentSubmit = () => {
      props.onSubmit({ username: "test", password: "123" });
    };
    const callParentReset = () => {
      emit("child-event", { action: "submit", data: "test" });
    };
    const callParentShare = () => {
      emit("share-event", { action: "share", data: "test" });
    };
    const callParentUndo = () => {
      emit("child-event", { action: "undo", data: "test" });
    };
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
        // 返回的页面数
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.p({
          type: "left",
          size: "30"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          type: "undo",
          size: "30",
          color: "#333"
        }),
        d: common_vendor.o(callParentUndo),
        e: common_vendor.p({
          type: "trash",
          size: "30",
          color: "#333"
        }),
        f: common_vendor.o(callParentSubmit),
        g: common_vendor.p({
          type: "download",
          size: "30",
          color: "#333"
        }),
        h: common_vendor.o(callParentReset),
        i: common_vendor.p({
          type: "paperplane",
          size: "30",
          color: "#333"
        }),
        j: common_vendor.o(callParentShare)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b0615a4"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/custom-juwang-nav-bar/custom-juwang-nav-bar.js.map
