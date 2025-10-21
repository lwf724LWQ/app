import {
	getAccount,
	request
} from "@/utils/request.js"
import {
  setToken,
  getToken, 
  setAccount, 
} from '@/utils/request.js';


export function apiGetDayRandom() {
	return request({
		url: "/randomWall"
	})
}

export function apiGetNotice(data = {}) {
	return request({
		url: "/wallNewsList",
		data
	})
}


export function apiGetClassify(data = {}) {
	return request({
		url: "/classify",
		data
	})
}
//获取画布数据
export function apiTicketQuery(data = {}) {
	return request({
		url: "/web/ticket/query",
		data
	})
}
//注册请求
export function apiRegInfo(data = {}) {
	return request({
		url: "/web/user/insert",
		method: "POST",
		data,
	})
}
//注册发送验证码
export function apiSendCode(data) {
	return request({
		url: "/web/user/send_sms",
		data
	})
}
//登录请求
export function apilogin(data = {}) {
	return request({
		url: "/web/user/login",
		method: "POST",
		data
	})
}
//获取STS令牌
export function apigetsts(headers = {}) {
	return request({
		url: "/web/video/get_sts",
		heade: headers // 将参数放在请求头中
	})
}
//获取视频列表
export function apiGetVideo(data = {}) {
	return request({
		url: "/web/video/query",
		data
	})
}
//点赞接口（用户针对某个视频是否点赞）
export function apiGetIsLike(data = {}) {
	return request({
		url: "/web/video/like_count",
		method: "POST",
		data: {
			id: data.id,
			account: getAccount(), 
			type: data.isLiked ? 0 : 1 // 0点赞，1取消点赞
		}
	})
}
//获取用户点赞列表
export function apiGetLikelist(account) {
	return request({
		url: "/web/video/query_like_count",
		data:{account}
	})
}
//上传视频
export function apiSubmitVideo(data) {
    return request({
        url: "/web/video/insert",
        method: "POST",
        data: data
    })
}

// 视频付费情况查询 
export function apiCheckVideoPayment(data = {}) {
  return request({
    url: "/web/video/find_pay",
    method: "GET",
    data,
    headers: {
      'Authorization': getToken()
    }
  })
}

export function apiGetClassList() {
	return request({
		url: "/wallList",

	})
}


export function apiGetSetupScore(data = {}) {
	return request({
		url: "/setupScore",
		data
	})
}


export function apiWriteDownload(data = {}) {
	return request({
		url: "/downloadWall",
		data
	})
}



export function apiDetailWall(data = {}) {
	return request({
		url: "/detailWall",
		data
	})
}


export function apiUserInfo(data = {}) {
	return request({
		url: "/userInfo",
		data
	})
}


export function apiGetHistoryList(data = {}) {
	return request({
		url: "/userWallList",
		data
	})
}



export function apiNoticeDetail(data = {}) {
	return request({
		url: "/wallNewsDetail",
		data
	})
}


export function apiSearchData(data = {}) {
	return request({
		url: "/searchWall",
		data
	})
}
// 解梦查询接口
export function apiDreamQuery(data = {}) {
	return request({
		url: "/web/dream/query",
		method: "POST",
		data
	})
}

// 用户充值接口
export function apiUserRecharge(data = {}) {
	return request({
		url: "/web/order/recharge",
		method: "POST",
		data
	})
}

// 获取用户金币余额查询接口
export function apiGetUserBalance(data = {}) {
	return request({
		url: "/web/user/find_gold",
		method: "GET",
		data
	})
}

// 订单查询接口
export function apiOrderQuery(data = {}) {
	return request({
		url: "/web/order/query",
		method: "POST",
		data
	})
}

// 账单查询接口
export function apiBillQuery(data = {}) {
	return request({
		url: "/web/bill/query",
		method: "POST",
		data
	})
}