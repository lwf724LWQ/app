import { ref } from "vue";

// 工具函数
const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const normalizeText = (val) => String(val || "").toLowerCase();

// 心水预测筛选选项
export const predictionFiltersList = [
  "头尾",
  "芝麻",
  "定头",
  "定百",
  "定十",
  "定尾",
  "杀头",
  "杀百",
  "杀十",
  "杀尾",
  "稳码",
  "中肚",
  "头尾合",
  "中肚合",
  "千百合",
  "千十合",
  "百个合",
  "十个合",
  "ABXD",
  "ABCX",
  "AXCD",
  "XBCD",
  "ABXX",
  "AXCX",
  "XXCD",
  "XBXD",
  "死数",
  "二字现",
  "三字现",
  "过滤王二定",
  "过滤王三定",
  "过滤王四定",
  "头尾不合",
  "中肚不合",
  "千百不合",
  "千十不合",
  "百个不合",
  "十个不合",
];

// 其他筛选选项
export const otherFiltersList = ["大师帖子", "靓规贴子", "点赞最多", "讨论最热"];

export function usePostSearch() {
  // 搜索相关状态
  const searchKeyword = ref("");
  const showSearchSuggestions = ref(false);
  const searchSuggestions = ref([]);
  const filteredPredictList = ref([]);
  const isSearching = ref(false);

  // 筛选弹窗状态
  const showFilterDialog = ref(false);
  const selectedPredictionFilter = ref("");
  const selectedOtherFilter = ref("");

  // 筛选选项
  const predictionFilters = ref([...predictionFiltersList]);
  const otherFilters = ref([...otherFiltersList]);

  // ---------- 搜索建议 ----------
  const generateSearchSuggestions = () => {
    const keyword = normalizeText(searchKeyword.value.trim());
    const suggestions = [];

    const candidates = [...predictionFilters.value, ...otherFilters.value];
    candidates.forEach((filter) => {
      if (normalizeText(filter).includes(keyword)) {
        suggestions.push(filter);
      }
    });

    searchSuggestions.value = suggestions.slice(0, 5);
  };

  const selectSuggestion = (suggestion, predictList) => {
    searchKeyword.value = suggestion;
    showSearchSuggestions.value = false;
    performFuzzySearch(predictList);
  };

  // ---------- 模糊搜索 ----------
  const performFuzzySearch = (predictList) => {
    const keyword = normalizeText(searchKeyword.value.trim());

    if (!keyword) {
      clearSearchResults();
      return;
    }

    isSearching.value = true;

    filteredPredictList.value = predictList.filter((post) => {
      if (post.uname && normalizeText(post.uname).includes(keyword)) {
        return true;
      }
      if (post.content && normalizeText(post.content).includes(keyword)) {
        return true;
      }
      if (post.issueno && post.issueno.toString().includes(keyword)) {
        return true;
      }

      // 特殊标签
      if (keyword === "全部") return true;
      if (keyword === "大师" || keyword === "大师帖子") {
        return post.content && post.content.includes("大师");
      }
      if (keyword === "靓规贴" || keyword === "靓规贴子") {
        return post.content && post.content.includes("靓规");
      }
      if (keyword === "过滤王") {
        return post.content && post.content.includes("过滤王");
      }
      if (keyword === "点赞最多") {
        return (post.like_count || 0) > 0;
      }

      return false;
    });

    if (keyword === "点赞最多") {
      filteredPredictList.value.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    }
  };

  // ---------- 搜索输入处理（防抖） ----------
  const _handleSearchInput = (predictList) => {
    if (searchKeyword.value.trim()) {
      generateSearchSuggestions();
      performFuzzySearch(predictList);
    } else {
      clearSearchResults();
    }
  };
  const handleSearchInput = debounce((predictList) => _handleSearchInput(predictList), 300);

  // ---------- 清空搜索 ----------
  const clearSearch = () => {
    searchKeyword.value = "";
    showSearchSuggestions.value = false;
    clearSearchResults();
  };

  const clearSearchResults = () => {
    filteredPredictList.value = [];
    isSearching.value = false;
  };

  // ---------- 筛选弹窗 ----------
  const showFilterModal = () => {
    showFilterDialog.value = true;
  };

  const hideFilterModal = () => {
    showFilterDialog.value = false;
  };

  const togglePredictionFilter = (filter) => {
    if (selectedPredictionFilter.value === filter) {
      selectedPredictionFilter.value = "";
    } else {
      selectedPredictionFilter.value = filter;
    }
  };

  const toggleOtherFilter = (filter) => {
    if (selectedOtherFilter.value === filter) {
      selectedOtherFilter.value = "";
    } else {
      selectedOtherFilter.value = filter;
    }
  };

  const clearFilterSelection = () => {
    selectedPredictionFilter.value = "";
    selectedOtherFilter.value = "";

    uni.showToast({
      title: "已清空筛选条件",
      icon: "success",
    });
  };

  // ---------- 筛选搜索 ----------
  const performSearch = (predictList) => {
    const filters = [];
    if (selectedPredictionFilter.value) {
      filters.push(selectedPredictionFilter.value);
    }
    if (selectedOtherFilter.value) {
      filters.push(selectedOtherFilter.value);
    }

    if (filters.length === 0) {
      uni.showToast({
        title: "请选择筛选条件",
        icon: "none",
      });
      return;
    }

    searchKeyword.value = filters.join("+");
    performFilterSearch(predictList);
    hideFilterModal();

    uni.showToast({
      title: `搜索${filters.join("+")}`,
      icon: "success",
    });
  };

  const performFilterSearch = (predictList) => {
    isSearching.value = true;

    filteredPredictList.value = predictList.filter((post) => {
      let matches = false;

      if (selectedPredictionFilter.value) {
        const predictionFilter = selectedPredictionFilter.value.toLowerCase();

        if (post.content && post.content.toLowerCase().includes(predictionFilter)) {
          matches = true;
        }

        if (
          predictionFilter === "头尾" &&
          post.content &&
          (post.content.includes("头") || post.content.includes("尾"))
        ) {
          matches = true;
        }
        if (predictionFilter === "芝麻" && post.content && post.content.includes("芝麻")) {
          matches = true;
        }
        if (predictionFilter === "中肚" && post.content && post.content.includes("中肚")) {
          matches = true;
        }
        if (predictionFilter.includes("定") && post.content && post.content.includes("定")) {
          matches = true;
        }
        if (predictionFilter.includes("杀") && post.content && post.content.includes("杀")) {
          matches = true;
        }
        if (predictionFilter.includes("合") && post.content && post.content.includes("合")) {
          matches = true;
        }
        if (
          predictionFilter.includes("过滤王") &&
          post.content &&
          post.content.includes("过滤王")
        ) {
          matches = true;
        }
      }

      if (selectedOtherFilter.value) {
        const otherFilter = selectedOtherFilter.value.toLowerCase();

        if (otherFilter === "大师帖子" && post.content && post.content.includes("大师")) {
          matches = true;
        }
        if (otherFilter === "靓规贴子" && post.content && post.content.includes("靓规")) {
          matches = true;
        }
        if (otherFilter === "点赞最多" && (post.like_count || 0) > 0) {
          matches = true;
        }
        if (otherFilter === "讨论最热" && (post.comment || 0) > 0) {
          matches = true;
        }
      }

      return matches;
    });

    if (selectedOtherFilter.value === "点赞最多") {
      filteredPredictList.value.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    } else if (selectedOtherFilter.value === "讨论最热") {
      filteredPredictList.value.sort((a, b) => (b.comment || 0) - (a.comment || 0));
    }
  };

  const getSearchButtonText = () => {
    const filters = [];
    if (selectedPredictionFilter.value) {
      filters.push(selectedPredictionFilter.value);
    }
    if (selectedOtherFilter.value) {
      filters.push(selectedOtherFilter.value);
    }

    if (filters.length === 0) return "搜索";
    return filters.join("+");
  };

  return {
    // 状态
    searchKeyword,
    showSearchSuggestions,
    searchSuggestions,
    filteredPredictList,
    isSearching,
    showFilterDialog,
    selectedPredictionFilter,
    selectedOtherFilter,
    predictionFilters,
    otherFilters,
    // 方法
    handleSearchInput,
    selectSuggestion,
    clearSearch,
    performSearch,
    clearFilterSelection,
    showFilterModal,
    hideFilterModal,
    togglePredictionFilter,
    toggleOtherFilter,
    getSearchButtonText,
  };
}