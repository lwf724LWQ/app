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
export default {getSchemeDisplayData, numberFormat, generatePostContent ,getTodayNewPost, loadSchemesData, saveSchemesData, clearSchemesData}