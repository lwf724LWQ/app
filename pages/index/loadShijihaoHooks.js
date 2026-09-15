import { ref } from "vue";

/**
 * 试机号数据
 *
 * ⚠️ 目前项目没有试机号接口（全仓库仅有 /web/ticket/query 与 find_result，
 * 返回的是开奖号码，不含试机号），因此这里使用 MOCK 数据，仅用于查看界面样式。
 *
 * 接入真实接口时只需要改两处：
 *   1. getList() 里把 MOCK_LIST 换成接口返回的数据数组；
 *   2. 如果后端字段名不同，改 normalizeRecord() 里的取值字段即可，
 *      组件只依赖 normalizeRecord 产出的结构，不需要改动。
 */

// MOCK 数据（取自参考表格，和值/跨度由号码自动计算，无需手填）
const MOCK_LIST = [
  { issueno: "2026214", opendate: "2026-08-12", week: "周三", testNumber: "408", awardNumber: "014", single: ["", "", ""], group: ["", "2", ""] },
  { issueno: "2026215", opendate: "2026-08-13", week: "周四", testNumber: "078", awardNumber: "927", single: ["", "", ""], group: ["1", "", ""] },
  { issueno: "2026216", opendate: "2026-08-14", week: "周五", testNumber: "841", awardNumber: "953", single: ["", "", ""], group: ["", "", ""] },
  { issueno: "2026217", opendate: "2026-08-15", week: "周六", testNumber: "796", awardNumber: "019", single: ["", "", ""], group: ["1", "", ""] },
  { issueno: "2026218", opendate: "2026-08-16", week: "周日", testNumber: "866", awardNumber: "079", single: ["", "", ""], group: ["", "", ""] },
  { issueno: "2026219", opendate: "2026-08-17", week: "周一", testNumber: "560", awardNumber: "662", single: ["", "+", ""], group: ["", "2", ""] },
  { issueno: "2026220", opendate: "2026-08-18", week: "周二", testNumber: "040", awardNumber: "482", single: ["", "", ""], group: ["1", "", ""] },
];

const WEEK_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 从号码里取出数字数组，兼容 "408" / "4 0 8" / "4,0,8" / [4,0,8]
function digitsOf(number) {
  if (Array.isArray(number)) {
    return number.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
  }
  return String(number == null ? "" : number)
    .replace(/\D/g, "")
    .split("")
    .map(Number);
}

// 和值
function sumOf(digits) {
  return digits.reduce((total, n) => total + n, 0);
}

// 跨度 = 最大数字 - 最小数字
function spanOf(digits) {
  if (!digits.length) return 0;
  return Math.max(...digits) - Math.min(...digits);
}

// 是否含重复数字（组三/豹子形态，界面上用灰底标注）
function hasRepeat(digits) {
  return new Set(digits).size < digits.length;
}

// 根据日期补星期，后端没给 week 时用
function weekdayOf(dateStr) {
  if (!dateStr) return "";
  const date = new Date(String(dateStr).replace(/-/g, "/"));
  if (Number.isNaN(date.getTime())) return "";
  return WEEK_NAMES[date.getDay()];
}

// 命中格：labels 为表头，values 为空串表示未命中
function buildCells(labels, values) {
  const arr = Array.isArray(values) ? values : [];
  return labels.map((label, index) => ({
    label,
    value: arr[index] === undefined || arr[index] === null ? "" : String(arr[index]),
  }));
}

function buildRow(key, label, digits, sum, span) {
  return {
    key,
    label,
    digits,
    sum: sum === undefined || sum === null ? sumOf(digits) : sum,
    span: span === undefined || span === null ? spanOf(digits) : span,
    // 含重复数字（组三/豹子）时灰底
    group3: hasRepeat(digits),
  };
}

/**
 * 把一条试机号记录整理成界面直接可用的结构
 * @returns {{
 *   issueno: String, opendate: String, week: String,
 *   rows: Array<{key:String,label:String,digits:Number[],sum:Number,span:Number,group3:Boolean}>,
 *   singleCells: Array<{label:String,value:String}>,
 *   groupCells: Array<{label:String,value:String}>
 * }}
 */
export function normalizeRecord(item = {}) {
  return {
    issueno: String(item.issueno || ""),
    opendate: item.opendate || "",
    week: item.week || weekdayOf(item.opendate),
    rows: [
      buildRow("test", "试机", digitsOf(item.testNumber), item.testSum, item.testSpan),
      buildRow("award", "奖号", digitsOf(item.awardNumber), item.awardSum, item.awardSpan),
    ],
    // 试机号与奖号单选同位：命中的位置标记为 "+"
    singleCells: buildCells(["百位", "十位", "个位"], item.single),
    // 试机号与奖号组选中：命中的位数标记命中个数
    groupCells: buildCells(["1位", "2位", "3位"], item.group),
  };
}

export default function useShijihaoList() {
  const list = ref([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  async function getList() {
    if (isLoading.value) return;
    try {
      isLoading.value = true;
      // TODO: 试机号接口就绪后，替换为 api 请求，保持 normalizeRecord 不变
      // 例：const res = await apiShijihaoQuery({ page: 1, limit: 30 })
      //     list.value = (res.data.records || []).map(normalizeRecord)
      list.value = MOCK_LIST.map(normalizeRecord);
      isLoaded.value = true;
    } catch (error) {
      console.error("加载试机号失败:", error);
      list.value = [];
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    list,
    isLoaded,
    isLoading,
    getList,
  };
}
