<template>
  <my-page pageTitle="预测详情">
    <view class="container">
      <!-- 顶部导航栏占位 (UniApp 默认有导航栏，这里做内容padding) -->
      <view class="content">
        <!-- 卡片：详细数据网格 -->
        <view class="card stats-card">
          <ScratchCard v-if="parsedResult" ref="scratchCardRef">
            <view class="stats-grid">
              <view class="stat-item" v-for="(item, index) in expertAnalysisList" :key="index">
                {{ item }}
              </view>
            </view>
          </ScratchCard>
          <button class="submit-btn" @click="refreshScratchCard">刷新</button>
        </view>

        <!-- 卡片：基本信息 -->
        <view class="card header-card">
          <view class="title">{{ prognosisData.title }}</view>

          <!-- 博主信息 -->
          <view class="author-info">
            <image class="avatar" :src="getFullHimgUrl(prognosisData.avatar)" mode="aspectFill" />
            <text class="name">{{ prognosisData.name || "博主" }}</text>
          </view>
        </view>

        <!-- 卡片：发布评论 -->
        <view class="card comment-input-card">
          <view class="section-title">
            <uni-icons class="icon" type="chat" size="16" color="#4A90E2"></uni-icons>
            发表评论
          </view>
          <view class="comment-input-wrapper">
            <textarea
              class="comment-input"
              v-model="commitForm.content"
              placeholder="写下你的看法..."
              maxlength="200"
            />
            <view class="comment-submit-row">
              <button class="submit-btn" @click="postCommit">发布</button>
            </view>
          </view>
        </view>

        <!-- 卡片：评论列表 -->
        <view class="card comment-list-card">
          <view class="section-title">
            <uni-icons class="icon" type="list" size="16" color="#4A90E2"></uni-icons>
            评论列表
            <text class="comment-count" v-if="commitList.length">({{ commitList.length }})</text>
          </view>
          <view class="comment-list">
            <view class="comment-item" v-for="item in commitList" :key="item.id">
              <view class="comment-user">
                <image class="user-avatar" :src="getFullHimgUrl(item.himg)" mode="aspectFill" />
                <text class="user-name">{{ item.uname }}</text>
              </view>
              <view class="comment-content">{{ item.content }}</view>
              <view class="comment-time">{{ item.create_time }}</view>
            </view>
            <view class="no-comment" v-if="commitList.length === 0">暂无评论，快来抢沙发吧~</view>
          </view>
        </view>
      </view>
    </view>
  </my-page>
</template>
<script>
import ScratchCard from "@/components/ScratchCard.vue";
import myPage from "@/components/myPage.vue";
import tool from "@/utils/tool.js";
import { getFootBallPostDetail, getFootBallDetail } from "@/api/apis.js";
export default {
  components: { ScratchCard, myPage },
  data() {
    return {
      prognosisData: {},
      commitList: [
        {
          id: 1,
          content: "这是测试数据",
          create_time: "2023-04-01 10:00:00",
          uname: "测试用户",
          himg: "dadfjwqehr213h4921.jpg",
        },
      ],
      footBallDetail: {},
      commitForm: {
        content: "",
      },
    };
  },
  computed: {
    parsedResult: function () {
      if (!this.prognosisData.result) return false;
      try {
        return JSON.parse(this.prognosisData.result);
      } catch (e) {
        return false;
      }
    },
    expertAnalysisList: function () {
      if (this.parsedResult) {
        return this.parsedResult.expertAnalysis.split("\n");
      }
      return [];
    },
  },
  watch: {
    expertAnalysisList() {
      // this.$nextTick(() => {
      //   this.$refs.scratchCardRef.reset();
      // });
    },
  },
  methods: {
    refreshScratchCard() {
      this.$refs.scratchCardRef.reset();
    },
    getFullHimgUrl(himg) {
      if (typeof himg !== "string" || himg.trim() === "") {
        // 默认头像
        return "http://video.caimizm.com/himg/user.png";
      }
      return tool.oss.getFullUrl(`/himg/${himg}`);
    },
    postCommit() {
      if (!this.commitForm.content.trim()) {
        uni.showToast({
          title: "请输入评论内容",
          icon: "none",
        });
        return;
      }
      // 等待接口
      uni.showToast({
        title: "发布成功",
        icon: "success",
      });
      // 模拟添加评论
      const newComment = {
        id: Date.now(),
        content: this.commitForm.content,
        create_time: this.formatTime(new Date()),
        uname: "当前用户",
        himg: "default_avatar.png",
      };
      this.commitList.unshift(newComment);
      this.commitForm.content = "";
    },
    formatTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      const second = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
  },
  onLoad(options) {
    uni.showLoading({
      title: "加载中...",
    });
    getFootBallPostDetail(options.id)
      .then((res) => {
        this.prognosisData = res.data;
      })
      .finally(() => {
        uni.hideLoading();
      });
  },
};
</script>

