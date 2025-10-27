"use strict";
const common_vendor = require("../common/vendor.js");
const api_apis = require("../api/apis.js");
const usetwoCounterStore = common_vendor.defineStore("twocounter", () => {
  const List = common_vendor.ref([]);
  const queryParams = common_vendor.ref({
    page: 1,
    limit: 20,
    tname: "排列五"
  });
  const isLoading = common_vendor.ref(false);
  const hasMore = common_vendor.ref(true);
  const error = common_vendor.ref(null);
  const getCounterInfo = async (isLoadMore = false) => {
    if (isLoading.value)
      return;
    isLoading.value = true;
    error.value = null;
    try {
      const res = await api_apis.apiTicketQuery(queryParams.value);
      common_vendor.index.__f__("log", "at stores/twocounter.js:26", "原始数据:", res.data.records);
      let convertedData = convertData(res.data.records);
      convertedData = convertedData.reverse();
      addEmptyRows(convertedData);
      if (isLoadMore) {
        List.value = [...List.value, ...convertedData];
      } else {
        List.value = convertedData;
      }
      hasMore.value = res.data.records.length >= queryParams.value.limit;
      common_vendor.index.__f__("log", "at stores/twocounter.js:50", "转换后数据（包含4行空数据）:", List.value);
    } catch (err) {
      error.value = err;
      common_vendor.index.__f__("error", "at stores/twocounter.js:53", "获取数据失败:", err);
    } finally {
      isLoading.value = false;
    }
  };
  const convertData = (originalData) => {
    return originalData.map((item) => {
      const qishu = parseInt(item.issueno);
      const numbers = item.number.split(" ").map(Number);
      const qishu2 = numbers.slice(0, 4).reduce((sum, num) => sum + num, 0);
      const newNumbers = [qishu2, ...numbers];
      return {
        qishu,
        numbers: newNumbers
      };
    });
  };
  const addEmptyRows = (data) => {
    if (data.length === 0)
      return;
    const lastQishu = data[data.length - 1].qishu;
    for (let i = 1; i <= 4; i++) {
      const emptyNumbers = Array(6).fill("");
      data.push({
        qishu: lastQishu + i,
        numbers: emptyNumbers
        // 空字符串数组
      });
    }
  };
  const loadMoreData = async () => {
    if (!hasMore.value || isLoading.value)
      return;
    await getCounterInfo(true);
  };
  const reset = () => {
    List.value = [];
    queryParams.value.page = 1;
    hasMore.value = true;
    isLoading.value = false;
    error.value = null;
  };
  return {
    List,
    isLoading,
    hasMore,
    error,
    getCounterInfo,
    loadMoreData,
    reset
  };
});
exports.usetwoCounterStore = usetwoCounterStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/twocounter.js.map
