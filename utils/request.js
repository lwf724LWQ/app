
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
    return globalToken || uni.getStorageSync('token');
}

export function apiGetBanner(){
	return request({
		url:"/homeBanner"
	})	
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
	console.log(token)
	    if (token) {
	        // 使用标准Authorization头
	        header.Authorization = `${token}`;
	    }
	
	console.log('请求参数：',  {url, data, method, header});
	return new Promise((resolve,reject)=>{		
		uni.request({
			url,
			data,
			method,
			header,
			success:res=>{
				if(res.data.code===200){
					resolve(res.data)
				}else{
					uni.showModal({
						title:"错误提示",
						content:res.data.errMsg,
						showCancel:false
					})
					reject(res.data)
				}
			},
			fail:err=>{
				reject(err)
			}
		})
	})
}
