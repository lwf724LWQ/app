import {
	getAccount,
	request
} from "@/utils/request.js"
import {
  getToken, 
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
export function apiGetVideoDetail(data = {}) {
	return request({
		url: "/web/video/find_by_id",
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
      channel: data.channel      
    },
    headers: {
      'Authorization': getToken()     // 添加token
    }
  })
}
//用户头像,名字
export function apiUserimg(data) {
	return request({
		url: "/web/user/find_info",
		data
	})
}
//余额支付
export function apigoldpay(data) {
	return request({
		url: "/web/user/pay_gold",
		data,
		headers: {
		  'Authorization': getToken()     // 添加token
		}
	})
}
//微信支付
export function apiWxpay(data) {
	return request({
		url: "/web/user/pay_wx",
		data,
		headers: {
		  'Authorization': getToken()     // 添加token
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

// 查询彩票期号接口
export function apiGetIssueNo(data = {}) {
	return request({
		url: "/web/ticket/find_issueno",
		method: "GET",
		data
	})
}

// 查询彩票最新开奖结果接口
export function apiFindResult(headers = {}) {
	return request({
		url: "/web/ticket/find_result",
		method: "GET",
		headers
	})
}

// 帖子点赞接口
export function apiPostLike(data = {}) {
	return request({
		url: "/web/post/like_count",
		method: "POST",
		data
	})
}
// 帖子列表查询接口
export function apiPostListQuery(data = {}) {
	return request({
		url: "/web/post/query",
		method: "POST",
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
// 发帖接口
export function apiPost(data = {}) {
	return request({
		url: "/web/post/insert",
		method: "POST",
		data
	})
}
// 查询订单支付状态接口
export function apiGetOrderPayStatus(data = {}) {
	return request({
		url: "/web/order/find_pay_status",
		method: "GET",
		data,
		headers: {
			'Authorization': getToken()
		}
	})
}
// 用户信息修改接口
export function apiUpdateUserProfile(data = {}) {
	return request({
		url: "/web/user/update",
		method: "POST",
		data
	})
}
// 追加帖子接口
export function apiPostUpdate(data = {}) {
	return request({
		url: "/web/post/update",
		method: "GET",
		data
	})
}
// 获取OSS临时凭证接口（使用现有的apigetsts）
export function getCOSSecretKey(params = {}) {
	return apigetsts(params)
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

// 上传视频表格数据接口
// 参数示例：{ videoId, content, issueno, tname, opendate, wimg }
export function apiWordInsert(data = {}) {
    return request({
        url: "/web/vword/insert",
        method: "POST",
        data
    })
}

// 查询视频表格数据接口
// 参数：videoId
export function apiWordQuery(data = {}) {
    return request({
        url: "/web/vword/find_wimg",
        method: "GET",
        data
    })
}

// 查询当前app版本
export function apiAppversionQuery(data = {}) {
    return request({
        url: "/web/version/query",
        method: "GET",
        data
    })
}

export function getWXSDKAccessToken(data = {}) {
    return request({
        url: "/web/getWXSDKAccessToken",
        method: "GET",
        data
    })
}