<template>
  <uni-popup ref="popup" type="dialog">
    <view class="popup-content">
      <view class="popup-header">
        <text class="popup-title">注销账号</text>
      </view>
      <view class="popup-body">
        <text class="popup-desc">注销账号后，您的所有数据将被永久删除且无法恢复，请谨慎操作！</text>
        <text class="popup-warning">请输入您的账号以确认注销：</text>
        <input
          class="input-account"
          v-model="inputAccount"
          placeholder="请输入账号"
          type="text"
          @input="onInput"
        />
        <text class="error-message" v-if="errorMessage">{{ errorMessage }}</text>
      </view>
      <view class="popup-footer">
        <button class="btn-cancel" @click="cancel">取消</button>
        <button class="btn-confirm" @click="confirm" :disabled="isSubmitting">
          {{ isSubmitting ? "提交中..." : "确定" }}
        </button>
      </view>
    </view>
  </uni-popup>
</template>

<script>
import {getUserDelete} from "@/api/apis.js"
import { useUserStore } from "@/stores/userStore";
export default {
  name: "UserCloseConfirmation",
  data() {
    return {
      inputAccount: "",
      errorMessage: "",
      isSubmitting: false,
      expectedAccount: "",
    };
  },
  methods: {
    /**
     * 打开弹窗
     * @param {String} account - 用户账号
     * @param {Function} onConfirm - 确认回调函数
     */
    open(account, onConfirm) {
      this.expectedAccount = account;
      this.inputAccount = "";
      this.errorMessage = "";
      this.$refs.popup.open();
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.$refs.popup.close();
    },

    /**
     * 取消操作
     */
    cancel() {
      this.close();
    },

    /**
     * 确认操作
     */
    confirm() {
      if (!this.inputAccount.trim()) {
        this.errorMessage = "请输入账号";
        return;
      }

      if (this.inputAccount !== this.expectedAccount) {
        this.errorMessage = "账号输入错误，请重新输入";
        return;
      }

      // 执行注销.... code
      console.log("注销账号：", this.inputAccount);
	  uni.showLoading({
	  	title: "注销中..."
	  })
	  getUserDelete().then(()=>{
		  uni.hideLoading()
		  const userStore = useUserStore();
		  userStore.clearUserInfo();
		  this.close()
		  uni.switchTab({
		  	url: "/pages/index/index"
		  })
	  })
    },

    /**
     * 输入框内容变化时清除错误信息
     */
    onInput() {
      if (this.errorMessage) {
        this.errorMessage = "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.popup-content {
  width: 600rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #fff;
}

.popup-header {
  padding: 40rpx 30rpx 20rpx;
  text-align: center;

  .popup-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.popup-body {
  padding: 0 40rpx 30rpx;

  .popup-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 30rpx;
  }

  .popup-warning {
    font-size: 28rpx;
    color: #ff6b6b;
    display: block;
    margin-bottom: 20rpx;
  }

  .input-account {
    height: 80rpx;
    border: 2rpx solid #e5e5e5;
    border-radius: 10rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    margin-bottom: 20rpx;
	box-sizing: border-box;
	
  }

  .error-message {
    color: #ff6b6b;
    font-size: 24rpx;
    display: block;
  }
}

.popup-footer {
  display: flex;
  padding: 20rpx 30rpx 40rpx;
  gap: 20rpx;

  .btn-cancel,
  .btn-confirm {
    flex: 1;
    height: 80rpx;
    border-radius: 10rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-cancel {
    background-color: #f5f5f5;
    color: #333;
    border: none;
  }

  .btn-confirm {
    background-color: #ff4757;
    color: #fff;
    border: none;

    &[disabled] {
      background-color: #cccccc;
      opacity: 0.6;
    }
  }
}
</style>
