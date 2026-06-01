<template>
  <my-page pageTitle="预测详情" @onReachBottom="onReachBottom">
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
            <image class="avatar" :src="getFullHimgUrl(prognosisData.himg)" mode="aspectFill" />
            <text class="name">{{ prognosisData.uname }}</text>
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
            <comment-card
              v-for="(item, index) in commitList"
              :key="index"
              :comment="item"
              @reply="onReplyTo"
            />
            <view class="no-comment" v-if="commitList.length === 0">暂无评论，快来抢沙发吧~</view>
            <view class="no-more" v-if="!isMoreComment && commitList.length > 0">没有更多了</view>
          </view>
        </view>
      </view>

      <!-- 底部固定输入栏 -->
      <view class="bottom-bar">
        <view class="input-wrap">
          <input
            class="input"
            v-model="inputText"
            @blur="onBlur"
            @focus="onFocus"
            :focus="inputFocus"
            :auto-blur="true"
            confirm-type="send"
            :placeholder="replyTarget ? '回复 ' + replyTarget.uname + '：' : '写下你的看法...'"
            @confirm="postCommit"
          />
        </view>
        <view class="bottom-actions">
          <template v-if="inputFocus">
            <button @click="postCommit" size="default" type="default">发送</button>
          </template>
          <template v-else>
            <view style="margin-right: 10rpx">
              <uni-icons type="chat" size="16"></uni-icons>
              {{ commentCount }}
            </view>
            <!-- <view>
              <uni-icons type="hand-up" size="16"></uni-icons>
              {{ prognosisData.likeCount || 0 }}
            </view> -->
          </template>
        </view>
      </view>
    </view>
  </my-page>
</template>
<script>
import ScratchCard from "@/components/ScratchCard.vue";
import myPage from "@/components/myPage.vue";
import tool from "@/utils/tool.js";
import { getFootBallPostDetail, addComment, commentList } from "@/api/apis.js";
import commentCard from "./components/comment-card.vue";
export default {
  components: { ScratchCard, myPage, commentCard },
  data() {
    return {
      id: "",
      prognosisData: {},
      commitList: [],
      commitPage: 1,
      commitLimit: 20,
      commentCount: 0,
      isMoreComment: false,
      replyTarget: null, // { pid, uname } | null
      inputText: "",
      inputFocus: false,
      footBallDetail: {},
    };
  },
  computed: {
    parsedResult: function () {
      if (!this.prognosisData?.fbpost?.result) return false;
      try {
        return JSON.parse(this.prognosisData.fbpost.result);
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
  methods: {
    refreshScratchCard() {
      this.$refs.scratchCardRef.reset();
    },
    getFullHimgUrl(himg) {
      if (typeof himg !== "string" || himg.trim() === "") {
        return "http://video.caimizm.com/himg/user.png";
      }
      return tool.oss.getFullUrl(`/himg/${himg}`);
    },
    // 回复某条一级评论
    onReplyTo(comment) {
      this.replyTarget = { pid: comment.id, uname: comment.uname };
      this.onFocus()
    },
    cancelReply() {
      this.replyTarget = null;
    },
    onBlur() {
      setTimeout(() => {
        this.inputFocus = false;
        if (!this.inputText.trim()) {
          this.replyTarget = null;
        }
      }, 100);
    },
    onFocus() {
      this.inputFocus = true;
    },
    async getCommentList(isLoadMore = false) {
      if (!isLoadMore) {
        this.commitPage = 1;
      }
      try {
        const res = await commentList({
          postId: this.id,
          page: this.commitPage,
          limit: this.commitLimit,
        });
        const { total, list } = res.data;
        this.commentCount = total
        this.isMoreComment = list.length === this.commitLimit;
        if (isLoadMore) {
          this.commitList = [...this.commitList, ...list];
        } else {
          this.commitList = list;
        }
      } catch (error) {
        uni.showToast({
          title: error.msg || "加载评论失败",
          icon: "none",
        });
      }
    },
    async postCommit() {
      if (!this.inputText.trim()) {
        uni.showToast({
          title: "请输入评论内容",
          icon: "none",
        });
        return;
      }
      uni.showLoading();
      try {
        const res = await addComment({
          postId: this.id,
          pid: this.replyTarget ? this.replyTarget.pid : "0",
          content: this.inputText,
        });
        uni.showToast({ title: res.msg || "发布成功" });
        this.inputText = "";
        this.replyTarget = null;
        this.getCommentList();
      } catch (error) {
        uni.showToast({
          title: error.msg || "发布失败",
          icon: "none",
        });
      }
      uni.hideLoading();
    },
    // 页面触底加载更多
    onReachBottom() {
      if (this.isMoreComment) {
        this.commitPage++;
        this.getCommentList(true);
      }
    },
  },
  onLoad(options) {
    this.id = options.id || "0";
    uni.showLoading({
      title: "加载中...",
    });
    getFootBallPostDetail(options.id)
      .then((res) => {
        this.prognosisData = {...res.data, ...res.data.fbpost};
      })
      .finally(() => {
        uni.hideLoading();
      });
    this.getCommentList();
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

.container {
  padding-bottom: 70px;
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
  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 16rpx;
    line-height: 1.4;
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
    .no-comment {
      text-align: center;
      padding: 60rpx 0;
      font-size: 28rpx;
      color: $text-sub;
    }
    .no-more {
      text-align: center;
      padding: 16rpx 0;
      font-size: 24rpx;
      color: #999;
    }
  }
}

/* 底部固定输入栏 */
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
  z-index: 100;

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
  }

  .bottom-actions {
    display: flex;
    margin-left: 12px;
    .action-btn {
      background: $primary-color;
      color: #fff;
      font-size: 14px;
      padding: 6px 20px;
      border-radius: 20px;
      border: none;
      margin: 0;
      &::after {
        border: none;
      }
    }
  }
}
</style>