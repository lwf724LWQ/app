/** uniapp 引入官方wxsdk
 * <script src="http://res.wx.qq.com/open/js/jweixin-1.6.0.js"/>  
    <script>  
        window.jWeixin=window.wx;  
        delete window.wx;  
    </script>  

    注意wx要全部替换成jWeixin
 */
import {getWXSDKAccessToken} from "../api/apis.js"
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

// 生成随机字符串
function generateRandomString(length = 16) {
    const array = new Uint8Array(length);
    if (typeof crypto !== 'undefined') {
        crypto.getRandomValues(array);
    } else {
        // 降级处理
        for (let i = 0; i < length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }
    
    // 转换为十六进制字符串
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// 使用crypto 生成sha1加密
function sha1(str) {
    const buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-1', buffer).then(function(hash) {
        // 将hash值转换为十六进制字符串
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    });
}
const appid = "wxd145b4a6dc948d7f"

// 改方法存储未init前执行的init方法
const waitDoList = []
const isDebug = true
const isReady = false
function log(...arg){
    if(isDebug){
        console.log(...arg)
    }
}

export default {
    isWx(){
        return !!WeixinJSBridge
    },
    async wxInit(){
        const timestamp = Math.floor(Date.now() / 1000)
        const nonceStr = generateRandomString()
        const access_token = await getAccessToken()
        const url = window.location.origin + window.location.pathname
        const signature = await sha1(`jsapi_ticket=${access_token}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`)
        
        const wxConfigObj = {
            debug: isDebug,
            appId: appid,
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature,
            jsApiList: [],
            access_token: access_token,
            url:url
        }
        log(wxConfigObj)
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

    async wxPay(){
        
    }

}