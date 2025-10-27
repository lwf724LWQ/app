"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_path = common_vendor.resolveComponent("path");
  const _component_svg = common_vendor.resolveComponent("svg");
  (_component_path + _component_svg)();
}
const _sfc_main = {
  __name: "select-color",
  emits: ["select-color", "select-line-width"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const selectedColor = common_vendor.ref("#3B82F6");
    const isOptionsOpen = common_vendor.ref(false);
    const presetColors = common_vendor.ref([
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#6366F1",
      "#14B8A6",
      "#F97316",
      "#DC2626",
      "#000000",
      "#333333",
      "#666666",
      "#999999",
      "#CCCCCC",
      "#FFFFFF"
    ]);
    const lineWidthOptions = [
      { label: "细", value: 2 },
      { label: "中", value: 4 },
      { label: "粗", value: 6 }
    ];
    const selectedLineWidth = common_vendor.ref(4);
    const toggleOptions = () => {
      isOptionsOpen.value = !isOptionsOpen.value;
    };
    const selectColor = (color) => {
      selectedColor.value = color;
      emit("select-color", color);
    };
    const selectLineWidth = (value) => {
      selectedLineWidth.value = value;
      emit("select-line-width", value);
    };
    selectedColor.value;
    common_vendor.watch(selectedColor, (newVal) => {
    });
    const handleClickOutside = (e) => {
      const wrapper = document.querySelector(".control-wrapper");
      if (wrapper && !wrapper.contains(e.target)) {
        isOptionsOpen.value = false;
      }
    };
    document.addEventListener("click", handleClickOutside);
    const cleanup = () => {
      document.removeEventListener("click", handleClickOutside);
    };
    window.addEventListener("beforeunload", cleanup);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: selectedColor.value,
        b: common_vendor.o(toggleOptions),
        c: isOptionsOpen.value
      }, isOptionsOpen.value ? {
        d: common_vendor.f(presetColors.value, (color, k0, i0) => {
          return {
            a: color,
            b: color,
            c: common_vendor.o(($event) => selectColor(color), color),
            d: color
          };
        }),
        e: common_vendor.o(() => {
        })
      } : {}, {
        f: common_vendor.f(lineWidthOptions, (width, k0, i0) => {
          return {
            a: "c363c773-1-" + i0 + "," + ("c363c773-0-" + i0),
            b: common_vendor.p({
              d: "M5,15 Q20,5 35,15",
              fill: "none",
              stroke: selectedColor.value,
              ["stroke-width"]: width.value,
              ["stroke-linecap"]: "round"
            }),
            c: "c363c773-0-" + i0,
            d: width.value,
            e: common_vendor.n({
              "active": selectedLineWidth.value === width.value
            }),
            f: common_vendor.o(($event) => selectLineWidth(width.value), width.value),
            g: width.label
          };
        }),
        g: common_vendor.p({
          width: "40",
          height: "30",
          viewBox: "0 0 40 30",
          xmlns: "http://www.w3.org/2000/svg"
        }),
        h: isOptionsOpen.value ? 1 : "",
        i: common_vendor.o(() => {
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c363c773"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/select-color/select-color.js.map
