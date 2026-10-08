import { getAccount } from "@/utils/request";
import { apiFind_post_by_account, apiGetIssueNo } from "@/api/apis.js";
// 获取分行显示的方案数据
const getSchemeDisplayData = (scheme) => {
return Object.entries(scheme)
    .map(([position, item]) => {
    return `${position}：${numberFormat(item.numbers, position)}`;
    })
    .join("\n");
};

// 号码显示格式化
const numberFormat = (numbers, schemeName) => {
    if (["任选二", "任选三"].includes(schemeName)) {
      return numbers.join(",");
    }
    // 和值等两位数号码，直接拼接会连成一片看不出边界，这类也用逗号分隔
    if (numbers.some((n) => String(n).length > 1)) {
      return numbers.join(",");
    }
    return numbers.join("");
  };
// 生成发帖内容
const generatePostContent = (schemes) => {
    if (schemes.length === 0) {
        return "暂无方案数据";
    }

    let content = "【预测方案】\n\n";

    content += schemes
        .map(([schemeName, data], index) => {
        return `${index + 1}.${schemeName} \n ${getSchemeDisplayData(data)}\n \n`;
        })
        .join("");

    return content;
};

/**
 * 方案「位名」-> 发帖提交字段
 *
 * key 是方案里的「位名」（标签 positions 里的字符串），不是标签名。
 * 例如「杀百十个」这个标签，它的三个位名分别是 杀百 / 杀十 / 杀个，
 * 所以它们会各自按下面的映射落到 fc / fb / fa。
 *
 * 同一个字段可以由多个位名共同贡献（如「个位」和「杀个」都进 fa），
 * 采集时把这些位名下的号码合并去重。
 */
const POSITION_FIELDS = {
  // 个位
  个位: "fa",
  杀个: "fa",

  // 十位
  十位: "fb",
  杀十: "fb",

  // 百位
  百位: "fc",
  杀百: "fc",

  // 胆码：三位中任意一位（毒胆 / 双胆 / 三胆）
  毒胆: "fdm",
  双胆: "fdm",
  三胆: "fdm",

  // 跨度：号码中最大与最小数字的差
  跨度: "fkd",
  杀跨度: "fkd",

  // 和值
  和值: "fh",

  // 复式：所选号码的全部组合
  复式: "ffs",

  // 和尾：如奖号 395，百十和值 3+9=12，和尾为 2
  百十和尾: "fhbc",
  杀百十和尾: "fhbc",
  百个和尾: "fhba",
  杀百个和尾: "fhba",
  十个和尾: "fhca",
  杀十个和尾: "fhca",
};

/**
 * 从方案里抽出发帖需要的各个字段
 *
 * 方案结构：[[标签名, {位名: {numbers, mainAttack}}], ...]
 *
 * 采集规则：
 *   1. 只按「位名」匹配 POSITION_FIELDS，未登记的位名（如 任选二 / 任选三 / 死数 / 各「不合」）忽略；
 *   2. 多个位名指向同一字段时（如 个位 + 杀个 → fa）号码合并；
 *   3. 同一字段里重复号码只保留一次，并保持数字出现的先后顺序；
 *   4. 只取 numbers，不带 mainAttack；
 *   5. 每个字段最终序列化成逗号分隔的字符串，没有号码时是空串。
 *
 * @param {Array} schemes 方案数组
 * @returns {Object} 字段名 -> 逗号分隔字符串，如 { fa: "3,9", fb: "2", fc: "1,5", ... }
 */
const buildPositionFields = (schemes = []) => {
  // 先按字段名建桶；同一个字段被多个位名映射时只建一次
  const collected = {};
  Object.values(POSITION_FIELDS).forEach((field) => {
    collected[field] = [];
  });

  (schemes || []).forEach((entry) => {
    const positions = Array.isArray(entry) ? entry[1] : entry;
    Object.entries(positions || {}).forEach(([position, item]) => {
      const field = POSITION_FIELDS[position];
      if (!field) return; // 没登记的位名直接跳过
      (item?.numbers || []).forEach((num) => {
        const value = String(num);
        // 合并去重，保持先后顺序
        if (!collected[field].includes(value)) {
          collected[field].push(value);
        }
      });
    });
  });

  // 序列化成逗号分隔的字符串，如 "1,5"
  Object.keys(collected).forEach((field) => {
    collected[field] = collected[field].join(",");
  });

  return collected;
};

// 获取当期自己发布的最新的帖子
const getTodayNewPost = async (lotteryType)=>{
    const issuenoRes = await apiGetIssueNo({ tname: lotteryType });
    const res = await apiFind_post_by_account(
      lotteryType,
      issuenoRes.data.issueno,
      
    );
    return res.data
}

// 方案草稿的本地存储
// 只保留「当前彩种」的草稿：存的彩种和当前彩种不一致时整份丢弃，
// 避免把上一个彩种的方案带到另一个彩种里一起提交。
const SCHEME_STORAGE_KEY = "predict_schemes_data";

// 早期版本按彩种分开存过（predict_schemes_data_排列三 ...），这里顺手清掉，避免残留
const clearLegacySchemeKeys = () => {
  try {
    const info = uni.getStorageInfoSync();
    (info?.keys || [])
      .filter((key) => key.indexOf(`${SCHEME_STORAGE_KEY}_`) === 0)
      .forEach((key) => uni.removeStorageSync(key));
  } catch (error) {}
};

const loadSchemesData = (lotteryType) =>{
  clearLegacySchemeKeys();
  const draft = uni.getStorageSync(SCHEME_STORAGE_KEY);
  if (!draft || typeof draft !== "object" || !draft.schemes) {
    return [];
  }
  // 彩种变了：上次缓存的方案全部丢弃
  if (lotteryType && draft.lotteryType && draft.lotteryType !== lotteryType) {
    uni.removeStorageSync(SCHEME_STORAGE_KEY);
    return [];
  }
  return Object.entries(draft.schemes);
}
const saveSchemesData = (lotteryType, schemes) =>{
  uni.setStorageSync(SCHEME_STORAGE_KEY, { lotteryType, schemes });
}
const clearSchemesData = () =>{
  uni.removeStorageSync(SCHEME_STORAGE_KEY);
}
export default {getSchemeDisplayData, numberFormat, generatePostContent ,getTodayNewPost, buildPositionFields, loadSchemesData, saveSchemesData, clearSchemesData}