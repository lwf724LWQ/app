<template>
  <scroll-view
    class="follow-list"
    :class="{ oldManMode: useOldManModeStore.enabled }"
    scroll-y
    :refresher-enabled="true"
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
    @scrolltolower="onScrolltolower"
  >
    <view
      class="follow-item"
      v-for="(item, index) in followList"
      :key="index"
      @click="goToUserDetail(item.account, item.flag)"
    >
      <image
        class="avatar"
        :src="
          item.himg
            ? 'http://video.caimizm.com/himg/' + item.himg
            : '/static/images/defaultAvatar.png'
        "
        mode="aspectFill"
      ></image>

      <view class="user-info">
        <view class="user-name">{{ item.uname }}</view>
      </view>

      <button
        class="follow-button"
        :type="item.flag ? 'default' : 'primary'"
        @click="followHandle(item.flag, item.account, item.uname)"
      >
        {{ item.flag ? "已关注" : "关注" }}
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
import { inject } from "vue";
import { cancelUserFollowApi, userFollowApi } from "@/api/apis";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();

const useOldManModeStore = inject("useOldManModeStore");
// 定义组件属性
const props = defineProps({
  followList: {
    type: Array,
    default: () => [],
  },
  refreshing: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: "暂无数据",
  },
});

// 定义组件事件
const emit = defineEmits(["refresh", "userClick"]);

// 下拉刷新处理函数
const onRefresh = () => {
  emit("refresh");
};

const onScrolltolower = () => {
  emit("reachBottom");
};

// 跳转到用户详情页
const goToUserDetail = (userId, followFlag) => {
  emit("userClick", userId, followFlag);
};

// 取消关注
const followHandle = async (flag, account2, uname) => {
  if (flag) {
    uni.showModal({
      title: "提示",
      content: `确定取消关注用户${uname}吗？`,
      success: async (res) => {
        if (res.confirm) {
          const res = await cancelUserFollowApi({ account2 });
          uni.showToast({
            title: res.msg,
            icon: "success",
          });
          emit("changeFollowStatus", account2);
        }
      },
    });
  } else {
    await userFollowApi({ account2 });
    emit("changeFollowStatus", account2);
  }
};
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

.follow-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1px solid #eee;
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
