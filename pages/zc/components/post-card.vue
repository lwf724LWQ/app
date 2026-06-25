<template>
  <view class="post-card" @click="onPostCard" @longpress.stop="onLongPress">
    <view class="card-row" :class="{ 'has-cover': postData.fimg }">
      <view class="card-left">
        

        <!-- 内容区 -->
        <view class="content">
          <view class="title" v-if="postData.title">{{ postData.title }}</view>
          <!-- 封面图 -->
          <image
            v-if="postData.fimg"
            class="cover-img"
            :src="tool.oss.getFullUrl(postData.fimg)"
            mode="aspectFill"
          />
        </view>
      </view>

      
    </view>

    <!-- 底部：互动栏 -->
    <view class="footer">
      <!-- 头部：用户信息 -->
        <view class="header">
          <view class="user-info" @click="toUserDetail">
            <image class="avatar" :src="getFullImgUrl(postData.himg)" mode="aspectFill" />
            <view class="text-info">
              <view class="name-row">
                <text class="nickname">{{ postData.uname }}</text>
              </view>
              <view class="meta-info">
                <text>{{ getTimeAgo(postData.create_time) }}</text>
              </view>
            </view>
          </view>
        </view>

      <view class="action-item" @click="onComment">
        <uni-icons class="icon-img" type="chat" size="22" />
        {{ postData.count }}
      </view>
      <!-- <view class="action-item" @click="onLike">
        <uni-icons class="icon-img" type="hand-up" size="16" />
        {{ postData.likeCount }}
      </view> -->
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import tool from "@/utils/tool.js"
import {getAccount} from "../../../utils/request"
import {delFootball} from "../../../api/apis"

// 定义组件接收的属性
const props = defineProps({
  postData: {
    type: Object,
    default: () => ({}),
  },
});

function getTimeAgo(time){
  return tool.getTimeAgo(time)
}

function getFullImgUrl(url){
  if (typeof url === "string" && url.startsWith("http")) {
    return url
  }
  return tool.oss.getFullUrl(`/himg/${url}`);
}

function toUserDetail(){
  uni.navigateTo({
    url: `/pages/user/space?account=${props.postData.account}`,
  });
}

function onLongPress() {
  if (props.postData.account === getAccount()) {
      const itemList = ["修改", "删除"];
      uni.showActionSheet({
        itemList,
        success: (res) => {
          if (res.tapIndex === 0) {
            handleEdit();
          } else if (res.tapIndex === 1) {
            handleDelete();
          }
        },
      });
  }
}
function handleEdit() {
  uni.navigateTo({
    url: `/pages/zc/creaet-post?id=${props.postData.id}`,
  });
}
function handleDelete() {
  uni.showModal({
    title: "确认删除",
    content: "确定要删除这条帖子吗？",
    success: async (modalRes) => {
      if (modalRes.confirm) {
        try {
          uni.showLoading({ title: "删除中..." });
          await delFootball(props.postData.id);
          uni.hideLoading();
          uni.showToast({ title: "删除成功" });
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: e.msg || "删除失败", icon: "none" });
        }
      }
    },
  });
}

const emit = defineEmits(["follow", "share", "comment", "like", "postCard"]);

const handleFollow = () => emit("follow");
const onShare = () => emit("share");
const onPostCard = () => emit("postCard");
const onComment = () => emit("comment");
const onLike = () => emit("like");
</script>

<style lang="scss" scoped>
.post-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  padding: 32rpx;
  font-family: sans-serif;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

  .card-row {
    display: flex;
    gap: 20rpx;
  }

  .card-left {
    flex: 1;
    min-width: 0;
  }

  .cover-img {
    width: 280rpx;
    height: 160rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 0;
    background-color: #f0f0f0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex: 1;

    .user-info {
      display: flex;
      align-items: center;

      .avatar {
        width: 66rpx;
        height: 66rpx;
        border-radius: 50%;
        margin-right: 10rpx;
        background-color: #eee;
      }

      .text-info {
        display: flex;
        flex-direction: column;

        .name-row {
          display: flex;
          align-items: center;

          .nickname {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
            margin-right: 12rpx;
          }
        }

        .meta-info {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .follow-btn {
      margin: 0;
      padding: 0 28rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 28rpx;
      color: #007aff;
      border: 1rpx solid #007aff;
      background: transparent;
      border-radius: 32rpx;

      &::after {
        border: none;
      }
    }
  }

  .content {
    display: flex;
    .title {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 16rpx;
      flex: 1;
    }

    .description {
      font-size: 30rpx;
      color: #666;
      line-height: 1.5;
    }
  }

  .footer {
    display: flex;
    border-top: 1rpx solid #f5f5f5; // 可选，增加分割感
    font-size: 28rpx;
    
    justify-content: flex-start;
    align-items: center;
    
    .action-item {
      display: flex;
      align-items: center;
      padding: 5rpx 20rpx;
      background-color: #eee;
      border-radius: 10rpx;
      height: 56rpx;
      margin-left: 20rpx;

      // 模拟图标（实际项目中请使用 <uni-icons> 或图片）
      .icon-img {
        width: 45rpx;
        height: 45rpx;
        margin-right: 8rpx;
      }
    }
  }
}
</style>
