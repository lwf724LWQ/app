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

    async pay(){
        
    }

}