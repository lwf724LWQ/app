"use strict";
const common_vendor = require("../../../../common/vendor.js");
function useFabActions(currentMode, canvasPointerEvents, shapes, textLabels, highlighted, redraw) {
  const isFabOpen = common_vendor.ref(false);
  function toggleFab() {
    isFabOpen.value = !isFabOpen.value;
  }
  function switchMode(mode) {
    currentMode.value = mode;
    redraw(false);
    if (mode === "text") {
      canvasPointerEvents.value = "auto";
    } else {
      canvasPointerEvents.value = "auto";
    }
    toggleFab();
  }
  function clearCanvas() {
    shapes.value = [];
    textLabels.value = [];
    highlighted.value = [];
    redraw(false);
  }
  function clickBlank() {
    canvasPointerEvents.value = "auto";
    toggleFab();
  }
  return {
    isFabOpen,
    toggleFab,
    switchMode,
    clearCanvas,
    clickBlank
  };
}
exports.useFabActions = useFabActions;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/useFunc/useFabActions.js.map
