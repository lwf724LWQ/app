<!-- FeedbackPage.vue -->
<template>
  <view class="feedback-page" :class="useOldManModeStore?.enabled ? 'old-man-mode' : ''">
    <top-navigation-bar title="意见反馈"></top-navigation-bar>
    <view class="feedback-container">
      <!-- 反馈类型 -->
      <view class="form-group">
        <label for="feedbackType">反馈类型 *</label>
        <view class="flex">
          <label class="radio">
            <radio
              value="r1"
              :checked="feedbackForm.type == '建议'"
              @click="feedbackForm.type = '建议'"
            >
              建议
            </radio>
          </label>
          <label class="radio">
            <radio
              value="r2"
              :checked="feedbackForm.type == '投诉'"
              @click="feedbackForm.type = '投诉'"
            />
            投诉
          </label>
        </view>
      </view>
      <!-- 标题 -->
      <view class="form-group">
        <label for="contactInfo">标题 *</label>
        <input
          type="text"
          id="contactInfo"
          v-model="feedbackForm.title"
          placeholder="请输入标题"
          class="form-control"
        />
      </view>

      <!-- 反馈内容 -->
      <view class="form-group">
        <label for="feedbackContent">反馈内容 *</label>
        <textarea
          id="feedbackContent"
          v-model="feedbackForm.content"
          placeholder="请输入您的反馈内容..."
          rows="5"
          required
          class="form-control content"
        ></textarea>
      </view>

      <!-- 联系方式 -->
      <view class="form-group">
        <label for="contactInfo">联系方式</label>
        <input
          type="text"
          id="contactInfo"
          v-model="feedbackForm.contact"
          placeholder="请输入邮箱或手机号（可选）"
          class="form-control"
        />
      </view>

      <!-- 提交按钮 -->
      <view class="form-group">
        <button type="submit" :disabled="isSubmitting" class="submit-btn" @click="submitFeedback">
          {{ isSubmitting ? "提交中..." : "提交反馈" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from "vue";
import TopNavigationBar from "../../components/TopNavigationBar.vue";
import { apiSubmitFeedback } from "../../api/apis.js";
import { useUserStore } from "../../stores/userStore";
import { oldManModeStoreKey } from "../../stores/oldManMode";

// 定义反馈表单数据类型
interface FeedbackForm {
  account: string;
  type: string;
  content: string;
  contact: string;
  title: string;
}

const useOldManModeStore = inject(oldManModeStoreKey);
const userStore = useUserStore();

// if (!userStore.getUserInfo?.account) {
//   uni.showModal({
//     title: "未登录账号，请先登录。",
//     showCancel: true,
//     success: function () {
//       uni.navigateTo({
//         url: "/pages/login/login",
//       });
//     },
//     fail(result) {
//       uni.navigateBack();
//     },
//   });
// }

const feedbackForm = reactive<FeedbackForm>({
  account: userStore.getUserInfo?.account || "",
  type: "建议",
  title: "",
  content: "",
  contact: "",
});

const isSubmitting = ref(false);
const submitSuccess = ref(false);

// 提交反馈
const submitFeedback = async () => {
  // 表单验证
  if (!feedbackForm.type || !feedbackForm.content) {
    uni.showToast({
      title: "请填写反馈内容",
      icon: "none",
      duration: 1500,
    });
    return;
  }

  isSubmitting.value = true;
  uni.showLoading({ title: "提交中..." });

  console.log("提交的反馈信息:", feedbackForm);
  try {
    // await apiSubmitFeedback(feedbackForm);

    uni.showToast({
      title: "感谢您的反馈！我们将会尽快处理您的意见。",
      icon: "success",
      duration: 1400,
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1200);
  } catch (error) {
    uni.showToast({
      title: "提交失败。请稍后再试。",
      icon: "error",
      duration: 1500,
    });
  }
  // 重置表单状态
  isSubmitting.value = false;
  submitSuccess.value = true;
  uni.hideLoading();
};
</script>

<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
  gap: 40rpx;
}

.feedback-page {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &.old-man-mode {
    .form-control {
      font-size: 48rpx;
      height: 100rpx;

      &.content {
        height: 400rpx;
      }
    }

    .submit-btn {
      font-size: 48rpx;
    }
  }
}

.feedback-container {
  padding: 30rpx;
}

.feedback-container h2 {
  text-align: center;
  margin-bottom: 30rpx;
  color: #333;
}

.feedback-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20rpx;
}

.form-group label {
  display: block;
  margin-bottom: 8rpx;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10rpx 30rpx;
  height: 80rpx;
  border: 1rpx solid #ddd;
  border-radius: 4rpx;
  font-size: 36rpx;
  box-sizing: border-box;

  &.content {
    height: 400rpx;
  }
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 5rpx rgba(64, 158, 255, 0.3);
}

textarea.form-control {
  resize: vertical;
  font-family: inherit;
}

.submit-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 14rpx;
  font-size: 32rpx;
  border-radius: 4rpx;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #337ecc;
}

.submit-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
