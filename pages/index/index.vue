<template>
  <view class="lottery-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <image src="/static/a.webp"></image>
  </view>
</template>

<script>
import { apiFindResult } from "@/api/apis.js";
import { mode } from "crypto-js";
import PrivacyPolicyModal from "../../components/PrivacyPolicyModal.vue";
import { useUserStore } from "../../stores/userStore";
import tool from "../../utils/tool";
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";
export default {
  inject: ["useOldManModeStore"],
  components: { PrivacyPolicyModal, bottomBar },
  data() {
    return {
      currentTab: "plw",
      fc3dNumbers: ["3", "8", "5"],
      plwNumbers: ["9", "0", "5", "3", "2"],
      qxcNumbers: ["8", "0", "6", "5", "7", "9", "7"],
      fc3dPeriod: "第25123期",
      plwPeriod: "第25285期",
      qxcPeriod: "第25123期",
      fc3dDate: "10.26 周日",
      plwDate: "10.26 周日",
      qxcDate: "10.26 周日",
      isLoadingResults: false, // 添加加载锁
    };
  },
  methods: {
    drawGui() {
      const tname = this.currentTab === "plw" ? "排列5" : "七星彩";
      uni.navigateTo({
        url: `/pages/juWang/peng-liao/drawLine/drawLine?type=排列五`,
      });
      // uni.navigateTo({
      // 	url: `/pages/juWang/drawLine/drawLine`
      // });
    },
    isLogin() {
      return true;
      const userStore = useUserStore();
      if (userStore.getUserInfo.account) {
        return true;
      } else {
        uni.showModal({
          title: "提示",
          content: "该功能需要登录，是否前往",
          success: async (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: "/pages/login/login" });
            }
          },
          showCancel: true,
        });
        return false;
      }
    },
    toChangtiao() {
      if (this.isLogin()) {
        uni.navigateTo({
          url: "/pages/changtiao/index",
        });
      }
    },
    goToLive() {
      // #ifdef H5
      uni.showModal({
        title: "提示",
        content: "收看直播功能仅支持APP内使用",
      });
      // #endif
      // #ifdef APP-PLUS
      uni.navigateTo({
        url: "/pages/index/live",
      });
      // #endif
    },
    goToDreamInterpretation() {
      uni.navigateTo({
        url: "/pages/dream-interpretation/dream-interpretation",
      });
    },
    // 加载开奖结果
    async loadLotteryResults() {
      // 防止重复调用
      if (this.isLoadingResults) {
        return;
      }

      try {
        this.isLoadingResults = true;
        uni.showLoading({ title: "加载中..." });

        const response = await apiFindResult();

        uni.hideLoading();

        if (response.code === 200 && response.data) {
          const results = response.data;

          // 检查数据格式 - 可能是一个数组
          let dataArray = results;
          if (Array.isArray(results)) {
            dataArray = results;
          } else if (results.records && Array.isArray(results.records)) {
            dataArray = results.records;
          } else if (results.data && Array.isArray(results.data)) {
            dataArray = results.data;
          }

          // 遍历数据，根据彩票名称匹配
          dataArray.forEach((item) => {
            const tname = item.tname || item.name;

            // 福彩3D
            if (tname && tname.includes("福彩3D")) {
              this.fc3dNumbers = this.parseNumbers(item.number);
              this.fc3dPeriod = item.issueno;
              // 更新日期
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.fc3dDate = this.formatDate(date);
              }
            }

            // 排列五
            if (tname && tname.includes("排列五")) {
              this.plwNumbers = this.parseNumbers(item.number);
              this.plwPeriod = item.issueno;
              // 更新日期
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.plwDate = this.formatDate(date);
              }
            }

            // 排列三
            if (tname && tname.includes("排列三")) {
              // 排列三和排列五共用期号
              this.plwPeriod = item.issueno;
              // 排列三的日期会覆盖排列五的日期（因为排列五在前面）
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.plwDate = this.formatDate(date);
              }
            }

            // 七星彩
            if (tname && tname.includes("七星彩")) {
              let numbers = this.parseNumbers(item.number);
              // 如果有refernumber，添加到末尾
              if (item.refernumber) {
                numbers.push(item.refernumber);
              }
              this.qxcNumbers = numbers;
              this.qxcPeriod = item.issueno;
              // 更新日期
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.qxcDate = this.formatDate(date);
              }
            }
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error("加载开奖结果失败:", error);
        // 保持默认数据，不显示错误提示
      } finally {
        this.isLoadingResults = false;
        uni.stopPullDownRefresh();
      }
    },
    // 解析中奖号码（支持字符串和数组格式）
    parseNumbers(numbers) {
      if (!numbers) {
        return [];
      }

      if (Array.isArray(numbers)) {
        return numbers.map((n) => String(n));
      }

      if (typeof numbers === "string") {
        // 如果是空格分隔的字符串（如 "1 7 2"）
        if (numbers.includes(" ")) {
          return numbers
            .split(" ")
            .map((n) => n.trim())
            .filter((n) => n)
            .map((n) => String(n));
        }
        // 如果是逗号分隔的字符串
        if (numbers.includes(",")) {
          return numbers
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n)
            .map((n) => String(n));
        }
        // 如果是普通字符串，按字符分割
        return numbers
          .split("")
          .map((n) => n.trim())
          .filter((n) => n)
          .map((n) => String(n));
      }

      // 如果是数字，转为字符串
      if (typeof numbers === "number") {
        return String(numbers).split("");
      }

      return [];
    },
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return "10.26 周日";

      try {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const weekday = weekdays[date.getDay()];

        return `${month}.${day} ${weekday}`;
      } catch (e) {
        return "10.26 周日";
      }
    },
    goToSearchuser() {
      uni.navigateTo({
        url: "/pages/index/searchUser",
      });
    },
  },
  onShow() {
    // 加载开奖结果
    this.loadLotteryResults();
  },
  onLoad() {
    tool.checkAppUpdate();
  },
  onPullDownRefresh() {
    this.loadLotteryResults();
  },
};
</script>

