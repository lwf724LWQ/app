<template>
  <scroll-view class="follow-user-list" scroll-x :show-scrollbar="false" @scrolltolower="nextPage">
    <view class="scroll-box">
      <view class="item" @click.stop="toSearchUser">
        <uni-icons class="avatar search-icon" type="search" />
        <view class="nickname">发现大师</view>
      </view>
      <view class="item" v-for="item in list" :key="item.id" @click="gotoUserSpace(item.account)">
        <image class="avatar" :src="item.avatar"></image>
        <view class="nickname">{{ item.uname }}</view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { getUserFollowApi } from "@/api/apis";
import tool from "@/utils/tool";
import { getAccount } from "../../../utils/request";
export default {
  data() {
    return { page: 1, list: [] };
  },
  methods: {
    reload() {
      this.page = 1;
      this.getUserFollow();
    },
    async getUserFollow() {
      if (!getAccount()) {
        this.list = [];
        return;
      }
      const page = this.page;
      const res = await getUserFollowApi({ page, limit: 20 });
      res.data.forEach((item) => {
        item.avatar = item.himg
          ? tool.oss.getFullUrl("/himg/" + item.himg)
          : "http://video.caimizm.com/himg/user.png";
      });
      if (page == 1) {
        this.list = res.data;
      } else {
        this.list = this.list.concat(res.data);
      }
    },
    toSearchUser() {
      uni.navigateTo({
        url: "/pages/index/searchUser",
      });
    },
    nextPage() {
      this.page++;
      this.getUserFollow();
    },
	gotoUserSpace(account){
		uni.navigateTo({
		  url: `/pages/user/space?account=${account}&follow=1`,
		});
	}
  },
  mounted() {
    this.getUserFollow();
  },
};
</script>

<style scoped>
.follow-user-list {
  width: 100vw;
  overflow: hidden;
}
.scroll-box {
  display: flex;
  flex-direction: row;
  gap: 20rpx;

  padding: 20rpx 10rpx 20rpx 10rpx;
}
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}
.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(248, 156, 199, 0.521);
}
.nickname {
  margin-top: 10rpx;
  width: 130rpx;
  overflow: hidden;
  font-size: 26rpx;
  text-align: center;

  word-break: break-all;
}
</style>
