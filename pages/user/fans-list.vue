<!-- pages/user/follow.vue -->
<template>
  <view class="follow-container">
    <!-- 页面标题 -->
    <top-navigation-bar title="关注列表" />

    <!-- 使用用户列表组件 -->
    <UserList
      :follow-list="followList"
      :refreshing="refreshing"
      @refresh="onRefresh"
      @user-click="goToUserDetail"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import TopNavigationBar from '../../components/TopNavigationBar.vue'
import UserList from './components/userList.vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserFansApi } from '@/api/apis'
import { useUserStore } from '@/stores/userStore'

// 关注列表数据
const followList = ref([])

const userStore = useUserStore()
const getFollowList = async () => {
  const res = await getUserFansApi({ account: userStore.userInfo.account, page: 1, limit: 10 })
  followList.value = res.data
}
getFollowList()

// 下拉刷新状态
const refreshing = ref(false)

// 下拉刷新处理函数
const onRefresh = () => {
  refreshing.value = true

  // 模拟请求数据
  setTimeout(() => {
    // 这里可以替换为实际的API调用
    // 例如: fetchFollowList()

    // 刷新完成后关闭刷新状态
    refreshing.value = false
  }, 1500)
}

// 跳转到用户详情页
const goToUserDetail = (userId) => {
  // 跳转逻辑
  console.log('跳转到用户详情页', userId)
}
onLoad(() => onRefresh())
</script>

<style scoped>
.follow-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