<style lang="scss" scoped>
.lottery-container:not(.old-man-mode) {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: calc(var(--status-bar-height) + 40rpx);

  /* 轮播图样式 */
  .ad-swiper {
    width: 100%;
    height: 320rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-sizing: border-box;
  }

  .swiper-item {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    overflow: hidden;
  }

  .swiper-item image {
    width: 100%;
    height: 100%;
  }

  /* 福彩3D开奖结果 */
  .lottery-results-fc3d {
    margin: 0 20rpx 20rpx 20rpx;
  }

  .result-item-fc3d {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-fc3d {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .lottery-title-fc3d {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .winning-numbers-fc3d {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-fc3d {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  /* 排列五开奖结果 */
  .lottery-results-plw {
    margin: 0 20rpx 20rpx 20rpx;
  }

  .result-item-plw {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-plw {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .lottery-title-plw {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .lottery-date {
    font-size: 32rpx;
    color: #666;
  }

  .winning-numbers-plw {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .number-item-plw {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    font-size: 42rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  .number-label {
    font-size: 20rpx;
    color: #999;
  }

  /* 七星彩开奖结果 */
  .lottery-results-qxc {
    margin: 0 20rpx 20rpx 20rpx;
  }

  .result-item-qxc {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-qxc {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .lottery-title-qxc {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .winning-numbers-qxc {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-qxc {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  /* 七星彩最后一个号码球显示为绿色 */
  .number-item-qxc.qxc-special {
    background-color: #28b389;
  }

  /* 通知横幅 */
  .notice-banner {
    display: flex;
    align-items: center;
    margin: 0 20rpx 20rpx 20rpx;
    padding: 20rpx;
    background-color: #fff;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  /* 通知横幅图标样式 */
  .notice-banner uni-icons[type="sound"] {
    margin-right: 10rpx;
  }

  .notice-banner uni-icons[type="right"] {
    margin-left: 0;
  }

  .notice-text {
    font-size: 26rpx;
    color: #333;
    flex: 1;
  }

  .notice-new {
    font-size: 20rpx;
    color: #fff;
    background-color: #e74c3c;
    padding: 4rpx 10rpx;
    border-radius: 4rpx;
    margin-right: 10rpx;
  }

  /* 功能图标区 */
  .function-area {
    padding: 20rpx;
    background-color: #f5f5f5;
    box-sizing: border-box;
  }
  .function-title {
    padding: 20rpx 0;
    font-weight: bold;
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx 10rpx;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .icon-item image {
    width: 60rpx;
    height: 60rpx;
    margin-bottom: 8rpx;
  }

  /* uni-icons 图标样式 */
  .icon-item uni-icons {
    margin-bottom: 8rpx;
  }

  .icon-item text {
    margin-top: 10rpx;
    font-size: 29rpx;
    color: #666;
  }

  .icon-item-message {
    position: relative;
  }

  .message-badge {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    background-color: #e74c3c;
    color: #fff;
    font-size: 18rpx;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #fff;
  }
}

.lottery-container.old-man-mode {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: var(--status-bar-height);

  /* 轮播图样式 */
  .ad-swiper {
    width: 100%;
    height: 180rpx;
  }

  .swiper-item {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    overflow: hidden;
  }

  .swiper-item image {
    width: 100%;
    height: 100%;
  }

  /* 福彩3D开奖结果 */
  .lottery-results-fc3d {
  }

  .result-item-fc3d {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-fc3d {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lottery-title-fc3d {
    font-size: 40rpx;
    font-weight: bold;
    color: #000;
  }

  .winning-numbers-fc3d {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-fc3d {
    width: 80rpx;
    height: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: #fff;
    margin-bottom: 8rpx;
  }

  /* 排列五开奖结果 */
  .lottery-results-plw {
    margin: 0;
  }

  .result-item-plw {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-plw {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lottery-title-plw {
    font-size: 38rpx;
    font-weight: bold;
    color: #000;
  }

  .lottery-date {
    font-size: 44rpx;
    color: #000;
    font-weight: bold;
  }

  .winning-numbers-plw {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .number-item-plw {
    width: 80rpx;
    height: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: #fff;
    margin-bottom: 8rpx;
  }

  .number-label {
    font-size: 35rpx;
    font-weight: bold;
    color: #000000;
  }

  /* 七星彩开奖结果 */
  .lottery-results-qxc {
    margin: 0 0;
  }

  .result-item-qxc {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-qxc {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }

  .lottery-title-qxc {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }

  .winning-numbers-qxc {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-qxc {
    width: 80rpx;
    height: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: #fff;
  }

  /* 七星彩最后一个号码球显示为绿色 */
  .number-item-qxc.qxc-special {
    background-color: #28b389;
  }

  /* 通知横幅 */
  .notice-banner {
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    background-color: #fff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  /* 通知横幅图标样式 */
  .notice-banner uni-icons[type="sound"] {
    margin-right: 10rpx;
  }

  .notice-banner uni-icons[type="right"] {
    margin-left: 0;
  }

  .notice-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #000000;
    flex: 1;
  }

  .notice-new {
    font-size: 20rpx;
    color: #fff;
    background-color: #e74c3c;
    padding: 4rpx 10rpx;
    margin-right: 10rpx;
  }

  /* 功能图标区 */
  .function-area {
    background-color: #f5f5f5;
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20rpx 10rpx;
    background-color: #fff;
    padding: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    font-weight: bolder;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .icon-item image {
    width: 50rpx;
    height: 50rpx;
  }

  /* uni-icons 图标样式 */
  .icon-item uni-icons {
    font-size: 30rpx;
    margin-bottom: 8rpx;
  }

  .icon-item text {
    font-size: 50rpx;
    color: #353434;

    // &.leng3 {
    // 	font-size: 43rpx;
    // }
  }

  .icon-item-message {
    position: relative;
  }

  .message-badge {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    background-color: #e74c3c;
    color: #fff;
    font-size: 18rpx;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid #fff;
  }
}
</style>
