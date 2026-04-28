<template>
  <scroll-view
    class="scroll-view"
    scroll-y
    @scrolltolower="loadMore"
    :lower-threshold="150"
    :refresher-enabled="true"
    :refresher-triggered="isLoading"
    @refresherrefresh="refreshList"
  >
    <view class="prognosis-container">
      <view class="prognosis-title title-style-3">
        <view class="title-badge">HOT</view>
        <view class="title-text">
          预测方案
          <text class="total" v-if="total">({{ total }})</text>
        </view>
      </view>
      <PrognosisCard v-for="item in list" :data="item" @openDetail="openDetail" />
      <view class="no-more" v-if="isNoMore">没有更多了</view>
    </view>
  </scroll-view>
  <PaymentWrapper ref="PaymentWrapperRef" :enableIntegralPay="true" @payOver="payOver">
    <template v-slot:payMethodSelector-header>
      <view class="pay-method-selector-header">
        <view class="pay-method-selector-title">方案：{{ payMethodSelectorHeader.title }}</view>
        <view class="pay-method-selector-price">价格：{{ payMethodSelectorHeader.price }}元</view>
      </view>
    </template>
  </PaymentWrapper>
</template>

<script>
import PaymentWrapper from "@/components/Payment-wrapper/Payment-wrapper.vue";
import PrognosisCard from "./components/prognosis-card.vue";
import { getFootBallPostList, CheckFootBallIsPay } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";

export default {
  components: { PrognosisCard, PaymentWrapper },
  props: {
    matchId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      payMethodSelectorHeader: {
        title: "张三",
        price: "10",
      },
      scratchBottomData: {}, // 刮刮乐底部内容

      isLoading: false,
      currentPage: 1,
      list: [],
      isNoMore: false,
      total: 0,
    };
  },
  methods: {
    async openDetail(data) {
      console.log(data);

      // 判断是否已经支付
      if (data.flag == 1) {
        uni.showLoading({
          title: "加载中...",
        });
        const res = await CheckFootBallIsPay(data.id, getAccount());
        uni.hideLoading();
        if (res.data == false) {
          // 未支付，弹出支付弹窗
          this.payMethodSelectorHeader = {
            id: data.id,
            title: data.title,
            price: data.price,
          };
          this.$refs.PaymentWrapperRef.pay({
            info: `付费${data.price.toString()}元解锁足球方案:` + `${data.title}`,
            amount: data.price.toString(),
            type: 4, // 4表示足球方案解锁
            remark: data.id,
            payType: 0,
          });
          return;
        }
      }

      uni.navigateTo({
        url: `/pages/zc/prognosis-detail?id=${data.id}`,
      });
    },

    async loadMore() {
      console.log("加载更多");
      if (this.isNoMore || this.isLoading) {
        return;
      }
      this.isLoading = true;
      this.currentPage++;
      const res = await getFootBallPostList({
        page: this.currentPage,
        limit: 20,
        matchId: this.matchId,
      });
      this.list = [...this.list, ...res.data.list];
      this.isNoMore = res.data.list.length < 20;
      this.total = res.data.total;
      setTimeout(() => {
        this.isLoading = false;
        this.currentPage++;
      }, 3000);
    },
    async refreshList() {
      console.log("刷新列表");
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      this.currentPage = 1;

      const res = await getFootBallPostList({
        page: this.currentPage,
        limit: 20,
        matchId: this.matchId,
      });
      console.log(res);
      this.list = res.data.list;
      this.isNoMore = res.data.list.length < 20;
      this.total = res.data.total;
      setTimeout(() => {
        this.isLoading = false;
      }, 200);
    },
    payOver(e) {
      if (e.flag) {
        uni.navigateTo({
          url: `/pages/zc/prognosis-detail?id=${this.payMethodSelectorHeader.id}`,
        });
      }else{
        uni.showModal({
          title: "支付失败",
          content: "请检查网络或稍后再试",
        });
      }
    },
    onScratchComplete(percent) {
      console.log(percent);
    },
  },
  mounted() {
    this.refreshList();
  },
};
</script>

<style lang="scss">
.prognosis-container {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  box-sizing: border-box;
  background: #f5f7fa;
}

.prognosis-title {
  font-size: 34rpx;
  font-weight: 700;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;

  /* 主渐变背景 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

  /* 阴影效果 */
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.35);

  /* 文字效果 */
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);

  /* 边框高光 */
  border: 1rpx solid rgba(255, 255, 255, 0.2);

  .title-icon {
    font-size: 36rpx;
    animation: iconFloat 2s ease-in-out infinite;
    filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
  }

  .title-text {
    flex: 1;
    letter-spacing: 2rpx;
    position: relative;
    z-index: 1;
  }

  .title-decoration {
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200rpx;
    height: 200rpx;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: glow 3s ease-in-out infinite;
  }

  /* 左侧装饰条 */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8rpx;
    background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.5) 100%);
    border-radius: 8rpx 0 0 8rpx;
  }

  /* 右下角装饰 */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 60rpx;
    height: 60rpx;
    background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.2) 50%);
    border-radius: 16rpx 0 0 0;
  }
}

.title-style-3 {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.4);

  .title-badge {
    background: #fff;
    color: #ff6b6b;
    font-size: 20rpx;
    font-weight: 800;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    animation: badgePulse 1.5s ease-in-out infinite;
  }

  .title-text {
    color: #fff;
  }

  &::before,
  &::after {
    display: none;
  }

  .title-decoration {
    display: none;
  }
}

/* ========== 动画效果 ========== */
@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-4rpx) rotate(5deg);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8rpx rgba(255, 255, 255, 0);
  }
}

.pay-method-selector-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  font-size: 28rpx;
  color: #333333;
  padding: 20rpx 24rpx;

  /* 1. 使用极淡的灰色背景，不要用 #f0f0f0 那么深 */
  background-color: #f9f9f9;

  /* 2. 去掉黑色边框，或者使用非常淡的边框 */
  border: 1rpx solid #eeeeee;

  /* 3. 去掉重阴影，或者使用极淡的阴影 */
  box-shadow: none;

  border-radius: 12rpx; /* 圆角稍微大一点更现代 */
  margin: 0 20rpx 20rpx 20rpx; /* 增加一点外边距，不要贴边 */
}

.no-more {
  text-align: center;
  font-size: 28rpx;
  color: #333333;
  padding: 20rpx 0;
}

.scroll-view {
  flex: 1;
  overflow: hidden;
  height: 100%;
}
</style>
