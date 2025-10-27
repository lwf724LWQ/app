"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_apis = require("../../../api/apis.js");
const pages_juWang_drawLine_useFunc_useTableData = require("./useFunc/useTableData.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "drawLineRead",
  setup(__props) {
    const classifyList = common_vendor.ref([]);
    function convertNumStrToArray(numStr) {
      if (!numStr || typeof numStr !== "string")
        return [];
      return numStr.trim().split(/\s+/).filter((item) => item !== "").map((item) => Number(item)).slice(0, 5);
    }
    function calculateFirstFourSum(numArr) {
      if (!Array.isArray(numArr) || numArr.length < 4)
        return 0;
      return numArr.slice(0, 4).filter((item) => !isNaN(item) && typeof item === "number").reduce((sum, curr) => sum + curr, 0);
    }
    const noData = common_vendor.ref(false);
    const queryParams = {
      page: 1,
      limit: 20,
      tname: "排列五"
    };
    const pageName = common_vendor.ref("");
    const formattedClassifyList = common_vendor.computed(() => {
      return classifyList.value.map((item) => ({
        qishu: item.qishu,
        numbers: [item.qishu2, ...item.numbers]
      }));
    });
    common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:158", formattedClassifyList);
    const tableData = pages_juWang_drawLine_useFunc_useTableData.useTableData();
    common_vendor.watch(formattedClassifyList, (newValue) => {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:164", "formattedClassifyList 发生变化:", newValue);
      if (newValue && newValue.length > 0) {
        common_vendor.nextTick$1(() => {
          if (tableData && typeof tableData.updateNumberGroups === "function") {
            common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:169", "调用 updateNumberGroups");
            tableData.updateNumberGroups(newValue);
          } else {
            common_vendor.index.__f__("error", "at pages/juWang/drawLine/drawLineRead.vue:172", "updateNumberGroups 函数不存在");
          }
        });
      }
    }, {
      deep: true,
      immediate: true
    });
    common_vendor.onLoad((e) => {
      let {
        name = null
      } = e;
      if (name)
        queryParams.tname = name;
      pageName.value = name;
      getClassList();
    });
    common_vendor.onPullDownRefresh(() => {
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:194", "onPullDownRefresh");
      if (noData.value)
        return;
      queryParams.page++;
      getClassList();
    });
    const getClassList = async () => {
      common_vendor.index.showLoading({
        title: "加载中...",
        mask: true
        // 开启遮罩，防止点击穿透
      });
      let res = await api_apis.apiTicketQuery(queryParams);
      let newData = res.data.records.map((group) => {
        return {
          ...group,
          qishu: Number(group.issueno),
          qishu2: calculateFirstFourSum(convertNumStrToArray(group.number)),
          numbers: convertNumStrToArray(group.number)
        };
      }) || [];
      let newDataSort = newData.sort((a, b) => {
        return Number(a.issueno) - Number(b.issueno);
      });
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:219", classifyList.value, "-----------------------------------------");
      classifyList.value = [...newDataSort, ...classifyList.value];
      await common_vendor.nextTick$1();
      common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:222", classifyList.value, "//这里是从网库中获取的数据");
      if (queryParams.limit > res.data.length)
        noData.value = true;
      common_vendor.index.hideLoading();
      common_vendor.index.stopPullDownRefresh();
      tableData.updateNumberGroups(formattedClassifyList.value);
      if (tableData && typeof tableData.updateNumberGroups === "function") {
        tableData.updateNumberGroups(formattedClassifyList.value);
      } else {
        common_vendor.index.__f__("error", "at pages/juWang/drawLine/drawLineRead.vue:233", "updateNumberGroups 函数不存在");
      }
      if (tableData && typeof tableData.updateNumberGroups === "function") {
        await common_vendor.nextTick$1();
        tableData.updateNumberGroups(formattedClassifyList.value);
      }
    };
    common_vendor.onUnload(() => {
    });
    const isPopoverShow = common_vendor.ref(false);
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
        // 返回的页面数
      });
    };
    const togglePopover = () => {
      isPopoverShow.value = !isPopoverShow.value;
    };
    const closePopover = () => {
      isPopoverShow.value = false;
    };
    const add4Empty = () => {
      const result = Array.from({
        length: 4
      }, () => ({
        qishu: "",
        qishu2: "",
        numbers: ["", "", "", "", ""]
      }));
      return result;
    };
    const handleMenuClick = (action) => {
      closePopover();
      switch (action) {
        case "draw":
          const result50 = classifyList.value.slice(-50);
          const result = [...result50, ...add4Empty()];
          common_vendor.index.setStorageSync("drawLineData", result);
          common_vendor.index.navigateTo({
            url: "/pages/juWang/drawLine/drawLine?name=排列5",
            events: {
              // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
              acceptDataFromOpenedPage: function(data) {
                common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:293", data);
              },
              someEvent: function(data) {
                common_vendor.index.__f__("log", "at pages/juWang/drawLine/drawLineRead.vue:296", data);
              }
            },
            success: function(res) {
              res.eventChannel.emit("acceptDataFromOpenerPage", {
                data: "data from starter page"
              });
            }
          });
          break;
      }
    };
    common_vendor.watch(classifyList, (newValue) => {
      if (tableData && typeof tableData.updateNumberGroups === "function") {
        tableData.updateNumberGroups(formattedClassifyList.value);
      }
    }, {
      deep: true
    });
    const isLoading = common_vendor.ref(false);
    const noMoreData = common_vendor.ref(false);
    common_vendor.onReachBottom(() => {
      if (isLoading.value || noMoreData.value)
        return;
      isLoading.value = true;
      ++queryParams.page;
      getClassList().then(() => {
        if (classifyList.value.length % queryParams.limit !== 0) {
          noMoreData.value = true;
        }
      }).catch((error) => {
        common_vendor.index.__f__("error", "at pages/juWang/drawLine/drawLineRead.vue:335", "加载更多数据失败:", error);
        queryParams.page--;
      }).finally(() => {
        isLoading.value = false;
      });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "30"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.o(togglePopover),
        d: common_vendor.p({
          type: "color-filled",
          size: "30"
        }),
        e: common_vendor.o(($event) => handleMenuClick("draw")),
        f: isPopoverShow.value ? 1 : "",
        g: common_vendor.o(() => {
        }),
        h: isPopoverShow.value
      }, isPopoverShow.value ? {
        i: common_vendor.o(closePopover)
      } : {}, {
        j: common_vendor.f(classifyList.value, (group, groupIndex, i0) => {
          return {
            a: common_vendor.t(group.qishu),
            b: common_vendor.t(group.qishu2),
            c: common_vendor.f(group.numbers, (num, numIndex, i1) => {
              return {
                a: common_vendor.t(num),
                b: numIndex,
                c: numIndex,
                d: common_vendor.n("col-" + (3 + numIndex))
              };
            }),
            d: groupIndex,
            e: group.qishu,
            f: group.qishu,
            g: groupIndex
          };
        }),
        k: isLoading.value
      }, isLoading.value ? {} : {}, {
        l: noMoreData.value && !isLoading.value
      }, noMoreData.value && !isLoading.value ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-74e8af97"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/drawLineRead.js.map
