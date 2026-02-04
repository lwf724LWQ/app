<template>
  <uni-popup ref="popup" type="center" :mask-click="isClose">
    <view class="password-container">
      <view class="title">设置新密码</view>

      <view class="input-group">
        <input
          type="password"
          v-model="password"
          placeholder="请输入新密码"
          class="input-field"
          placeholder-style="color: var(--light-text-color);font-size: 35rpx"
        />
      </view>
      <view class="input-group">
        <input
          type="password"
          v-model="confirmPassword"
          placeholder="请再次输入密码"
          placeholder-style="color: var(--light-text-color);font-size: 35rpx"
          class="input-field"
        />
      </view>
      <view v-if="!canSubmit" style="color: red; font-size: 35rpx">最短6位数</view>
      <view class="btn-group">
        <button @click="submitPassword" :disabled="!canSubmit" class="submit-btn">确认设置</button>
      </view>
    </view>
  </uni-popup>
</template>

<script>
import { apiUpdateUserProfile } from "@/api/apis.js";
export default {
  name: "SetPassword",
  data() {
    return {
      password: "",
      confirmPassword: "",
      isClose: false,
    };
  },
  computed: {
    canSubmit() {
      return this.password.length >= 6 && this.password === this.confirmPassword;
    },
  },
  methods: {
    open(isClose) {
      this.$refs.popup.open();
      this.isClose = isClose;
    },
    close() {
      this.$refs.popup.close();
    },
    async submitPassword() {
      if (this.password !== this.confirmPassword) {
        uni.showToast({
          title: "两次输入的密码不一致",
          icon: "none",
        });
        return;
      }

      if (this.password.length < 6) {
        uni.showToast({
          title: "密码长度至少6位",
          icon: "none",
        });
        return;
      }

      // 这里处理密码设置逻辑
      console.log("设置密码:", this.password);
      let res;
      try {
        res = await apiUpdateUserProfile({
          password: this.password,
        });
        uni.showToast({
          title: "密码设置成功",
          icon: "success",
        });
      } catch (error) {
        uni.showToast({
          title: "密码设置失败，稍后可在主页设置重新尝试修改密码",
          icon: "success",
        });
      }

      this.password = "";
      this.confirmPassword = "";

      // 关闭弹窗
      this.close();

      // 触发父组件事件，通知密码已设置
      this.$emit("password-set", this.password);
    },
  },
};
</script>

<style scoped>
.password-container {
  padding: 40rpx;
  background-color: #fff;
  border-radius: 10rpx;
  width: 80vw;
}

.title {
  font-size: 36rpx;
  text-align: center;
  margin-bottom: 60rpx;
  color: #333;
  font-weight: bold;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.btn-group {
  margin-top: 40rpx;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007aff;
  color: white;
  border-radius: 10rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:disabled {
  background-color: #ccc;
}
</style>
