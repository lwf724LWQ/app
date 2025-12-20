<template>
  <!-- 搜索用户 -->
  <view class="search-user">
    <view class="search-input">
      <input placeholder="搜索用户" @confirm="searchUser" v-model.trim="searchInputValue" />
    </view>
    <button class="search-button" type="primary" @click="searchUser">搜索</button>
  </view>

  <scroll-view
    class="follow-list"
    :class="{ oldManMode: useOldManModeStore.enabled }"
    scroll-y
    :refresher-enabled="true"
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
    @scrolltolower="onRefresh"
  >
    <view
      class="follow-item"
      v-for="(item, index) in followList"
      :key="index"
      @click="goToUserDetail(item.id)"
    >
      <image
        class="avatar"
        :src="
          item.himg
            ? 'http://video.caimizm.com/himg/' + item.himg
            : '/static/images/defaultAvatar.png'
        "
        mode="aspectFill"
      >
      </image>

      <view class="user-info">
        <view class="user-name">{{ item.uname }}</view>
      </view>

      <button
        class="follow-button"
        :type="item.flag ? 'default' : 'primary'"
        @click="followHandle(item.flag, item.account, item.uname)"
      >
        {{ item.flag ? '已关注' : '关注' }}
      </button>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="followList.length === 0 && !refreshing">
      <image class="empty-icon" src="/static/empty-follow.png" mode="aspectFit"></image>
      <text class="empty-text">{{ emptyText }}</text>
    </view>
  </scroll-view>
</template>

<script setup>
import { inject } from 'vue'
import { cancelUserFollowApi, userFollowApi } from '@/api/apis'
import { useUserStore } from '@/stores/userStore'
import { ref } from 'vue'

const userStore = useUserStore()

const useOldManModeStore = inject('useOldManModeStore')
// 定义组件属性
const props = defineProps({
  followList: {
    type: Array,
    default: () => []
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  }
})

// 定义组件事件
const emit = defineEmits(['refresh', 'userClick'])

// 下拉刷新处理函数
const onRefresh = () => {
  emit('refresh')
}

// 跳转到用户详情页
const goToUserDetail = (userId) => {
  emit('userClick', userId)
}

// 搜索用户
const searchInputValue = ref('')
const searchUser = () => {
  emit('searchUser', searchInputValue.value)
}

// 取消关注
const followHandle = async (flag, account2, uname) => {
  if (flag) {
    uni.showModal({
      title: '提示',
      content: `确定取消关注用户${uname}吗？`,
      success: async (res) => {
        if (res.confirm) {
          const res = await cancelUserFollowApi({ account: userStore.userInfo.account, account2 })
          uni.showToast({
            title: res.msg,
            icon: 'success'
          })
          emit('changeFollowStatus', account2)
        }
      }
    })
  } else {
    const res = await userFollowApi({ account: userStore.userInfo.account, account2 })
    emit('changeFollowStatus', account2)
  }
}
</script>

<style scoped lang="scss">
.oldManMode {
  .follow-item {
    margin-bottom: 5rpx;
    padding: 15rpx 20rpx;
  }

  .user-name {
    font-size: 42rpx;
  }

  .user-desc {
    font-size: 32rpx;
  }
}

.follow-list {
  flex: 1;
  overflow: hidden;
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

.follow-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  .follow-button {
    width: 150rpx;
    height: 60rpx;
    line-height: 60rpx;
    font-size: 30rpx;
  }
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background-color: #eee;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.user-desc {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
