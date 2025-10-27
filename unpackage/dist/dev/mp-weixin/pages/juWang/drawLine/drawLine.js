"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const pages_juWang_drawLine_useFunc_useDrawing = require("./useFunc/useDrawing.js");
const pages_juWang_drawLine_useFunc_useTableData = require("./useFunc/useTableData.js");
const pages_juWang_drawLine_useFunc_useTextLabels = require("./useFunc/useTextLabels.js");
const pages_juWang_drawLine_useFunc_useFabActions = require("./useFunc/useFabActions.js");
const pages_juWang_drawLine_useFunc_useScreenshot = require("./useFunc/useScreenshot.js");
const stores_twocounter = require("../../../stores/twocounter.js");
const stores_counter = require("../../../stores/counter.js");
if (!Array) {
  const _easycom_custom_juwang_nav_bar2 = common_vendor.resolveComponent("custom-juwang-nav-bar");
  const _easycom_select_color2 = common_vendor.resolveComponent("select-color");
  (_easycom_custom_juwang_nav_bar2 + _easycom_select_color2)();
}
const _easycom_custom_juwang_nav_bar = () => "../../../components/custom-juwang-nav-bar/custom-juwang-nav-bar.js";
const _easycom_select_color = () => "../../../components/select-color/select-color.js";
if (!Math) {
  (_easycom_custom_juwang_nav_bar + _easycom_select_color + NumberSelector)();
}
const NumberSelector = () => "../../../components/NumberSelector/NumberSelector2.js";
const _sfc_main = {
  __name: "drawLine",
  setup(__props) {
    const onCanvasEnd = (event) => {
      drawingOnCanvasEnd(event);
      const endPoint = currentShape.value.end;
      checkPointOnNumber(endPoint);
    };
    const showNumberSelector = common_vendor.ref(false);
    const selectedGroupIndex = common_vendor.ref(null);
    const selectedNumIndex = common_vendor.ref(null);
    const counterStore = stores_counter.useCounterStore();
    common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:195", counterStore);
    common_vendor.ref([]);
    const gridStyles = common_vendor.ref({});
    const openNumberSelector = (groupIndex, numIndex) => {
      selectedGroupIndex.value = groupIndex;
      selectedNumIndex.value = numIndex;
      showNumberSelector.value = true;
    };
    const closeNumberSelector = () => {
      showNumberSelector.value = false;
    };
    const handleConfirmSelection = (data) => {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:214", "确认选择:", data);
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:215", "格子位置:", selectedGroupIndex.value, selectedNumIndex.value);
      const key = `${data.groupIndex}-${data.numIndex}`;
      gridStyles.value[key] = {
        previewType: data.previewType,
        content: {
          selectedCondition: data.selectedCondition,
          selectedNumbers: data.selectedNumbers,
          selecteddoubNumber: data.selecteddoubNumber
        }
      };
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:225", gridStyles.value);
      closeNumberSelector();
      applyStyleToGrid(data.groupIndex, data.numIndex);
    };
    const applyStyleToGrid = (groupIndex, numIndex) => {
      const key = `${groupIndex}-${numIndex}`;
      const styleData = gridStyles.value[key];
      if (!styleData)
        return;
      const gridElement = document.querySelector(
        `[data-group-index="${groupIndex}"][data-num-index="${numIndex}"]`
      );
      if (!gridElement)
        return;
      gridElement.classList.remove("solid", "hollow");
      if (styleData.previewType === "solid") {
        gridElement.classList.add("solid");
      } else {
        gridElement.classList.add("hollow");
      }
      const contentElement = gridElement.querySelector(".grid-content");
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:252", styleData.content.selectedCondition);
      if (contentElement) {
        contentElement.innerHTML = "";
        if (styleData.content.selectedCondition) {
          const conditionElement = document.createElement("div");
          conditionElement.textContent = styleData.content.selectedCondition;
          contentElement.appendChild(conditionElement);
        }
        if (styleData.content.selectedNumbers && styleData.content.selectedNumbers.length > 0) {
          const numbersElement = document.createElement("div");
          numbersElement.textContent = styleData.content.selectedNumbers.join(" ");
          contentElement.appendChild(numbersElement);
        }
        if (styleData.content.selecteddoubNumber) {
          const doubNumberElement = document.createElement("div");
          doubNumberElement.textContent = styleData.content.selecteddoubNumber;
          contentElement.appendChild(doubNumberElement);
        }
      }
    };
    common_vendor.ref(false);
    common_vendor.ref(true);
    common_vendor.ref(null);
    const twocounterStore = stores_twocounter.usetwoCounterStore();
    const canvasPointerValue = common_vendor.ref(true);
    const switchDrawMode = (value) => {
      common_vendor.index.showToast({
        title: `当前为${value === "none" ? "滚动" : "画规"}模式`,
        icon: "none",
        // 可选值：success, loading, none
        duration: 2e3,
        // 提示持续时间（毫秒）
        position: "bottom"
        // 可选值：top, center, bottom
      });
      canvasPointerValue.value = !canvasPointerValue.value;
      canvasPointerEvents.value = value;
    };
    const handleSubmit = (data) => {
      common_vendor.index.showModal({
        title: "确认清除",
        content: "确定要清除所有绘制内容和样式吗？此操作不可撤销。",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:379", "用户确认清除操作");
            clearCanvas();
            clearAllGridContents();
          } else if (res.cancel) {
            common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:383", "用户取消清除操作");
          }
        }
      });
    };
    const clearAllGridContents = () => {
      gridStyles.value = {};
      const gridElements = document.querySelectorAll("[data-group-index][data-num-index]");
      gridElements.forEach((element) => {
        element.classList.remove("solid", "hollow");
        const contentElement = element.querySelector(".grid-content");
        if (contentElement) {
          contentElement.innerHTML = "";
        }
      });
    };
    const handleChildEvent = (params) => {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:405", "收到子组件事件，参数", params);
      switch (params.action) {
        case "submit":
          saveCanvasImage();
          break;
        case "undo":
          undoDraw();
          break;
      }
    };
    const handleShareEvent = () => {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:417", "子组件调用了父组件的分享方法");
    };
    common_vendor.onLoad((e) => {
      const instance = common_vendor.getCurrentInstance().proxy;
      const eventChannel = instance.getOpenerEventChannel();
      eventChannel.emit("acceptDataFromOpenedPage", {
        data: "data from test page"
      });
      eventChannel.emit("someEvent", {
        data: "data from test page for someEvent"
      });
      eventChannel.on("acceptDataFromOpenerPage", function(data) {
        common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:435", "acceptDataFromOpenerPage", data);
      });
    });
    const child = common_vendor.ref(null);
    const {
      numberGroups,
      highlighted,
      numberRefs,
      getTargetRowIndex,
      isTargetRow,
      handleCellClick,
      isHighlighted,
      toggleHighlight,
      handleMessage
    } = pages_juWang_drawLine_useFunc_useTableData.useTableData(child, null, openNumberSelector);
    const handleColorMessage = (val) => {
      strokeColor.value = val;
    };
    const handleLineMessage = (val) => {
      lineWidth.value = val;
    };
    const {
      currentMode,
      isDrawing,
      isErasing,
      canvasPointerEvents,
      strokeColor,
      lineWidth,
      canvasCtx,
      tempCanvasCtx,
      canvasSize,
      dpr,
      currentShape,
      shapes,
      eraserSize,
      onCanvasStart,
      onCanvasMove,
      onCanvasEnd: drawingOnCanvasEnd,
      // 重命名以避免冲突
      redraw,
      initCanvas,
      selectedColor,
      checkPointOnNumber
    } = pages_juWang_drawLine_useFunc_useDrawing.useDrawing(numberGroups, highlighted, numberRefs, openNumberSelector);
    common_vendor.nextTick$1();
    const {
      textLabels,
      movingLabel,
      touchStartTime,
      touchStartPos,
      touchEndTime,
      touchCount,
      touchTimer,
      labelOffset,
      longPressDetected,
      handleLabelTouchStart,
      handleLabelTouchMove,
      handleLabelTouchEnd,
      handleLabelClick,
      handleLabelDblClick,
      addTextLabel,
      editLabel,
      updateLabelText,
      finishEditLabel,
      getLabelStyle
    } = pages_juWang_drawLine_useFunc_useTextLabels.useTextLabels(canvasSize);
    const {
      isFabOpen,
      toggleFab,
      switchMode,
      clearCanvas,
      clickBlank
    } = pages_juWang_drawLine_useFunc_useFabActions.useFabActions(currentMode, canvasPointerEvents, shapes, textLabels, highlighted, redraw);
    const {
      saveCanvasImage,
      domToImage
    } = pages_juWang_drawLine_useFunc_useScreenshot.useScreenshot(common_vendor.html2canvas);
    const undoDraw = () => {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:549", "undoDraw");
      if (shapes.value.length > 0) {
        shapes.value.pop();
        redraw(false);
      }
    };
    common_vendor.onMounted(async () => {
      await twocounterStore.getCounterInfo();
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:559", "数字元素数量:", numberRefs.value.length);
      await initCanvas();
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLine.vue:563", "初始化后数字元素数量:", numberRefs.value.length);
      setTimeout(() => {
        scrollToBottom();
      }, 0);
    });
    common_vendor.watch(shapes, () => redraw(false), {
      deep: true
    });
    const scrollToBottom = () => {
      const query = common_vendor.index.createSelectorQuery();
      query.select(".container").boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((res) => {
        if (res[0]) {
          const pageHeight = res[0].height;
          common_vendor.index.pageScrollTo({
            scrollTop: pageHeight,
            duration: 0
          });
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(handleChildEvent),
        b: common_vendor.o(handleShareEvent),
        c: common_vendor.p({
          title: "drawLine",
          onSubmit: handleSubmit
        }),
        d: common_vendor.o(handleColorMessage),
        e: common_vendor.o(handleLineMessage),
        f: showNumberSelector.value
      }, showNumberSelector.value ? {
        g: common_vendor.sr("numberSelector", "233ee3e6-2"),
        h: common_vendor.o(closeNumberSelector),
        i: common_vendor.o(handleConfirmSelection),
        j: common_vendor.p({
          groupIndex: selectedGroupIndex.value,
          numIndex: selectedNumIndex.value
        }),
        k: common_vendor.o(() => {
        }),
        l: common_vendor.o(closeNumberSelector)
      } : {}, {
        m: common_vendor.f(common_vendor.unref(twocounterStore).List, (group, groupIndex, i0) => {
          return {
            a: common_vendor.t(group.qishu),
            b: common_vendor.f(group.numbers, (num, numIndex, i1) => {
              return {
                a: common_vendor.t(num),
                b: common_vendor.unref(isHighlighted)(groupIndex, numIndex) ? 1 : "",
                c: numIndex,
                d: numIndex,
                e: common_vendor.n("col-" + (2 + numIndex) + (common_vendor.unref(isTargetRow)(groupIndex) ? " clickable" : "")),
                f: common_vendor.o(($event) => common_vendor.unref(handleCellClick)(groupIndex, numIndex), numIndex)
              };
            }),
            c: groupIndex,
            d: group.qishu,
            e: group.qishu,
            f: groupIndex,
            g: common_vendor.unref(isTargetRow)(groupIndex) ? 1 : ""
          };
        }),
        n: common_vendor.o((...args) => common_vendor.unref(onCanvasStart) && common_vendor.unref(onCanvasStart)(...args)),
        o: common_vendor.o((...args) => common_vendor.unref(onCanvasMove) && common_vendor.unref(onCanvasMove)(...args)),
        p: common_vendor.o(onCanvasEnd),
        q: common_vendor.o((...args) => common_vendor.unref(onCanvasStart) && common_vendor.unref(onCanvasStart)(...args)),
        r: common_vendor.o((...args) => common_vendor.unref(onCanvasMove) && common_vendor.unref(onCanvasMove)(...args)),
        s: common_vendor.o(onCanvasEnd),
        t: common_vendor.unref(canvasPointerEvents),
        v: common_vendor.f(common_vendor.unref(textLabels), (label, idx, i0) => {
          return {
            a: common_vendor.t(label.text),
            b: label.editing,
            c: common_vendor.o(($event) => common_vendor.unref(finishEditLabel)(idx), label.id),
            d: common_vendor.o(($event) => common_vendor.unref(updateLabelText)(idx, $event), label.id),
            e: label.id,
            f: common_vendor.s(common_vendor.unref(getLabelStyle)(label)),
            g: common_vendor.o(($event) => common_vendor.unref(handleLabelTouchStart)(idx, $event), label.id),
            h: common_vendor.o(($event) => common_vendor.unref(handleLabelTouchMove)(idx, $event), label.id),
            i: common_vendor.o(($event) => common_vendor.unref(handleLabelTouchEnd)(idx, $event), label.id),
            j: common_vendor.o(($event) => common_vendor.unref(handleLabelClick)(idx), label.id),
            k: common_vendor.o(($event) => common_vendor.unref(handleLabelDblClick)(idx), label.id),
            l: idx
          };
        }),
        w: common_assets._imports_0$1,
        x: common_vendor.o(($event) => switchDrawMode("none")),
        y: canvasPointerValue.value,
        z: common_assets._imports_1$1,
        A: common_vendor.o(($event) => switchDrawMode("auto")),
        B: !canvasPointerValue.value,
        C: common_vendor.t(common_vendor.unref(isFabOpen) ? "✕" : "+"),
        D: common_vendor.o((...args) => common_vendor.unref(toggleFab) && common_vendor.unref(toggleFab)(...args)),
        E: common_vendor.o(($event) => common_vendor.unref(switchMode)("freeDraw")),
        F: common_vendor.o(($event) => common_vendor.unref(switchMode)("straightLine")),
        G: common_vendor.o(($event) => common_vendor.unref(switchMode)("rectangle")),
        H: common_vendor.o(($event) => common_vendor.unref(switchMode)("circle")),
        I: common_vendor.o(($event) => common_vendor.unref(switchMode)("smart")),
        J: common_vendor.o(($event) => common_vendor.unref(switchMode)("eraser")),
        K: common_vendor.o((...args) => common_vendor.unref(addTextLabel) && common_vendor.unref(addTextLabel)(...args)),
        L: common_vendor.o((...args) => common_vendor.unref(clickBlank) && common_vendor.unref(clickBlank)(...args)),
        M: common_vendor.unref(isFabOpen) ? 1 : ""
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-233ee3e6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/drawLine.js.map
