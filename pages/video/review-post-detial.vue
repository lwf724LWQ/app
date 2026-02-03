<template>
  <my-page :pageTitle="pageTitle">
    <view class="post-detail-container">
      <!-- 帖子图片 -->
      <view class="post-image">
        <image
          v-if="imgSrc"
          :src="imgSrc"
          mode="widthFix"
          class="image"
          @click="previewImage"
        ></image>
        <view v-else class="no-image">暂无图片</view>
      </view>

      <!-- 帖子内容 -->
      <view class="post-content" @click="toUserDetail">
        <view class="user">
          <image class="avatar" :src="himg"></image>
        </view>
        <view style="flex: 1">
          <view class="description">
            {{ pageTitle }}
          </view>
          <view class="time">{{ formatTime(postTime) }}</view>
        </view>
      </view>
    </view>
  </my-page>
</template>

<script>
import myPage from "../../components/myPage.vue";
import tool from "../../utils/tool.js";
import dayjs from "dayjs";
import { getReviewPostDetail } from "@/api/apis.js";
export default {
  components: { myPage },
  data() {
    return {
      pageTitle: "",
      id: "",
      imgSrc: "",
      postTime: null,
      uname: "11",
      himg: "",
      c: "",
    };
  },
  methods: {
    async getDetail(id) {
      const res = await getReviewPostDetail(id);
      this.imgSrc = tool.oss.getFullUrl(res.data.jimg); // 实际项目中应为真实图片地址
      this.pageTitle = res.data.title;
      // this.pageTitle = `${res.data.uname} ${dayjs(res.data.createTime).format("MM月DD日")}精彩回顾`;
      this.postTime = res.data.create_time;
      this.uname = res.data.uname;
      this.account = res.data.account;
      this.himg = res.data.himg
        ? tool.oss.getFullUrl("himg/" + res.data.himg)
        : "http://video.caimizm.com/himg/user.png";
    },

    formatTime(time) {
      if (!time) return "";
      return dayjs(time).format("YYYY-MM-DD");
    },
    previewImage() {
      uni.previewImage({
        urls: [this.imgSrc],
      });
    },
    toUserDetail() {
      if (tool.isLogin("登录后即可免费查看大师过往视频学习")) {
        uni.navigateTo({
          url: "/pages/user/space?account=" + this.account,
        });
      }
    },
  },
  onLoad(options) {
    options = tool.optionsParamsDecode(options);
    this.id = options.id || "";

    if (this.id) {
      this.getDetail(this.id);
    }
  },
};
</script>

<style lang="scss" scoped>
.post-detail-container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.post-image {
  width: 100%;
  margin-bottom: 20rpx;

  .image {
    width: 100%;
    border-radius: 10rpx;
  }

  .no-image {
    width: 100%;
    height: 300rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e0e0e0;
    color: #999;
    font-size: 28rpx;
    border-radius: 10rpx;
  }
}

.post-content {
  background: #fff;
  padding: 30rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;

  .user {
    display: flex;
    flex-direction: column;
    // justify-content: center;
    // align-items: center;
    margin-right: 10rpx;
    width: 100rpx;
    // 不换行
    white-space: nowrap;
    .avatar {
      width: 80rpx;
      height: 80rpx;
      overflow: hidden;
    }
  }

  .description {
    font-size: 32rpx;
    line-height: 1.6;
    color: #333;
    margin-bottom: 20rpx;
    display: flex;
    flex: 1;
  }

  .time {
    font-size: 24rpx;
    color: #999;
    text-align: right;
  }
}
</style>
