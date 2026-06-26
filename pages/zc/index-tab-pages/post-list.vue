<template>
  <z-paging-swiper-item
    ref="swiperItemRef"
    :tabIndex="4"
    :currentIndex="pickerIndex"
    @query="onQuery"
  >
    <view class="prognosis-container">
      <PostCard
        v-for="item in list"
        :key="item.id"
        :postData="item"
        :badgeData="getUserBadgeData(item.account)"
        @postCard="openDetail(item)"
      />
    </view>
    <view class="no-more" v-if="isNoMore">没有更多了</view>
  </z-paging-swiper-item>
  <PaymentWrapper ref="PaymentWrapperRef" :enableIntegralPay="true" @payOver="payOver">
    <template v-slot:payMethodSelector-header>
      <view class="pay-method-selector-header">
        <view class="pay-method-selector-title">方案：{{ payMethodSelectorHeader.title }}</view>
        <view class="pay-method-selector-price">价格：{{ payMethodSelectorHeader.price }}元</view>
      </view>
    </template>
  </PaymentWrapper>
  <view class="publish-btn" @click="gotoPutPost">发表看法</view>
</template>

<script>
import PaymentWrapper from "@/components/Payment-wrapper/Payment-wrapper.vue";
import PostCard from "../components/post-card.vue";
import { getFootBallPostList, CheckFootBallIsPay, findByAccountWithFbpost } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import tool from "@/utils/tool.js";

export default {
  components: { PostCard, PaymentWrapper },
  props: {
    pickerIndex: {
      type: Number,
      default: 0,
    },
    findByAccount: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      payMethodSelectorHeader: {
        title: "张三",
        price: "10",
      },
      scratchBottomData: {},
      isLoading: false,
      currentPage: 1,
      list: [],
      isNoMore: false,
      total: 0,
      UserBadgeAccuracyMap: {},
      isNeedRefresh: false,
    };
  },
  methods: {
    getUserBadgeData(account) {
      return this.UserBadgeAccuracyMap[account] || [];
    },
    async openDetail(data) {
      if (tool.isLogin()) {
        uni.navigateTo({
          url: `/pages/zc/post-detail?id=${data.id}`,
        });
      }
    },

    async onQuery(pageNo, pageSize, from) {
      if (this.isLoading) return;
      this.isLoading = true;
      this.currentPage = 1;
      try {
        let res = null;
        if (this.findByAccount) {
          res = await findByAccountWithFbpost({
            page: this.currentPage,
            limit: 20,
            ftype: 2,
            account: this.findByAccount,
          });
          const userStore = useUserStore();
          const userdata = userStore.getUserInfo;
          res.data.records.forEach((item) => {
            item.uname = userdata.nickname;
            item.himg = userdata.avatar;
          });
          res.data.list = res.data.records;
        } else {
          res = await getFootBallPostList({
            page: this.currentPage,
            limit: 20,
            ftype: 2,
          });
        }

        res.data.list.forEach((item) => {
          const a = JSON.parse(item.result);
          item.description = a.expertAnalysis;
        });

        this.UserBadgeAccuracyMap = res.data.result || {};
        this.list = res.data.list;
        this.isNoMore = res.data.list.length < 20;
        this.total = res.data.total;
        this.$refs.swiperItemRef?.complete(this.list);
      } catch (e) {
        uni.showToast({ title: e?.msg || "刷新失败，请检查网络或稍后再试" });
        this.$refs.swiperItemRef?.complete([]);
      } finally {
        this.isLoading = false;
      }
    },

    payOver(e) {
      if (e.flag) {
        uni.navigateTo({
          url: `/pages/zc/prognosis-detail?id=${this.payMethodSelectorHeader.id}`,
        });
      } else {
        uni.showModal({
          title: "支付失败",
          content: "请检查网络或稍后再试",
        });
      }
    },
    gotoPutPost() {
      if (!tool.isLogin()) {
        return;
      }
      this.isNeedRefresh = true;
      uni.navigateTo({
        url: "/pages/zc/creaet-post",
      });
    },
    onshow() {
      if (this.isNeedRefresh) {
        this.$refs.swiperItemRef?.reload();
        this.isNeedRefresh = false;
      }
    },
  },
};
</script>

<style lang="scss">
.prognosis-container {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.no-more {
  text-align: center;
  font-size: 28rpx;
  color: #333333;
  padding: 20rpx 0;
}

.pay-method-selector-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333333;
  padding: 20rpx 24rpx;
  background-color: #f9f9f9;
  border: 1rpx solid #eeeeee;
  box-shadow: none;
  border-radius: 12rpx;
  margin: 0 20rpx 20rpx 20rpx;
}

.publish-btn {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  right: 30rpx;
  bottom: calc(120rpx + var(--window-bottom));
  width: 250rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  background-color: #1642e3;
  border-radius: 10px;
  padding: 10rpx;
  border: 6rpx solid #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(11, 15, 14, 0.6);
  z-index: 97;

  &.publish-btn-putreview {
    width: 330rpx;
  }
}
</style>