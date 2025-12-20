<template>
  <TopNavigationBar>
    <template v-slot:center>
      <view class="search-user">
        <view class="search-input">
          <input
            placeholder="搜索用户"
            focus
            @confirm="searchUser"
            v-model.trim="searchInputValue"
          />
        </view>
      </view>
    </template>
    <template v-slot:right>
      <button class="search-button" type="primary" @click="searchUser">搜索</button>
    </template>
  </TopNavigationBar>
  <!-- 搜索历史记录 -->
  <view class="search-history">
    <view>历史记录</view>
    <uni-icons type="trash" size="23"></uni-icons>
  </view>
</template>

<script setup>
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import { searchUserApi } from "@/api/apis";
import { ref } from "vue";

const searchInputValue = ref("");
const userList = ref([]);
const searchUser = async () => {
  if (!searchInputValue.value) return;
  const res = await searchUserApi({ uname: searchInputValue.value });
  userList.value = res.data;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  font-size: 25rpx;
}
</style>
