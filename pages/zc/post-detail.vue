<template>
  <my-page pageTitle=" ">
    <view class="container">
      <!-- 1. 主贴内容 -->
      <view class="main-post">
        <view class="post-header">
          <image class="avatar" src="http://video.caimizm.com/himg/user.png" mode="aspectFill" />
          <view class="user-meta">
            <view class="name-row">
              <text class="username">Xctwar</text>
            </view>
            <view class="time-row">05-09</view>
          </view>
        </view>

        <view class="post-content">
          <view class="title">讲下阿诺德</view>
          <view class="body">参加非洲杯仍缺席皇马训练。</view>
        </view>
      </view>

      <!-- 3. 评论列表 -->
      <view class="comment-list">
        <comment-card v-for="(item, index) in commentList" :key="index" :comment="item" />
      </view>

      <!-- 4. 底部输入栏 -->
      <view class="bottom-bar">
        <view class="input-wrap">
          <input
            class="input"
            v-model="inputText"
            @blur="onBlur"
            @focus="onFocus"
            :auto-blur="true"
            confirm-type="send"
            placeholder="请输入评论..."
          />
        </view>
        <view class="bottom-actions">
          <template v-if="inputFocus">
            <button class="action-btn">发送</button>
          </template>
          <template v-else>
            <view class="action-btn">
              <uni-icons type="chat" size="16"></uni-icons>
              154
            </view>
            <view class="action-btn">
              <uni-icons type="hand-up" size="16"></uni-icons>
              351
            </view>
          </template>
        </view>
      </view>
    </view>
  </my-page>
</template>

<script>
import commentCard from "./components/comment-card.vue";
import myPage from "@/components/myPage.vue";

export default {
  components: { commentCard, myPage },
  data() {
    return {
      activeTab: "all",
      sort: "hot",
      commentList: [
        {
          username: "哥们在这",
          userAvatar: "http://video.caimizm.com/himg/user.png",
          level: "Lv.9",
          vStatus: "V",
          title: "流砥柱",
          isOp: true,
          text: "啊？",
          date: "05-09",
          location: "河南",
          likes: 56,
        },
      ],

      inputFocus: false,
      inputText: "",
    };
  },
  methods: {
    onBlur() {
      this.inputFocus = false;
    },
    onFocus() {
      this.inputFocus = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  background-color: #f4f4f4;
  padding-bottom: 70px;
  min-height: 100vh;
  box-sizing: border-box;
}

.main-post {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 10px;

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    .avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .name-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .username {
      font-weight: bold;
      font-size: 16px;
      margin-right: 5px;
    }
    .badge {
      padding: 0 4px;
      border-radius: 3px;
      font-size: 10px;
      color: #fff;
      margin-right: 5px;
    }
    .lv {
      background: #91c43c;
    }
    .v {
      background: #fbe212;
      color: #666;
    }
    .time-row {
      font-size: 12px;
      color: #999;
    }
  }

  .post-content {
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .body {
      font-size: 15px;
      color: #444;
      line-height: 1.6;
    }
  }

  .post-footer {
    display: flex;
    justify-content: space-around;
    padding-top: 15px;
    margin-top: 15px;
    border-top: 1px solid #eee;
    .action-item {
      font-size: 14px;
      color: #666;
    }
  }
}

.comment-tabs {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 8px 12px;
  font-size: 14px;
  border-bottom: 1px solid #eee;

  .left-tabs {
    .tab-item {
      margin-right: 15px;
      color: #666;
      &.active {
        color: #000;
        font-weight: bold;
      }
    }
  }
  .right-tabs {
    .sort-item {
      margin-left: 12px;
      color: #666;
      padding: 2px 8px;
      &.active {
        background: #ffebee;
        color: #ff5252;
        border-radius: 10px;
      }
    }
  }
}

.comment-list {
  background-color: #fff;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #ddd;
  padding: 8px 12px;
  display: flex;
  align-items: center;

  .input-wrap {
    flex: 1;
    background: #f2f2f2;
    border-radius: 20px;
    display: flex;
    align-items: center;
    padding: 5px 12px;
    .input {
      flex: 1;
      height: 30px;
      font-size: 14px;
    }
    .emoji-icon {
      font-size: 20px;
      margin-left: 5px;
    }
  }

  .bottom-actions {
    display: flex;
    margin-left: 12px;
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      color: #666;
      margin-left: 15px;
      text-align: center;
    }
  }
}
</style>
