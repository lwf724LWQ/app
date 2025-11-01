"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "predict-scheme",
  setup(__props) {
    const activeScheme = common_vendor.ref("AXCX");
    const lotteryTypes = common_vendor.ref([
      { id: 16, name: "排列三", code: "pl3", status: "待开奖", time: "今天 21:30" },
      { id: 17, name: "排列五", code: "pl5", status: "待开奖", time: "今天 21:30" },
      { id: 15, name: "七星彩", code: "qxc", status: "待开奖", time: "今天 21:30" },
      { id: 12, name: "福彩3D", code: "fc3d", status: "待开奖", time: "今天 21:30" }
    ]);
    const currentLotteryType = common_vendor.ref(lotteryTypes.value[0]);
    const currentIssueInfo = common_vendor.ref({
      id: null,
      number: null,
      status: "待开奖",
      time: "今天 21:30"
    });
    const selectedThousands = common_vendor.ref([]);
    const selectedHundreds = common_vendor.ref([]);
    const selectedTens = common_vendor.ref([]);
    const selectedUnits = common_vendor.ref([]);
    const selectedCombinations = common_vendor.ref([]);
    const clickedSequence = common_vendor.ref([]);
    const schemeData = common_vendor.ref({});
    const hasChanges = common_vendor.ref(false);
    const showSaveDialog = common_vendor.ref(false);
    const pendingSchemeId = common_vendor.ref("");
    const addedSchemes = common_vendor.ref([]);
    const showMainAttackDialog = common_vendor.ref(false);
    const mainAttackType = common_vendor.ref("");
    const mainAttackNumbers = common_vendor.ref([]);
    const selectedMainAttack = common_vendor.ref([]);
    const showKeyPointDialog = common_vendor.ref(false);
    const keyPointNumbers = common_vendor.ref([]);
    const selectedKeyPoint = common_vendor.ref([]);
    const schemeList = common_vendor.ref([
      { id: "头尾", name: "头尾" },
      { id: "中肚", name: "中肚" },
      { id: "ABXX", name: "ABXX" },
      { id: "AXCX", name: "AXCX" },
      { id: "XBXD", name: "XBXD" },
      { id: "XXCD", name: "XXCD" },
      { id: "ABCX", name: "ABCX" },
      { id: "ABXD", name: "ABXD" },
      { id: "AXCD", name: "AXCD" },
      { id: "XBCD", name: "XBCD" },
      { id: "芝麻", name: "芝麻" },
      { id: "二字现", name: "二字现" },
      { id: "三字现", name: "三字现" },
      { id: "定头", name: "定头" },
      { id: "定百", name: "定百" },
      { id: "定十", name: "定十" },
      { id: "定尾", name: "定尾" },
      { id: "杀头", name: "杀头" },
      { id: "杀百", name: "杀百" },
      { id: "杀十", name: "杀十" },
      { id: "杀尾", name: "杀尾" },
      { id: "稳码", name: "稳码" },
      { id: "头尾合", name: "头尾合" },
      { id: "中肚合", name: "中肚合" },
      { id: "千百合", name: "千百合" },
      { id: "千十合", name: "千十合" },
      { id: "百个合", name: "百个合" },
      { id: "十个合", name: "十个合" },
      { id: "死数", name: "死数" },
      { id: "头尾不合", name: "头尾不合" },
      { id: "中肚不合", name: "中肚不合" },
      { id: "千百不合", name: "千百不合" },
      { id: "千十不合", name: "千十不合" },
      { id: "百个不合", name: "百个不合" },
      { id: "十个不合", name: "十个不合" }
    ]);
    const currentSchemeName = common_vendor.computed(() => {
      const scheme = schemeList.value.find((s) => s.id === activeScheme.value);
      return scheme ? scheme.name : "";
    });
    const savedSchemeCount = common_vendor.computed(() => {
      return addedSchemes.value.length;
    });
    const publishButtonText = common_vendor.computed(() => {
      return `${savedSchemeCount.value}/4`;
    });
    const getSchemeDigits = (schemeId) => {
      switch (schemeId) {
        case "头尾":
          return ["thousands", "units"];
        case "中肚":
          return ["hundreds", "tens"];
        case "ABXX":
          return ["thousands", "hundreds"];
        case "ABCX":
          return ["thousands", "hundreds", "tens"];
        case "ABXD":
          return ["thousands", "hundreds", "units"];
        case "AXCD":
          return ["thousands", "tens", "units"];
        case "XBXD":
          return ["hundreds", "units"];
        case "XBCD":
          return ["hundreds", "tens", "units"];
        case "XXCD":
          return ["tens", "units"];
        case "AXCX":
          return ["thousands", "tens"];
        case "芝麻":
          return ["thousands", "hundreds", "tens", "units"];
        case "定头":
          return ["thousands"];
        case "定百":
          return ["hundreds"];
        case "定十":
          return ["tens"];
        case "定尾":
          return ["units"];
        case "杀头":
          return ["thousands"];
        case "杀百":
          return ["hundreds"];
        case "杀十":
          return ["tens"];
        case "杀尾":
          return ["units"];
        case "稳码":
          return ["units"];
        case "头尾合":
          return ["thousands"];
        case "中肚合":
          return ["hundreds"];
        case "千百合":
          return ["thousands"];
        case "千十合":
          return ["thousands"];
        case "百个合":
          return ["hundreds"];
        case "十个合":
          return ["tens"];
        case "死数":
          return ["units"];
        case "头尾不合":
          return ["units"];
        case "中肚不合":
          return ["units"];
        case "千百不合":
          return ["units"];
        case "千十不合":
          return ["units"];
        case "百个不合":
          return ["units"];
        case "十个不合":
          return ["units"];
        default:
          return ["thousands", "tens"];
      }
    };
    const currentSchemeDigits = common_vendor.computed(() => {
      return getSchemeDigits(activeScheme.value);
    });
    const publishedSchemes = common_vendor.ref([]);
    const isAppendMode = common_vendor.ref(false);
    const appendPostData = common_vendor.ref(null);
    const isLoadingIssueInfo = common_vendor.ref(false);
    const isLoadingPublishedSchemes = common_vendor.ref(false);
    const isFromPatternPredict = common_vendor.computed(() => {
      const pages = getCurrentPages();
      const previousPage = pages[pages.length - 2];
      return previousPage && previousPage.route === "pages/pattern-predict/pattern-predict";
    });
    const isSchemePublished = (schemeId) => {
      return publishedSchemes.value.includes(schemeId);
    };
    const checkAppendMode = () => {
      try {
        const savedAppendData = common_vendor.index.getStorageSync("appendPostData");
        if (savedAppendData && savedAppendData.postId && savedAppendData.postContent) {
          let isCurrentLotteryPost = false;
          if (savedAppendData.lotteryType) {
            isCurrentLotteryPost = savedAppendData.lotteryType === currentLotteryType.value.name;
          } else {
            const currentLottery = currentLotteryType.value.name;
            isCurrentLotteryPost = savedAppendData.postContent.includes(currentLottery) || savedAppendData.postContent.includes(`${currentLottery}-规律预测`);
          }
          if (isCurrentLotteryPost) {
            isAppendMode.value = true;
            appendPostData.value = savedAppendData;
          } else {
            common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:616", "检测到追帖数据，但不是当前彩票类型，清除数据");
            common_vendor.index.removeStorageSync("appendPostData");
            common_vendor.index.removeStorageSync("currentAppendPostData");
            common_vendor.index.removeStorageSync("appendModeTipShown");
            isAppendMode.value = false;
            appendPostData.value = null;
            return;
          }
          const hasShownTip = common_vendor.index.getStorageSync("appendModeTipShown");
          if (!hasShownTip) {
            const schemeNames = savedAppendData.schemeIds ? savedAppendData.schemeIds.join("、") : "未知方案";
            common_vendor.index.showModal({
              title: "追帖模式",
              content: `正在为帖子"第${savedAppendData.period}期"追加方案

已发布的方案(${schemeNames})将被禁用，请选择其他方案进行追加。`,
              showCancel: false,
              confirmText: "知道了"
            });
            common_vendor.index.setStorageSync("appendModeTipShown", true);
          }
          const today = (/* @__PURE__ */ new Date()).toDateString();
          const publishedSchemesList = [];
          const publishedPostsList = {};
          const schemeIds = savedAppendData.schemeIds || [];
          schemeIds.forEach((schemeId) => {
            if (schemeId) {
              publishedSchemesList.push(schemeId);
              publishedPostsList[schemeId] = savedAppendData.postId;
            }
          });
          publishedSchemes.value = publishedSchemesList;
          common_vendor.index.setStorageSync(`publishedSchemes_${today}`, publishedSchemesList);
          common_vendor.index.setStorageSync(`publishedPosts_${today}`, publishedPostsList);
          common_vendor.index.setStorageSync("currentAppendPostData", savedAppendData);
        } else {
          const currentAppendData = common_vendor.index.getStorageSync("currentAppendPostData");
          if (currentAppendData && currentAppendData.postId) {
            isAppendMode.value = true;
            appendPostData.value = currentAppendData;
            loadPublishedSchemes();
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:674", "检查追帖模式失败:", error);
      }
    };
    const testPublishedScheme = async () => {
      if (isLoadingPublishedSchemes.value) {
        common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:682", "正在加载已发布方案，跳过重复请求");
        return;
      }
      try {
        isLoadingPublishedSchemes.value = true;
        common_vendor.index.showLoading({ title: "获取已发布帖子..." });
        const response = await api_apis.apiPostListQuery({
          page: 1,
          size: 20,
          account: common_vendor.index.getStorageSync("account") || ""
        });
        common_vendor.index.hideLoading();
        if (response.code === 200 && response.data && response.data.records) {
          const today = (/* @__PURE__ */ new Date()).toDateString();
          const publishedSchemes2 = [];
          const publishedPosts = {};
          response.data.records.forEach((post) => {
            if (post.content && post.content.includes("预测方案")) {
              const content = post.content;
              if (content.includes("中肚")) {
                publishedSchemes2.push("中肚");
                publishedPosts["中肚"] = post.id;
              }
              if (content.includes("头尾")) {
                publishedSchemes2.push("头尾");
                publishedPosts["头尾"] = post.id;
              }
              if (content.includes("定头")) {
                publishedSchemes2.push("定头");
                publishedPosts["定头"] = post.id;
              }
              if (content.includes("定百")) {
                publishedSchemes2.push("定百");
                publishedPosts["定百"] = post.id;
              }
              if (content.includes("定十")) {
                publishedSchemes2.push("定十");
                publishedPosts["定十"] = post.id;
              }
              if (content.includes("定尾")) {
                publishedSchemes2.push("定尾");
                publishedPosts["定尾"] = post.id;
              }
            }
          });
          common_vendor.index.setStorageSync(`publishedSchemes_${today}`, publishedSchemes2);
          common_vendor.index.setStorageSync(`publishedPosts_${today}`, publishedPosts);
          loadPublishedSchemes();
          common_vendor.index.showToast({
            title: `获取到${publishedSchemes2.length}个已发布方案`,
            icon: "success"
          });
        } else {
          handleApiFailure();
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:757", "获取已发布帖子失败:", error);
        handleApiFailure();
      } finally {
        isLoadingPublishedSchemes.value = false;
      }
    };
    const handleApiFailure = () => {
      try {
        if (isAppendMode.value && appendPostData.value) {
          const today = (/* @__PURE__ */ new Date()).toDateString();
          const publishedSchemes2 = [];
          const publishedPosts = {};
          const schemeIds = appendPostData.value.schemeIds || [];
          schemeIds.forEach((schemeId) => {
            if (schemeId) {
              publishedSchemes2.push(schemeId);
              publishedPosts[schemeId] = appendPostData.value.postId;
            }
          });
          common_vendor.index.setStorageSync(`publishedSchemes_${today}`, publishedSchemes2);
          common_vendor.index.setStorageSync(`publishedPosts_${today}`, publishedPosts);
          loadPublishedSchemes();
          common_vendor.index.showToast({
            title: `追帖模式：已加载 ${publishedSchemes2.length} 个方案`,
            icon: "success"
          });
        } else {
          common_vendor.index.showModal({
            title: "获取已发布帖子失败",
            content: "无法获取已发布的帖子信息，可能的原因：\n1. 网络连接问题\n2. 服务器暂时不可用\n3. 账号权限问题\n\n是否继续使用本地数据？",
            confirmText: "继续",
            cancelText: "重试",
            success: (res) => {
              if (res.confirm) {
                loadPublishedSchemes();
                common_vendor.index.showToast({
                  title: "使用本地数据",
                  icon: "success"
                });
              } else {
                setTimeout(() => {
                  testPublishedScheme();
                }, 1e3);
              }
            }
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:822", "处理接口失败情况时出错:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const clearTestData = () => {
      const today = (/* @__PURE__ */ new Date()).toDateString();
      common_vendor.index.removeStorageSync(`publishedSchemes_${today}`);
      common_vendor.index.removeStorageSync(`publishedPosts_${today}`);
      publishedSchemes.value = [];
      common_vendor.index.showToast({
        title: "已清除测试数据",
        icon: "success"
      });
    };
    const loadPublishedSchemes = async () => {
      try {
        const today = (/* @__PURE__ */ new Date()).toDateString();
        const publishedData = common_vendor.index.getStorageSync(`publishedSchemes_${today}`) || [];
        publishedSchemes.value = publishedData;
        if (publishedSchemes.value.length > 0) {
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:856", "加载已发布方案失败:", error);
      }
    };
    const selectScheme = (schemeId) => {
      if (schemeId === activeScheme.value) {
        return;
      }
      if (!isFromPatternPredict.value && isSchemePublished(schemeId)) {
        common_vendor.index.showToast({
          title: "该方案今天已发布过，无法重复选择",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (hasChanges.value) {
        pendingSchemeId.value = schemeId;
        showSaveDialog.value = true;
        return;
      }
      switchToScheme(schemeId);
    };
    const enterAppendMode = (schemeId) => {
      try {
        const today = (/* @__PURE__ */ new Date()).toDateString();
        const publishedPosts = common_vendor.index.getStorageSync(`publishedPosts_${today}`) || {};
        const postId = publishedPosts[schemeId];
        if (!postId) {
          common_vendor.index.showToast({
            title: "未找到对应的帖子ID",
            icon: "none"
          });
          return;
        }
        common_vendor.index.navigateTo({
          url: `/pages/predict-publish/predict-publish?postId=${postId}&schemeId=${schemeId}`,
          success: () => {
            common_vendor.index.showToast({
              title: "进入追帖模式",
              icon: "success"
            });
          },
          fail: (err) => {
            common_vendor.index.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:921", "进入追帖模式失败:", error);
        common_vendor.index.showToast({
          title: "进入追帖模式失败",
          icon: "none"
        });
      }
    };
    const switchToScheme = (schemeId) => {
      saveCurrentScheme();
      activeScheme.value = schemeId;
      loadSchemeData(schemeId);
      hasChanges.value = false;
    };
    const saveCurrentScheme = () => {
      if (activeScheme.value) {
        if (activeScheme.value === "二字现" || activeScheme.value === "三字现") {
          schemeData.value[activeScheme.value] = {
            combinations: [...selectedCombinations.value],
            sequence: [...clickedSequence.value]
          };
        } else {
          const currentData = {
            thousands: [...selectedThousands.value],
            hundreds: [...selectedHundreds.value],
            tens: [...selectedTens.value],
            units: [...selectedUnits.value]
          };
          if (schemeData.value[activeScheme.value]) {
            const existingData = schemeData.value[activeScheme.value];
            if (existingData.thousandsMainAttack) {
              currentData.thousandsMainAttack = [...existingData.thousandsMainAttack];
            }
            if (existingData.thousandsKeyPoint) {
              currentData.thousandsKeyPoint = [...existingData.thousandsKeyPoint];
            }
            if (existingData.hundredsMainAttack) {
              currentData.hundredsMainAttack = [...existingData.hundredsMainAttack];
            }
            if (existingData.hundredsKeyPoint) {
              currentData.hundredsKeyPoint = [...existingData.hundredsKeyPoint];
            }
            if (existingData.tensMainAttack) {
              currentData.tensMainAttack = [...existingData.tensMainAttack];
            }
            if (existingData.tensKeyPoint) {
              currentData.tensKeyPoint = [...existingData.tensKeyPoint];
            }
            if (existingData.unitsMainAttack) {
              currentData.unitsMainAttack = [...existingData.unitsMainAttack];
            }
            if (existingData.unitsKeyPoint) {
              currentData.unitsKeyPoint = [...existingData.unitsKeyPoint];
            }
          }
          schemeData.value[activeScheme.value] = currentData;
        }
      }
      saveSchemesToStorage();
    };
    const loadSchemeData = (schemeId) => {
      const data = schemeData.value[schemeId];
      if (data) {
        if (schemeId === "二字现" || schemeId === "三字现") {
          selectedCombinations.value = [...data.combinations || []];
          clickedSequence.value = [...data.sequence || []];
        } else {
          selectedThousands.value = [...data.thousands || []];
          selectedHundreds.value = [...data.hundreds || []];
          selectedTens.value = [...data.tens || []];
          selectedUnits.value = [...data.units || []];
        }
      } else {
        selectedThousands.value = [];
        selectedHundreds.value = [];
        selectedTens.value = [];
        selectedUnits.value = [];
        selectedCombinations.value = [];
      }
    };
    const toggleNumber = (type, num) => {
      const value = num - 1;
      if (activeScheme.value === "二字现") {
        toggleCombinationNumber(value);
        return;
      }
      if (activeScheme.value === "三字现") {
        toggleThreeDigitCombination(value);
        return;
      }
      let maxSelection = 6;
      if (activeScheme.value === "杀头" || activeScheme.value === "杀百" || activeScheme.value === "杀十" || activeScheme.value === "杀尾" || activeScheme.value === "稳码" || activeScheme.value === "头尾不合" || activeScheme.value === "中肚不合" || activeScheme.value === "千百不合" || activeScheme.value === "千十不合" || activeScheme.value === "百个不合" || activeScheme.value === "十个不合") {
        maxSelection = 2;
      } else if (activeScheme.value === "死数") {
        maxSelection = 1;
      }
      let targetArray = null;
      switch (type) {
        case "thousands":
          targetArray = selectedThousands.value;
          break;
        case "hundreds":
          targetArray = selectedHundreds.value;
          break;
        case "tens":
          targetArray = selectedTens.value;
          break;
        case "units":
          targetArray = selectedUnits.value;
          break;
        default:
          return;
      }
      const index = targetArray.indexOf(value);
      if (index > -1) {
        targetArray.splice(index, 1);
      } else if (targetArray.length < maxSelection) {
        targetArray.push(value);
      } else {
        let message = "最多只能选择6个数字";
        if (activeScheme.value === "杀头" || activeScheme.value === "杀百" || activeScheme.value === "杀十" || activeScheme.value === "杀尾" || activeScheme.value === "稳码" || activeScheme.value === "头尾不合" || activeScheme.value === "中肚不合" || activeScheme.value === "千百不合" || activeScheme.value === "千十不合" || activeScheme.value === "百个不合" || activeScheme.value === "十个不合") {
          message = `${activeScheme.value}方案最多只能选择2个数字`;
        } else if (activeScheme.value === "死数") {
          message = "死数方案只能选择1个数字";
        }
        common_vendor.index.showToast({
          title: message,
          icon: "none"
        });
      }
      hasChanges.value = true;
    };
    const toggleCombinationNumber = (value) => {
      clickedSequence.value.push(value);
      if (clickedSequence.value.length === 2) {
        const sortedNumbers = [...clickedSequence.value].sort((a, b) => a - b);
        const combination = `${sortedNumbers[0]}${sortedNumbers[1]}`;
        if (!selectedCombinations.value.includes(combination)) {
          if (selectedCombinations.value.length < 4) {
            selectedCombinations.value.push(combination);
          } else {
            common_vendor.index.showToast({
              title: "最多只能选择4组组合",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: "该组合已存在",
            icon: "none"
          });
        }
        clickedSequence.value = [];
      }
      hasChanges.value = true;
    };
    const toggleThreeDigitCombination = (value) => {
      clickedSequence.value.push(value);
      if (clickedSequence.value.length === 3) {
        const sortedNumbers = [...clickedSequence.value].sort((a, b) => a - b);
        const combination = sortedNumbers.join("");
        if (!selectedCombinations.value.includes(combination)) {
          if (selectedCombinations.value.length < 15) {
            selectedCombinations.value.push(combination);
          } else {
            common_vendor.index.showToast({
              title: "最多只能选择15组组合",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: "该组合已存在",
            icon: "none"
          });
        }
        clickedSequence.value = [];
      }
      hasChanges.value = true;
    };
    const formatCombinations = (combinations) => {
      if (!combinations || combinations.length === 0) {
        return "";
      }
      const maxPerLine = 6;
      const lines = [];
      for (let i = 0; i < combinations.length; i += maxPerLine) {
        const lineCombinations = combinations.slice(i, i + maxPerLine);
        lines.push(lineCombinations.join(","));
      }
      return lines.join("\n");
    };
    const getSequenceStatus = () => {
      if (activeScheme.value === "二字现") {
        if (clickedSequence.value.length === 0) {
          return "点击两个数字组成组合";
        } else if (clickedSequence.value.length === 1) {
          return `已选择 ${clickedSequence.value[0]}，再选择一个数字`;
        }
      } else if (activeScheme.value === "三字现") {
        if (clickedSequence.value.length === 0) {
          return "点击三个数字组成组合";
        } else if (clickedSequence.value.length === 1) {
          return `已选择 ${clickedSequence.value[0]}，再选择两个数字`;
        } else if (clickedSequence.value.length === 2) {
          return `已选择 ${clickedSequence.value.join(",")}，再选择一个数字`;
        }
      }
      return "";
    };
    const validateSchemeCompleteness = () => {
      if (activeScheme.value === "二字现" || activeScheme.value === "三字现") {
        return true;
      }
      const requiredDigits = getSchemeDigits(activeScheme.value);
      for (const digit of requiredDigits) {
        let selectedCount = 0;
        switch (digit) {
          case "thousands":
            selectedCount = selectedThousands.value.length;
            break;
          case "hundreds":
            selectedCount = selectedHundreds.value.length;
            break;
          case "tens":
            selectedCount = selectedTens.value.length;
            break;
          case "units":
            selectedCount = selectedUnits.value.length;
            break;
        }
        if (selectedCount === 0) {
          return false;
        }
      }
      return true;
    };
    const clearScheme = () => {
      selectedThousands.value = [];
      selectedHundreds.value = [];
      selectedTens.value = [];
      selectedUnits.value = [];
      selectedCombinations.value = [];
      clickedSequence.value = [];
      if (activeScheme.value) {
        schemeData.value[activeScheme.value] = {};
        const index = addedSchemes.value.findIndex((scheme) => scheme.id === activeScheme.value);
        if (index > -1) {
          addedSchemes.value.splice(index, 1);
        }
      }
      saveSchemesToStorage();
      hasChanges.value = false;
      common_vendor.index.showToast({
        title: `${currentSchemeName.value}方案已清除`,
        icon: "success"
      });
    };
    const addScheme = () => {
      let hasContent = false;
      if (activeScheme.value === "二字现" || activeScheme.value === "三字现") {
        hasContent = selectedCombinations.value.length > 0;
      } else {
        hasContent = selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0;
      }
      if (!hasContent) {
        common_vendor.index.showToast({
          title: "请先配置方案内容",
          icon: "none"
        });
        return;
      }
      if (!validateSchemeCompleteness()) {
        common_vendor.index.showToast({
          title: "添加失败,数据不完整",
          icon: "none"
        });
        return;
      }
      if (addedSchemes.value.length >= 4) {
        common_vendor.index.showToast({
          title: "最多只能添加4个方案",
          icon: "none"
        });
        return;
      }
      saveCurrentScheme();
      const schemeToAdd = {
        id: activeScheme.value,
        name: currentSchemeName.value,
        data: { ...schemeData.value[activeScheme.value] },
        timestamp: Date.now()
      };
      addedSchemes.value.push(schemeToAdd);
      saveSchemesToStorage();
      clearCurrentScheme();
      common_vendor.index.showToast({
        title: "方案已添加",
        icon: "success"
      });
    };
    const clearCurrentScheme = () => {
      selectedThousands.value = [];
      selectedHundreds.value = [];
      selectedTens.value = [];
      selectedUnits.value = [];
      selectedCombinations.value = [];
      clickedSequence.value = [];
      hasChanges.value = false;
    };
    const saveScheme = () => {
      saveCurrentScheme();
      hasChanges.value = false;
      showSaveDialog.value = false;
      if (pendingSchemeId.value) {
        switchToScheme(pendingSchemeId.value);
        pendingSchemeId.value = "";
      }
    };
    const dontSaveScheme = () => {
      showSaveDialog.value = false;
      selectedThousands.value = [];
      selectedHundreds.value = [];
      selectedTens.value = [];
      selectedUnits.value = [];
      selectedCombinations.value = [];
      clickedSequence.value = [];
      addedSchemes.value = [];
      hasChanges.value = false;
      if (pendingSchemeId.value) {
        switchToScheme(pendingSchemeId.value);
        pendingSchemeId.value = "";
      }
    };
    const showMainAttack = (type) => {
      mainAttackType.value = type;
      switch (type) {
        case "thousands":
          mainAttackNumbers.value = [...selectedThousands.value];
          break;
        case "hundreds":
          mainAttackNumbers.value = [...selectedHundreds.value];
          break;
        case "tens":
          mainAttackNumbers.value = [...selectedTens.value];
          break;
        case "units":
          mainAttackNumbers.value = [...selectedUnits.value];
          break;
      }
      selectedMainAttack.value = [];
      showMainAttackDialog.value = true;
    };
    const hideMainAttack = () => {
      showMainAttackDialog.value = false;
      mainAttackType.value = "";
      mainAttackNumbers.value = [];
      selectedMainAttack.value = [];
    };
    const toggleMainAttackNumber = (num) => {
      const index = selectedMainAttack.value.indexOf(num);
      if (index > -1) {
        selectedMainAttack.value.splice(index, 1);
      } else {
        if (selectedMainAttack.value.length < mainAttackNumbers.value.length - 1) {
          selectedMainAttack.value.push(num);
        } else {
          common_vendor.index.showToast({
            title: "主攻不能全选，必须至少留一个数字",
            icon: "none"
          });
        }
      }
    };
    const isMainAttackSelected = (num) => {
      return selectedMainAttack.value.includes(num);
    };
    const confirmMainAttack = () => {
      if (selectedMainAttack.value.length === 0) {
        common_vendor.index.showToast({
          title: "请至少选择一个主攻数字",
          icon: "none"
        });
        return;
      }
      if (!schemeData.value[activeScheme.value]) {
        schemeData.value[activeScheme.value] = {};
      }
      const mainAttackKey = `${mainAttackType.value}MainAttack`;
      schemeData.value[activeScheme.value][mainAttackKey] = [...selectedMainAttack.value];
      hideMainAttack();
      common_vendor.index.showToast({
        title: `${getMainAttackTitle()}主攻已设置: ${selectedMainAttack.value.join(",")}`,
        icon: "success"
      });
    };
    const shouldShowMainAttack = (type) => {
      if (activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && activeScheme.value !== "头尾" && activeScheme.value !== "中肚" && activeScheme.value !== "ABXX" && activeScheme.value !== "AXCX" && activeScheme.value !== "XBXD" && activeScheme.value !== "XXCD" && activeScheme.value !== "ABCX" && activeScheme.value !== "ABXD" && activeScheme.value !== "AXCD" && activeScheme.value !== "XBCD" && activeScheme.value !== "芝麻")
        return false;
      let selectedCount = 0;
      switch (type) {
        case "thousands":
          selectedCount = selectedThousands.value.length;
          break;
        case "hundreds":
          selectedCount = selectedHundreds.value.length;
          break;
        case "tens":
          selectedCount = selectedTens.value.length;
          break;
        case "units":
          selectedCount = selectedUnits.value.length;
          break;
      }
      return selectedCount > 1;
    };
    const getMainAttackTitle = () => {
      switch (mainAttackType.value) {
        case "thousands":
          return "千位";
        case "hundreds":
          return "百位";
        case "tens":
          return "十位";
        case "units":
          return "个位";
        default:
          return "";
      }
    };
    const showKeyPoint = (type) => {
      var _a;
      mainAttackType.value = type;
      const mainAttackKey = `${type}MainAttack`;
      const mainAttackData = ((_a = schemeData.value[activeScheme.value]) == null ? void 0 : _a[mainAttackKey]) || [];
      keyPointNumbers.value = [...mainAttackData];
      selectedKeyPoint.value = [];
      showKeyPointDialog.value = true;
    };
    const hideKeyPoint = () => {
      showKeyPointDialog.value = false;
      mainAttackType.value = "";
      keyPointNumbers.value = [];
      selectedKeyPoint.value = [];
    };
    const toggleKeyPointNumber = (num) => {
      const index = selectedKeyPoint.value.indexOf(num);
      if (index > -1) {
        selectedKeyPoint.value.splice(index, 1);
      } else {
        if (selectedKeyPoint.value.length < keyPointNumbers.value.length - 1) {
          selectedKeyPoint.value.push(num);
        } else {
          common_vendor.index.showToast({
            title: "重点不能全选，必须至少留一个数字",
            icon: "none"
          });
        }
      }
    };
    const isKeyPointSelected = (num) => {
      return selectedKeyPoint.value.includes(num);
    };
    const confirmKeyPoint = () => {
      if (selectedKeyPoint.value.length === 0) {
        common_vendor.index.showToast({
          title: "请至少选择一个重点数字",
          icon: "none"
        });
        return;
      }
      if (!schemeData.value[activeScheme.value]) {
        schemeData.value[activeScheme.value] = {};
      }
      const keyPointKey = `${mainAttackType.value}KeyPoint`;
      schemeData.value[activeScheme.value][keyPointKey] = [...selectedKeyPoint.value];
      hideKeyPoint();
      common_vendor.index.showToast({
        title: `${getMainAttackTitle()}重点已设置: ${selectedKeyPoint.value.join(",")}`,
        icon: "success"
      });
    };
    const shouldShowKeyPoint = (type) => {
      var _a;
      if (activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && activeScheme.value !== "头尾" && activeScheme.value !== "中肚" && activeScheme.value !== "ABXX" && activeScheme.value !== "AXCX" && activeScheme.value !== "XBXD" && activeScheme.value !== "XXCD" && activeScheme.value !== "ABCX" && activeScheme.value !== "ABXD" && activeScheme.value !== "AXCD" && activeScheme.value !== "XBCD" && activeScheme.value !== "芝麻")
        return false;
      const mainAttackKey = `${type}MainAttack`;
      const mainAttackData = (_a = schemeData.value[activeScheme.value]) == null ? void 0 : _a[mainAttackKey];
      return mainAttackData && mainAttackData.length >= 2;
    };
    const goToPublish = () => {
      if (addedSchemes.value.length === 0) {
        common_vendor.index.showToast({
          title: "请先添加方案",
          icon: "none"
        });
        return;
      }
      const pages = getCurrentPages();
      const hasPatternPredictPage = pages.some(
        (page) => page.route === "pages/pattern-predict/pattern-predict"
      );
      if (hasPatternPredictPage) {
        common_vendor.index.setStorageSync("predict_schemes_data", {
          addedSchemes: addedSchemes.value,
          schemeData: schemeData.value,
          timestamp: Date.now()
        });
        common_vendor.index.navigateBack();
        return;
      }
      if (isAppendMode.value && appendPostData.value) {
        proceedToAppendPost();
        return;
      }
      const publishedSchemesInCurrent = addedSchemes.value.filter(
        (scheme) => isSchemePublished(scheme.id)
      );
      if (publishedSchemesInCurrent.length === 0) {
        proceedToPublish();
        return;
      }
      const publishedNames = publishedSchemesInCurrent.map((s) => s.name).join("、");
      common_vendor.index.showModal({
        title: "检测到已发布方案",
        content: `以下方案今天已发布过：${publishedNames}

选择处理方式：`,
        confirmText: "进入追帖模式",
        cancelText: "继续发新帖",
        success: (res) => {
          if (res.confirm) {
            const firstPublishedScheme = publishedSchemesInCurrent[0];
            enterAppendMode(firstPublishedScheme.id);
          } else {
            proceedToPublish();
          }
        }
      });
    };
    const proceedToAppendPost = () => {
      try {
        if (!appendPostData.value || !appendPostData.value.postId) {
          common_vendor.index.showToast({
            title: "追帖数据异常",
            icon: "none"
          });
          return;
        }
        const publishData = {
          schemes: addedSchemes.value,
          lotteryType: currentLotteryType.value,
          issueInfo: currentIssueInfo.value,
          appendMode: true,
          appendPostData: appendPostData.value
        };
        common_vendor.index.navigateTo({
          url: `/pages/predict-publish/predict-publish?data=${encodeURIComponent(JSON.stringify(publishData))}&postId=${appendPostData.value.postId}`,
          success: () => {
          },
          fail: (err) => {
            common_vendor.index.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const proceedToPublish = () => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const previousPage = pages[pages.length - 2];
      const hasPatternPredictPage = pages.some(
        (page) => page.route === "pages/pattern-predict/pattern-predict"
      );
      common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1713", "=== 检查页面来源 ===");
      common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1714", "页面栈长度:", pages.length);
      common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1715", "当前页面:", currentPage.route);
      common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1716", "上一页面:", previousPage ? previousPage.route : "无");
      common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1717", "页面栈中是否有规律预测页面:", hasPatternPredictPage);
      if (hasPatternPredictPage) {
        common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1721", "检测到规律帖模式，返回到规律预测页面");
        common_vendor.index.setStorageSync("predict_schemes_data", {
          addedSchemes: addedSchemes.value,
          schemeData: schemeData.value,
          timestamp: Date.now()
        });
        common_vendor.index.navigateBack();
        return;
      }
      const publishData = {
        schemes: addedSchemes.value,
        lotteryType: currentLotteryType.value,
        issueInfo: currentIssueInfo.value
      };
      common_vendor.index.navigateTo({
        url: `/pages/predict-publish/predict-publish?data=${encodeURIComponent(JSON.stringify(publishData))}`
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleModifySchemes = (schemesToModify) => {
      if (schemesToModify && schemesToModify.length > 0) {
        addedSchemes.value = [...schemesToModify];
        common_vendor.index.showToast({
          title: "已加载修改的方案",
          icon: "success"
        });
      }
    };
    const loadCurrentLotteryType = () => {
      try {
        const forumLotteryType = common_vendor.index.getStorageSync("currentLotteryType");
        if (forumLotteryType) {
          currentLotteryType.value = forumLotteryType;
        }
        const savedIssueInfo = common_vendor.index.getStorageSync("currentIssueInfo");
        if (savedIssueInfo) {
          currentIssueInfo.value = savedIssueInfo;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:1778", "加载彩票类型失败:", error);
      }
    };
    const loadIssueInfo = async () => {
      if (isLoadingIssueInfo.value) {
        common_vendor.index.__f__("log", "at pages/predict-scheme/predict-scheme.vue:1786", "正在加载期号信息，跳过重复请求");
        return;
      }
      try {
        if (currentIssueInfo.value.number && currentIssueInfo.value.number !== "--") {
          return;
        }
        isLoadingIssueInfo.value = true;
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_apis.apiGetIssueNo({ tname: currentLotteryType.value.name });
        common_vendor.index.hideLoading();
        if (response.code === 200 && response.data !== null && response.data !== void 0) {
          let issueNumber = null;
          let issueStatus = "待开奖";
          let issueTime = "今天 21:30";
          if (typeof response.data === "number" || typeof response.data === "string") {
            issueNumber = response.data.toString();
          } else if (typeof response.data === "object") {
            issueNumber = response.data.issueno || response.data.number || response.data.id;
            issueStatus = response.data.status || "待开奖";
            issueTime = response.data.time || "今天 21:30";
          }
          currentIssueInfo.value = {
            id: issueNumber,
            number: issueNumber,
            status: issueStatus,
            time: issueTime
          };
          currentLotteryType.value.status = currentIssueInfo.value.status;
          currentLotteryType.value.time = currentIssueInfo.value.time;
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:1828", "加载期号信息失败:", error);
      } finally {
        isLoadingIssueInfo.value = false;
      }
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("modifySchemes", handleModifySchemes);
      loadSavedSchemes();
      loadCurrentLotteryType();
      loadIssueInfo();
      loadPublishedSchemes();
      setTimeout(() => {
        checkAppendMode();
      }, 100);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("modifySchemes", handleModifySchemes);
    });
    const saveSchemesToStorage = () => {
      try {
        const schemesData = {
          addedSchemes: addedSchemes.value,
          schemeData: schemeData.value,
          timestamp: Date.now()
        };
        common_vendor.index.setStorageSync("predict_schemes_data", schemesData);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:1867", "保存方案数据失败:", error);
      }
    };
    const loadSavedSchemes = () => {
      try {
        const savedData = common_vendor.index.getStorageSync("predict_schemes_data");
        if (savedData && savedData.addedSchemes) {
          addedSchemes.value = [...savedData.addedSchemes];
          if (savedData.schemeData) {
            schemeData.value = { ...savedData.schemeData };
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-scheme/predict-scheme.vue:1882", "加载方案数据失败:", error);
      }
    };
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba;
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.t(isAppendMode.value ? "追帖方案" : "设置方案"),
        c: isAppendMode.value && appendPostData.value
      }, isAppendMode.value && appendPostData.value ? {
        d: common_vendor.p({
          type: "info",
          size: "16",
          color: "#28B389"
        }),
        e: common_vendor.t(appendPostData.value.period)
      } : {}, {
        f: common_vendor.f(schemeList.value, (scheme, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(scheme.name),
            b: activeScheme.value === scheme.id
          }, activeScheme.value === scheme.id ? {
            c: "83f89747-1-" + i0,
            d: common_vendor.p({
              type: "checkmarkempty",
              size: "16",
              color: "#ff4757"
            })
          } : {}, {
            e: isSchemePublished(scheme.id)
          }, isSchemePublished(scheme.id) ? {
            f: "83f89747-2-" + i0,
            g: common_vendor.p({
              type: "checkmarkempty",
              size: "16",
              color: "#28B389"
            })
          } : {}, {
            h: activeScheme.value === scheme.id ? 1 : "",
            i: isSchemePublished(scheme.id) ? 1 : "",
            j: !isFromPatternPredict.value && isSchemePublished(scheme.id) ? 1 : "",
            k: scheme.id,
            l: common_vendor.o(($event) => selectScheme(scheme.id), scheme.id)
          });
        }),
        g: common_vendor.o(testPublishedScheme),
        h: common_vendor.o(clearTestData),
        i: activeScheme.value === "二字现"
      }, activeScheme.value === "二字现" ? common_vendor.e({
        j: getSequenceStatus()
      }, getSequenceStatus() ? {
        k: common_vendor.t(getSequenceStatus())
      } : {}, {
        l: common_vendor.f(10, (num, k0, i0) => {
          return {
            a: common_vendor.t(num - 1),
            b: num,
            c: common_vendor.o(($event) => toggleNumber("combination", num), num)
          };
        })
      }) : {}, {
        m: activeScheme.value === "三字现"
      }, activeScheme.value === "三字现" ? common_vendor.e({
        n: getSequenceStatus()
      }, getSequenceStatus() ? {
        o: common_vendor.t(getSequenceStatus())
      } : {}, {
        p: common_vendor.f(10, (num, k0, i0) => {
          return {
            a: common_vendor.t(num - 1),
            b: num,
            c: common_vendor.o(($event) => toggleNumber("combination", num), num)
          };
        })
      }) : {}, {
        q: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && currentSchemeDigits.value.includes("thousands")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && currentSchemeDigits.value.includes("thousands") ? common_vendor.e({
        r: common_vendor.t(activeScheme.value === "头尾合" ? "头尾合" : activeScheme.value === "千百合" ? "千百合" : activeScheme.value === "千十合" ? "千十合" : "千位"),
        s: common_vendor.t(activeScheme.value === "杀头" || activeScheme.value === "杀百" || activeScheme.value === "杀十" || activeScheme.value === "杀尾" || activeScheme.value === "稳码" ? "最多选2个" : "最多选6个"),
        t: common_vendor.f(10, (num, k0, i0) => {
          return {
            a: common_vendor.t(num - 1),
            b: selectedThousands.value.includes(num - 1) ? 1 : "",
            c: num,
            d: common_vendor.o(($event) => toggleNumber("thousands", num), num)
          };
        }),
        v: shouldShowMainAttack("thousands")
      }, shouldShowMainAttack("thousands") ? {
        w: common_vendor.o(($event) => showMainAttack("thousands"))
      } : {}, {
        x: shouldShowKeyPoint("thousands")
      }, shouldShowKeyPoint("thousands") ? {
        y: common_vendor.o(($event) => showKeyPoint("thousands"))
      } : {}) : {}, {
        z: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && currentSchemeDigits.value.includes("hundreds")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && currentSchemeDigits.value.includes("hundreds") ? common_vendor.e({
        A: common_vendor.t(activeScheme.value === "中肚合" ? "中肚合" : activeScheme.value === "千百合" ? "千百合" : activeScheme.value === "百个合" ? "百个合" : "百位"),
        B: common_vendor.t(activeScheme.value === "杀头" || activeScheme.value === "杀百" || activeScheme.value === "杀十" || activeScheme.value === "杀尾" || activeScheme.value === "稳码" ? "最多选2个" : "最多选6个"),
        C: common_vendor.f(10, (num, k0, i0) => {
          return {
            a: common_vendor.t(num - 1),
            b: selectedHundreds.value.includes(num - 1) ? 1 : "",
            c: num,
            d: common_vendor.o(($event) => toggleNumber("hundreds", num), num)
          };
        }),
        D: shouldShowMainAttack("hundreds")
      }, shouldShowMainAttack("hundreds") ? {
        E: common_vendor.o(($event) => showMainAttack("hundreds"))
      } : {}, {
        F: shouldShowKeyPoint("hundreds")
      }, shouldShowKeyPoint("hundreds") ? {
        G: common_vendor.o(($event) => showKeyPoint("hundreds"))
      } : {}) : {}, {
        H: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "杀百" && currentSchemeDigits.value.includes("tens")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "杀百" && currentSchemeDigits.value.includes("tens") ? common_vendor.e({
        I: common_vendor.t(activeScheme.value === "中肚合" ? "中肚合" : activeScheme.value === "十个合" ? "十个合" : "十位"),
        J: common_vendor.t(activeScheme.value === "杀头" || activeScheme.value === "杀百" || activeScheme.value === "杀十" || activeScheme.value === "杀尾" || activeScheme.value === "稳码" ? "最多选2个" : "最多选6个"),
        K: common_vendor.f(10, (num, k0, i0) => {
          return {
            a: common_vendor.t(num - 1),
            b: selectedTens.value.includes(num - 1) ? 1 : "",
            c: num,
            d: common_vendor.o(($event) => toggleNumber("tens", num), num)
          };
        }),
        L: shouldShowMainAttack("tens")
      }, shouldShowMainAttack("tens") ? {
        M: common_vendor.o(($event) => showMainAttack("tens"))
      } : {}, {
        N: shouldShowKeyPoint("tens")
      }, shouldShowKeyPoint("tens") ? {
        O: common_vendor.o(($event) => showKeyPoint("tens"))
      } : {}) : {}, {
        P: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && currentSchemeDigits.value.includes("units")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && currentSchemeDigits.value.includes("units") ? common_vendor.e({
        Q: common_vendor.t(activeScheme.value === "稳码" ? "" : activeScheme.value === "头尾合" ? "头尾合" : activeScheme.value === "死数" ? "死数" : activeScheme.value === "头尾不合" ? "头尾不合" : activeScheme.value === "中肚不合" ? "中肚不合" : activeScheme.value === "千百不合" ? "千百不合" : activeScheme.value === "千十不合" ? "千十不合" : activeScheme.value === "百个不合" ? "百个不合" : activeScheme.value === "十个不合" ? "十个不合" : "个位"),
        R: common_vendor.t(activeScheme.value === "杀头" || activeScheme.value === "杀百" || activeScheme.value === "杀十" || activeScheme.value === "杀尾" || activeScheme.value === "稳码" || activeScheme.value === "头尾不合" || activeScheme.value === "中肚不合" || activeScheme.value === "千百不合" || activeScheme.value === "千十不合" || activeScheme.value === "百个不合" || activeScheme.value === "十个不合" ? "最多选2个" : activeScheme.value === "死数" ? "只选1个" : "最多选6个"),
        S: common_vendor.f(10, (num, k0, i0) => {
          return {
            a: common_vendor.t(num - 1),
            b: selectedUnits.value.includes(num - 1) ? 1 : "",
            c: num,
            d: common_vendor.o(($event) => toggleNumber("units", num), num)
          };
        }),
        T: shouldShowMainAttack("units")
      }, shouldShowMainAttack("units") ? {
        U: common_vendor.o(($event) => showMainAttack("units"))
      } : {}, {
        V: shouldShowKeyPoint("units")
      }, shouldShowKeyPoint("units") ? {
        W: common_vendor.o(($event) => showKeyPoint("units"))
      } : {}) : {}, {
        X: common_vendor.t(currentSchemeName.value),
        Y: activeScheme.value === "二字现"
      }, activeScheme.value === "二字现" ? {
        Z: common_vendor.t(formatCombinations(selectedCombinations.value) || "未选择")
      } : {}, {
        aa: activeScheme.value === "三字现"
      }, activeScheme.value === "三字现" ? {
        ab: common_vendor.t(formatCombinations(selectedCombinations.value) || "未选择")
      } : {}, {
        ac: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "头尾合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && currentSchemeDigits.value.includes("thousands")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "头尾合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && currentSchemeDigits.value.includes("thousands") ? {
        ad: common_vendor.t(selectedThousands.value.join("") || "未选择")
      } : {}, {
        ae: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "头尾合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && currentSchemeDigits.value.includes("thousands") && ((_a = schemeData.value[activeScheme.value]) == null ? void 0 : _a.thousandsMainAttack)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "头尾合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && currentSchemeDigits.value.includes("thousands") && ((_b = schemeData.value[activeScheme.value]) == null ? void 0 : _b.thousandsMainAttack) ? {
        af: common_vendor.t(schemeData.value[activeScheme.value].thousandsMainAttack.join(""))
      } : {}, {
        ag: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "头尾合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && currentSchemeDigits.value.includes("thousands") && ((_c = schemeData.value[activeScheme.value]) == null ? void 0 : _c.thousandsKeyPoint)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "头尾合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && currentSchemeDigits.value.includes("thousands") && ((_d = schemeData.value[activeScheme.value]) == null ? void 0 : _d.thousandsKeyPoint) ? {
        ah: common_vendor.t(schemeData.value[activeScheme.value].thousandsKeyPoint.join(""))
      } : {}, {
        ai: activeScheme.value === "定头" && selectedThousands.value.length > 0
      }, activeScheme.value === "定头" && selectedThousands.value.length > 0 ? {
        aj: common_vendor.t(selectedThousands.value.join(""))
      } : {}, {
        ak: activeScheme.value === "定头" && ((_e = schemeData.value[activeScheme.value]) == null ? void 0 : _e.mainAttack)
      }, activeScheme.value === "定头" && ((_f = schemeData.value[activeScheme.value]) == null ? void 0 : _f.mainAttack) ? {
        al: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        am: activeScheme.value === "定头" && ((_g = schemeData.value[activeScheme.value]) == null ? void 0 : _g.keyPoint)
      }, activeScheme.value === "定头" && ((_h = schemeData.value[activeScheme.value]) == null ? void 0 : _h.keyPoint) ? {
        an: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        ao: activeScheme.value === "定百" && selectedHundreds.value.length > 0
      }, activeScheme.value === "定百" && selectedHundreds.value.length > 0 ? {
        ap: common_vendor.t(selectedHundreds.value.join(""))
      } : {}, {
        aq: activeScheme.value === "定百" && ((_i = schemeData.value[activeScheme.value]) == null ? void 0 : _i.mainAttack)
      }, activeScheme.value === "定百" && ((_j = schemeData.value[activeScheme.value]) == null ? void 0 : _j.mainAttack) ? {
        ar: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        as: activeScheme.value === "定百" && ((_k = schemeData.value[activeScheme.value]) == null ? void 0 : _k.keyPoint)
      }, activeScheme.value === "定百" && ((_l = schemeData.value[activeScheme.value]) == null ? void 0 : _l.keyPoint) ? {
        at: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        av: activeScheme.value === "定十" && selectedTens.value.length > 0
      }, activeScheme.value === "定十" && selectedTens.value.length > 0 ? {
        aw: common_vendor.t(selectedTens.value.join(""))
      } : {}, {
        ax: activeScheme.value === "定十" && ((_m = schemeData.value[activeScheme.value]) == null ? void 0 : _m.mainAttack)
      }, activeScheme.value === "定十" && ((_n = schemeData.value[activeScheme.value]) == null ? void 0 : _n.mainAttack) ? {
        ay: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        az: activeScheme.value === "定十" && ((_o = schemeData.value[activeScheme.value]) == null ? void 0 : _o.keyPoint)
      }, activeScheme.value === "定十" && ((_p = schemeData.value[activeScheme.value]) == null ? void 0 : _p.keyPoint) ? {
        aA: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        aB: activeScheme.value === "定尾" && selectedUnits.value.length > 0
      }, activeScheme.value === "定尾" && selectedUnits.value.length > 0 ? {
        aC: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aD: activeScheme.value === "定尾" && ((_q = schemeData.value[activeScheme.value]) == null ? void 0 : _q.mainAttack)
      }, activeScheme.value === "定尾" && ((_r = schemeData.value[activeScheme.value]) == null ? void 0 : _r.mainAttack) ? {
        aE: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        aF: activeScheme.value === "定尾" && ((_s = schemeData.value[activeScheme.value]) == null ? void 0 : _s.keyPoint)
      }, activeScheme.value === "定尾" && ((_t = schemeData.value[activeScheme.value]) == null ? void 0 : _t.keyPoint) ? {
        aG: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        aH: activeScheme.value === "杀头" && selectedThousands.value.length > 0
      }, activeScheme.value === "杀头" && selectedThousands.value.length > 0 ? {
        aI: common_vendor.t(selectedThousands.value.join(""))
      } : {}, {
        aJ: activeScheme.value === "杀百" && selectedHundreds.value.length > 0
      }, activeScheme.value === "杀百" && selectedHundreds.value.length > 0 ? {
        aK: common_vendor.t(selectedHundreds.value.join(""))
      } : {}, {
        aL: activeScheme.value === "杀十" && selectedTens.value.length > 0
      }, activeScheme.value === "杀十" && selectedTens.value.length > 0 ? {
        aM: common_vendor.t(selectedTens.value.join(""))
      } : {}, {
        aN: activeScheme.value === "杀尾" && selectedUnits.value.length > 0
      }, activeScheme.value === "杀尾" && selectedUnits.value.length > 0 ? {
        aO: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aP: activeScheme.value === "稳码" && selectedUnits.value.length > 0
      }, activeScheme.value === "稳码" && selectedUnits.value.length > 0 ? {
        aQ: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aR: activeScheme.value === "死数" && selectedUnits.value.length > 0
      }, activeScheme.value === "死数" && selectedUnits.value.length > 0 ? {
        aS: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aT: activeScheme.value === "头尾不合" && selectedUnits.value.length > 0
      }, activeScheme.value === "头尾不合" && selectedUnits.value.length > 0 ? {
        aU: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aV: activeScheme.value === "中肚不合" && selectedUnits.value.length > 0
      }, activeScheme.value === "中肚不合" && selectedUnits.value.length > 0 ? {
        aW: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aX: activeScheme.value === "千百不合" && selectedUnits.value.length > 0
      }, activeScheme.value === "千百不合" && selectedUnits.value.length > 0 ? {
        aY: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        aZ: activeScheme.value === "千十不合" && selectedUnits.value.length > 0
      }, activeScheme.value === "千十不合" && selectedUnits.value.length > 0 ? {
        ba: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        bb: activeScheme.value === "百个不合" && selectedUnits.value.length > 0
      }, activeScheme.value === "百个不合" && selectedUnits.value.length > 0 ? {
        bc: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        bd: activeScheme.value === "十个不合" && selectedUnits.value.length > 0
      }, activeScheme.value === "十个不合" && selectedUnits.value.length > 0 ? {
        be: common_vendor.t(selectedUnits.value.join(""))
      } : {}, {
        bf: activeScheme.value === "头尾合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0)
      }, activeScheme.value === "头尾合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0) ? {
        bg: common_vendor.t(selectedThousands.value.join("") + selectedHundreds.value.join("") + selectedTens.value.join("") + selectedUnits.value.join("") || "未选择")
      } : {}, {
        bh: activeScheme.value === "头尾合" && ((_u = schemeData.value[activeScheme.value]) == null ? void 0 : _u.mainAttack)
      }, activeScheme.value === "头尾合" && ((_v = schemeData.value[activeScheme.value]) == null ? void 0 : _v.mainAttack) ? {
        bi: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        bj: activeScheme.value === "头尾合" && ((_w = schemeData.value[activeScheme.value]) == null ? void 0 : _w.keyPoint)
      }, activeScheme.value === "头尾合" && ((_x = schemeData.value[activeScheme.value]) == null ? void 0 : _x.keyPoint) ? {
        bk: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        bl: activeScheme.value === "中肚合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0)
      }, activeScheme.value === "中肚合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0) ? {
        bm: common_vendor.t(selectedThousands.value.join("") + selectedHundreds.value.join("") + selectedTens.value.join("") + selectedUnits.value.join("") || "未选择")
      } : {}, {
        bn: activeScheme.value === "中肚合" && ((_y = schemeData.value[activeScheme.value]) == null ? void 0 : _y.mainAttack)
      }, activeScheme.value === "中肚合" && ((_z = schemeData.value[activeScheme.value]) == null ? void 0 : _z.mainAttack) ? {
        bo: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        bp: activeScheme.value === "中肚合" && ((_A = schemeData.value[activeScheme.value]) == null ? void 0 : _A.keyPoint)
      }, activeScheme.value === "中肚合" && ((_B = schemeData.value[activeScheme.value]) == null ? void 0 : _B.keyPoint) ? {
        bq: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        br: activeScheme.value === "千百合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0)
      }, activeScheme.value === "千百合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0) ? {
        bs: common_vendor.t(selectedThousands.value.join("") + selectedHundreds.value.join("") + selectedTens.value.join("") + selectedUnits.value.join("") || "未选择")
      } : {}, {
        bt: activeScheme.value === "千百合" && ((_C = schemeData.value[activeScheme.value]) == null ? void 0 : _C.mainAttack)
      }, activeScheme.value === "千百合" && ((_D = schemeData.value[activeScheme.value]) == null ? void 0 : _D.mainAttack) ? {
        bv: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        bw: activeScheme.value === "千百合" && ((_E = schemeData.value[activeScheme.value]) == null ? void 0 : _E.keyPoint)
      }, activeScheme.value === "千百合" && ((_F = schemeData.value[activeScheme.value]) == null ? void 0 : _F.keyPoint) ? {
        bx: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        by: activeScheme.value === "千十合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0)
      }, activeScheme.value === "千十合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0) ? {
        bz: common_vendor.t(selectedThousands.value.join("") + selectedHundreds.value.join("") + selectedTens.value.join("") + selectedUnits.value.join("") || "未选择")
      } : {}, {
        bA: activeScheme.value === "千十合" && ((_G = schemeData.value[activeScheme.value]) == null ? void 0 : _G.mainAttack)
      }, activeScheme.value === "千十合" && ((_H = schemeData.value[activeScheme.value]) == null ? void 0 : _H.mainAttack) ? {
        bB: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        bC: activeScheme.value === "千十合" && ((_I = schemeData.value[activeScheme.value]) == null ? void 0 : _I.keyPoint)
      }, activeScheme.value === "千十合" && ((_J = schemeData.value[activeScheme.value]) == null ? void 0 : _J.keyPoint) ? {
        bD: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        bE: activeScheme.value === "百个合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0)
      }, activeScheme.value === "百个合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0) ? {
        bF: common_vendor.t(selectedThousands.value.join("") + selectedHundreds.value.join("") + selectedTens.value.join("") + selectedUnits.value.join("") || "未选择")
      } : {}, {
        bG: activeScheme.value === "百个合" && ((_K = schemeData.value[activeScheme.value]) == null ? void 0 : _K.mainAttack)
      }, activeScheme.value === "百个合" && ((_L = schemeData.value[activeScheme.value]) == null ? void 0 : _L.mainAttack) ? {
        bH: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        bI: activeScheme.value === "百个合" && ((_M = schemeData.value[activeScheme.value]) == null ? void 0 : _M.keyPoint)
      }, activeScheme.value === "百个合" && ((_N = schemeData.value[activeScheme.value]) == null ? void 0 : _N.keyPoint) ? {
        bJ: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        bK: activeScheme.value === "十个合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0)
      }, activeScheme.value === "十个合" && (selectedThousands.value.length > 0 || selectedHundreds.value.length > 0 || selectedTens.value.length > 0 || selectedUnits.value.length > 0) ? {
        bL: common_vendor.t(selectedThousands.value.join("") + selectedHundreds.value.join("") + selectedTens.value.join("") + selectedUnits.value.join("") || "未选择")
      } : {}, {
        bM: activeScheme.value === "十个合" && ((_O = schemeData.value[activeScheme.value]) == null ? void 0 : _O.mainAttack)
      }, activeScheme.value === "十个合" && ((_P = schemeData.value[activeScheme.value]) == null ? void 0 : _P.mainAttack) ? {
        bN: common_vendor.t(schemeData.value[activeScheme.value].mainAttack.join(""))
      } : {}, {
        bO: activeScheme.value === "十个合" && ((_Q = schemeData.value[activeScheme.value]) == null ? void 0 : _Q.keyPoint)
      }, activeScheme.value === "十个合" && ((_R = schemeData.value[activeScheme.value]) == null ? void 0 : _R.keyPoint) ? {
        bP: common_vendor.t(schemeData.value[activeScheme.value].keyPoint.join(""))
      } : {}, {
        bQ: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("hundreds")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("hundreds") ? {
        bR: common_vendor.t(selectedHundreds.value.join("") || "未选择")
      } : {}, {
        bS: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("hundreds") && ((_S = schemeData.value[activeScheme.value]) == null ? void 0 : _S.hundredsMainAttack)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("hundreds") && ((_T = schemeData.value[activeScheme.value]) == null ? void 0 : _T.hundredsMainAttack) ? {
        bT: common_vendor.t(schemeData.value[activeScheme.value].hundredsMainAttack.join(""))
      } : {}, {
        bU: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("hundreds") && ((_U = schemeData.value[activeScheme.value]) == null ? void 0 : _U.hundredsKeyPoint)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("hundreds") && ((_V = schemeData.value[activeScheme.value]) == null ? void 0 : _V.hundredsKeyPoint) ? {
        bV: common_vendor.t(schemeData.value[activeScheme.value].hundredsKeyPoint.join(""))
      } : {}, {
        bW: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("tens")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("tens") ? {
        bX: common_vendor.t(selectedTens.value.join("") || "未选择")
      } : {}, {
        bY: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("tens") && ((_W = schemeData.value[activeScheme.value]) == null ? void 0 : _W.tensMainAttack)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("tens") && ((_X = schemeData.value[activeScheme.value]) == null ? void 0 : _X.tensMainAttack) ? {
        bZ: common_vendor.t(schemeData.value[activeScheme.value].tensMainAttack.join(""))
      } : {}, {
        ca: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("tens") && ((_Y = schemeData.value[activeScheme.value]) == null ? void 0 : _Y.tensKeyPoint)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("tens") && ((_Z = schemeData.value[activeScheme.value]) == null ? void 0 : _Z.tensKeyPoint) ? {
        cb: common_vendor.t(schemeData.value[activeScheme.value].tensKeyPoint.join(""))
      } : {}, {
        cc: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("units")
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("units") ? {
        cd: common_vendor.t(selectedUnits.value.join("") || "未选择")
      } : {}, {
        ce: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("units") && ((__ = schemeData.value[activeScheme.value]) == null ? void 0 : __.unitsMainAttack)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("units") && ((_$ = schemeData.value[activeScheme.value]) == null ? void 0 : _$.unitsMainAttack) ? {
        cf: common_vendor.t(schemeData.value[activeScheme.value].unitsMainAttack.join(""))
      } : {}, {
        cg: activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("units") && ((_aa = schemeData.value[activeScheme.value]) == null ? void 0 : _aa.unitsKeyPoint)
      }, activeScheme.value !== "二字现" && activeScheme.value !== "三字现" && activeScheme.value !== "定头" && activeScheme.value !== "定百" && activeScheme.value !== "定十" && activeScheme.value !== "定尾" && activeScheme.value !== "杀头" && activeScheme.value !== "杀百" && activeScheme.value !== "杀十" && activeScheme.value !== "杀尾" && activeScheme.value !== "稳码" && activeScheme.value !== "死数" && activeScheme.value !== "头尾不合" && activeScheme.value !== "中肚不合" && activeScheme.value !== "千百不合" && activeScheme.value !== "千十不合" && activeScheme.value !== "百个不合" && activeScheme.value !== "十个不合" && activeScheme.value !== "头尾合" && activeScheme.value !== "中肚合" && activeScheme.value !== "千百合" && activeScheme.value !== "千十合" && activeScheme.value !== "百个合" && activeScheme.value !== "十个合" && currentSchemeDigits.value.includes("units") && ((_ba = schemeData.value[activeScheme.value]) == null ? void 0 : _ba.unitsKeyPoint) ? {
        ch: common_vendor.t(schemeData.value[activeScheme.value].unitsKeyPoint.join(""))
      } : {}, {
        ci: common_vendor.o(clearScheme),
        cj: common_vendor.o(addScheme),
        ck: common_vendor.t(publishButtonText.value),
        cl: common_vendor.o(goToPublish),
        cm: showSaveDialog.value
      }, showSaveDialog.value ? {
        cn: common_vendor.t(currentSchemeName.value),
        co: common_vendor.o(dontSaveScheme),
        cp: common_vendor.o(saveScheme),
        cq: common_vendor.o(() => {
        }),
        cr: common_vendor.o(dontSaveScheme)
      } : {}, {
        cs: showMainAttackDialog.value
      }, showMainAttackDialog.value ? {
        ct: common_vendor.t(getMainAttackTitle()),
        cv: common_vendor.f(mainAttackNumbers.value, (num, k0, i0) => {
          return {
            a: common_vendor.t(num),
            b: isMainAttackSelected(num) ? 1 : "",
            c: num,
            d: common_vendor.o(($event) => toggleMainAttackNumber(num), num)
          };
        }),
        cw: common_vendor.o(hideMainAttack),
        cx: common_vendor.o(confirmMainAttack),
        cy: common_vendor.o(() => {
        }),
        cz: common_vendor.o(hideMainAttack)
      } : {}, {
        cA: showKeyPointDialog.value
      }, showKeyPointDialog.value ? {
        cB: common_vendor.t(getMainAttackTitle()),
        cC: common_vendor.f(keyPointNumbers.value, (num, k0, i0) => {
          return {
            a: common_vendor.t(num),
            b: isKeyPointSelected(num) ? 1 : "",
            c: num,
            d: common_vendor.o(($event) => toggleKeyPointNumber(num), num)
          };
        }),
        cD: common_vendor.o(hideKeyPoint),
        cE: common_vendor.o(confirmKeyPoint),
        cF: common_vendor.o(() => {
        }),
        cG: common_vendor.o(hideKeyPoint)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83f89747"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/predict-scheme/predict-scheme.js.map
