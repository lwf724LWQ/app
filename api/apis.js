import { getAccount, request } from "@/utils/request.js";
import { getToken } from "@/utils/request.js";

export function apiGetDayRandom() {
  return request({
    url: "/randomWall",
  });
}

export function apiGetNotice(data = {}) {
  return request({
    url: "/wallNewsList",
    data,
  });
}

export function apiGetClassify(data = {}) {
  return request({
    url: "/classify",
    data,
  });
}
//获取画布数据
export function apiTicketQuery(data = {}) {
  return request({
    url: "/web/ticket/query",
    data,
  });
}
//注册请求
export function apiRegInfo(data = {}) {
  return request({
    url: "/web/user/insert",
    method: "POST",
    data,
  });
}
//注册发送验证码
export function apiSendCode(data) {
  return request({
    url: "/web/user/send_sms",
    data,
  });
}
//登录请求
export function apilogin(data = {}) {
  return request({
    url: "/web/user/login",
    method: "POST",
    data,
  });
}
//获取STS令牌
export function apigetsts(headers = {}) {
  return request({
    url: "/web/video/get_sts",
    heade: headers, // 将参数放在请求头中
  });
}
//获取视频列表
export function apiGetVideo(data = {}) {
  return request({
    url: "/web/video/query",
    data,
  });
}
export function apiGetVideoDetail(data = {}) {
  return request({
    url: "/web/video/find_by_id",
    data,
  });
}
//点赞接口（用户针对某个视频是否点赞）
export function apiGetIsLike(data = {}) {
  return request({
    url: "/web/video/like_count",
    method: "POST",
    data: {
      id: data.id,
      account: getAccount(),
      type: data.isLiked ? 0 : 1, // 0点赞，1取消点赞
    },
  });
}
//获取用户点赞列表
export function apiGetLikelist(account) {
  return request({
    url: "/web/video/query_like_count",
    data: { account },
  });
}
//上传视频
export function apiSubmitVideo(data) {
  return request({
    url: "/web/video/insert",
    method: "POST",
    data: data,
  });
}

// 视频付费情况查询
export function apiCheckVideoPayment(data = {}) {
  return request({
    url: "/web/video/find_pay",
    method: "GET",
    data,
    headers: {
      Authorization: getToken(),
    },
  });
}
//订单
export function apiRewardVideo(data) {
  return request({
    url: "/web/order/recharge",
    method: "POST",
    data: {
      info: data.info,
      amount: data.amount,
      type: data.type,
      account: data.account,
      payType: data.payType,
      channel: data.channel,
    },
    headers: {
      Authorization: getToken(), // 添加token
    },
  });
}
//用户头像,名字
export function apiUserimg(data) {
  return request({
    url: "/web/user/find_info",
    data,
  }).then((res) => {
    if (res?.data) {
      return { ...res, data: { ...res.data, ...res.data.user, isForllow: res.data.flag } };
    }
    return res;
  });
}
//余额支付
export function apigoldpay(data) {
  return request({
    url: "/web/user/pay_gold",
    data,
    headers: {
      Authorization: getToken(), // 添加token
    },
  });
}
//微信支付
export function apiWxpay(data) {
  return request({
    url: "/web/user/pay_wx",
    data,
    headers: {
      Authorization: getToken(), // 添加token
    },
  });
}

export function apiGetClassList() {
  return request({
    url: "/wallList",
  });
}

export function apiGetSetupScore(data = {}) {
  return request({
    url: "/setupScore",
    data,
  });
}

export function apiWriteDownload(data = {}) {
  return request({
    url: "/downloadWall",
    data,
  });
}

export function apiDetailWall(data = {}) {
  return request({
    url: "/detailWall",
    data,
  });
}

export function apiUserInfo(data = {}) {
  return request({
    url: "/userInfo",
    data,
  });
}

export function apiGetHistoryList(data = {}) {
  return request({
    url: "/userWallList",
    data,
  });
}

export function apiNoticeDetail(data = {}) {
  return request({
    url: "/wallNewsDetail",
    data,
  });
}

// 查询彩票期号接口
export function apiGetIssueNo(data = {}) {
  return request({
    url: "/web/ticket/find_issueno",
    method: "GET",
    data,
  });
}

// 查询彩票最新开奖结果接口
export function apiFindResult(headers = {}) {
  return request({
    url: "/web/ticket/find_result",
    method: "GET",
    headers,
  });
}

// 帖子点赞接口
export function apiPostLike(data = {}) {
  return request({
    url: "/web/post/like_count",
    method: "POST",
    data,
  });
}
// 帖子列表查询接口
export function apiPostListQuery(data = {}) {
  return request({
    url: "/web/post/query",
    method: "POST",
    data,
  });
}
export function apiSearchData(data = {}) {
  return request({
    url: "/searchWall",
    data,
  });
}
// 解梦查询接口
export function apiDreamQuery(data = {}) {
  return request({
    url: "/web/dream/query",
    method: "POST",
    data,
  });
}

// 用户充值接口
export function apiUserRecharge(data = {}) {
  return request({
    url: "/web/order/recharge",
    method: "POST",
    data,
  });
}

