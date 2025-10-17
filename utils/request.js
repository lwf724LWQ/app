
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
	// header['access-key'] = "xxxxxx"
	//如果有令牌
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
					if(res.data && res.data.code === 200){
						resolve(res.data)
					} else {
						reject(res.data)
					}
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
