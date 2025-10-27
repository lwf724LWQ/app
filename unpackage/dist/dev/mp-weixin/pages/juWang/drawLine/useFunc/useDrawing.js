"use strict";
const common_vendor = require("../../../../common/vendor.js");
if (!Math) {
  "../../../login/login.js";
  "../../../index/index.js";
  "../drawLineRead.js";
  "../drawLine.js";
  "../../../classify/classify.js";
  "../../../user/user.js";
  "../../../video/play.js";
  "../../../video/reward.js";
  "../../../video/payment.js";
  "../../../../components/NumberSelector/NumberSelector.js";
  "../../../classlist/classlist.js";
  "../../../user/edit-profile.js";
  "../../../video/oss.js";
  "../../../notice/notice.js";
  "../../../notice/detail.js";
  "../../../search/search.js";
  "../../../reg/reg.js";
  "../../../code-login/code-login.js";
  "../../../video/video.js";
  "../../../forum/forum.js";
  "../../../predict-scheme/predict-scheme.js";
  "../../../predict-publish/predict-publish.js";
  "../../../pattern-predict/pattern-predict.js";
  "../../../dream-interpretation/dream-interpretation.js";
  "../../../recharge/recharge.js";
  "../../../transaction/transaction.js";
  "../../../orders/orders.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  }
};
const platform = common_vendor.index.getSystemInfoSync().platform;
const isH5 = platform === "web" || platform === "windows" || platform === "mac";
const isApp = platform === "android" || platform === "ios";
common_vendor.index.__f__("log", "at main.js:8", common_vendor.index$1);
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return {
    app,
    Pinia: common_vendor.Pinia
  };
}
createApp().app.mount("#app");
common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:11", isApp, isH5, common_vendor.index.getSystemInfoSync().platform);
function useDrawing(numberGroups, highlighted, numberRefs, showNumberSelectorCallback, isH52, drawCanvasRef, tempCanvasRef) {
  const currentMode = common_vendor.ref("freeDraw");
  const isDrawing = common_vendor.ref(false);
  const isErasing = common_vendor.ref(false);
  const canvasPointerEvents = common_vendor.ref("auto");
  const strokeColor = common_vendor.ref("#3B82F6");
  const lineWidth = common_vendor.ref(3);
  const canvasCtx = common_vendor.ref(null);
  const tempCanvasCtx = common_vendor.ref(null);
  const canvasSize = common_vendor.ref({
    w: 0,
    h: 0
  });
  const dpr = common_vendor.ref(1);
  const currentShape = common_vendor.ref({
    start: {
      x: 0,
      y: 0
    },
    end: {
      x: 0,
      y: 0
    },
    points: []
    // 用于自由绘制的点数组
  });
  const shapes = common_vendor.ref([]);
  const eraserSize = common_vendor.ref(30);
  const resetCurrentShape = () => {
    currentShape.value = {
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: 0,
        y: 0
      },
      points: []
    };
  };
  const isPointInNonDrawableArea = (point) => {
    var _a;
    const canvasDomRect = (_a = canvasCtx.value) == null ? void 0 : _a.canvas.getBoundingClientRect();
    if (!canvasDomRect)
      return false;
    const table = document.querySelector(".numbers-table");
    if (!table)
      return false;
    const firstColCells = table.querySelectorAll(".col-1");
    if (!firstColCells.length)
      return false;
    const firstColWidth = firstColCells[0].getBoundingClientRect().width;
    const totalNonDrawableWidth = firstColWidth;
    const tableRect = table.getBoundingClientRect();
    const pointXInTable = point.x + canvasDomRect.left - tableRect.left;
    return pointXInTable <= totalNonDrawableWidth;
  };
  const checkPointOnNumber = (point) => {
    var _a;
    if (isPointInNonDrawableArea(point)) {
      return null;
    }
    if (!numberRefs.value || numberRefs.value.length === 0) {
      return null;
    }
    for (let i = 0; i < numberRefs.value.length; i++) {
      let el = numberRefs.value[i];
      if (el && el.$el) {
        el = el.$el;
      }
      if (!el || !(el instanceof HTMLElement) || !el.getBoundingClientRect) {
        continue;
      }
      try {
        const rect = el.getBoundingClientRect();
        const canvasRect = (_a = canvasCtx.value) == null ? void 0 : _a.canvas.getBoundingClientRect();
        if (!canvasRect)
          continue;
        const adjustedX = point.x + canvasRect.left;
        const adjustedY = point.y + canvasRect.top;
        if (adjustedX >= rect.left && adjustedX <= rect.right && adjustedY >= rect.top && adjustedY <= rect.bottom) {
          const groupIndex = parseInt(el.dataset.groupIndex);
          const numIndex = parseInt(el.dataset.numIndex);
          return {
            groupIndex,
            numIndex
          };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useDrawing.js:142", "检查点在数字上时出错:", error);
        continue;
      }
    }
    return null;
  };
  const clearTempCanvas = () => {
    if (tempCanvasCtx.value) {
      tempCanvasCtx.value.clearRect(0, 0, canvasSize.value.w, canvasSize.value.h);
    }
  };
  const drawStraightLine = (start, end, color, width, context = canvasCtx.value) => {
    if (!context)
      return;
    if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
      return;
    }
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  };
  const drawFreeLine = (points, color, width, context = canvasCtx.value) => {
    if (!context || points.length < 2)
      return;
    const filteredPoints = points.filter((point) => !isPointInNonDrawableArea(point));
    if (filteredPoints.length < 2)
      return;
    context.beginPath();
    context.moveTo(filteredPoints[0].x, filteredPoints[0].y);
    for (let i = 1; i < filteredPoints.length; i++) {
      context.lineTo(filteredPoints[i].x, filteredPoints[i].y);
    }
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  };
  const drawRectangle = (start, end, color, width, context = canvasCtx.value) => {
    if (!context)
      return;
    if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
      return;
    }
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const widthRect = Math.abs(end.x - start.x);
    const heightRect = Math.abs(end.y - start.y);
    context.strokeStyle = color;
    context.lineWidth = 6;
    context.strokeRect(x, y, widthRect, heightRect);
  };
  const drawEllipsePath = (ctx, cx, cy, rx, ry) => {
    const kappa = 0.5522848;
    const ox = rx * kappa;
    const oy = ry * kappa;
    ctx.beginPath();
    ctx.moveTo(cx + rx, cy);
    ctx.bezierCurveTo(cx + rx, cy - oy, cx + ox, cy - ry, cx, cy - ry);
    ctx.bezierCurveTo(cx - ox, cy - ry, cx - rx, cy - oy, cx - rx, cy);
    ctx.bezierCurveTo(cx - rx, cy + oy, cx - ox, cy + ry, cx, cy + ry);
    ctx.bezierCurveTo(cx + ox, cy + ry, cx + rx, cy + oy, cx + rx, cy);
    ctx.closePath();
  };
  const drawCircle = (start, end, color, width, context = canvasCtx.value) => {
    if (!context)
      return;
    if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
      return;
    }
    const xRadius = Math.abs(end.x - start.x) / 2;
    const yRadius = Math.abs(end.y - start.y) / 2;
    const centerX = start.x + (end.x - start.x) / 2;
    const centerY = start.y + (end.y - start.y) / 2;
    drawEllipsePath(context, centerX, centerY, xRadius, yRadius);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  };
  const drawSmartCurve = (start, end, color2, width, context = canvasCtx.value, point) => {
    let color = "#1a1ad9";
    if (!context)
      return;
    if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
      return;
    }
    const startNum = checkPointOnNumber(start);
    if (startNum) {
      const exists = highlighted.value.some(
        (item) => item.groupIndex === startNum.groupIndex && item.numIndex === startNum.numIndex
      );
      if (!exists) {
        highlighted.value.push({
          groupIndex: startNum.groupIndex,
          numIndex: startNum.numIndex
        });
      }
    }
    const controlX = start.x;
    const controlY = start.y;
    canvasSize.value.h / numberGroups.value;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(controlX, controlY, end.x, end.y);
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.stroke();
    context.fillStyle = color;
    context.beginPath();
    context.arc(start.x, start.y, 5, 0, Math.PI * 2);
    context.arc(end.x, end.y, 5, 0, Math.PI * 2);
    context.fill();
  };
  const pointLineDistance = (point, start, end) => {
    const A = point.x - start.x;
    const B = point.y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0)
      param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
      xx = start.x;
      yy = start.y;
    } else if (param > 1) {
      xx = end.x;
      yy = end.y;
    } else {
      xx = start.x + param * C;
      yy = start.y + param * D;
    }
    return Math.hypot(point.x - xx, point.y - yy);
  };
  const isPointNearShape = (point, shape) => {
    if (isPointInNonDrawableArea(point)) {
      return false;
    }
    if (shape.type === "freeDraw") {
      for (let i = 0; i < shape.points.length - 1; i++) {
        if (pointLineDistance(point, shape.points[i], shape.points[i + 1]) < eraserSize.value / 2) {
          return true;
        }
      }
      return false;
    } else if (shape.type === "rectangle" || shape.type === "straightLine") {
      const x = Math.min(shape.start.x, shape.end.x);
      const y = Math.min(shape.start.y, shape.end.y);
      const width = Math.abs(shape.end.x - shape.start.x);
      const height = Math.abs(shape.end.y - shape.start.y);
      return point.x >= x - eraserSize.value / 2 && point.x <= x + width + eraserSize.value / 2 && point.y >= y - eraserSize.value / 2 && point.y <= y + height + eraserSize.value / 2;
    } else if (shape.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(shape.end.x - shape.start.x, 2) + Math.pow(shape.end.y - shape.start.y, 2)
      );
      const distanceFromCenter = Math.hypot(point.x - shape.start.x, point.y - shape.start.y);
      return Math.abs(distanceFromCenter - radius) < eraserSize.value / 2 || distanceFromCenter < eraserSize.value / 2;
    } else if (shape.type === "smart") {
      const controlX = (shape.start.x + shape.end.x) / 2;
      const controlY = (shape.start.y + shape.end.y) / 2 + Math.abs(shape.start.x - shape.end.x) / 3;
      const distToStart = Math.hypot(point.x - shape.start.x, point.y - shape.start.y);
      const distToEnd = Math.hypot(point.x - shape.end.x, point.y - shape.end.y);
      const distToControl = Math.hypot(point.x - controlX, point.y - controlY);
      return Math.min(distToStart, distToEnd, distToControl) < eraserSize.value / 1.5;
    }
    return false;
  };
  const checkPointOnTextLabel = (point) => {
    if (isPointInNonDrawableArea(point)) {
      return -1;
    }
    return -1;
  };
  const performErase = (point) => {
    if (isPointInNonDrawableArea(point)) {
      return;
    }
    const numberPos = checkPointOnNumber(point);
    if (numberPos) {
      const {
        groupIndex,
        numIndex
      } = numberPos;
      const idx = highlighted.value.findIndex(
        (item) => item.groupIndex === groupIndex && item.numIndex === numIndex
      );
      if (idx > -1) {
        highlighted.value.splice(idx, 1);
      }
    }
    for (let i = shapes.value.length - 1; i >= 0; i--) {
      if (isPointNearShape(point, shapes.value[i])) {
        shapes.value.splice(i, 1);
      }
    }
  };
  const getRelativeCoordinates = (e) => {
    var _a;
    const canvas = (_a = canvasCtx.value) == null ? void 0 : _a.canvas;
    if (!canvas)
      return {
        x: 0,
        y: 0
      };
    const canvasDomRect = canvas.getBoundingClientRect();
    if (!canvasDomRect)
      return {
        x: 0,
        y: 0
      };
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.clientX !== void 0) {
      clientX = e.clientX;
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:531", clientX);
      clientY = e.clientY;
    } else {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: clientX - canvasDomRect.left,
      y: clientY - canvasDomRect.top
    };
  };
  const onCanvasStart = (e) => {
    common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:551", "Canvas 开始操作");
    const coords = getRelativeCoordinates(e);
    if (isPointInNonDrawableArea(coords)) {
      e.stopPropagation();
      return;
    }
    canvasPointerEvents.value = "none";
    let timerId = null;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    timerId = setTimeout(() => {
      canvasPointerEvents.value = "auto";
      timerId = null;
    }, 300);
    if (currentMode.value === "eraser") {
      isErasing.value = true;
      performErase(coords);
      redraw(false);
    } else if (["straightLine", "freeDraw", "rectangle", "circle", "smart"].includes(currentMode.value)) {
      isDrawing.value = true;
      currentShape.value.start = {
        ...coords
      };
      currentShape.value.end = {
        ...coords
      };
      if (currentMode.value === "freeDraw") {
        currentShape.value.points = [coords];
        common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:595", currentShape.value.points);
      }
    }
  };
  let animationFrameId = null;
  const onCanvasMove = (e) => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(() => {
      const coords2 = getRelativeCoordinates(e);
      if (isDrawing.value) {
        currentShape.value.end = {
          ...coords2
        };
        if (currentMode.value === "freeDraw") {
          currentShape.value.points.push(coords2);
        }
        drawTemporaryShape();
      }
      animationFrameId = null;
    });
    const coords = getRelativeCoordinates(e);
    if (isPointInNonDrawableArea(coords)) {
      return;
    }
    e.preventDefault();
    if (currentMode.value === "eraser" && isErasing.value) {
      performErase(coords);
      redraw(false);
    } else if (isDrawing.value) {
      currentShape.value.end = {
        ...coords
      };
      if (currentMode.value === "freeDraw") {
        currentShape.value.points.push(coords);
      }
      drawTemporaryShape();
    }
  };
  const drawTemporaryShape = () => {
    if (!tempCanvasCtx.value)
      return;
    if (currentMode.value === "freeDraw" && isDrawing.value && currentShape.value.points.length > 1) {
      const points = currentShape.value.points;
      const startPoint = points[points.length - 2];
      const endPoint = points[points.length - 1];
      tempCanvasCtx.value.beginPath();
      tempCanvasCtx.value.moveTo(startPoint.x, startPoint.y);
      tempCanvasCtx.value.lineTo(endPoint.x, endPoint.y);
      tempCanvasCtx.value.strokeStyle = strokeColor.value;
      tempCanvasCtx.value.lineWidth = lineWidth.value;
      tempCanvasCtx.value.lineCap = "round";
      tempCanvasCtx.value.stroke();
    } else {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:699", tempCanvasCtx);
      if (tempCanvasCtx.value) {
        tempCanvasCtx.value.clearRect(0, 0, canvasSize.value.w, canvasSize.value.h);
        shapes.value.forEach((shape) => {
          switch (shape.type) {
            case "straightLine":
              drawStraightLine(shape.start, shape.end, shape.color, shape.width, tempCanvasCtx.value);
              break;
            case "freeDraw":
              drawFreeLine(shape.points, shape.color, shape.width, tempCanvasCtx.value);
              break;
            case "rectangle":
              drawRectangle(shape.start, shape.end, shape.color, shape.width, tempCanvasCtx.value);
              break;
            case "circle":
              drawCircle(shape.start, shape.end, shape.color, shape.width, tempCanvasCtx.value);
              break;
            case "smart":
              if (shape.startNum && shape.endNum) {
                drawSmartCurve(
                  shape.start,
                  shape.end,
                  shape.color,
                  shape.width,
                  tempCanvasCtx.value
                );
              } else {
                drawFreeLine(
                  [shape.start, shape.end],
                  shape.color,
                  shape.width,
                  tempCanvasCtx.value
                );
              }
              break;
          }
        });
      }
    }
    if (!tempCanvasCtx.value)
      return;
    switch (currentMode.value) {
      case "straightLine":
        drawStraightLine(currentShape.value.start, currentShape.value.end, strokeColor.value, lineWidth.value, tempCanvasCtx.value);
        break;
      case "freeDraw":
        if (currentShape.value.points.length > 1) {
          drawFreeLine(currentShape.value.points, strokeColor.value, lineWidth.value, tempCanvasCtx.value);
        }
        break;
      case "rectangle":
        drawRectangle(
          currentShape.value.start,
          currentShape.value.end,
          strokeColor.value,
          lineWidth.value,
          tempCanvasCtx.value
        );
        break;
      case "circle":
        drawCircle(
          currentShape.value.start,
          currentShape.value.end,
          strokeColor.value,
          lineWidth.value,
          tempCanvasCtx.value
        );
        break;
      case "smart":
        const startNum = checkPointOnNumber(currentShape.value.start);
        const endNum = checkPointOnNumber(currentShape.value.end);
        if (startNum && endNum) {
          drawSmartCurve(
            currentShape.value.start,
            currentShape.value.end,
            "#66dd99",
            lineWidth.value,
            tempCanvasCtx.value
          );
        } else {
          drawFreeLine(
            [currentShape.value.start, currentShape.value.end],
            "#ff6688",
            lineWidth.value,
            tempCanvasCtx.value
          );
        }
        break;
    }
  };
  const onCanvasEnd = () => {
    const endPoint = currentShape.value.end;
    const numberPos = checkPointOnNumber(endPoint);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (numberPos) {
      const {
        groupIndex,
        numIndex
      } = numberPos;
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:795", groupIndex, numIndex);
      if (currentMode.value === "smart" && groupIndex >= 20 && groupIndex <= 23 && numIndex == 0) {
        if (showNumberSelectorCallback) {
          showNumberSelectorCallback(groupIndex, numIndex);
        }
      }
      if (currentMode.value === "smart" && groupIndex >= 20 && groupIndex <= 23 && numIndex == 1) {
        if (showNumberSelectorCallback) {
          showNumberSelectorCallback(groupIndex, numIndex);
        }
      }
      if (currentMode.value === "smart" && groupIndex >= 20 && groupIndex <= 23 && numIndex == 2) {
        if (showNumberSelectorCallback) {
          showNumberSelectorCallback(groupIndex, numIndex);
        }
      }
      if (currentMode.value === "smart" && groupIndex >= 20 && groupIndex <= 23 && numIndex == 3) {
        if (showNumberSelectorCallback) {
          showNumberSelectorCallback(groupIndex, numIndex);
        }
      }
      if (currentMode.value === "smart" && groupIndex >= 20 && groupIndex <= 23 && numIndex == 4) {
        if (showNumberSelectorCallback) {
          showNumberSelectorCallback(groupIndex, numIndex);
        }
      }
      if (currentMode.value === "smart" && groupIndex >= 20 && groupIndex <= 23 && numIndex == 5) {
        if (showNumberSelectorCallback) {
          showNumberSelectorCallback(groupIndex, numIndex);
        }
      }
    }
    if (currentMode.value === "eraser") {
      isErasing.value = false;
    } else if (isDrawing.value) {
      if (isPointInNonDrawableArea(currentShape.value.start) || isPointInNonDrawableArea(currentShape.value.end)) {
        isDrawing.value = false;
        resetCurrentShape();
        clearTempCanvas();
        return;
      }
      const shape = {
        type: currentMode.value,
        start: {
          ...currentShape.value.start
        },
        end: {
          ...currentShape.value.end
        },
        points: [...currentShape.value.points],
        color: strokeColor.value,
        width: lineWidth.value
      };
      if (currentMode.value === "freeDraw" && shape.points.length > 1) {
        shape.points = shape.points.filter((point) => !isPointInNonDrawableArea(point));
        if (shape.points.length > 1) {
          shapes.value.push(shape);
        }
      } else if (["rectangle", "straightLine", "circle"].includes(currentMode.value)) {
        const size = Math.hypot(
          shape.end.x - shape.start.x,
          shape.end.y - shape.start.y
        );
        if (size > 5) {
          shapes.value.push(shape);
        }
      } else if (currentMode.value === "smart") {
        const startNum = checkPointOnNumber(shape.start);
        const endNum = checkPointOnNumber(shape.end);
        const lineLength = Math.hypot(
          shape.end.x - shape.start.x,
          shape.end.y - shape.start.y
        );
        if (lineLength > 10) {
          shape.startNum = startNum;
          shape.endNum = endNum;
          shapes.value.push(shape);
          if (startNum && endNum) {
            const addHighlight = (groupIdx, numIdx) => {
              const exists = highlighted.value.some(
                (item) => item.groupIndex === groupIdx && item.numIndex === numIdx
              );
              if (!exists) {
                highlighted.value.push({
                  groupIndex: groupIdx,
                  numIndex: numIdx
                });
              }
            };
            addHighlight(startNum.groupIndex, startNum.numIndex);
            addHighlight(endNum.groupIndex, endNum.numIndex);
          }
        }
      }
      isDrawing.value = false;
      resetCurrentShape();
      clearTempCanvas();
      redraw(false);
    }
  };
  const redraw = (includeTemp = false) => {
    if (!canvasCtx.value)
      return;
    canvasCtx.value.clearRect(0, 0, canvasSize.value.w, canvasSize.value.h);
    shapes.value.forEach((shape) => {
      switch (shape.type) {
        case "straightLine":
          drawStraightLine(shape.start, shape.end, shape.color, shape.width);
          break;
        case "freeDraw":
          drawFreeLine(shape.points, shape.color, shape.width);
          break;
        case "rectangle":
          drawRectangle(shape.start, shape.end, shape.color, shape.width);
          break;
        case "circle":
          drawCircle(shape.start, shape.end, shape.color, shape.width);
          break;
        case "smart":
          if (shape.startNum && shape.endNum) {
            drawSmartCurve(shape.start, shape.end, shape.color, shape.width);
          } else {
            drawFreeLine([shape.start, shape.end], shape.color, shape.width);
          }
          break;
      }
    });
    if (currentMode.value === "eraser" && isErasing.value) {
      drawEraserIndicator();
    }
  };
  const drawEraserIndicator = () => {
    if (!canvasCtx.value)
      return;
    const lastPoint = currentShape.value.end;
    canvasCtx.value.beginPath();
    canvasCtx.value.arc(lastPoint.x, lastPoint.y, eraserSize.value / 2, 0, Math.PI * 2);
    canvasCtx.value.strokeStyle = "rgba(255, 0, 0, 0.5)";
    canvasCtx.value.lineWidth = 2;
    canvasCtx.value.stroke();
    canvasCtx.value.fillStyle = "rgba(255, 0, 0, 0.1)";
    canvasCtx.value.fill();
  };
  const safeRemoveEventListener = (container, event, handler) => {
    if (container && container.removeEventListener) {
      container.removeEventListener(event, handler);
    }
  };
  const safeAddEventListener = (container, event, handler, options) => {
    if (container && container.addEventListener) {
      container.addEventListener(event, handler, options);
    }
  };
  const setupTableScrollListener = () => {
    var _a;
    const possibleContainers = [
      document.querySelector(".numbers-table-container"),
      // 表格容器
      document.querySelector(".container"),
      // 最外层容器
      (_a = document.querySelector(".numbers-table")) == null ? void 0 : _a.parentElement,
      // 表格的直接父元素
      document.scrollingElement,
      // 页面滚动容器
      window
      // 窗口对象
    ];
    const validContainers = possibleContainers.filter((container) => container != null);
    validContainers.forEach((container) => {
      safeRemoveEventListener(container, "scroll", handleTableScroll);
      safeAddEventListener(container, "scroll", handleTableScroll);
    });
    safeRemoveEventListener(document, "touchmove", handleTouchScroll);
    safeAddEventListener(document, "touchmove", handleTouchScroll, {
      passive: true
    });
  };
  const handleTableScroll = () => {
    canvasPointerEvents.value = "auto";
  };
  const handleTouchScroll = () => {
    canvasPointerEvents.value = "auto";
  };
  const initCanvas = async () => {
    try {
      await common_vendor.nextTick$1();
      if (document.readyState !== "complete") {
        await new Promise((resolve) => {
          if (document.readyState === "complete") {
            resolve();
          } else {
            document.addEventListener("DOMContentLoaded", resolve);
          }
        });
      }
      let canvasEl = null;
      let tempCanvasEl = null;
      if (drawCanvasRef && drawCanvasRef.value) {
        canvasEl = drawCanvasRef.value;
      } else {
        canvasEl = document.querySelector(".draw-canvas");
      }
      if (tempCanvasRef && tempCanvasRef.value) {
        tempCanvasEl = tempCanvasRef.value;
      } else {
        tempCanvasEl = document.querySelector(".temp-canvas");
      }
      if (!canvasEl) {
        common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useDrawing.js:1098", "主 Canvas 元素未找到");
        return;
      }
      const tableContainer = document.querySelector(".numbers-table");
      let containerHeight = 0;
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:1105", tableContainer.getBoundingClientRect().height);
      if (tableContainer) {
        containerHeight = tableContainer.getBoundingClientRect().height;
      }
      if (isH52) {
        if (canvasEl instanceof HTMLCanvasElement) {
          common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:1113", "元素是 Canvas");
        } else {
          common_vendor.index.__f__("warn", "at pages/juWang/drawLine/useFunc/useDrawing.js:1115", "元素不是 Canvas，尝试查找内部的 Canvas");
          const innerCanvas = canvasEl.querySelector("canvas");
          if (innerCanvas) {
            common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:1120", "在元素内部找到 Canvas:", innerCanvas);
            canvasEl = innerCanvas;
          } else {
            common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useDrawing.js:1123", "元素内部也没有 Canvas");
            return;
          }
        }
        canvasCtx.value = canvasEl.getContext("2d");
        dpr.value = window.devicePixelRatio || 1;
        canvasSize.value = {
          w: window.innerWidth,
          h: containerHeight || window.innerHeight * 0.7
        };
        canvasEl.style.width = `${canvasSize.value.w}px`;
        canvasEl.style.height = `${canvasSize.value.h}px`;
        canvasEl.width = canvasSize.value.w * dpr.value;
        canvasEl.height = canvasSize.value.h * dpr.value;
        if (canvasCtx.value) {
          canvasCtx.value.scale(dpr.value, dpr.value);
        }
        if (tempCanvasEl && tempCanvasEl instanceof HTMLCanvasElement) {
          tempCanvasCtx.value = tempCanvasEl.getContext("2d");
          tempCanvasEl.style.width = `${canvasSize.value.w}px`;
          tempCanvasEl.style.height = `${canvasSize.value.h}px`;
          tempCanvasEl.width = canvasSize.value.w * dpr.value;
          tempCanvasEl.height = canvasSize.value.h * dpr.value;
          if (tempCanvasCtx.value) {
            tempCanvasCtx.value.scale(dpr.value, dpr.value);
          }
        }
      } else {
        const query = common_vendor.index.createSelectorQuery();
        const res = await new Promise((resolve) => {
          query.select(".draw-canvas").fields({
            node: true,
            size: true
          }).exec((rect) => resolve(rect[0]));
        });
        if (!res || !res.node) {
          common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useDrawing.js:1170", "Canvas初始化失败");
          return;
        }
        const canvas = res.node;
        canvasCtx.value = canvas.getContext("2d");
        const systemInfo = common_vendor.index.getSystemInfoSync();
        dpr.value = systemInfo.pixelRatio || 1;
        canvasSize.value = {
          w: systemInfo.windowWidth,
          h: containerHeight
        };
        canvasCtx.value.scale(dpr.value, dpr.value);
        const tempRes = await new Promise((resolve) => {
          query.select(".temp-canvas").fields({
            node: true,
            size: true
          }).exec((rect) => resolve(rect[0]));
        });
        if (tempRes && tempRes.node) {
          const tempCanvas = tempRes.node;
          tempCanvasCtx.value = tempCanvas.getContext("2d");
          tempCanvas.style.width = canvasSize.value.w + "px";
          tempCanvas.style.height = canvasSize.value.h + "px";
          tempCanvas.width = canvasSize.value.w * dpr.value;
          tempCanvas.height = canvasSize.value.h * dpr.value;
          tempCanvasCtx.value.scale(dpr.value, dpr.value);
        }
      }
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useDrawing.js:1207", "Canvas 初始化成功");
    } catch (error) {
      common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useDrawing.js:1209", "Canvas 初始化过程中发生错误:", error);
    }
  };
  common_vendor.nextTick$1().then(() => {
    setupTableScrollListener();
  });
  return {
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
    onCanvasEnd,
    redraw,
    initCanvas,
    checkPointOnNumber,
    isPointInNonDrawableArea,
    checkPointOnTextLabel,
    performErase,
    setupTableScrollListener
    // 暴露出去以便在需要时手动调用
  };
}
exports.createApp = createApp;
exports.isApp = isApp;
exports.isH5 = isH5;
exports.useDrawing = useDrawing;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/useFunc/useDrawing.js.map
