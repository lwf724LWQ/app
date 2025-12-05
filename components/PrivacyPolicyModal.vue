<!-- PrivacyPolicyModal.vue -->
<template>
    <view v-if="visible" class="privacy-modal-overlay" @touchmove.stop.prevent>
        <view class="privacy-modal-container">
            <view class="privacy-modal-header">
                <view>隐私政策与用户协议</view>
            </view>
            <view class="privacy-modal-content">
                <view>尊敬的用户，欢迎使用我们的服务。我们非常重视您的个人信息和隐私保护。</view>
                <view>在您使用彩迷服务前，请仔细阅读</view>
                <text class="href" @click="openPrivacyPolicy">《隐私政策》</text>和<text class="href"
                    @click="openUserAgreement">《用户协议》</text>
                <view>我们将按照您同意的条款使用您的个人信息，以便为您提供服务。</view>
            </view>
            <view class="privacy-modal-content">
                如您同意此政策，请点击“同意"并开始使用我们的产品和服务，我们尽全力保护您的个人信息安全。
            </view>
            <div class="privacy-modal-footer">
                <button class="btn-disagree" @click="handleDisagree">退出</button>
                <button class="btn-agree" @click="handleAgree">同意</button>
            </div>
        </view>
    </view>
</template>

<script>
export default {
    name: 'PrivacyPolicyModal',
    data() {
        // #ifdef APP-PLUS
        const visible = uni.getStorageSync('privacyPolicyAgreed') !== 'true'
        // #endif
        // #ifdef H5
        const visible = false
        // #endif
		if(visible){
			uni.hideTabBar()
		}
        return {
            visible: visible
        }
    },
    methods: {
        handleAgree() {
            this.visible = false
			uni.showTabBar()
            uni.setStorageSync('privacyPolicyAgreed', 'true')
        },
        handleDisagree() {
			plus.runtime.quit()
        },
        openPrivacyPolicy() {
            uni.navigateTo({
                url: '/pages/login/agreement?type=PrivacyPolicy',
            })
        },
        openUserAgreement() {
            uni.navigateTo({
                url: '/pages/login/agreement?type=UserAgreement',
            })
        }
    }
}
</script>

<style scoped>
.privacy-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-weight: bold;
}

.privacy-modal-container {
    background: white;
    border-radius: 16rpx;
    width: 90%;
    max-width: 680rpx;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.privacy-modal-header {
    padding: 40rpx;
    border-bottom: 1px solid #eee;
}

.privacy-modal-header h2 {
    margin: 0;
    color: #333;
    font-size: 40rpx;
}

.privacy-modal-content {
    padding: 40rpx;
    overflow-y: auto;
    flex: 1;
}

.policy-section {
    margin-bottom: 40rpx;
}

.policy-section h3 {
    color: #333;
    margin-top: 0;
    margin-bottom: 20rpx;
}

.policy-section p {
    color: #666;
    line-height: 1.6;
    margin: 16rpx 0;
}

.policy-links {
    margin-top: 40rpx;
    padding-top: 30rpx;
    border-top: 1px solid #eee;
}

.policy-links a {
    display: block;
    color: #409EFF;
    text-decoration: none;
    margin-bottom: 20rpx;
}

.policy-links a:hover {
    text-decoration: underline;
}

.privacy-modal-footer {
    padding: 40rpx;
    border-top: 1rpx solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-agree,
.btn-disagree {
    padding: 20rpx 40rpx;
    border-radius: 4px;
    cursor: pointer;
    font-size: 30rpx;
    transition: all 0.3s;
}

.btn-agree {
    background-color: #409EFF;
    color: white;
    border: 1px solid #409EFF;
}

.btn-agree:hover {
    background-color: #66b1ff;
}

.btn-disagree {
    background-color: transparent;
    color: #666;
    border: 1px solid #dcdfe6;
}

.btn-disagree:hover {
    background-color: #f5f7fa;
}

.href {
    color: blue;
}
</style>