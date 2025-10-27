"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
const _sfc_main = {
  __name: "predict-publish",
  setup(__props) {
    const schemes = common_vendor.ref([]);
    const postId = common_vendor.ref("");
    const isAppending = common_vendor.ref(false);
    common_vendor.ref("");
    const isAppendMode = common_vendor.ref(false);
    const lotteryType = common_vendor.ref(null);
    const issueInfo = common_vendor.ref({
      id: null,
      number: null,
      status: "待开奖",
      time: "今天 21:30"
    });
    const getSchemeDisplayData = (scheme) => {
      const data = scheme.data;
      const result = [];
      if (scheme.id === "二字现" || scheme.id === "三字现") {
        if (data.combinations && data.combinations.length > 0) {
          result.push(data.combinations.join(","));
        } else {
          result.push("未选择");
        }
      } else {
        if (data.thousands && data.thousands.length > 0) {
          let thousandsInfo = `千位: ${data.thousands.join("")}`;
          if (data.thousandsMainAttack && data.thousandsMainAttack.length > 0) {
            thousandsInfo += ` 主攻${data.thousandsMainAttack.join("")}`;
          }
          if (data.thousandsKeyPoint && data.thousandsKeyPoint.length > 0) {
            thousandsInfo += ` 重点${data.thousandsKeyPoint.join("")}`;
          }
          result.push(thousandsInfo);
        }
        if (data.hundreds && data.hundreds.length > 0) {
          let hundredsInfo = `百位: ${data.hundreds.join("")}`;
          if (data.hundredsMainAttack && data.hundredsMainAttack.length > 0) {
            hundredsInfo += ` 主攻${data.hundredsMainAttack.join("")}`;
          }
          if (data.hundredsKeyPoint && data.hundredsKeyPoint.length > 0) {
            hundredsInfo += ` 重点${data.hundredsKeyPoint.join("")}`;
          }
          result.push(hundredsInfo);
        }
        if (data.tens && data.tens.length > 0) {
          let tensInfo = `十位: ${data.tens.join("")}`;
          if (data.tensMainAttack && data.tensMainAttack.length > 0) {
            tensInfo += ` 主攻${data.tensMainAttack.join("")}`;
          }
          if (data.tensKeyPoint && data.tensKeyPoint.length > 0) {
            tensInfo += ` 重点${data.tensKeyPoint.join("")}`;
          }
          result.push(tensInfo);
        }
        if (data.units && data.units.length > 0) {
          let unitsInfo = `个位: ${data.units.join("")}`;
          if (data.unitsMainAttack && data.unitsMainAttack.length > 0) {
            unitsInfo += ` 主攻${data.unitsMainAttack.join("")}`;
          }
          if (data.unitsKeyPoint && data.unitsKeyPoint.length > 0) {
            unitsInfo += ` 重点${data.unitsKeyPoint.join("")}`;
          }
          result.push(unitsInfo);
        }
        if (result.length === 0) {
          result.push("未选择");
        }
      }
      return result;
    };
    const modifyScheme = () => {
      common_vendor.index.navigateBack({
        delta: 1,
        // 通过事件总线或全局状态传递数据
        success: () => {
          common_vendor.index.$emit("modifySchemes", schemes.value);
        }
      });
    };
    const publishScheme = async () => {
      common_vendor.index.showModal({
        title: "确认发布",
        content: "确定要发布这些方案吗？发布后将无法修改或删除。",
        success: async (res) => {
          if (res.confirm) {
            await handlePublish();
          }
        }
      });
    };
    const handleAppendPost = async () => {
      if (!postId.value) {
        common_vendor.index.showToast({
          title: "帖子ID缺失",
          icon: "none"
        });
        return;
      }
      try {
        isAppending.value = true;
        common_vendor.index.showLoading({
          title: "追加中..."
        });
        const appendText = await generateAppendContent();
        const response = await api_apis.apiPostUpdate({
          id: postId.value,
          content: appendText
        });
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "追加成功",
            icon: "success"
          });
          common_vendor.index.removeStorageSync("appendPostData");
          common_vendor.index.removeStorageSync("currentAppendPostData");
          common_vendor.index.removeStorageSync("appendModeTipShown");
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/forum/forum"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: response.msg || "追加失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "追加失败，请重试",
          icon: "none"
        });
      } finally {
        isAppending.value = false;
      }
    };
    const generateAppendContent = async () => {
      var _a;
      try {
        let originalContent = "";
        if (postId.value) {
          try {
            const response = await api_apis.apiPostListQuery({
              page: 1,
              size: 50,
              tname: ((_a = currentLotteryType.value) == null ? void 0 : _a.name) || "预测方案"
            });
            if (response.code === 200 && response.data && response.data.records && Array.isArray(response.data.records)) {
              const targetPost = response.data.records.find((post) => post.id == postId.value);
              if (targetPost) {
                originalContent = targetPost.content || "";
              }
            }
          } catch (error) {
            const appendData = common_vendor.index.getStorageSync("currentAppendPostData");
            if (appendData && appendData.postContent) {
              originalContent = appendData.postContent;
            }
          }
        }
        let appendContent = "\n\n--- 追加内容 ---\n";
        appendContent += `追加时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`;
        if (schemes.value.length > 0) {
          appendContent += "\n追加方案:\n";
          schemes.value.forEach((scheme, index) => {
            appendContent += `${index + 1}. [${scheme.id}]
`;
            const displayData = getSchemeDisplayData(scheme);
            displayData.forEach((info) => {
              appendContent += `   ${info}
`;
            });
          });
        } else {
          appendContent += "\n追加内容: 方案数据\n";
        }
        const finalContent = originalContent + appendContent;
        return finalContent;
      } catch (error) {
        let appendContent = "\n\n--- 追加内容 ---\n";
        appendContent += `追加时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}
`;
        if (schemes.value.length > 0) {
          appendContent += "\n追加方案:\n";
          schemes.value.forEach((scheme, index) => {
            appendContent += `${index + 1}. [${scheme.id}]
`;
            const displayData = getSchemeDisplayData(scheme);
            displayData.forEach((info) => {
              appendContent += `   ${info}
`;
            });
          });
        }
        return appendContent;
      }
    };
    const handlePublish = async () => {
      try {
        common_vendor.index.showLoading({
          title: "发布中..."
        });
        const postData = {
          tname: lotteryType.value ? lotteryType.value.name : "预测方案",
          // 彩票名称
          issueno: getIssueNumber(),
          // 期号 - 使用统一的期号获取函数
          content: generatePostContent(),
          // 发帖内容
          account: utils_request.getAccount() || "",
          // 账号
          pimg: "",
          // 预测帖不需要图片
          flag: true
          // 无需审核
        };
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:468", "发帖数据:", postData);
        const response = await api_apis.apiPost(postData);
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          if (response.data && response.data.id) {
            postId.value = response.data.id;
            common_vendor.index.setStorageSync("currentPostId", response.data.id);
            savePublishedSchemeData(response.data.id);
          }
          common_vendor.index.showToast({
            title: "发布成功",
            icon: "success"
          });
          common_vendor.index.removeStorageSync("predict_schemes_data");
          setTimeout(() => {
            common_vendor.index.reLaunch({
              url: "/pages/forum/forum"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: response.msg || "发布失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "发布失败，请重试",
          icon: "none"
        });
      }
    };
    const getIssueNumber = () => {
      return issueInfo.value.number || issueInfo.value.id || "--";
    };
    const loadIssueInfo = async () => {
      try {
        if (!lotteryType.value || !lotteryType.value.id) {
          return;
        }
        common_vendor.index.showLoading({ title: "加载期号中..." });
        const response = await api_apis.apiGetIssueNo({ cpid: lotteryType.value.id });
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
          issueInfo.value = {
            id: issueNumber,
            number: issueNumber,
            status: issueStatus,
            time: issueTime
          };
          common_vendor.index.showToast({ title: `期号加载成功: ${issueNumber}`, icon: "success" });
        } else {
          common_vendor.index.showToast({ title: "期号数据为空", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "期号加载异常", icon: "none" });
      }
    };
    const loadSchemeForAppend = async (schemeId) => {
      try {
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:566", "=== 加载追帖方案数据 ===");
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:567", "方案ID:", schemeId);
        const today = (/* @__PURE__ */ new Date()).toDateString();
        const publishedPosts = common_vendor.index.getStorageSync(`publishedPosts_${today}`) || {};
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:572", "已发布的帖子映射:", publishedPosts);
        const schemePostId = publishedPosts[schemeId];
        if (schemePostId) {
          postId.value = schemePostId;
          common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:578", `加载方案 ${schemeId} 对应的帖子ID:`, schemePostId);
          await loadPostDetails(schemePostId);
        } else {
          common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:583", `未找到方案 ${schemeId} 对应的帖子ID`);
          await loadUserPublishedPosts(schemeId);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-publish/predict-publish.vue:590", "加载追帖方案数据失败:", error);
      }
    };
    const loadPostDetails = async (postId2) => {
      try {
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:597", "=== 获取帖子详细信息 ===");
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:598", "帖子ID:", postId2);
        const response = await api_apis.apiPostListQuery({
          page: 1,
          size: 1,
          id: postId2
        });
        if (response.code === 200 && response.data && response.data.records && response.data.records.length > 0) {
          const post = response.data.records[0];
          common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:609", "帖子详情:", post);
          if (post.content) {
            parseSchemeFromPostContent(post.content);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-publish/predict-publish.vue:618", "获取帖子详情失败:", error);
      }
    };
    const loadUserPublishedPosts = async (schemeId) => {
      try {
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:625", "=== 获取用户已发布帖子 ===");
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:626", "方案ID:", schemeId);
        const response = await api_apis.apiPostListQuery({
          page: 1,
          size: 20,
          account: common_vendor.index.getStorageSync("account") || ""
        });
        if (response.code === 200 && response.data && response.data.records) {
          const targetPost = response.data.records.find(
            (post) => post.content && post.content.includes(schemeId)
          );
          if (targetPost) {
            postId.value = targetPost.id;
            common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:642", `找到方案 ${schemeId} 对应的帖子:`, targetPost.id);
            parseSchemeFromPostContent(targetPost.content);
          } else {
            common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:647", `未找到包含方案 ${schemeId} 的帖子`);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-publish/predict-publish.vue:652", "获取用户已发布帖子失败:", error);
      }
    };
    const parseSchemeFromPostContent = (content) => {
      try {
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:659", "=== 解析帖子内容 ===");
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:660", "帖子内容:", content);
        const savedSchemesData = common_vendor.index.getStorageSync("predict_schemes_data");
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:665", "本地存储的方案数据:", savedSchemesData);
        if (savedSchemesData && savedSchemesData.schemeData) {
          const schemeKeys = Object.keys(savedSchemesData.schemeData);
          const matchingScheme = schemeKeys.find((key) => content.includes(key));
          if (matchingScheme) {
            const schemeData = savedSchemesData.schemeData[matchingScheme];
            const schemeObj = {
              id: matchingScheme,
              name: matchingScheme,
              data: schemeData
            };
            schemes.value = [schemeObj];
            common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:680", "解析出的方案数据:", schemeObj);
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-publish/predict-publish.vue:685", "解析帖子内容失败:", error);
      }
    };
    const savePublishedSchemeData = (postId2) => {
      try {
        const today = (/* @__PURE__ */ new Date()).toDateString();
        const publishedSchemes = common_vendor.index.getStorageSync(`publishedSchemes_${today}`) || [];
        const publishedPosts = common_vendor.index.getStorageSync(`publishedPosts_${today}`) || {};
        schemes.value.forEach((scheme) => {
          const schemeId = scheme.id;
          if (!publishedSchemes.includes(schemeId)) {
            publishedSchemes.push(schemeId);
          }
          publishedPosts[schemeId] = postId2;
        });
        common_vendor.index.setStorageSync(`publishedSchemes_${today}`, publishedSchemes);
        common_vendor.index.setStorageSync(`publishedPosts_${today}`, publishedPosts);
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:717", "已保存发布数据:", {
          publishedSchemes,
          publishedPosts,
          postId: postId2
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/predict-publish/predict-publish.vue:724", "保存已发布方案数据失败:", error);
      }
    };
    const generatePostContent = () => {
      if (schemes.value.length === 0) {
        return "暂无方案数据";
      }
      let content = "【预测方案】\n\n";
      schemes.value.forEach((scheme, index) => {
        content += `${index + 1}. ${scheme.name} (${scheme.id})
`;
        const displayData = getSchemeDisplayData(scheme);
        displayData.forEach((info) => {
          content += `   ${info}
`;
        });
        content += "\n";
      });
      content += `期号: 第${getIssueNumber()}期
`;
      content += `发布时间: ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
      return content;
    };
    const goBack = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "返回会清空内容,确定返回吗?",
        confirmText: "确定",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.removeStorageSync("predict_schemes_data");
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/predict-publish/predict-publish.vue:766", "清除本地存储失败:", error);
            }
            common_vendor.index.reLaunch({
              url: "/pages/forum/forum"
            });
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:786", "=== 页面加载调试信息 ===");
      common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:787", "页面参数:", options);
      if (options.postId) {
        postId.value = options.postId;
        common_vendor.index.setStorageSync("currentPostId", options.postId);
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:793", "接收到帖子ID，进入追帖模式:", options.postId);
        isAppendMode.value = true;
        common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:797", "追帖模式已设置:", isAppendMode.value);
        if (options.schemeId) {
          common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:801", "加载方案数据:", options.schemeId);
          loadSchemeForAppend(options.schemeId);
        }
      } else {
        const savedPostId = common_vendor.index.getStorageSync("currentPostId");
        if (savedPostId) {
          const appendData = common_vendor.index.getStorageSync("appendPostData");
          if (appendData && appendData.postId === savedPostId) {
            postId.value = savedPostId;
            isAppendMode.value = true;
            common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:813", "从本地存储恢复追帖模式:", savedPostId);
          } else {
            common_vendor.index.removeStorageSync("currentPostId");
            common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:817", "清除残留的帖子ID，确保新帖模式");
          }
        }
      }
      common_vendor.index.__f__("log", "at pages/predict-publish/predict-publish.vue:822", "最终状态 - 帖子ID:", postId.value, "追帖模式:", isAppendMode.value);
      if (options.data) {
        try {
          const publishData = JSON.parse(decodeURIComponent(options.data));
          schemes.value = publishData.schemes || [];
          lotteryType.value = publishData.lotteryType || null;
          issueInfo.value = publishData.issueInfo || {
            id: null,
            number: null,
            status: "待开奖",
            time: "今天 21:30"
          };
          if (!issueInfo.value.number && !issueInfo.value.id) {
            loadIssueInfo();
          }
        } catch (error) {
          common_vendor.index.showToast({
            title: "数据解析失败",
            icon: "none"
          });
        }
      } else if (options.schemes) {
        try {
          const decodedSchemes = decodeURIComponent(options.schemes);
          schemes.value = JSON.parse(decodedSchemes);
        } catch (error) {
          common_vendor.index.showToast({
            title: "数据解析失败",
            icon: "none"
          });
        }
      } else {
        schemes.value = [];
        common_vendor.index.showToast({
          title: "没有方案数据",
          icon: "none"
        });
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.f(schemes.value, (scheme, index, i0) => {
          return {
            a: common_vendor.t(scheme.name),
            b: common_vendor.t(scheme.id),
            c: common_vendor.f(getSchemeDisplayData(scheme), (info, index2, i1) => {
              return {
                a: common_vendor.t(info),
                b: index2
              };
            }),
            d: index
          };
        }),
        c: schemes.value.length === 0
      }, schemes.value.length === 0 ? {} : {}, {
        d: common_vendor.t(lotteryType.value ? lotteryType.value.name : "彩票类型"),
        e: common_vendor.t(getIssueNumber()),
        f: common_vendor.t(issueInfo.value.status),
        g: postId.value || isAppendMode.value
      }, postId.value || isAppendMode.value ? {
        h: common_vendor.t(postId.value),
        i: common_vendor.t(isAppending.value ? "追加中..." : "追加发帖"),
        j: isAppending.value ? 1 : "",
        k: common_vendor.o(handleAppendPost)
      } : {}, {
        l: !isAppendMode.value
      }, !isAppendMode.value ? {
        m: common_vendor.o(modifyScheme),
        n: common_vendor.o(publishScheme)
      } : {}, {
        o: isAppendMode.value
      }, isAppendMode.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e8a47ea3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/predict-publish/predict-publish.js.map
