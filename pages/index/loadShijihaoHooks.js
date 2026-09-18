import { ref } from "vue";

/**
 * 试机号数据：排列三 / 福彩3D 各显示最新一期
 *
 * ⚠️ 目前项目没有试机号接口（全仓库只有 /web/ticket/query 与 find_result，
 * 返回的是开奖号码，不含试机号），因此这里使用 MOCK 数据，仅用于查看界面样式。
 *
 * 接入真实接口时只需要改两处：
 *   1. getList() 里把 MOCK 换成接口返回的数据；
 *   2. 字段名不同就改 normalizeRecord() 里的取值。
 */

// 排列三 / 福彩3D 两条
const GROUPS = [
  { key: "pl3", label: "拼搏排列三" },
  { key: "fc3d", label: "拼搏福彩3D" },
];

// MOCK 数据
const MOCK = {
  pl3: { issueno: "26250", opendate: "2026-09-17", number: "449" },
  pl5: { issueno: "26250", opendate: "2026-09-17", number: "44937" },
  fc3d: { issueno: "26250", opendate: "2026-09-17", number: "360" },
};

const WEEK_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 从号码里取出数字数组，兼容 "985" / "9 8 5" / [9,8,5]
function digitsOf(number) {
  if (Array.isArray(number)) {
    return number.map((n) => String(n));
  }
  return String(number == null ? "" : number)
    .replace(/\D/g, "")
    .split("");
}

// 根据日期取星期
function weekdayOf(dateStr) {
  if (!dateStr) return "";
  const date = new Date(String(dateStr).replace(/-/g, "/"));
  if (Number.isNaN(date.getTime())) return "";
  return WEEK_NAMES[date.getDay()];
}

// 例：2026-09-17 -> "09.17 周四"
function formatDate(dateStr, week) {
  const matched = String(dateStr || "").match(/\d{4}-(\d{2})-(\d{2})/);
  if (!matched) return week || "";
  return `${matched[1]}.${matched[2]} ${week || weekdayOf(dateStr)}`;
}

/**
 * 整理一条试机号记录
 * @returns {{ key:String, label:String, issueno:String, date:String, numbers:String[] }}
 */
export function normalizeRecord(config, item = {}) {
  return {
    key: config.key,
    label: config.label,
    issueno: String(item.issueno || ""),
    date: formatDate(item.opendate, item.week),
    numbers: digitsOf(item.number),
  };
}

export default function useShijihaoList() {
  // { pl3: {...}, fc3d: {...} }
  const data = ref({});
  const isLoaded = ref(false);
  const isLoading = ref(false);

  async function getList() {
    if (isLoading.value) return;
    try {
      isLoading.value = true;
      // TODO: 试机号接口就绪后，替换为 api 请求，保持 normalizeRecord 不变
      // 例：const res = await apiShijihaoQuery()
      //     const map = { pl3: res.data.pl3, fc3d: res.data.fc3d }
      const next = {};
      GROUPS.forEach((config) => {
        const item = MOCK[config.key];
        if (item) {
          next[config.key] = normalizeRecord(config, item);
        }
      });
      data.value = next;
      isLoaded.value = true;
    } catch (error) {
      console.error("加载试机号失败:", error);
      data.value = {};
      isLoaded.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    data,
    isLoaded,
    isLoading,
    getList,
  };
}
