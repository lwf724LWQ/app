import config from "./config.js"
import tool from "./tool.js"


export default {
    init(){},
    pay(partnerId: string, prepayId: string){
        return new Promise((resolve, reject) => {
            tool.log("开始支付")
            tool.log(partnerId)
            tool.log(prepayId)
			try{
				const appId = config.appid;
				const time = Math.floor(Date.now() / 1000);
				const nonceStr = tool.generateRandomString(16);
				console.log(`${appId}\n${time}\n${nonceStr}\n${partnerId}\n`)
				const sign = tool.signWithRSA(`${appId}\n${time}\n${nonceStr}\n${partnerId}\n`, config.appPEMKey);
				const orderInfo = {
				    appId: appId,
				    partnerId: partnerId,
				    prepayId: prepayId,
				    nonceStr: nonceStr,
				    timeStamp: time,
				    sign: sign
				}
				tool.log(orderInfo)
				uni.requestPayment({
				    provider: 'wxpay',
				    orderInfo: orderInfo,
				    success: function (res) {
				        
				    },
				    fail: function (res) {
				        
				    }
				})
			}catch(error){
				console.log(error)
			}
            
        })
    }
}