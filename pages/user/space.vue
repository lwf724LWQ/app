<template>
  <view class="user-space">
    <TopNavigationBar class="topBar" title="个人空间"></TopNavigationBar>
    <scroll-view scroll-y class="scroll-view" @scrolltolower="lower">
      <view class="container">
        <view class="user-info">
          <image class="user-info-avatar" mode="aspectFill" :src="userAvatar"></image>
          <view class="user-info-name">
            {{ userInfo.uname }}
          </view>
          <button
            class="user-info-follow"
            :type="followStatus ? 'default' : 'primary'"
            @click="followHandle"
          >
            {{ followStatus ? "已关注" : "关注" }}
          </button>
        </view>
        <view class="segmented">
          <view class="title">已发布</view>
          <view>
            <uni-segmented-control
              :current="current"
              :values="['视频', '帖子']"
              @clickItem="onClickItem"
            ></uni-segmented-control>
          </view>
        </view>
        <view class="user-post">
          <view v-if="current === 0">
            <videoCard v-for="video in videoList" :key="video.id" :video="video"></videoCard>
            <view class="no-post" v-if="!videoList.length && current == 0">未发布视频</view>
          </view>
          <view v-else>
            <postCard v-for="post in postList" :key="post.id" :post="post"></postCard>
            <view class="no-post" v-if="!videoList.length && current == 1">未发布视频</view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import { apiUserimg, cancelUserFollowApi, userFollowApi, getUserVideoListApi } from "@/api/apis";
import { ref, computed } from "vue";
import postCard from "@/components/post-card/post-card.vue";
import videoCard from "@/components/post-card/video-card.vue";
import { apiSelect_by_account } from "@/api/apis.js";

// 获取用户数据
const userInfo = ref({});
const userAvatar = computed(() => {
  return userInfo.value.himg
    ? `http://video.caimizm.com/himg/${userInfo.value.himg}`
    : "/static/images/defaultAvatar.png";
});
const getUserInfo = async (account) => {
  const res = await apiUserimg({ account });
  userInfo.value = res.data;
};
let account;
const followStatus = ref(0);
onLoad(async (options) => {
  account = options.account;
  followStatus.value = Number(options.follow);
  getUserInfo(account);
  videoList.value = await getVideo(1);
});

// tab切换
const current = ref(0);
let page = 1;
const videoList = ref([]);
const postList = ref([]);
const onClickItem = async (e) => {
  current.value = e.currentIndex;
  page = 1;
  if (current.value == 0) {
    videoList.value = await getVideo(page);
  } else {
    postList.value = await getPost(page);
  }
};
// 获取用户视频
const getVideo = async (page) => {
  try {
    uni.showLoading({
      title: "加载中",
      mask: true,
    });
    const res = await getUserVideoListApi({ page, limit: 10, account });
    return res.data.records;
  } finally {
    uni.hideLoading();
  }
};

// 获取用户帖子
const getPost = async (page) => {
  try {
    uni.showLoading({
      title: "加载中",
      mask: true,
    });
    const res = await apiSelect_by_account({ page, limit: 10, account });
    return res.data.list;
  } finally {
    uni.hideLoading();
  }
};

// 关注
const followHandle = async () => {
  if (followStatus.value) {
    uni.showModal({
      title: "提示",
      content: `确定取消关注用户${userInfo.value.uname}吗？`,
      success: async (res) => {
        if (res.confirm) {
          const res = await cancelUserFollowApi({ account2: account });
          uni.showToast({
            title: res.msg,
            icon: "success",
          });
          changeFollowStatus();
        }
      },
    });
  } else {
    await userFollowApi({ account2: account });
    changeFollowStatus();
  }
};
// 切换关注状态
const changeFollowStatus = () => {
  followStatus.value = followStatus.value === 0 ? 1 : 0;
};
// 触底加载更多
const lower = async () => {
  page++;
  if (current.value == 0) {
    const newData = await getVideo(page);
    if (newData.length) {
      videoList.value.push(...newData);
    }
  } else {
    const newData = await getPost(page);
    if (newData.length) {
      postList.value.push(...newData);
    }
  }
};
</script>

<style lang="scss" scoped>
.user-space {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}
.topBar {
  position: relative;
  z-index: 3;
}
.scroll-view {
  flex: 1;
  min-height: 0;
}
.container {
  padding: 0 30rpx;
  .user-info {
    width: 100%;
    display: flex;
    padding: 30rpx 0;
    align-items: center;
    justify-content: space-between;
    .user-info-avatar {
      width: 150rpx;
      height: 150rpx;
      border-radius: 50%;
    }
    .user-info-name {
      display: flex;
      flex-direction: column;
      width: 300rpx;
      font-size: 50rpx;
    }
    .user-info-follow {
      width: 150rpx;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 30rpx;
      margin: 0;
    }
  }
  .title {
    height: 50rpx;
    font-size: 40rpx;
    font-weight: bold;
    padding: 30rpx 0;
  }
  .segmented {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #fff;
    padding-bottom: 30rpx;
  }
  .user-post {
    .post-item {
      padding: 0;
      box-shadow: none;
      margin-bottom: 50rpx;
      :deep(.post-header) {
        display: none;
      }
    }
    .video-card {
      padding: 20rpx 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .no-post {
      text-align: center;
      font-size: 30rpx;
      color: #999;
      margin-top: 50rpx;
    }
  }
}
</style>
