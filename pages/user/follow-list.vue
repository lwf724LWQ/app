<!-- pages/user/follow.vue -->
<template>
  <view class="follow-container">
    <!-- 页面标题 -->
    <top-navigation-bar :title="type === 'follow' ? '关注列表' : '粉丝列表'" />

    <!-- 搜索用户 -->
    <view class="search-user">
      <view class="search-input">
        <input
          placeholder="搜索用户"
          @confirm="filterUser(searchInputValue)"
          v-model.trim="searchInputValue"
        />
      </view>
      <button class="search-button" type="primary" @click="filterUser(searchInputValue)">
        搜索
      </button>
    </view>

    <!-- 使用用户列表组件 -->
    <UserList
      :follow-list="followList"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @user-click="goToUserDetail"
      @changeFollowStatus="cancelFollow"
      @reachBottom="onReachBottom"
    />
  </view>
</template>

<script setup>
import { ref } from "vue";
import TopNavigationBar from "../../components/TopNavigationBar.vue";
import UserList from "./components/userList.vue";
import { getUserFollowApi, getUserFansApi } from "@/api/apis";
import { useUserStore } from "@/stores/userStore";
import { onLoad } from "@dcloudio/uni-app";

// 关注列表数据
const followList = ref([]);
let initFollowList = [];
const userStore = useUserStore();

let page = 1;
let type;
const fetchFollowList = async () => {
  let res;
  if (type === "follow") {
    res = await getUserFollowApi({ page, limit: 20 });
  } else if (type === "fans") {
    res = await getUserFansApi({ page, limit: 20 });
  }
  followList.value = res.data;
  if (type === "follow") {
    followList.value.forEach((item) => {
      item.flag = 1;
    });
  }

  initFollowList = followList.value;
};

onLoad((options) => {
  type = options.type;
  fetchFollowList();
});

// 下拉刷新状态
const refreshing = ref(false);

// 下拉刷新处理函数
const onRefresh = async () => {
  refreshing.value = true;
  await fetchFollowList();
  refreshing.value = false;
};
// 翻页
const onReachBottom = async () => {
  page++;
  await fetchFollowList();
};

// 跳转到用户详情页
const goToUserDetail = (account, isFollow) => {
  // 跳转逻辑
  uni.navigateTo({
    url: `/pages/user/space?account=${account}&follow=${isFollow}`,
  });
};

// 筛选用户
const searchInputValue = ref("");
const filterUser = (keywords) => {
  if (keywords === "") {
    followList.value = initFollowList;
    return;
  }
  followList.value = [];
  initFollowList.forEach((item) => {
    if (item.uname.includes(keywords)) {
      followList.value.push(item);
    }
  });
};

const cancelFollow = (account) => {
  followList.value.forEach((item) => {
    if (item.account === account) {
      item.flag = item.flag === 1 ? 0 : 1;
    }
  });
};
</script>

<style lang="scss" scoped>
.follow-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.search-user {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
  .search-input {
    width: 500rpx;
    height: 60rpx;
    border-radius: 60rpx;
    background-color: #eee;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
  }
  .search-button {
    width: 120rpx;
    height: 70rpx;
    line-height: 70rpx;
    font-size: 30rpx;
    margin: 0;
  }
}
</style>
