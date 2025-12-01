const BASE_URL = 'http://caimi.s7.tunnelfrp.com';

// 全局token变量
let globalToken = '';
// 设置token的方法
export function setToken(token) {
  globalToken = token;
  uni.setStorageSync('token', token);//保存到本地
}
// 获取Token的方法
export function getToken() {
    const localToken = uni.getStorageSync('token');
    return globalToken || localToken;
}
// 移除Token的方法
export function removeToken() {
    globalToken = '';
    uni.removeStorageSync('token');
}

export function apiGetBanner(){
	return request({
		url:"/homeBanner"
	})	
}

//设置账号
let globalAccount = '';
// 设置账号的方法
export function setAccount(account) {
  globalAccount = account;
  uni.setStorageSync('account', account);//保存到本地
}
// 获取账号的方法
export function getAccount() {
    const localAccount = uni.getStorageSync('account');
    return globalAccount || localAccount;
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
		}else{
			const token = getToken()
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
		}
		return false	
	}
	return true
}

// 检查code
function checkCode(res){
	if (res && res.code === 200){
		return true
	} else {
		return false
	}
}