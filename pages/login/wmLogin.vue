<template>
<view class="page">
    <wmLogin 
        :showWechat="false" 
        :showPolicy="false"
        @sendCode="handleSendCode"
        @phoneLogin="handlePhoneLogin">
    </wmLogin>
</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import wmLogin from "@/uni_modules/wm-login/components/wm-login/wm-login.vue"

onLoad(() => {

})
const handleSendCode = () => {
    // 模拟后端发送验证码
    setTimeout(() => {
        uni.showToast({
            title: '验证码已发送'
        })
    }, 1000)
}

const handlePhoneLogin = (data) => {
    console.log(data);
    uni.showToast({
        title: '登录成功'
    })
    uni.navigateBack()
}

</script>

