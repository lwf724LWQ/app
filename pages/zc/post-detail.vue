<template>
  <my-page pageTitle=" " @onReachBottom="onReachBottom">
    <view class="container">
      <!-- 1. 主贴内容 -->
      <view class="main-post">
        <view class="post-header">
          <image class="avatar" :src="getFullImgUrl(postDetail.himg)" mode="aspectFill" />
          <view class="user-meta">
            <view class="name-row">
              <text class="username">{{ postDetail.uname }}</text>
            </view>
            <view class="time-row">{{ getTimeAgo(postDetail.create_time) }}</view>
          </view>
        </view>

        <view class="post-content">
          <view class="title">{{ postDetail.title }}</view>
          <view class="body">{{ postDetail.description }}</view>
        </view>
      </view>

      <!-- 3. 评论列表 -->
      <view class="comment-list">
        <comment-card
          v-for="(item, index) in commentList"
          :key="index"
          :comment="item"
          @reply="onReplyTo"
        />
        <view class="no-more" v-if="!isMoreComment && commentList.length > 0">没有更多了</view>
      </view>

      <!-- 4. 底部输入栏 -->
      <view class="bottom-bar">
        <view class="input-wrap">
          <input
            class="input"
            v-model="inputText"
            @blur="onBlur"
            @focus="onFocus"
            @confirm="submitComment"
            :focus="inputFocus"
            :auto-blur="true"
            confirm-type="send"
            :placeholder="replyTarget ? '回复 ' + replyTarget.uname + '：' : '请输入评论...'"
          />
        </view>
        <view class="bottom-actions">
          <template v-if="inputFocus">
            <button class="action-btn" @click="submitComment" size="default" type="default">发送</button>
          </template>
          <template v-else>
            <view class="action-btn">
              <uni-icons type="chat" size="16"></uni-icons>
              {{ commentCount }}
            </view>
            <!-- <view class="action-btn">
              <uni-icons type="hand-up" size="16"></uni-icons>
              351
            </view> -->
          </template>
        </view>
      </view>
    </view>
  </my-page>
</template>

<script>
import commentCard from "./components/comment-card.vue";
import myPage from "@/components/myPage.vue";
import { getFootBallPostDetail, addComment, commentList } from "@/api/apis.js"
import tool from "@/utils/tool"

export default {
  components: { commentCard, myPage },
  data() {
    return {
      id: "",
      postDetail:{},

      activeTab: "all",
      sort: "hot",
      commentList: [],
      commentPage: 1,
      commentLimit: 20,
      isMoreComment: false,
      commentCount: 0,

      inputFocus: false,
      inputText: "",
      replyTarget: null, // { pid, uname } | null
    };
  },
  methods: {
    onBlur() {
      setTimeout(()=>{
        this.inputFocus = false;
        // 失焦时清除回复目标
        if (!this.inputText.trim()) {
          this.replyTarget = null;
        }
      }, 100)
    },
    onFocus() {
      this.inputFocus = true;
    },
    // 回复某条一级评论
    onReplyTo(comment) {
      this.replyTarget = { pid: comment.id, uname: comment.uname };
      this.inputFocus = true;
    },

    async getPostDetail(){
      uni.showLoading()
      try {
          const res = await getFootBallPostDetail(this.id)
          const a = JSON.parse(res.data.fbpost.result)
          res.data.description = a.expertAnalysis
          this.postDetail = {uname: res.data.uname, himg: res.data.himg, ...res.data.fbpost}
      } catch (error) {
        uni.showToast({
          title: error.msg || "加载失败"
        })        
      }
      uni.hideLoading()
    },
    getFullImgUrl(url){
      return tool.oss.getFullUrl(`/himg/${url}`);
    },
    async getCommentList(isLoadMore = false) {
      if (!isLoadMore) {
        this.commentPage = 1;
      }
      try {
        const res = await commentList({
          postId: this.id,
          page: this.commentPage,
          limit: this.commentLimit,
        });
        const { total,list } = res.data;
        
        this.commentCount = total
        this.isMoreComment = list.length === this.commentLimit

        if (isLoadMore) {
          this.commentList = [...this.commentList, ...list];
        } else {
          this.commentList = list;
        }
      } catch (error) {
        console.log(error)
        uni.showToast({
          title: error.msg || "加载评论失败",
          icon: "none",
        });
      }
    },
    getTimeAgo(time){
      return tool.getTimeAgo(time)
    },
    async submitComment() {
      if (!this.inputText.trim()) {
        uni.showToast({ title: "请输入评论内容", icon: "none" });
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
        // 刷新评论列表
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
        this.commentPage++;
        this.getCommentList(true); 
      }
    },
  },
  
  onLoad(option) {
    this.id = option.id;
    this.getPostDetail();
    this.getCommentList();
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

.comment-list {
  background-color: #fff;

  .no-more {
    text-align: center;
    padding: 16px 0;
    font-size: 13px;
    color: #999;
  }
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