/**
 * 方案标签集（按彩种）
 *
 * 排列五 / 七星彩 / 福彩3D：四位数的「千位/百位/十位/个位」体系（沿用原有 34 个标签）
 * 排列三：三位数体系，使用另一套 17 个标签
 *
 * 每个标签：
 *   name       标签名（左侧栏显示，也会写进帖子内容）
 *   minNum     该标签下每个位最少要选几个号码（不填默认 1）
 *   maxNum     该标签下每个位最多能选几个号码
 *              minNum === maxNum 表示「必须选满 N 个」
 *   positions  位名数组，决定右侧渲染几个选号区
 *   numberList 可选，选号区的号码列表，默认 0-9（和值需要 0-27）
 */

// 默认号码 0-9
export const DEFAULT_NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// 和值可选 0-27
export const SUM_NUMBERS = Array.from({ length: 28 }, (_, i) => String(i));

// 四位数标签集（排列五 / 七星彩 / 福彩3D）
const TAGS_4D = [
  { name: "定头", maxNum: 6, positions: ["千位"] },
  { name: "定百", maxNum: 6, positions: ["百位"] },
  { name: "定十", maxNum: 6, positions: ["十位"] },
  { name: "定尾", maxNum: 6, positions: ["个位"] },
  { name: "头尾", maxNum: 6, positions: ["千位", "个位"] },
  { name: "中肚", maxNum: 6, positions: ["百位", "十位"] },
  { name: "ABXX", maxNum: 6, positions: ["千位", "百位"] },
  { name: "AXCX", maxNum: 6, positions: ["千位", "十位"] },
  { name: "XBXD", maxNum: 6, positions: ["百位", "个位"] },
  { name: "XXCD", maxNum: 6, positions: ["十位", "个位"] },
  { name: "ABCX", maxNum: 6, positions: ["千位", "百位", "十位"] },
  { name: "ABXD", maxNum: 6, positions: ["千位", "百位", "个位"] },
  { name: "AXCD", maxNum: 6, positions: ["千位", "十位", "个位"] },
  { name: "XBCD", maxNum: 6, positions: ["百位", "十位", "个位"] },
  { name: "芝麻", maxNum: 6, positions: ["千位", "百位", "十位", "个位"] },
  { name: "二字现", maxNum: 4, positions: ["任选二"] },
  { name: "三字现", maxNum: 15, positions: ["任选三"] },
  { name: "杀头", maxNum: 2, positions: ["杀头"] },
  { name: "杀百", maxNum: 2, positions: ["杀百"] },
  { name: "杀十", maxNum: 2, positions: ["杀十"] },
  { name: "杀尾", maxNum: 2, positions: ["杀尾"] },
  { name: "死数", maxNum: 1, positions: ["死数"] },
  { name: "头尾合", maxNum: 2, positions: ["头尾合"] },
  { name: "中肚合", maxNum: 2, positions: ["中肚合"] },
  { name: "千百合", maxNum: 2, positions: ["千百合"] },
  { name: "千十合", maxNum: 2, positions: ["千十合"] },
  { name: "百个合", maxNum: 2, positions: ["百个合"] },
  { name: "十个合", maxNum: 2, positions: ["十个合"] },
  { name: "头尾不合", maxNum: 2, positions: ["头尾不合"] },
  { name: "中肚不合", maxNum: 2, positions: ["中肚不合"] },
  { name: "千百不合", maxNum: 2, positions: ["千百不合"] },
  { name: "千十不合", maxNum: 2, positions: ["千十不合"] },
  { name: "百个不合", maxNum: 2, positions: ["百个不合"] },
  { name: "十个不合", maxNum: 2, positions: ["十个不合"] },
];