// 获取用户金币余额查询接口
export function apiGetUserBalance(data = {}) {
  return request({
    url: "/web/user/find_gold",
    method: "GET",
    data,
  });
}
// 发帖接口
export function apiPost(data = {}) {
  return request({
    url: "/web/post/insert",
    method: "POST",
    data,
  });
}
// 查询订单支付状态接口
export function apiGetOrderPayStatus(data = {}) {
  return request({
    url: "/web/order/find_pay_status",
    method: "GET",
    data,
    headers: {
      Authorization: getToken(),
    },
  });
}
// 用户信息修改接口
export function apiUpdateUserProfile(data = {}) {
  return request({
    url: "/web/user/update",
    method: "POST",
    data,
  });
}
// 追加帖子接口
export function apiPostUpdate(data = {}) {
  return request({
    url: "/web/post/update",
    method: "GET",
    data,
  });
}
// 获取OSS临时凭证接口（使用现有的apigetsts）
export function getCOSSecretKey(params = {}) {
  return apigetsts(params);
}

// 订单查询接口
export function apiOrderQuery(data = {}) {
  return request({
    url: "/web/order/query",
    method: "POST",
    data,
  });
}

// 账单查询接口
export function apiBillQuery(data = {}) {
  return request({
    url: "/web/bill/query",
    method: "POST",
    data,
  });
}

// 上传视频表格数据接口
// 参数示例：{ videoId, content, issueno, tname, opendate, wimg }
export function apiWordInsert(data = {}) {
  return request({
    url: "/web/vword/insert",
    method: "POST",
    data,
  });
}

// 查询视频表格数据接口
// 参数：videoId
export function apiWordQuery(data = {}) {
  return request({
    url: "/web/vword/find_wimg",
    method: "GET",
    data,
  });
}

// 查询当前app版本
export function apiAppversionQuery(data = {}) {
  return request({
    url: "/web/version/get_new",
    method: "GET",
    data,
  });
}

export function getWXSDKAccessToken(data = {}) {
  return request({
    url: "/web/getWXSDKAccessToken",
    method: "GET",
    data,
  });
}

// 提交反馈接口
export function apiSubmitFeedback(data = {}) {
  return request({
    url: "/web/suggest/insert",
    method: "POST",
    data,
  });
}

// 用户关注列表
export function getUserFollowApi(data = {}) {
  return request({
    url: "/web/follow/query",
    method: "GET",
    data,
  });
}

// 取消用户关注
export function cancelUserFollowApi(data = {}) {
  return request({
    url: "/web/follow/delete",
    method: "GET",
    data,
  });
}
// 用户关注
export function userFollowApi(data = {}) {
  return request({
    url: "/web/follow/insert",
    method: "POST",
    data,
  });
}
// 查询用户关注、粉丝总数
export function getUserFollowCountApi(data = {}) {
  return request({
    url: "/web/follow/count",
    method: "GET",
    data,
  });
}
// 粉丝列表
export function getUserFansApi(data = {}) {
  return request({
    url: "/web/follow/queryfs",
    method: "GET",
    data,
  });
}
// 搜索用户
export function searchUserApi(data = {}) {
  return request({
    url: "/web/user/find_by_uname",
    method: "GET",
    data,
  });
}

// 长条
export function apiGetChangtiaoForisseno(issueno) {
  return request({
    url: "/web/long_strip/select",
    method: "GET",
    data: {
      issueno: issueno,
    },
  });
}

export function apiGetChangtiaoForlname(name) {
  return request({
    url: "/web/long_strip/query",
    method: "POST",
    data: {
      lname: name,
      page: 1,
      limit: 10,
    },
  });
}

//查询个人当前期号发帖
export function apiFind_post_by_account(tname, issueno) {
  return request({
    url: "/web/post/find_by_account",
    method: "GET",
    data: {
      tname,
      issueno,
    },
  });
}

//查询个人发帖列表
export function apiSelect_by_account(data) {
  return request({
    url: "/web/post/select_by_account",
    method: "POST",
    data,
  });
}

//查询个人视频列表
export const getUserVideoListApi = (data) => {
  return request({
    url: "/web/video/find_by_account",
    method: "GET",
    data,
  });
};

// 用户注销
export const getUserDelete = () => {
  return request({
    url: "/web/user/delete",
    method: "GET",
  });
}
// 举报
export const sendReport = ({ title, content, rpid, type }) => {
  return request({
    url: "/web/report/insert",
    method: "POST",
    data: {
      title,
      content,
      rpid,
      type,
    },
  });
};

// 查询用户银行卡列表
export const getUserBankListApi = () => {
  return request({
    url: "/web/bank/query",
    method: "GET",
  });
};

// 添加银行卡
export const addBankCardApi = ({ bankNo, bname, uname }) => {
  return request({
    url: "/web/bank/insert",
    method: "POST",
    data: { bankNo, bname, uname },
  });
};

// 删除银行卡
export const deleteBankCardApi = (bid) => {
  return request({
    url: "/web/bank/delete?id=" + bid,
    method: "GET",
  });
};

// 提现
export const withdrawApi = ({ amount, bankNo, bname, uname }) => {
  return request({
    url: "/web/withdraw/insert",
    method: "POST",
    data: { amount, bankNo, bname, uname },
  });
};

// 查询提现记录
export const getWithdrawListApi = (page, limit) => {
  return request({
    url: `/web/withdraw/query?page=${page}&limit=${limit}`,
    method: "GET",
  });
};

// 获取收益记录
export const getIncomeListApi = (page, limit) => {
  return request({
    url: `/web/withdraw/find_income?page=${page}&limit=${limit}`,
    method: "GET",
  });
};

export const vcodeConfiont = (account, vcode) => {
  return request({
    url: "/web/vcode/insert",
    method: "POST",
    data: {
      account,
      vcode,
    },
  });
};

export const delVideo = (id) => {
  return request({
    url: "/web/video/delete?id=" + id,
    method: "GET",
  });
};

export const post_select_by_follow = (data) => {
  return request({
    url: "/web/post/select_by_follow",
    method: "POST",
    data,
  });
};
