/**
 * 大师榜单 - 筛选弹框选项配置
 *
 * 不同彩种的筛选维度不一样：
 *   - 排列五 / 七星彩：五位数玩法，定位按 A/B/C/D 位，另有「合分」「字现/任选」
 *   - 排列三 / 福彩3D：三位数玩法，定位按 百/十/个，另有「和尾」「胆码/复式」
 *
 * 每个分组：
 *   key    分组标识，用于承载已选值
 *   title  分组标题
 *   single 是否单选（定位为单选，决定页面标题；其余为多选）
 *   items  选项文案
 */

// 三位数（排列三 / 福彩3D）
const SECTIONS_3D = [
  {
    key: "position",
    title: "定位",
    single: true,
    items: ["百十个", "百", "十", "个", "百十", "百个", "十个", "过滤王直选"],
  },
  {
    key: "kill",
    title: "杀数类",
    items: [
      "杀百",
      "杀十",
      "杀个",
      "杀百十个",
      "杀跨度",
      "毒胆",
      "杀百十和尾",
      "杀百个和尾",
      "杀十个和尾",
    ],
  },
  {
    key: "sumTail",
    title: "和尾",
    items: ["百十和尾", "百个和尾", "十个和尾", "和值"],
  },
  {
    key: "dan",
    title: "胆码/复式",
    items: ["胆码", "复式", "跨度"],
  },
];

// 五位数（排列五 / 七星彩）
const SECTIONS_5D = [
  {
    key: "position",
    title: "定位",
    single: true,
    items: [
      "定位A",
      "定位B",
      "定位C",
      "定位D",
      "ABCD",
      "AXXD",
      "XBCX",
      "ABXX",
      "AXCX",
      "XXCD",
      "XBXD",
      "ABXD",
      "ABCX",
      "AXCD",
      "XBCD",
      "过滤王二定",
      "过滤王三定",
      "过滤王四定",
    ],
  },
  {
    key: "kill",
    title: "杀数类",
    items: [
      "杀A",
      "杀B",
      "杀C",
      "杀D",
      "杀ABCD",
      "死数",
      "AD不合",
      "BC不合",
      "AB不合",
      "AC不合",
      "BD不合",
      "CD不合",
    ],
  },
  {
    key: "hefen",
    title: "合分",
    items: ["AD合", "BC合", "AB合", "AC合", "BD合", "CD合"],
  },
  {
    key: "renxuan",
    title: "字现/任选",
    items: ["任选三", "任选二", "稳码"],
  },
];

export const FILTER_CONFIG = {
  排列三: SECTIONS_3D,
  福彩3D: SECTIONS_3D,
  排列五: SECTIONS_5D,
  七星彩: SECTIONS_5D,
};

// 弹框顶部彩种切换顺序
export const FILTER_TYPES = ["排列五", "七星彩", "排列三", "福彩3D"];

export const DEFAULT_FILTER_TYPE = "排列三";

// 取某个彩种的分组配置
export function getFilterSections(tname) {
  return FILTER_CONFIG[tname] || SECTIONS_3D;
}

// 某个彩种的默认选中值（第一组的第一项）
export function getDefaultSelection(tname) {
  const sections = getFilterSections(tname);
  const selection = {};
  sections.forEach((section) => {
    selection[section.key] = [];
  });
  if (sections.length) {
    const first = sections[0];
    selection[first.key] = [first.items[0]];
  }
  return selection;
}
