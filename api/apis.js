import {
	request
} from "@/utils/request.js"


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