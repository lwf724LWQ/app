"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
const _sfc_main = {
  __name: "transaction",
  setup(__props) {
    const activeTab = common_vendor.ref("all");
    const searchKeyword = common_vendor.ref("");
    common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const totalRecords = common_vendor.ref(0);
    const showFilterModal = common_vendor.ref(false);
    const selectedIncomeType = common_vendor.ref("all");
    common_vendor.ref("all");
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
    const transactions = common_vendor.ref([]);
    const filteredTransactions = common_vendor.computed(() => {
      let result = transactions.value;
      if (startDate.value && endDate.value) {
        result = result.filter((item) => {
          const itemTimeStr = item.createTime;
          if (!itemTimeStr)
            return false;
          const itemDate = new Date(itemTimeStr);
          const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate());
          const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate());
          return itemDateOnly.getTime() >= startDateOnly.getTime() && itemDateOnly.getTime() <= endDateOnly.getTime();
        });
      } else {
        result = result.filter((item) => {
          const itemTimeStr = item.createTime;
          if (!itemTimeStr)
            return false;
          const itemDate = new Date(itemTimeStr);
          return itemDate.getFullYear() === currentYear.value && itemDate.getMonth() + 1 === currentMonth.value;
        });
      }
      if (activeTab.value !== "all") {
        const typeMap = {
          "income": 0,
          // 收入
          "expense": 1
          // 支出
        };
        result = result.filter((item) => item.type === typeMap[activeTab.value]);
      }
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.trim().toLowerCase();
        result = result.filter(
          (item) => item.remark && item.remark.toLowerCase().includes(keyword) || item.account && item.account.toLowerCase().includes(keyword)
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
    const isDateRangeSelected = common_vendor.computed(() => {
      return selectionMode.value === "range" && (startDate.value || endDate.value);
    });
    const monthlyExpense = common_vendor.computed(() => {
      let currentTransactions = [];
      if (startDate.value && endDate.value) {
        currentTransactions = transactions.value.filter((item) => {
          const itemTimeStr = item.createTime;
          if (!itemTimeStr)
            return false;
          const itemDate = new Date(itemTimeStr);
          const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate());
          const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate());
          return itemDateOnly.getTime() >= startDateOnly.getTime() && itemDateOnly.getTime() <= endDateOnly.getTime() && item.type === 1;
        });
      } else {
        currentTransactions = transactions.value.filter((item) => {
          const itemTimeStr = item.createTime;
          if (!itemTimeStr)
            return false;
          const itemDate = new Date(itemTimeStr);
          return itemDate.getFullYear() === currentYear.value && itemDate.getMonth() + 1 === currentMonth.value && item.type === 1;
        });
      }
      const total = currentTransactions.reduce((sum, item) => sum + (item.amount || 0), 0);
      return total.toFixed(2);
    });
    const monthlyIncome = common_vendor.computed(() => {
      let currentTransactions = [];
      if (startDate.value && endDate.value) {
        currentTransactions = transactions.value.filter((item) => {
          const itemTimeStr = item.createTime;
          if (!itemTimeStr)
            return false;
          const itemDate = new Date(itemTimeStr);
          const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
          const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate());
          const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate());
          return itemDateOnly.getTime() >= startDateOnly.getTime() && itemDateOnly.getTime() <= endDateOnly.getTime() && item.type === 0;
        });
      } else {
        currentTransactions = transactions.value.filter((item) => {
          const itemTimeStr = item.createTime;
          if (!itemTimeStr)
            return false;
          const itemDate = new Date(itemTimeStr);
          return itemDate.getFullYear() === currentYear.value && itemDate.getMonth() + 1 === currentMonth.value && item.type === 0;
        });
      }
      const total = currentTransactions.reduce((sum, item) => sum + (item.amount || 0), 0);
      return total.toFixed(2);
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const showFilterOptions = () => {
      showFilterModal.value = true;
    };
    const goToStatistics = () => {
      common_vendor.index.__f__("log", "at pages/transaction/transaction.vue:555", "跳转到统计页面");
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
    const closeFilterModal = () => {
      showFilterModal.value = false;
    };
    const selectIncomeType = (type) => {
      selectedIncomeType.value = type;
    };
    const confirmFilter = () => {
      activeTab.value = selectedIncomeType.value;
      closeFilterModal();
      currentPage.value = 1;
      getBillData(true);
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
      await getBillData(true);
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
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    };
    const getTypeClass = (type) => {
      return type === 0 ? "recharge" : "consume";
    };
    const getTypeIcon = (type) => {
      return type === 0 ? "💰" : "💸";
    };
    const validateToken = () => {
      const token = utils_request.getToken();
      const account = utils_request.getAccount();
      if (!token || token.trim() === "") {
        return { isValid: false, reason: "token_missing" };
      }
      if (!token.includes(".")) {
        return { isValid: false, reason: "token_format_invalid" };
      }
      if (token.length < 50) {
        return { isValid: false, reason: "token_too_short" };
      }
      return { isValid: true, token, account };
    };
    const getBillData = async (isRefresh = false) => {
      var _a, _b, _c;
      try {
        loading.value = true;
        const tokenValidation = validateToken();
        if (!tokenValidation.isValid) {
          let errorMessage = "请先登录";
          if (tokenValidation.reason === "token_format_invalid") {
            errorMessage = "登录状态异常，请重新登录";
          } else if (tokenValidation.reason === "token_too_short") {
            errorMessage = "登录信息不完整，请重新登录";
          }
          common_vendor.index.showToast({
            title: errorMessage,
            icon: "none"
          });
          setTimeout(() => {
            common_vendor.index.navigateTo({ url: "/pages/login/login" });
          }, 1500);
          return;
        }
        const { token, account } = tokenValidation;
        const queryParams = {
          account: account || token,
          // 使用account，如果为空则使用token
          page: currentPage.value.toString(),
          limit: pageSize.value.toString()
        };
        const response = await api_apis.apiBillQuery(queryParams);
        if (response.code === 200) {
          const newBills = ((_a = response.data) == null ? void 0 : _a.records) || [];
          if (isRefresh) {
            transactions.value = newBills;
            currentPage.value = 1;
          } else {
            if (currentPage.value === 1) {
              transactions.value = newBills;
            } else {
              transactions.value = [...transactions.value, ...newBills];
            }
          }
          const totalPages = ((_b = response.data) == null ? void 0 : _b.pages) || 1;
          hasMore.value = currentPage.value < totalPages;
          totalRecords.value = ((_c = response.data) == null ? void 0 : _c.total) || 0;
          if (newBills.length === 0 && currentPage.value === 1) {
            common_vendor.index.showToast({
              title: "暂无账单数据",
              icon: "none",
              duration: 2e3
            });
          }
        } else {
          common_vendor.index.showToast({
            title: response.msg || "获取账单失败",
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
    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        currentPage.value++;
        getBillData(false);
      }
    };
    const checkLoginStatus = () => {
      const tokenValidation = validateToken();
      return tokenValidation.isValid;
    };
    common_vendor.onMounted(async () => {
      if (checkLoginStatus()) {
        await getBillData(true);
      } else {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 1500);
      }
    });
    common_vendor.onShow(async () => {
      if (checkLoginStatus()) {
        if (transactions.value.length === 0 && !loading.value) {
          await getBillData(true);
        }
      } else {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({ url: "/pages/login/login" });
        }, 1500);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(showFilterOptions),
        c: common_vendor.o(goToStatistics),
        d: common_vendor.t(displayedDateText.value),
        e: common_vendor.o(showMonthPicker),
        f: !isDateRangeSelected.value
      }, !isDateRangeSelected.value ? {
        g: common_vendor.t(monthlyExpense.value),
        h: common_vendor.t(monthlyIncome.value)
      } : startDate.value && endDate.value && formatDate(startDate.value) === formatDate(endDate.value) ? {
        j: common_vendor.t(monthlyExpense.value),
        k: common_vendor.t(monthlyIncome.value)
      } : {}, {
        i: startDate.value && endDate.value && formatDate(startDate.value) === formatDate(endDate.value),
        l: common_vendor.f(filteredTransactions.value, (item, index, i0) => {
          return {
            a: common_vendor.t(getTypeIcon(item.type)),
            b: common_vendor.n(getTypeClass(item.type)),
            c: common_vendor.t(item.remark || "账单记录"),
            d: common_vendor.t(item.account || "账单详情"),
            e: common_vendor.t(formatTime(item.createTime)),
            f: common_vendor.t(item.type === 0 ? "+" : "-"),
            g: common_vendor.t(item.amount || 0),
            h: common_vendor.n(getTypeClass(item.type)),
            i: item.id || index
          };
        }),
        m: filteredTransactions.value.length > 0
      }, filteredTransactions.value.length > 0 ? common_vendor.e({
        n: loading.value
      }, loading.value ? {} : !hasMore.value ? {} : {
        p: common_vendor.o(loadMore)
      }, {
        o: !hasMore.value
      }) : {}, {
        q: loading.value && transactions.value.length === 0
      }, loading.value && transactions.value.length === 0 ? {} : {}, {
        r: showFilterModal.value
      }, showFilterModal.value ? {
        s: selectedIncomeType.value === "all" ? 1 : "",
        t: common_vendor.o(($event) => selectIncomeType("all")),
        v: selectedIncomeType.value === "expense" ? 1 : "",
        w: common_vendor.o(($event) => selectIncomeType("expense")),
        x: selectedIncomeType.value === "income" ? 1 : "",
        y: common_vendor.o(($event) => selectIncomeType("income")),
        z: common_vendor.o(closeFilterModal),
        A: common_vendor.o(confirmFilter),
        B: common_vendor.o(() => {
        }),
        C: common_vendor.o(closeFilterModal)
      } : {}, {
        D: showCalendar.value
      }, showCalendar.value ? common_vendor.e({
        E: common_vendor.o(closeCalendar),
        F: selectionMode.value === "month" ? 1 : "",
        G: common_vendor.o(($event) => setSelectionMode("month")),
        H: selectionMode.value === "range" ? 1 : "",
        I: common_vendor.o(($event) => setSelectionMode("range")),
        J: selectionMode.value === "range"
      }, selectionMode.value === "range" ? {
        K: common_vendor.t(startDate.value ? formatDate(startDate.value) : "请选择"),
        L: common_vendor.t(endDate.value ? formatDate(endDate.value) : "请选择")
      } : {}, {
        M: selectionMode.value === "month"
      }, selectionMode.value === "month" ? {
        N: common_vendor.f(yearList.value, (year, k0, i0) => {
          return {
            a: common_vendor.t(year),
            b: year,
            c: selectedYear.value === year ? 1 : "",
            d: common_vendor.o(($event) => selectYear(year), year)
          };
        }),
        O: yearScrollTop.value,
        P: common_vendor.f(monthList.value, (month, k0, i0) => {
          return {
            a: common_vendor.t(month),
            b: month,
            c: selectedMonth.value === month ? 1 : "",
            d: common_vendor.o(($event) => selectMonth(month), month)
          };
        }),
        Q: monthScrollTop.value
      } : {
        R: common_vendor.o(previousMonth),
        S: common_vendor.t(currentYear.value),
        T: common_vendor.t(currentMonth.value),
        U: common_vendor.o(showMonthYearPicker),
        V: common_vendor.o(nextMonth),
        W: common_vendor.f(weekdays, (day, k0, i0) => {
          return {
            a: common_vendor.t(day),
            b: day
          };
        }),
        X: common_vendor.f(calendarDays.value, (day, index, i0) => {
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
        Y: common_vendor.o(handleTouchStart),
        Z: common_vendor.o(handleTouchMove),
        aa: common_vendor.o(handleTouchEnd)
      }, {
        ab: common_vendor.o(closeCalendar),
        ac: common_vendor.o(confirmSelection),
        ad: common_vendor.o(() => {
        }),
        ae: common_vendor.o(closeCalendar)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-72eafd73"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/transaction/transaction.js.map
