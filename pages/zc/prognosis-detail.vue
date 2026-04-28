<template>
  <my-page pageTitle="预测详情">
    <view class="container">
      <!-- 顶部导航栏占位 (UniApp 默认有导航栏，这里做内容padding) -->
      <view class="content">
        <!-- 卡片：基本信息 -->
        <view class="card header-card">
          <view class="title">{{ prognosisData.title }}</view>
          <view class="status-badge" v-if="prognosisData.flag">
            <text class="dot"></text>
            推荐方案
          </view>
        </view>
        <!-- 卡片：详细数据网格 -->

        <view class="card stats-card">
          <view class="section-title">预测数据</view>
          <ScratchCard v-if="parsedResult">
            <view class="stats-grid">
              <!-- highlight 代表命中 -->
              <view
                class="stat-item"
                v-if="parsedResult.winDrawLosecurrent"
                :class="{ highlight: parsedResult.winDrawLosecurrent1 === 'true' }"
              >
                <text class="stat-label">胜平负</text>
                <text class="stat-value">{{ parsedResult.winDrawLosecurrent }}</text>
                <view v-if="parsedResult.winDrawLosecurrent1 === 'true'" class="stat-hit">
                  命中
                </view>
              </view>
              <view
                class="stat-item"
                v-if="parsedResult.winDrawLosecurrentHandicap"
                :class="{ highlight: parsedResult.winDrawLosecurrentHandicap1 === 'true' }"
              >
                <text class="stat-label">让球胜平负</text>
                <text class="stat-value">{{ parsedResult.winDrawLosecurrentHandicap }}</text>
                <view v-if="parsedResult.winDrawLosecurrentHandicap1 === 'true'" class="stat-hit">
                  命中
                </view>
              </view>
              <view
                class="stat-item"
                v-if="parsedResult.halfTimecurrent"
                :class="{ highlight: parsedResult.halfTimecurrent1 === 'true' }"
              >
                <text class="stat-label">半全场</text>
                <text class="stat-value">{{ parsedResult.halfTimecurrent }}</text>
                <view v-if="parsedResult.halfTimecurrent1 === 'true'" class="stat-hit">命中</view>
              </view>
              <view
                class="stat-item"
                v-if="parsedResult.totalGoalscurrent"
                :class="{ highlight: parsedResult.totalGoalscurrent1 === 'true' }"
              >
                <text class="stat-label">总进球</text>
                <text class="stat-value">{{ parsedResult.totalGoalscurrent }}</text>
                <view v-if="parsedResult.totalGoalscurrent1 === 'true'" class="stat-hit">命中</view>
              </view>
              <view
                class="stat-item"
                v-if="parsedResult.scorecurrent"
                :class="{ highlight: parsedResult.scorecurrent1 === 'true' }"
              >
                <text class="stat-label">比分</text>
                <text class="stat-value">{{ parsedResult.scorecurrent }}</text>
                <view v-if="parsedResult.scorecurrent1 === 'true'" class="stat-hit">命中</view>
              </view>
            </view>
          </ScratchCard>
        </view>

        <!-- 卡片：专家分析 -->
        <view class="card analysis-card" v-if="parsedResult.expertAnalysis">
          <view class="section-title">
            <text class="icon">📝</text>
            专家分析
          </view>
          <view class="analysis-text">
            {{ parsedResult.expertAnalysis }}
          </view>
        </view>

        <!-- 卡片：发布评论 -->
        <!-- <view class="card comment-input-card">
          <view class="section-title">
            <text class="icon">💬</text>
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
        </view> -->

        <!-- 卡片：评论列表 -->
        <!-- <view class="card comment-list-card">
          <view class="section-title">
            <text class="icon">📋</text>
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
        </view> -->
      </view>
    </view>
  </my-page>
</template>
<script>
import ScratchCard from "@/components/ScratchCard.vue";
import myPage from "@/components/myPage.vue";
import tool from "@/utils/tool.js";
import { getFootBallPostDetail } from "@/api/apis.js";
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
      commitForm: {
        content: "",
      },
    };
  },
  computed: {
    parsedResult: function () {
      if (!this.prognosisData.result) return false;
      return JSON.parse(this.prognosisData.result);
    },
  },
  methods: {
    getFullHimgUrl(himg) {
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
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 20rpx;

    .stat-item {
      flex: 1;
      min-width: 45%; /* 每行两个 */
      background: #f8f8f8;
      padding: 20rpx;
      border-radius: 12rpx;
      display: flex;
      flex-direction: row;
      align-items: center;
      position: relative;
      &.highlight {
        background: $highlight-bg;
        .stat-value {
          color: $highlight-text;
        }
      }
      .stat-hit {
        position: absolute;
        font-size: 56rpx;
        color: #f00;
        padding: 4rpx 8rpx;
        border-radius: 8rpx;
        right: 10rpx;
        border: 6rpx solid #f00;
        background-color: rgba(255, 255, 255, 0.3);

        transform: rotate(15deg);
        animation: hit-animation 0.5s infinite;
      }

      .stat-label {
        font-size: 32rpx;
        color: $text-sub;
        flex-basis: 200rpx;
        text-align: right;
        font-weight: bold;
        margin-right: 28rpx;
      }
      .stat-value {
        font-size: 40rpx;
        font-weight: bold;
        color: $text-main;
      }
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
        font-size: 32rpx;
        padding: 8rpx 120rpx;
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
