<template>
  <TopNavigationBar>
    <template v-slot:center>
      <view class="search-user">
        <view class="search-input">
          <input
            placeholder="搜索用户"
            focus
            @confirm="searchUser(searchInputValue)"
            v-model.trim="searchInputValue"
          />
          <uni-icons
            type="close"
            size="25"
            v-if="searchInputValue"
            @click="searchInputValue = ''"
          ></uni-icons>
        </view>
      </view>
    </template>
    <template v-slot:right>
      <button class="search-button" type="primary" @click="searchUser">搜索</button>
    </template>
  </TopNavigationBar>
  <!-- 搜索历史记录 -->
  <view class="search-history" v-if="!userList.length">
    <view class="search-history-title">
      <view>历史记录</view>
      <uni-icons type="trash" size="20" @click="onClearSearchHistory"></uni-icons>
    </view>
    <view class="search-history-list">
      <view
        class="search-history-item"
        v-for="value in searchHistory"
        :key="value"
        @click="onSearchHistoryClick(value)"
      >
        {{ value }}
      </view>
    </view>
  </view>

  <UserList
    class="user-list"
    :follow-list="userList"
    v-else
    @changeFollowStatus="onChangeFollowStatus"
  ></UserList>
</template>

<script setup>
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import { searchUserApi } from "@/api/apis";
import { ref, watch } from "vue";
import UserList from "@/pages/user/components/userList.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();

const searchInputValue = ref("");
const userList = ref([]);
const searchHistory = ref(uni.getStorageSync("searchHistory") || []);
const searchUser = async (keyword) => {
  if (!keyword) return;
  const res = await searchUserApi({ uname: keyword });
  userList.value = res.data;
  addSearchHistory(keyword);
};

const addSearchHistory = (value) => {
  if (!value || searchHistory.value.includes(value)) return;
  if (searchHistory.value.length >= 10) searchHistory.value.shift();
  searchHistory.value.push(value);
};

const onSearchHistoryClick = (value) => {
  searchInputValue.value = value;
  searchUser(value);
};

watch(
  searchHistory,
  () => {
    uni.setStorage({
      key: "searchHistory",
      data: searchHistory.value,
    });
  },
  {
    deep: true,
  }
);

watch(searchInputValue, (val) => !val && (userList.value = []));

const onChangeFollowStatus = (account) => {
  userList.value.forEach((item) => {
    if (item.account === account) {
      item.flag = item.flag === 1 ? 0 : 1;
    }
  });
};

const onClearSearchHistory = () => {
  searchHistory.value = [];
  uni.removeStorageSync("searchHistory");
};
</script>

<style lang="scss" scoped>
.search-user {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #eee;
  .search-input {
    width: 100%;
    height: 60rpx;
    border-radius: 60rpx;
    background-color: #eee;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    font-size: 24rpx;
  }
}
.search-button {
  width: 120rpx;
  height: 60rpx;
  line-height: 60rpx;
  font-size: 30rpx;
  margin: 0;
  padding: 0;
  margin-left: 10rpx;
}
.search-history {
  .search-history-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    font-size: 25rpx;
    margin-top: 20rpx;
  }
  .search-history-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 20rpx;
    .search-history-item {
      padding: 5rpx 20rpx;
      border-radius: 10rpx;
      background-color: #eee;
      margin: 10rpx;
    }
  }
}

.user-list {
  margin-top: 20rpx;
}
</style>
