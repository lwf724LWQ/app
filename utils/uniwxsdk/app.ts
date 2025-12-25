import config from "./config.js"
import paytool from "./tool.js"

export default {
    init(){},
    pay(partnerId: string, prepayId: string){
        return new Promise(async (resolve, reject) => {
			try{
				paytool.log("开始支付")
				paytool.log(partnerId)
				paytool.log(prepayId)
				
				const appId = config.appid;
				paytool.log(appId)
				const time = Math.floor(Date.now() / 1000);
				paytool.log(time)
				
				const nonceStr = paytool.generateRandomString(16);
				
				paytool.log(nonceStr)
				const str = `appid=${appId}&noncestr=${nonceStr}&package=Sign=WXPay&partnerid=${partnerId}&prepayid=${prepayId}&timestamp=${time}&key=${config.appSignature}`
				paytool.log(str)
				const sign = paytool.md5(str)
				paytool.log(sign)
				const orderInfo = {
				    appid: appId,
				    partnerid: partnerId,
				    prepayid: prepayId,
				    package: "Sign=WXPay",
				    noncestr: nonceStr,
				    timestamp: time,
				    sign: sign
				}
				console.log(orderInfo)
				// console.log(str)
				// console.log(sign)
				uni.requestPayment({
				    provider: 'wxpay',
				    orderInfo: orderInfo,
				    success: function (res) {
				        console.log(res)
				    },
				    fail: function (res) {
				        console.log(res)
				    }
				})
			}catch(error){
				console.log(error)
			}
            
        })
    }
}