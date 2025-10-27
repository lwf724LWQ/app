"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
const _sfc_main = {
  __name: "orders",
  setup(__props) {
    const searchKeyword = common_vendor.ref("");
    const isSearching = common_vendor.ref(false);
    const orders = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const hasMore = common_vendor.ref(true);
    const totalOrders = common_vendor.ref(0);
    const searchHistory = common_vendor.ref([]);
    const showCalendar = common_vendor.ref(false);
    const selectionMode = common_vendor.ref("month");
    const currentYear = common_vendor.ref(2025);
    const currentMonth = common_vendor.ref(9);
    const startDate = common_vendor.ref(null);
    const endDate = common_vendor.ref(null);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const selectedYear = common_vendor.ref(2023);
    const selectedMonth = common_vendor.ref(10);
    const yearScrollTop = common_vendor.ref(0);
    const monthScrollTop = common_vendor.ref(0);
    const touchStartY = common_vendor.ref(0);
    const touchStartX = common_vendor.ref(0);
    const isSwipeEnabled = common_vendor.ref(true);
    const filteredOrders = common_vendor.computed(() => {
      let result = orders.value;
      if (startDate.value && endDate.value) {
        result = result.filter((order) => {
          const orderTimeStr = order.updateTime || order.createTime;
          if (!orderTimeStr)
            return false;
          const orderDate = new Date(orderTimeStr);
          const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
          const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate());
          const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate());
          return orderDateOnly.getTime() >= startDateOnly.getTime() && orderDateOnly.getTime() <= endDateOnly.getTime();
        });
      } else {
        result = result.filter((order) => {
          const orderTimeStr = order.updateTime || order.createTime;
          if (!orderTimeStr)
            return false;
          const orderDate = new Date(orderTimeStr);
          return orderDate.getFullYear() === currentYear.value && orderDate.getMonth() + 1 === currentMonth.value;
        });
      }
      if (searchKeyword.value.trim()) {
        result = result.filter(
          (order) => order.orderNo.includes(searchKeyword.value) || order.info && order.info.includes(searchKeyword.value)
        );
      }
      return result;
    });
    const calendarDays = common_vendor.computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      const days = [];
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ date: "", isEmpty: true });
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const today = /* @__PURE__ */ new Date();
        const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
        const isStart = startDate.value && date.getTime() === startDate.value.getTime();
        const isEnd = endDate.value && date.getTime() === endDate.value.getTime();
        const isInRange = startDate.value && endDate.value && date.getTime() >= startDate.value.getTime() && date.getTime() <= endDate.value.getTime();
        days.push({
          date: day,
          fullDate: date,
          isStart,
          isEnd,
          isInRange,
          isToday,
          isEmpty: false
        });
      }
      return days;
    });
    const yearList = common_vendor.computed(() => {
      const currentYear2 = (/* @__PURE__ */ new Date()).getFullYear();
      const years = [];
      for (let year = currentYear2 - 5; year <= currentYear2 + 2; year++) {
        years.push(year);
      }
      return years;
    });
    const monthList = common_vendor.computed(() => {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    });
    const displayedDateText = common_vendor.computed(() => {
      if (selectionMode.value === "range" && startDate.value && endDate.value) {
        const startDateStr = formatDate(startDate.value);
        const endDateStr = formatDate(endDate.value);
        if (startDateStr === endDateStr) {
          return startDateStr;
        } else {
          return `${startDateStr} - ${endDateStr}`;
        }
      } else if (selectionMode.value === "range" && startDate.value) {
        return formatDate(startDate.value);
      } else {
        return `${currentYear.value}年${currentMonth.value}月`;
      }
    });
    common_vendor.computed(() => {
      return selectionMode.value === "range" && (startDate.value || endDate.value);
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const showMonthPicker = () => {
      showCalendar.value = true;
      selectedYear.value = currentYear.value;
      selectedMonth.value = currentMonth.value;
      if (selectionMode.value === "range") {
        if (!startDate.value) {
          startDate.value = new Date(2025, 8, 3);
        }
        if (!endDate.value) {
          endDate.value = new Date(2025, 9, 2);
        }
      }
    };
    const closeCalendar = () => {
      showCalendar.value = false;
    };
    const setSelectionMode = (mode) => {
      selectionMode.value = mode;
    };
    const selectDate = (day) => {
      if (day.isEmpty)
        return;
      if (selectionMode.value === "range") {
        if (!startDate.value || startDate.value && endDate.value) {
          startDate.value = day.fullDate;
          endDate.value = null;
        } else if (startDate.value && !endDate.value) {
          if (day.fullDate.getTime() >= startDate.value.getTime()) {
            endDate.value = day.fullDate;
          } else {
            endDate.value = startDate.value;
            startDate.value = day.fullDate;
          }
        }
      }
    };
    const getDayClass = (day) => {
      if (day.isEmpty)
        return "empty";
      if (day.isStart)
        return "start-date";
      if (day.isEnd)
        return "end-date";
      if (day.isInRange)
        return "in-range";
      return "normal";
    };
    const formatDate = (date) => {
      if (!date)
        return "";
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };
    const formatDateForAPI = (date) => {
      if (!date)
        return "";
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const confirmSelection = async () => {
      if (selectionMode.value === "month") {
        currentYear.value = selectedYear.value;
        currentMonth.value = selectedMonth.value;
        startDate.value = null;
        endDate.value = null;
      } else if (selectionMode.value === "range") {
        if (startDate.value && !endDate.value) {
          endDate.value = new Date(startDate.value);
        }
        if (startDate.value) {
          currentYear.value = startDate.value.getFullYear();
          currentMonth.value = startDate.value.getMonth() + 1;
        }
      }
      closeCalendar();
      currentPage.value = 1;
      await getOrders(true);
    };
    const selectYear = (year) => {
      selectedYear.value = year;
      const yearIndex = yearList.value.indexOf(year);
      yearScrollTop.value = yearIndex * 60;
    };
    const selectMonth = (month) => {
      selectedMonth.value = month;
      const monthIndex = monthList.value.indexOf(month);
      monthScrollTop.value = monthIndex * 60;
    };
    const previousMonth = () => {
      if (currentMonth.value === 1) {
        currentMonth.value = 12;
        currentYear.value -= 1;
      } else {
        currentMonth.value -= 1;
      }
    };
    const nextMonth = () => {
      if (currentMonth.value === 12) {
        currentMonth.value = 1;
        currentYear.value += 1;
      } else {
        currentMonth.value += 1;
      }
    };
    const showMonthYearPicker = () => {
      selectionMode.value = "month";
      selectedYear.value = currentYear.value;
      selectedMonth.value = currentMonth.value;
    };
    const handleTouchStart = (e) => {
      if (!isSwipeEnabled.value)
        return;
      const touch = e.touches[0];
      touchStartY.value = touch.clientY;
      touchStartX.value = touch.clientX;
    };
    const handleTouchMove = (e) => {
    };
    const handleTouchEnd = (e) => {
      if (!isSwipeEnabled.value)
        return;
      const touch = e.changedTouches[0];
      const deltaY = touch.clientY - touchStartY.value;
      const deltaX = touch.clientX - touchStartX.value;
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          previousMonth();
        } else {
          nextMonth();
        }
      }
    };
    const getOrders = async (isRefresh = false) => {
      var _a, _b, _c, _d, _e, _f;
      try {
        loading.value = true;
        const token = utils_request.getToken();
        const account = utils_request.getAccount();
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 1500);
          return;
        }
        if (!account) {
          const tokenAccount = token || "default_user";
          const queryParams2 = {
            account: tokenAccount,
            page: currentPage.value.toString(),
            limit: pageSize.value.toString()
          };
          if (searchKeyword.value.trim()) {
            queryParams2.orderNo = searchKeyword.value.trim();
          }
          if (startDate.value && endDate.value) {
            queryParams2.startDate = formatDateForAPI(startDate.value);
            queryParams2.endDate = formatDateForAPI(endDate.value);
          } else {
            queryParams2.year = currentYear.value.toString();
            queryParams2.month = currentMonth.value.toString();
          }
          const response2 = await api_apis.apiOrderQuery(queryParams2);
          if (response2.code === 200) {
            const newOrders = ((_a = response2.data) == null ? void 0 : _a.records) || [];
            if (isRefresh) {
              orders.value = newOrders;
              currentPage.value = 1;
            } else {
              if (currentPage.value === 1) {
                orders.value = newOrders;
              } else {
                orders.value = [...orders.value, ...newOrders];
              }
            }
            const totalPages = ((_b = response2.data) == null ? void 0 : _b.pages) || 1;
            hasMore.value = currentPage.value < totalPages;
            totalOrders.value = ((_c = response2.data) == null ? void 0 : _c.total) || 0;
          } else {
            common_vendor.index.showToast({
              title: response2.msg || "获取订单失败",
              icon: "none"
            });
          }
          loading.value = false;
          return;
        }
        const queryParams = {
          account,
          page: currentPage.value.toString(),
          limit: pageSize.value.toString()
        };
        if (searchKeyword.value.trim()) {
          queryParams.orderNo = searchKeyword.value.trim();
        }
        const response = await api_apis.apiOrderQuery(queryParams);
        if (response.code === 200) {
          const newOrders = ((_d = response.data) == null ? void 0 : _d.records) || [];
          if (isRefresh) {
            orders.value = newOrders;
            currentPage.value = 1;
          } else {
            if (currentPage.value === 1) {
              orders.value = newOrders;
            } else {
              orders.value = [...orders.value, ...newOrders];
            }
          }
          const totalPages = ((_e = response.data) == null ? void 0 : _e.pages) || 1;
          hasMore.value = currentPage.value < totalPages;
          totalOrders.value = ((_f = response.data) == null ? void 0 : _f.total) || 0;
        } else {
          common_vendor.index.showToast({
            title: response.msg || "获取订单失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    const getStatusText = (status) => {
      const statusMap = {
        0: "待支付",
        1: "已支付",
        2: "已取消",
        3: "已完成"
      };
      return statusMap[status] || "未知状态";
    };
    const getStatusClass = (status) => {
      const classMap = {
        0: "status-pending",
        1: "status-paid",
        2: "status-cancelled",
        3: "status-completed"
      };
      return classMap[status] || "status-unknown";
    };
    const viewOrderDetail = (order) => {
      common_vendor.index.showModal({
        title: "订单详情",
        content: `订单号：${order.orderNo}
金额：¥${order.amount}
状态：${getStatusText(order.status)}
时间：${formatTime(order.updateTime || order.createTime)}`,
        showCancel: false
      });
    };
    const focusSearch = () => {
      isSearching.value = true;
    };
    const handleSearchBlur = () => {
      setTimeout(() => {
        if (!searchKeyword.value.trim()) {
          isSearching.value = false;
        }
      }, 200);
    };
    const handleSearchInput = () => {
      common_vendor.index.__f__("log", "at pages/orders/orders.vue:790", "搜索关键词:", searchKeyword.value);
      if (!searchKeyword.value.trim()) {
        currentPage.value = 1;
        getOrders(true);
      }
    };
    const clearSearch = () => {
      searchKeyword.value = "";
      isSearching.value = false;
      currentPage.value = 1;
      getOrders(true);
    };
    const performSearch = async () => {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入订单号",
          icon: "none"
        });
        return;
      }
      addToSearchHistory(searchKeyword.value.trim());
      common_vendor.index.__f__("log", "at pages/orders/orders.vue:822", "执行订单搜索:", searchKeyword.value.trim());
      currentPage.value = 1;
      await getOrders(true);
    };
    const addToSearchHistory = (keyword) => {
      if (!keyword || keyword.length < 3)
        return;
      const index = searchHistory.value.indexOf(keyword);
      if (index > -1) {
        searchHistory.value.splice(index, 1);
      }
      searchHistory.value.unshift(keyword);
      if (searchHistory.value.length > 5) {
        searchHistory.value = searchHistory.value.slice(0, 5);
      }
      common_vendor.index.setStorageSync("orderSearchHistory", searchHistory.value);
    };
    const loadSearchHistory = () => {
      try {
        const history = common_vendor.index.getStorageSync("orderSearchHistory");
        if (history && Array.isArray(history)) {
          searchHistory.value = history;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/orders/orders.vue:857", "加载搜索历史失败:", error);
      }
    };
    const selectSuggestion = (keyword) => {
      searchKeyword.value = keyword;
      performSearch();
    };
    const loadMoreOrders = async () => {
      if (!hasMore.value || loading.value)
        return;
      currentPage.value++;
      await getOrders(false);
    };
    common_vendor.onMounted(async () => {
      const token = utils_request.getToken();
      const account = utils_request.getAccount();
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 1500);
      } else if (!account) {
        common_vendor.index.showToast({
          title: "用户信息异常，请重新登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 1500);
      } else {
        loadSearchHistory();
        await getOrders();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: isSearching.value
      }, isSearching.value ? {
        c: common_vendor.o(handleSearchBlur),
        d: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, handleSearchInput]),
        e: common_vendor.o(performSearch),
        f: isSearching.value,
        g: searchKeyword.value
      } : {}, {
        h: isSearching.value && searchKeyword.value
      }, isSearching.value && searchKeyword.value ? {
        i: common_vendor.o(clearSearch)
      } : {}, {
        j: isSearching.value
      }, isSearching.value ? {
        k: common_vendor.o(performSearch)
      } : {}, {
        l: common_vendor.o(focusSearch),
        m: isSearching.value && searchHistory.value.length > 0 && !searchKeyword.value
      }, isSearching.value && searchHistory.value.length > 0 && !searchKeyword.value ? {
        n: common_vendor.f(searchHistory.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item),
            b: index,
            c: common_vendor.o(($event) => selectSuggestion(item), index)
          };
        })
      } : {}, {
        o: common_vendor.t(displayedDateText.value),
        p: common_vendor.o(showMonthPicker),
        q: orders.value.length > 0
      }, orders.value.length > 0 ? common_vendor.e({
        r: searchKeyword.value.trim()
      }, searchKeyword.value.trim() ? {
        s: common_vendor.t(searchKeyword.value),
        t: common_vendor.t(filteredOrders.value.length)
      } : startDate.value && endDate.value ? common_vendor.e({
        w: formatDate(startDate.value) === formatDate(endDate.value)
      }, formatDate(startDate.value) === formatDate(endDate.value) ? {
        x: common_vendor.t(formatDate(startDate.value)),
        y: common_vendor.t(filteredOrders.value.length)
      } : {
        z: common_vendor.t(formatDate(startDate.value)),
        A: common_vendor.t(formatDate(endDate.value)),
        B: common_vendor.t(filteredOrders.value.length)
      }) : {
        C: common_vendor.t(currentYear.value),
        D: common_vendor.t(currentMonth.value),
        E: common_vendor.t(filteredOrders.value.length)
      }, {
        v: startDate.value && endDate.value
      }) : {}, {
        F: orders.value.length > 0
      }, orders.value.length > 0 ? {
        G: common_vendor.f(filteredOrders.value, (order, k0, i0) => {
          return {
            a: common_vendor.t(order.orderNo),
            b: common_vendor.t(formatTime(order.updateTime || order.createTime)),
            c: common_vendor.t(getStatusText(order.status)),
            d: common_vendor.n(getStatusClass(order.status)),
            e: common_vendor.t(order.info || "订单详情"),
            f: common_vendor.t(order.amount),
            g: order.orderNo,
            h: common_vendor.o(($event) => viewOrderDetail(order), order.orderNo)
          };
        })
      } : !loading.value ? common_vendor.e({
        I: searchKeyword.value.trim()
      }, searchKeyword.value.trim() ? {} : startDate.value && endDate.value ? common_vendor.e({
        K: formatDate(startDate.value) === formatDate(endDate.value)
      }, formatDate(startDate.value) === formatDate(endDate.value) ? {} : {}) : {}, {
        J: startDate.value && endDate.value,
        L: searchKeyword.value.trim()
      }, searchKeyword.value.trim() ? {} : startDate.value && endDate.value ? common_vendor.e({
        N: formatDate(startDate.value) === formatDate(endDate.value)
      }, formatDate(startDate.value) === formatDate(endDate.value) ? {} : {}) : {}, {
        M: startDate.value && endDate.value
      }) : {}, {
        H: !loading.value,
        O: orders.value.length > 0 && hasMore.value
      }, orders.value.length > 0 && hasMore.value ? {
        P: common_vendor.t(loading.value ? "加载中..." : "加载更多"),
        Q: common_vendor.o(loadMoreOrders),
        R: loading.value
      } : {}, {
        S: loading.value && orders.value.length === 0
      }, loading.value && orders.value.length === 0 ? {} : {}, {
        T: showCalendar.value
      }, showCalendar.value ? common_vendor.e({
        U: common_vendor.o(closeCalendar),
        V: selectionMode.value === "month" ? 1 : "",
        W: common_vendor.o(($event) => setSelectionMode("month")),
        X: selectionMode.value === "range" ? 1 : "",
        Y: common_vendor.o(($event) => setSelectionMode("range")),
        Z: selectionMode.value === "range"
      }, selectionMode.value === "range" ? {
        aa: common_vendor.t(startDate.value ? formatDate(startDate.value) : "请选择"),
        ab: common_vendor.t(endDate.value ? formatDate(endDate.value) : "请选择")
      } : {}, {
        ac: selectionMode.value === "month"
      }, selectionMode.value === "month" ? {
        ad: common_vendor.f(yearList.value, (year, k0, i0) => {
          return {
            a: common_vendor.t(year),
            b: year,
            c: selectedYear.value === year ? 1 : "",
            d: common_vendor.o(($event) => selectYear(year), year)
          };
        }),
        ae: yearScrollTop.value,
        af: common_vendor.f(monthList.value, (month, k0, i0) => {
          return {
            a: common_vendor.t(month),
            b: month,
            c: selectedMonth.value === month ? 1 : "",
            d: common_vendor.o(($event) => selectMonth(month), month)
          };
        }),
        ag: monthScrollTop.value
      } : {
        ah: common_vendor.o(previousMonth),
        ai: common_vendor.t(currentYear.value),
        aj: common_vendor.t(currentMonth.value),
        ak: common_vendor.o(showMonthYearPicker),
        al: common_vendor.o(nextMonth),
        am: common_vendor.f(weekdays, (day, k0, i0) => {
          return {
            a: common_vendor.t(day),
            b: day
          };
        }),
        an: common_vendor.f(calendarDays.value, (day, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(day.date),
            b: day.isStart
          }, day.isStart ? {} : {}, {
            c: day.isToday
          }, day.isToday ? {} : {}, {
            d: index,
            e: common_vendor.n(getDayClass(day)),
            f: common_vendor.o(($event) => selectDate(day), index)
          });
        }),
        ao: common_vendor.o(handleTouchStart),
        ap: common_vendor.o(handleTouchMove),
        aq: common_vendor.o(handleTouchEnd)
      }, {
        ar: common_vendor.o(closeCalendar),
        as: common_vendor.o(confirmSelection),
        at: common_vendor.o(() => {
        }),
        av: common_vendor.o(closeCalendar)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1acc51a1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/orders/orders.js.map