// 三位数标签集（排列三）
// minNum === maxNum 的表示「固定选择 N 个」，必须选满才能加入方案
const TAGS_3D = [
  // 百位 / 十位 / 个位 各固定选 6 个
  { name: "百十个", minNum: 6, maxNum: 6, positions: ["百位", "十位", "个位"] },
  { name: "跨度", minNum: 6, maxNum: 6, positions: ["跨度"] },
  // 杀百 / 杀十 / 杀个：每个位最低选 1 个，最多 3 个
  { name: "杀百", minNum: 1, maxNum: 3, positions: ["杀百"] },
  { name: "杀十", minNum: 1, maxNum: 3, positions: ["杀十"] },
  { name: "杀个", minNum: 1, maxNum: 3, positions: ["杀个"] },
  // 杀百十个：杀百、杀十、杀个 各固定选 1 个
  { name: "杀百十个", minNum: 1, maxNum: 1, positions: ["杀百", "杀十", "杀个"] },
  // 杀跨度未单独说明，按同组「杀」类处理
  { name: "杀跨度", minNum: 1, maxNum: 3, positions: ["杀跨度"] },
  { name: "胆码", minNum: 1, maxNum: 1, positions: ["毒胆","双胆","三胆"] },
  { name: "毒胆", minNum: 1, maxNum: 1, positions: ["毒胆"] },
  // 和值：可选号码为 0-27，固定选 6 个
  { name: "和值", minNum: 10, maxNum: 10, positions: ["和值"], numberList: SUM_NUMBERS },
  { name: "复式", minNum: 7, maxNum: 7, positions: ["复式"] },
  { name: "百十和尾", minNum: 6, maxNum: 6, positions: ["百十和尾"] },
  { name: "百个和尾", minNum: 6, maxNum: 6, positions: ["百个和尾"] },
  { name: "十个和尾", minNum: 6, maxNum: 6, positions: ["十个和尾"] },
  // 三个「杀和尾」：每个位最低选 1 个，最多 3 个
  { name: "杀百十和尾", minNum: 1, maxNum: 3, positions: ["杀百十和尾"] },
  { name: "杀百个和尾", minNum: 1, maxNum: 3, positions: ["杀百个和尾"] },
  { name: "杀十个和尾", minNum: 1, maxNum: 3, positions: ["杀十个和尾"] },
];

// 彩种 -> 标签集（福彩3D 暂时沿用四位数标签集）
const TAGS_BY_LOTTERY = {
  排列三: TAGS_3D,
  排列五: TAGS_4D,
  七星彩: TAGS_4D,
  福彩3D: TAGS_4D,
};

// 取某个彩种的标签集，未知彩种回退到四位数那套
export function getSchemeTags(lotteryType) {
  return TAGS_BY_LOTTERY[lotteryType] || TAGS_4D;
}

/**
 * 构建可直接用于渲染的标签数组：补上 numberList 和每个位的选号容器
 * @param {String} lotteryType 彩种名
 */
export function buildSchemeTags(lotteryType) {
  return getSchemeTags(lotteryType).map((tag) => ({
    ...tag,
    minNum: tag.minNum || 1,
    numberList: tag.numberList || DEFAULT_NUMBERS,
    selectedNumbers: tag.positions.reduce((acc, position) => {
      acc[position] = { numbers: [], mainAttack: "" };
      return acc;
    }, {}),
  }));
}

/**
 * 校验一个标签下的选号是否满足数量要求
 * @param {Object} scheme 位名 -> { numbers, mainAttack }
 * @param {Object} tag 标签配置（含 minNum / maxNum）
 * @returns {String} 通过返回空串，否则返回提示文案
 */
export function validateScheme(scheme, tag) {
  const min = (tag && tag.minNum) || 1;
  const max = (tag && tag.maxNum) || Infinity;

  for (const [position, item] of Object.entries(scheme || {})) {
    const count = (item.numbers || []).length;

    if (count < min || count > max) {
      if (min === max) {
        return `${position}需选满${max}个号码（当前${count}个）`;
      }
      if (count < min) {
        return `${position}至少选${min}个号码（当前${count}个）`;
      }
      return `${position}最多选${max}个号码（当前${count}个）`;
    }

    // 任选二 / 任选三 的每一项是一组数字，长度必须正好是 2 / 3
    const groupLength = { 任选二: 2, 任选三: 3 }[position];
    if (groupLength && (item.numbers || []).some((n) => String(n).length !== groupLength)) {
      return `${position}每组需要${groupLength}个数字`;
    }
  }

  return "";
}

/**
 * 判断帖子内容里是否已经包含某个标签
 * 不能直接用 content.includes(name)：标签名互为子串（如「杀百」是「杀百十个」「杀百十和尾」的子串），
 * 会误判。这里按 generatePostContent 生成的格式「序号.标签名」整行匹配。
 * @param {String} content 帖子内容
 * @param {String} tagName 标签名
 */
export function contentHasTag(content, tagName) {
  if (!content || !tagName) return false;
  const escaped = String(tagName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\n)\\s*\\d+\\.\\s*${escaped}[ \\t]*(?:\\n|$)`).test(content);
}
