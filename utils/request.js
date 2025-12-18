export const BASE_URL = 'http://caimi.s7.tunnelfrp.com';
// export const BASE_URL = 'http://api.彩迷.com/api';

import { useUserStore } from '../stores/userStore'
let userStore;
function initStore() {
	// 因为直接初始化store会导致提前调用，这样js加载后才调用就不会
	if (!userStore) {
		userStore = useUserStore()
	}
}

// 设置token的方法
export function setToken(token) {
	initStore()
	userStore.setToken(token);
  //保存到本地
}
// 获取Token的方法
export function getToken() {
	initStore()
    return userStore.getToken
}
// 移除Token的方法
export function removeToken() {
	initStore()
    userStore.clearUserInfo()
}

export function apiGetBanner(){
	return request({
		url:"/homeBanner"
	})	
}

// 获取账号的方法
export function getAccount() {
	initStore()
    return userStore.getUserInfo?.account || false
}

export function request(config={}){	
	let {
		url,
		data={},
		method="GET",
		header={}
	} = config
	
	url = BASE_URL+url
	
	// 设置默认请求头
	if (!header['Content-Type']) {
		header['Content-Type'] = 'application/json'
	}
	
	// 如果有令牌，添加到请求头
	const token = getToken();
	if (token) {
	    header.Authorization = `${token}`;
	}
	
	return new Promise((resolve,reject)=>{		
		uni.request({
			url,
			data,
			method,
			header,
			success:res=>{
				if (res.statusCode === 200) {
					if (handleServerError(res.data)) {
						resolve(res.data)
					}else{
						reject(res.data)
					}

					// if(res.data && res.data.code === 200){
					// 	resolve(res.data)
					// } else {
					// 	reject(res.data)
					// }
				} else {
					reject({
						code: res.statusCode,
						msg: `HTTP错误: ${res.statusCode}`,
						data: res.data
					})
				}
			},
			fail:err=>{
				reject(err)
			}
		})
	})
}

/**
 * 请求守卫
 * @param {} res 
 * @returns boolean 输出true代表没有错误 false代表有错误
 */

const guardList = [loginGuard, checkCode]
function handleServerError(res){
	return guardList.every(guard => guard(res))
}


// 判断是否未登录
const notLoginPages = ['pages/login/login'] // 白名单
function loginGuard(res){
	if (res.msg && ["Token验证失败","Token已过期"].includes(res.msg)) {
		const pages = getCurrentPages()
		if (notLoginPages.includes(pages[pages.length - 1].route)) {
			return false
		}
		// #ifdef APP-PLUS
		// app的话直接拿缓存的账号密码重新登录
		uni.showLoading({
			title: "登录校验过期，重新登录中..."
		})
		const account = uni.getStorageSync("account")
		if(account){
			request({
				url: "/web/user/login",
				method: "POST",
				data:{
					type: "0",
					account: account,
					password: uni.getStorageSync("password"),
				}
			}).then((loginRes)=>{
				uni.hideLoading()
				// 从登录返回的数据中提取用户信息
				const loginData = loginRes.data || {};
				// 保存用户信息到本地存储
				const userInfo = {
				  nickname: loginData.uname || '用户',
				  avatar: loginData.himg,
				  account: account.value
				};
				userStore.updateUserInfo(userInfo, success.data.token);
				uni.showToast({
					title: "重新登录成功，请重新操作"
				})
			}).catch(()=>{
				uni.hideLoading()
				uni.showModal({
					title: "自动登录失败",
					content: "请使用账号密码重新登录",
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({url:'/pages/login/login'})
						}
					}
				})
			})
			return
		}
		// #endif
		
		const token = getToken()
		userStore.clearUserInfo()
		uni.showModal({
			title: '提示',
			content: token ? '登录过期，请重新登录' : '当前未登录或者登录过期，请重新登录',
			success: async (res) => {
				if (res.confirm) {
					uni.navigateTo({url:'/pages/login/login'})
				}
			},
			showCancel: true,
		})
		return false	
	}
	return true
}

// 检查code
function checkCode(res){
	if (res.success) {
		return true
	}
	if (res && res.code === 200){
		return true
	} else {
		return false
	}
}