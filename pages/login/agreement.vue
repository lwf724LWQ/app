<template>
    <web-view :webview-styles="webviewStyles" :src="src"></web-view>
</template>

<script>
export default {
    data() {
        return {
            src: ''
        }
    },
    onLoad(option) {
        this.src = {
            "PrivacyPolicy": "/static/agreement-text/PrivacyPolicy.html",
            "UserAgreement": "/static/agreement-text/UserAgreement.html",
			"topupAgreement": "/static/agreement-text/topupAgreement.html"
        }[option.type]

        uni.setNavigationBarTitle({
            "PrivacyPolicy": "隐私协议",
            "UserAgreement": "用户协议",
			"topupAgreement": "充值服务协议"
        }[option.type])
    }
}
</script>

<style></style>