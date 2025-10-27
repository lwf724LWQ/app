"use strict";
const common_vendor = require("../../../../common/vendor.js");
function useTableData(child, NumberGroups = null, showNumberSelectorCallback) {
  const externalData = null;
  common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useTableData.js:13", "useTableData 被调用，externalData:");
  common_vendor.ref([]);
  common_vendor.index.getStorageSync("drawLineData");
  const numberGroups = common_vendor.ref(externalData);
  function validateDataFormat(data) {
    if (!Array.isArray(data)) {
      common_vendor.index.__f__("warn", "at pages/juWang/drawLine/useFunc/useTableData.js:49", "数据不是数组:", data);
      return false;
    }
    return data.every((item) => {
      const isValid = item && item.hasOwnProperty("qishu") && item.hasOwnProperty("numbers") && Array.isArray(item.numbers) && item.numbers.length === 6;
      if (!isValid) {
        common_vendor.index.__f__("warn", "at pages/juWang/drawLine/useFunc/useTableData.js:60", "数据项格式不正确:", item);
      }
      return isValid;
    });
  }
  const highlighted = common_vendor.ref([]);
  const numberRefs = common_vendor.ref([]);
  const indexes = {
    colIndex: 0,
    groupIndex: 1
  };
  function updateNumberGroups(newData) {
    common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useTableData.js:109", "updateNumberGroups 被调用，数据:", newData);
    if (validateDataFormat(newData)) {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useTableData.js:113", "数据更新成功");
      return "数据更新成功";
    }
  }
  function isTargetRow(groupIndex) {
    const totalRows = 23;
    return groupIndex > totalRows - 4 && groupIndex <= totalRows;
  }
  function handleCellClick(groupIndex, colIndex) {
    if (isTargetRow(groupIndex) && colIndex >= 0 && colIndex <= 6) {
      indexes.colIndex = colIndex;
      indexes.groupIndex = groupIndex;
      showNumberSelectorCallback(indexes.groupIndex, indexes.colIndex);
    }
    toggleHighlight(groupIndex, colIndex);
  }
  function isHighlighted(groupIndex, numIndex) {
    return highlighted.value.some(
      (item) => item.groupIndex === groupIndex && item.numIndex === numIndex
    );
  }
  function toggleHighlight(groupIndex, numIndex) {
    const highlightIndex = highlighted.value.findIndex(
      (item) => item.groupIndex === groupIndex && item.numIndex === numIndex
    );
    if (highlightIndex > -1) {
      highlighted.value.splice(highlightIndex, 1);
    } else {
      highlighted.value.push({
        groupIndex,
        numIndex
      });
      if (groupIndex >= 46 && groupIndex <= 49 && numIndex >= 1 && numIndex <= 4) {
        common_vendor.index.__f__("log", "at pages/juWang/drawLine/useFunc/useTableData.js:199", 1);
      }
    }
  }
  function handleMessage(msg) {
    const {
      colIndex,
      groupIndex
    } = indexes;
    numberGroups.value[groupIndex].numbers[colIndex] = msg;
  }
  function validateDataFormat(data) {
    if (!Array.isArray(data))
      return false;
    return data.every((item) => {
      return item.hasOwnProperty("qishu") && item.hasOwnProperty("numbers") && Array.isArray(item.numbers) && item.numbers.length === 6;
    });
  }
  return {
    validateDataFormat,
    updateNumberGroups,
    numberGroups,
    highlighted,
    numberRefs,
    // getTargetRowIndex,
    isTargetRow,
    handleCellClick,
    isHighlighted,
    toggleHighlight,
    handleMessage
  };
}
exports.useTableData = useTableData;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/useFunc/useTableData.js.map
