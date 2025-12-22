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
    } else {
      return numbers.join("");
    }
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

const loadSchemesData = () =>{
  const data = uni.getStorageSync("predict_schemes_data")
  if (data) {
    return Object.entries(data) 
  }else{
    return []
  }
}
const clearSchemesData = () =>{
  uni.removeStorageSync("predict_schemes_data")
}
export default {getSchemeDisplayData, numberFormat, generatePostContent ,getTodayNewPost, loadSchemesData, clearSchemesData}