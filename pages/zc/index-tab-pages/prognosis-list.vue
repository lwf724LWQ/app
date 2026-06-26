<template>
  <z-paging-swiper-item
    ref="swiperItemRef"
    :tabIndex="3"
    :currentIndex="pickerIndex"
    @query="onQuery"
  >
    <view class="prognosis-container">
      <PrognosisCard
        v-for="item in list"
        :key="item.id"
        :data="item"
        :badgeData="getUserBadgeData(item.account)"
        @openDetail="openDetail"
      />
    </view>
  </z-paging-swiper-item>
  <PaymentWrapper ref="PaymentWrapperRef" :enableIntegralPay="true" @payOver="payOver">
    <template v-slot:payMethodSelector-header>
      <view class="pay-method-selector-header">
        <view class="pay-method-selector-title">方案：{{ payMethodSelectorHeader.title }}</view>
        <view class="pay-method-selector-price">价格：{{ payMethodSelectorHeader.price }}元</view>
      </view>
    </template>
  </PaymentWrapper>
  <view class="publish-btn" @click="gotoPutreview">点我发布预测</view>
</template>

<script>
import PaymentWrapper from "@/components/Payment-wrapper/Payment-wrapper.vue";
import PrognosisCard from "../components/prognosis-card.vue";
import { getFootBallPostList, CheckFootBallIsPay, findByAccountWithFbpost } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
import videoTool from "@/pages/video/video-tool.js";
import tool from "@/utils/tool.js";
import { useUserStore } from "@/stores/userStore";
export default {
  components: { PrognosisCard, PaymentWrapper },
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
      list: [],
      UserBadgeAccuracyMap: {},
      isNeedRefresh: false
    };
  },
  methods: {
    getUserBadgeData(account) {
      return this.UserBadgeAccuracyMap[account] || [];
    },
    async openDetail(data) {
      if (tool.isLogin()) {
        if (data.flag == 1 && (getAccount() !== data.account)) {
          uni.showLoading({
            title: "加载中...",
          });
          const res = await CheckFootBallIsPay(data.id, getAccount());
          uni.hideLoading();
          if (res.data == false) {
            this.payMethodSelectorHeader = {
              id: data.id,
              title: data.title,
              price: data.price,
            };
            this.$refs.PaymentWrapperRef.pay({
              info: `付费${data.price.toString()}元解锁足球方案:` + `${data.title}`,
              amount: data.price.toString(),
              type: 4,
              remark: data.id,
              payType: 0,
            });
            return;
          }
        }
        uni.navigateTo({
          url: `/pages/zc/prognosis-detail?id=${data.id}`,
        });
      }
    },

    async onQuery(pageNo, pageSize, from) {
      try {
        let res = null;
        if (this.findByAccount) {
          res = await findByAccountWithFbpost({
            page: pageNo,
            limit: pageSize,
            ftype: 1,
            account: this.findByAccount
          });
          const userStore = useUserStore();
          const userdata = userStore.getUserInfo;
          res.data.records.forEach(item => {
            item.uname = userdata.nickname;
            item.himg = userdata.avatar;
          });
          res.data.list = res.data.records;
        } else {
          res = await getFootBallPostList({
            page: pageNo,
            limit: pageSize,
            ftype: 1,
          });
        }
        this.UserBadgeAccuracyMap = res.data.result || {};
        this.list = res.data.list;
        this.$refs.swiperItemRef?.complete(this.list);
      } catch (e) {
        uni.showToast({ title: e?.msg || "刷新失败，请检查网络或稍后再试" });
        this.$refs.swiperItemRef?.complete(false);
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
    gotoPutreview(){
      if (videoTool.checkIsBozhu()) {
        const url = tool.formatUrlParams(
          {},
          "/pages/zc/creaet-prognosis-post"
        );
        this.isNeedRefresh = true;
        uni.navigateTo({
          url: url,
        });
      }
    },
    onshow(){
      if(this.isNeedRefresh){
        this.$refs.swiperItemRef?.reload();
        this.isNeedRefresh = false;
      }
    }
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