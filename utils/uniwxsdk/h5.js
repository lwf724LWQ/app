/** uniapp 引入官方wxsdk
 * <script src="http://res.wx.qq.com/open/js/jweixin-1.6.0.js"/>  
    <script>  
        window.jWeixin=window.wx;  
        delete window.wx;  
    </script>  

    注意wx要全部替换成jWeixin
 */
import {getWXSDKAccessToken} from "../../api/apis.js"
import config from "./config.js"
import tool from "./tool.js"

async function getAccessToken(){
    return "123123"
    // 这里对获取access_token进行一个解耦
    try {
        const res = await getWXSDKAccessToken()
        return res.data.access_token
    } catch (error) {
        uni.showToast({
            title: "获取微信授权失败",
            icon: "error"
        })
    }
}

// 改方法存储未init前执行的init方法
const waitDoList = []
const isDebug = true


export default {
    isWx(){
        return !!WeixinJSBridge
    },
    async init(){
        const appId = config.appid
        const timestamp = Math.floor(Date.now() / 1000)
        const nonceStr = tool.generateRandomString()
        const access_token = await getAccessToken()
        const url = window.location.origin + window.location.pathname
        const signature = await tool.sha1(`jsapi_ticket=${access_token}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`)
        
        const wxConfigObj = {
            debug: isDebug,
            appId: appId,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature,
            jsApiList: [],
            access_token: access_token,
            url:url
        }
        tool.log(wxConfigObj)
        jWeixin.config(wxConfigObj);

        jWeixin.ready(function(){
            isReady = true
            waitDoList.forEach(fn => {
                try {
                    fn()
                } catch (error) {
                    
                }
            })
        })
    },

    doWxSDK(fn){
        if (isReady) {
            fn()
        }else{
            waitDoList.push(fn)
        }
    },

    async pay(prepay_id){
        const appId = config.appid
        const timestamp = Math.floor(Date.now() / 1000)
        const nonceStr = tool.generateRandomString()
        const prepay_id_str = "prepay_id=wx21201855730335ac86f8c43d1889123400"
        const signType = "RSA"
        const url = window.location.origin + window.location.pathname
        const signature = await tool.sha1(`jsapi_ticket=${access_token}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`)
        
        const wxConfigObj = {
            debug: isDebug,
            appId: appId,
            timestamp: timestamp,
            nonceStr: nonceStr,
            package: prepay_id_str,
            signType: signType,
            paySign: paySign
        }
        tool.log(wxConfigObj)
        WeixinJSBridge.invoke('getBrandWCPayRequest', {
            "appId": config.appid,     //公众号ID，由商户传入     
            "timeStamp": "1395712654",     //时间戳，自1970年以来的秒数     
            "nonceStr": "e61463f8efa94090b1f366cccfbbb444",      //随机串     
            "package": "prepay_id=wx21201855730335ac86f8c43d1889123400",
            "signType": "RSA",     //微信签名方式：     
            "paySign": "oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ\/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8Pfso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7eaLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+AehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq\/xDg==" //微信签名 
        },
        function(res) {
            if (res.err_msg == "get_brand_wcpay_request:ok") {
                // 使用以上方式判断前端返回,微信团队郑重提示：
                //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠，商户需进一步调用后端查单确认支付结果。
            }
        });
    }   

}