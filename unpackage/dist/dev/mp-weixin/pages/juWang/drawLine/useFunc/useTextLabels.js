"use strict";
const common_vendor = require("../../../../common/vendor.js");
function useTextLabels(canvasSize) {
  const textLabels = common_vendor.ref([]);
  const movingLabel = common_vendor.ref(-1);
  const touchStartTime = common_vendor.ref(0);
  const touchStartPos = common_vendor.ref({ x: 0, y: 0 });
  const touchEndTime = common_vendor.ref(0);
  const touchCount = common_vendor.ref(0);
  const touchTimer = common_vendor.ref(null);
  const labelOffset = common_vendor.ref({ x: 0, y: 0 });
  const longPressDetected = common_vendor.ref(false);
  function getLabelStyle(label) {
    return {
      left: `${label.x}px`,
      top: `${label.y}px`,
      zIndex: 25
    };
  }
  function handleLabelTouchStart(idx, e) {
    if (textLabels.value[idx].editing) {
      e.stopPropagation();
      return;
    }
    touchStartTime.value = Date.now();
    const touch = e.touches[0];
    const container = document.querySelector(".numbers-table-container");
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
    const containerAbsTop = containerRect.top + window.scrollY;
    const containerAbsLeft = containerRect.left + window.scrollX;
    const currentLabel = textLabels.value[idx];
    const labelAbsX = currentLabel.x + containerAbsLeft;
    const labelAbsY = currentLabel.y + containerAbsTop;
    touchStartPos.value = {
      x: touch.pageX,
      y: touch.pageY
    };
    labelOffset.value = {
      x: touch.pageX - labelAbsX,
      y: touch.pageY - labelAbsY
    };
    touchCount.value++;
    if (touchCount.value === 2) {
      if (touchTimer.value) {
        clearTimeout(touchTimer.value);
        touchTimer.value = null;
      }
      handleDoubleTap(idx);
      touchCount.value = 0;
    } else {
      touchTimer.value = setTimeout(() => {
        touchCount.value = 0;
      }, 300);
    }
    setTimeout(() => {
      if (touchCount.value === 1 && Date.now() - touchStartTime.value > 500 && // 长按超过500ms
      !longPressDetected.value) {
        longPressDetected.value = true;
        handleLongPress(idx);
      }
    }, 500);
    e.stopPropagation();
    e.preventDefault();
  }
  function handleLabelTouchMove(idx, e) {
    if (longPressDetected.value)
      return;
    const touch = e.touches[0];
    const moveX = Math.abs(touch.clientX - touchStartPos.value.x);
    const moveY = Math.abs(touch.clientY - touchStartPos.value.y);
    if (moveX > 5 || moveY > 5) {
      movingLabel.value = idx;
      const container = document.querySelector(".numbers-table-container");
      const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      const containerAbsTop = containerRect.top + window.scrollY;
      const containerAbsLeft = containerRect.left + window.scrollX;
      let newX = touch.pageX - labelOffset.value.x - containerAbsLeft;
      let newY = touch.pageY - labelOffset.value.y - containerAbsTop;
      const maxY = canvasSize.value.h;
      textLabels.value[idx].x = Math.max(0, Math.min(newX, canvasSize.value.w - 100));
      textLabels.value[idx].y = Math.max(0, Math.min(newY, maxY));
    }
    e.stopPropagation();
    e.preventDefault();
  }
  function handleLabelTouchEnd(idx, e) {
    touchEndTime.value = Date.now();
    movingLabel.value = -1;
    longPressDetected.value = false;
    e.stopPropagation();
    e.preventDefault();
  }
  function handleLabelClick(idx) {
    if (!textLabels.value[idx].editing)
      ;
  }
  function handleLabelDblClick(idx) {
    {
      editLabel(idx);
    }
  }
  function handleDoubleTap(idx) {
    editLabel(idx);
  }
  function handleLongPress(idx) {
    editLabel(idx);
  }
  function addTextLabel() {
    var _a;
    const canvasRect = (_a = document.querySelector(".draw-canvas")) == null ? void 0 : _a.getBoundingClientRect();
    let x = 100;
    let y = 100;
    if (canvasRect) {
      const table = document.querySelector(".numbers-table");
      if (table) {
        const firstCol = table.querySelector(".col-1");
        const secondCol = table.querySelector(".col-2");
        if (firstCol && secondCol) {
          const firstColWidth = firstCol.getBoundingClientRect().width;
          const secondColWidth = secondCol.getBoundingClientRect().width;
          x = firstColWidth + secondColWidth + 20;
        }
      }
      y = canvasRect.height / 3;
    }
    const newLabel = {
      id: Date.now(),
      // 唯一ID
      x,
      y,
      text: "双击或长按编辑",
      editing: false
    };
    textLabels.value.push(newLabel);
    common_vendor.nextTick$1(() => {
      const lastIdx = textLabels.value.length - 1;
      editLabel(lastIdx);
    });
  }
  function editLabel(idx) {
    textLabels.value.forEach((label, i) => {
      label.editing = i === idx;
    });
    common_vendor.nextTick$1(() => {
      const elements = document.querySelectorAll(".text-label");
      if (elements[idx]) {
        const content = elements[idx].querySelector(".text-content");
        if (content) {
          content.setAttribute("contenteditable", "true");
          content.focus();
          const range = document.createRange();
          range.selectNodeContents(content);
          range.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            content.click();
            setTimeout(() => content.focus(), 100);
          }
        }
      }
    });
  }
  function updateLabelText(idx, e) {
    if (textLabels.value[idx]) {
      textLabels.value[idx].text = e.target.innerText;
    }
  }
  function finishEditLabel(idx) {
    if (textLabels.value[idx]) {
      textLabels.value[idx].editing = false;
      if (!textLabels.value[idx].text.trim()) {
        textLabels.value.splice(idx, 1);
      }
    }
  }
  return {
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
  };
}
exports.useTextLabels = useTextLabels;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/useFunc/useTextLabels.js.map