<style lang="scss" scoped>
/* 全局变量 */
$primary-color: #3700ff;
$bg-color: #f5f6f7;
$card-bg: #ffffff;
$text-main: #000000;
$text-sub: #000000;
$highlight-bg: #e6f7ff;
$highlight-text: #3700ff;

.container {
  // background-color: $bg-color;
  // padding-bottom: 120rpx; /* 为底部按钮留空间 */
}

.content {
  padding: 20rpx;
}

/* 通用卡片样式 */
.card {
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 头部卡片 */
.header-card {
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
  }
  .match-id {
    font-size: 24rpx;
    color: $text-sub;
    background: #f0f0f0;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
  .price-tag {
    font-size: 28rpx;
    color: #ff4d4f;
    font-weight: bold;
  }
  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 16rpx;
    line-height: 1.4;
  }
  .status-badge {
    display: inline-flex;
    align-items: center;
    font-size: 24rpx;
    color: $primary-color;
    background: rgba(0, 122, 255, 0.1);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    .dot {
      width: 12rpx;
      height: 12rpx;
      background: $primary-color;
      border-radius: 50%;
      margin-right: 8rpx;
    }
  }

  .author-info {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    .avatar {
      width: 68rpx;
      height: 68rpx;
      border-radius: 50%;
      border: 1rpx solid #e0e0e0;
      margin-right: 16rpx;
    }
    .name {
      font-size: 32rpx;
      color: $text-sub;
    }
  }
}

/* 比分卡片 */
.score-card {
  text-align: center;
  padding: 40rpx 24rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);

  .score-label {
    font-size: 26rpx;
    color: $text-sub;
    margin-bottom: 10rpx;
  }
  .score-value {
    font-size: 80rpx;
    font-weight: 800;
    color: $text-main;
    font-family: "DIN", sans-serif; /* 如果有数字字体更好 */
    line-height: 1;
  }
  .score-sub {
    font-size: 24rpx;
    color: $text-sub;
    margin-top: 10rpx;
  }
}

/* 数据网格 */
.stats-card {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 20rpx;
    border-left: 6rpx solid $primary-color;
    padding-left: 12rpx;
  }
  .stats-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 38rpx;
    font-weight: bold;
    min-height: 280rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 12rpx;

    .stat-item {
      margin: 10rpx 0;
    }
  }
}

// 命中文字动画
@keyframes hit-animation {
  0% {
    transform: scale(1) rotate(15deg);
  }
  100% {
    transform: scale(1.1) rotate(15deg);
  }
}

/* 分析文本 */
.analysis-card {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
    .icon {
      margin-right: 8rpx;
    }
  }
  .analysis-text {
    font-size: 28rpx;
    color: #555;
    line-height: 1.6;
    text-align: justify;
    overflow: hidden;
    transition: all 0.3s;
  }
  .toggle-btn {
    margin-top: 20rpx;
    text-align: center;
    font-size: 26rpx;
    color: $primary-color;
    padding: 10rpx;
    .arrow {
      margin-left: 6rpx;
    }
  }
}

/* 评论输入卡片 */
.comment-input-card {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
    .icon {
      margin-right: 8rpx;
    }
  }
  .comment-input-wrapper {
    .comment-input {
      width: 100%;
      height: 120rpx;
      padding: 16rpx;
      background: #f8f8f8;
      border-radius: 12rpx;
      font-size: 28rpx;
      color: $text-main;
      box-sizing: border-box;
    }
    .comment-submit-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 16rpx;
      .submit-btn {
        background: $primary-color;
        color: #fff;
        font-size: 30rpx;
        font-weight: bold;
        padding: 8rpx 80rpx;
        border-radius: 30rpx;
        border: none;
        margin: 0;
        &::after {
          border: none;
        }
      }
    }
  }
}

/* 评论列表卡片 */
.comment-list-card {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
    .icon {
      margin-right: 8rpx;
    }
    .comment-count {
      font-size: 24rpx;
      color: $text-sub;
      font-weight: normal;
      margin-left: 8rpx;
    }
  }
  .comment-list {
    .comment-item {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      &:last-child {
        border-bottom: none;
      }
      .comment-user {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        .user-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          margin-right: 16rpx;
          background: #f0f0f0;
        }
        .user-name {
          font-size: 28rpx;
          color: $text-main;
          font-weight: 500;
        }
      }
      .comment-content {
        font-size: 28rpx;
        color: #555;
        line-height: 1.6;
        margin-bottom: 12rpx;
        word-break: break-all;
      }
      .comment-time {
        font-size: 24rpx;
        color: $text-sub;
      }
    }
    .no-comment {
      text-align: center;
      padding: 60rpx 0;
      font-size: 28rpx;
      color: $text-sub;
    }
  }
}

/* 底部按钮 */
.footer-action {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 20rpx 30rpx;
  box-sizing: border-box;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -4rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .action-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    border-radius: 40rpx;
    background: #f0f0f0;
    color: $text-main;
    border: none;

    &.primary {
      background: $primary-color;
      color: #fff;
    }

    /* 移除 button 默认样式 */
    &::after {
      border: none;
    }
  }
}
</style>
