import { ref } from "vue";

/**
 * 大师榜单数据
 *
 * ⚠️ 目前项目没有大师榜单接口（仓库里只有帖子 / 视频 / 关注类接口，
 * 没有榜单、命中次数、连中、回报率这类数据），因此这里使用 MOCK 数据，
 * 仅用于查看界面样式。
 *
 * 接入真实接口时只需要改两处：
 *   1. getList() 里把 MOCK_LIST 换成接口返回的数组；
 *   2. 字段名不同就改 normalizeRankItem() 里的取值。
 *      组件只依赖 normalizeRankItem 产出的结构，不需要改动。
 */

// 左侧榜单分类
export const SIDEBAR_TABS = [
  { key: "10", name: "10期榜" },
  { key: "20", name: "20期榜" },
  { key: "30", name: "30期榜" },
  { key: "lianhong", name: "连红榜" },
  { key: "xinjin", name: "新晋榜" },
  { key: "huizong", name: "汇总榜" },
  // { key: "qianlong", name: "潜龙榜", locked: true },
  // { key: "lengre", name: "冷热榜", locked: true },
  // { key: "liancuo", name: "连错榜", locked: true },
  // { key: "dashi", name: "大师统计", arrow: true },
];

// 顶部排序/统计维度
export const SORT_TABS = [
  { key: "hitCount", name: "命中次数" },
  { key: "returnRate", name: "回报率" },
  { key: "maxStreak", name: "连中最多" },
  { key: "dispersion", name: "离散程度" },
  { key: "masterCount", name: "大师次数" },
  { key: "masterAge", name: "大师期龄" },
];

// 范围码
export const RANGE_TABS = [
  { key: 6, name: "范围6码" },
  { key: 5, name: "范围5码" },
  { key: 4, name: "范围4码" },
];

// 默认头像（与项目其他地方一致）
const DEFAULT_AVATAR = "http://video.caimizm.com/himg/user.png";

// MOCK 数据（取自设计稿）
const MOCK_LIST = [
  { rank: 1, account: "mock_001", uname: "大师1", rangeCode: 6, recentTotal: 10, recentHit: 5, streakLabel: "最高3连中", viewCount: 7 },
  { rank: 2, account: "mock_002", uname: "大师2", rangeCode: 6, recentTotal: 10, recentHit: 5, streakLabel: "最高3连中", viewCount: 7 },
  { rank: 3, account: "mock_003", uname: "大师3", rangeCode: 6, recentTotal: 10, recentHit: 5, streakLabel: "最高2连中", viewCount: 7 },
  { rank: 4, account: "mock_004", uname: "大师4", rangeCode: 6, recentTotal: 10, recentHit: 5, streakLabel: "最高3现3连中", viewCount: 7 },
  { rank: 5, account: "mock_005", uname: "大师5", rangeCode: 6, recentTotal: 10, recentHit: 5, streakLabel: "最高2连中", viewCount: 7 },
  { rank: 6, account: "mock_006", uname: "大师6", rangeCode: 6, recentTotal: 10, recentHit: 5, streakLabel: "最高4连中", viewCount: 7 },
];

/**
 * 整理一条榜单记录
 * @returns {{
 *   rank:Number, account:String, uname:String, avatar:String,
 *   rangeLabel:String, hitLabel:String, streakLabel:String,
 *   detailText:String, periodText:String,
 *   published:Boolean, viewCount:Number, post:Object
 * }}
 */
export function normalizeRankItem(item = {}, context = {}) {
  const rangeCode = item.rangeCode || 6;
  const recentTotal = item.recentTotal || 10;
  const recentHit = item.recentHit || 0;
  const streakLabel = item.streakLabel || "";
  const issueno = item.issueno || context.issueno || "";
  const tname = item.tname || context.tname || "";

  const rangeLabel = `${rangeCode}码`;
  const hitLabel = `近${recentTotal}中${recentHit}`;
  const published = item.published !== false;

  // 传给彩友圈帖子详情页的数据（详情页只读参数，不会按 id 再拉一次帖子）
  const post = {
    id: item.postId || `mock_post_${item.rank}`,
    account: item.account,
    username: item.uname,
    avatar: item.avatar,
    tname,
    issueno,
    period: issueno,
    content: item.postContent || `${tname} ${issueno}期 个人规`,
    time: item.publishTime || "",
  };

  return {
    rank: item.rank || 0,
    account: item.account || "",
    uname: item.uname || "匿名用户",
    avatar: item.avatar || DEFAULT_AVATAR,
    rangeLabel,
    hitLabel,
    streakLabel,
    // 例：6码: 近10中5, 最高3连中
    detailText: `${rangeLabel}: ${hitLabel}${streakLabel ? ", " + streakLabel : ""}`,
    // 例：第26244期 已发布 / 未发布
    periodText: issueno ? `第${issueno}期 ${published ? "已发布" : "未发布"}` : "",
    published,
    viewCount: item.viewCount === undefined ? 0 : item.viewCount,
    post,
  };
}

export default function useMasterRank() {
  const list = ref([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);
  const totalCount = ref(0);
  const issueno = ref("");
  const issuenoStatus = ref("待开奖");
  const statRangeText = ref("");
  const tname = ref("排列三");
  const position = ref("百十个");
  const rankTab = ref("10");

  async function getList() {
    if (isLoading.value) return;
    try {
      isLoading.value = true;
      // TODO: 榜单接口就绪后替换为 api 请求，保持 normalizeRankItem 不变
      // 例：const res = await apiMasterRankQuery({ rankType: rankTab.value, tname: tname.value, position: position.value })
      //     list.value = (res.data.list || []).map((it) => normalizeRankItem(it, { tname: tname.value, issueno: issueno.value }))
      issueno.value = "26244";
      issuenoStatus.value = "待开奖";
      statRangeText.value = "26234期~26243期";
      totalCount.value = 20;

      list.value = MOCK_LIST.map((item) =>
        normalizeRankItem(item, { tname: tname.value, issueno: issueno.value })
      );
      isLoaded.value = true;
    } catch (error) {
      console.error("加载大师榜单失败:", error);
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
    totalCount,
    issueno,
    issuenoStatus,
    statRangeText,
    tname,
    position,
    rankTab,
    getList,
  };
}
