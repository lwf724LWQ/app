"use strict";
const utils_request = require("../utils/request.js");
function apiGetClassify(data = {}) {
  return utils_request.request({
    url: "/classify",
    data
  });
}
function apiTicketQuery(data = {}) {
  return utils_request.request({
    url: "/web/ticket/query",
    data
  });
}
function apiRegInfo(data = {}) {
  return utils_request.request({
    url: "/web/user/insert",
    method: "POST",
    data
  });
}
function apiSendCode(data) {
  return utils_request.request({
    url: "/web/user/send_sms",
    data
  });
}
function apilogin(data = {}) {
  return utils_request.request({
    url: "/web/user/login",
    method: "POST",
    data
  });
}
function apigetsts(headers = {}) {
  return utils_request.request({
    url: "/web/video/get_sts",
    heade: headers
    // 将参数放在请求头中
  });
}
function apiGetVideo(data = {}) {
  return utils_request.request({
    url: "/web/video/query",
    data
  });
}
function apiGetIsLike(data = {}) {
  return utils_request.request({
    url: "/web/video/like_count",
    method: "POST",
    data: {
      id: data.id,
      account: utils_request.getAccount(),
      type: data.isLiked ? 0 : 1
      // 0点赞，1取消点赞
    }
  });
}
function apiGetLikelist(account) {
  return utils_request.request({
    url: "/web/video/query_like_count",
    data: { account }
  });
}
function apiSubmitVideo(data) {
  return utils_request.request({
    url: "/web/video/insert",
    method: "POST",
    data
  });
}
function apiCheckVideoPayment(data = {}) {
  return utils_request.request({
    url: "/web/video/find_pay",
    method: "GET",
    data,
    headers: {
      "Authorization": utils_request.getToken()
    }
  });
}
function apiRewardVideo(data) {
  return utils_request.request({
    url: "/web/order/recharge",
    method: "POST",
    data: {
      info: data.info,
      amount: data.amount,
      type: data.type,
      account: data.account,
      payType: data.payType,
      channel: data.channel
    },
    headers: {
      "Authorization": utils_request.getToken()
      // 添加token
    }
  });
}
function apiUserimg(data) {
  return utils_request.request({
    url: "/web/user/find_info",
    data
  });
}
function apigoldpay(data) {
  return utils_request.request({
    url: "/web/user/pay_gold",
    data,
    headers: {
      "Authorization": utils_request.getToken()
      // 添加token
    }
  });
}
function apiWxpay(data) {
  return utils_request.request({
    url: "/web/user/pay_wx",
    data,
    headers: {
      "Authorization": utils_request.getToken()
      // 添加token
    }
  });
}
function apiGetClassList() {
  return utils_request.request({
    url: "/wallList"
  });
}
function apiGetHistoryList(data = {}) {
  return utils_request.request({
    url: "/userWallList",
    data
  });
}
function apiNoticeDetail(data = {}) {
  return utils_request.request({
    url: "/wallNewsDetail",
    data
  });
}
function apiGetIssueNo(data = {}) {
  return utils_request.request({
    url: "/web/ticket/find_issueno",
    method: "GET",
    data
  });
}
function apiFindResult(headers = {}) {
  return utils_request.request({
    url: "/web/ticket/find_result",
    method: "GET",
    headers
  });
}
function apiPostLike(data = {}) {
  return utils_request.request({
    url: "/web/post/like_count",
    method: "POST",
    data
  });
}
function apiPostListQuery(data = {}) {
  return utils_request.request({
    url: "/web/post/query",
    method: "POST",
    data
  });
}
function apiSearchData(data = {}) {
  return utils_request.request({
    url: "/searchWall",
    data
  });
}
function apiDreamQuery(data = {}) {
  return utils_request.request({
    url: "/web/dream/query",
    method: "POST",
    data
  });
}
function apiUserRecharge(data = {}) {
  return utils_request.request({
    url: "/web/order/recharge",
    method: "POST",
    data
  });
}
function apiGetUserBalance(data = {}) {
  return utils_request.request({
    url: "/web/user/find_gold",
    method: "GET",
    data
  });
}
function apiPost(data = {}) {
  return utils_request.request({
    url: "/web/post/insert",
    method: "POST",
    data
  });
}
function apiGetOrderPayStatus(data = {}) {
  return utils_request.request({
    url: "/web/order/find_pay_status",
    method: "GET",
    data,
    headers: {
      "Authorization": utils_request.getToken()
    }
  });
}
function apiUpdateUserProfile(data = {}) {
  return utils_request.request({
    url: "/web/user/update",
    method: "POST",
    data
  });
}
function apiPostUpdate(data = {}) {
  return utils_request.request({
    url: "/web/post/update",
    method: "GET",
    data
  });
}
function getCOSSecretKey(params = {}) {
  return apigetsts(params);
}
function apiOrderQuery(data = {}) {
  return utils_request.request({
    url: "/web/order/query",
    method: "POST",
    data
  });
}
function apiBillQuery(data = {}) {
  return utils_request.request({
    url: "/web/bill/query",
    method: "POST",
    data
  });
}
exports.apiBillQuery = apiBillQuery;
exports.apiCheckVideoPayment = apiCheckVideoPayment;
exports.apiDreamQuery = apiDreamQuery;
exports.apiFindResult = apiFindResult;
exports.apiGetClassList = apiGetClassList;
exports.apiGetClassify = apiGetClassify;
exports.apiGetHistoryList = apiGetHistoryList;
exports.apiGetIsLike = apiGetIsLike;
exports.apiGetIssueNo = apiGetIssueNo;
exports.apiGetLikelist = apiGetLikelist;
exports.apiGetOrderPayStatus = apiGetOrderPayStatus;
exports.apiGetUserBalance = apiGetUserBalance;
exports.apiGetVideo = apiGetVideo;
exports.apiNoticeDetail = apiNoticeDetail;
exports.apiOrderQuery = apiOrderQuery;
exports.apiPost = apiPost;
exports.apiPostLike = apiPostLike;
exports.apiPostListQuery = apiPostListQuery;
exports.apiPostUpdate = apiPostUpdate;
exports.apiRegInfo = apiRegInfo;
exports.apiRewardVideo = apiRewardVideo;
exports.apiSearchData = apiSearchData;
exports.apiSendCode = apiSendCode;
exports.apiSubmitVideo = apiSubmitVideo;
exports.apiTicketQuery = apiTicketQuery;
exports.apiUpdateUserProfile = apiUpdateUserProfile;
exports.apiUserRecharge = apiUserRecharge;
exports.apiUserimg = apiUserimg;
exports.apiWxpay = apiWxpay;
exports.apigetsts = apigetsts;
exports.apigoldpay = apigoldpay;
exports.apilogin = apilogin;
exports.getCOSSecretKey = getCOSSecretKey;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/apis.js.map
