<template>
  <view class="report-modal">
    <!-- 举报弹窗 -->
    <uni-popup ref="popup" type="bottom" background-color="#fff">
      <view class="popup-content">
        <view class="header">
          <text class="title">举报内容</text>
          <text class="close" @click="closeReportModal">×</text>
        </view>

        <view class="content">
          <textarea
            v-model="reportReason"
            placeholder="请输入举报原因"
            class="reason-input"
            maxlength="200"
          />
          <text class="char-count">{{ reportReason.length }}/200</text>
        </view>

        <view class="footer">
          <button class="cancel-btn" @click="closeReportModal">取消</button>
          <button class="submit-btn" @click="submitReport" :disabled="!canSubmit">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { sendReport } from "@/api/apis.js";
export default {
  name: "ReportModal",
  data() {
    return {
      reportReason: "",
    };
  },
  computed: {
    canSubmit() {
      // 检查是否可以提交（至少输入1个字符）
      return this.reportReason.trim().length > 0;
    },
  },
  methods: {
    // 打开举报弹窗
    openReportModal(data) {
      this.reportData = data;
      this.$refs.popup.open();
    },

    // 关闭举报弹窗
    closeReportModal() {
      this.reportReason = "";
      this.$refs.popup.close();
    },

    // 提交举报
    async submitReport() {
      if (!this.canSubmit) {
        uni.showToast({
          title: "请输入举报原因",
          icon: "none",
        });
        return;
      }
      const reportList = uni.getStorageSync("reportList") || [];
      reportList.push({
        id: this.reportData.id,
        type: this.reportData.type,
      });
      uni.setStorageSync("reportList", reportList);
      try {
        // 这里可以添加实际的提交逻辑
        console.log("提交举报:", this.reportReason);

        // 显示提交成功提示
        uni.showLoading({
          title: "提交中...",
        });

        // 模拟网络请求
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        await sendReport({
          title: this.reportData.title || "",
          content: this.reportReason,
          rpid: this.reportData.id,
          type: {
            post: 2,
            video: 1,
          }[this.reportData.type],
        });

        uni.hideLoading();
        uni.showToast({
          title: "举报已提交",
          icon: "success",
        });

        // 关闭弹窗并重置表单
        this.closeReportModal();

        // 这里可以触发父组件的回调
        this.$emit("reportSubmitted", this.reportReason);
      } catch (error) {
        console.error("提交失败:", error);
        uni.showToast({
          title: "提交失败，请重试",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.trigger-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
}

.popup-content {
  padding: 0;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 15px 10px;
    border-bottom: 1px solid #f0f0f0;

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .close {
      font-size: 24px;
      color: #999;
      padding: 5px 10px;
    }
  }

  .content {
    padding: 20px 15px;

    .reason-input {
      width: 100%;
      height: 120px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 10px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .char-count {
      display: block;
      text-align: right;
      margin-top: 5px;
      font-size: 12px;
      color: #999;
    }
  }

  .footer {
    display: flex;
    padding: 15px;
    border-top: 1px solid #f0f0f0;

    .cancel-btn,
    .submit-btn {
      flex: 1;
      height: 45px;
      line-height: 45px;
      border-radius: 4px;
      font-size: 16px;
      margin: 0 7.5px;
    }

    .cancel-btn {
      background-color: #f0f0f0;
      color: #333;
    }

    .submit-btn {
      background-color: #007aff;
      color: #fff;

      &[disabled] {
        background-color: #ccc;
        color: #999;
      }
    }
  }
}
</style>
