<template>
  <my-page pageTitle="发布精彩回顾帖子">
    <view class="container">
      <view class="tname">类型： {{ tname }}</view>
      <!-- 标题选择 -->
      <view class="input-group">
        <text class="label">标题</text>
        <view class="title-container">
          <input
            v-model="formData.title"
            type="text"
            placeholder="点击选择标题"
            readonly
            class="title-input"
          />
          <view @click="openTitleModal">选择标题</view>
        </view>
      </view>

      <!-- 图片上传 -->
      <view class="input-group">
        <text class="label">图片</text>
        <view class="upload-container">
          <view v-if="!imageTempSrc" class="upload-btn" @click="chooseImage">
            <uni-icons type="plusempty" size="30" color="#ccc"></uni-icons>
            <text class="upload-text">点击上传图片</text>
          </view>
          <view v-else class="image-preview">
            <image :src="imageTempSrc" mode="aspectFill" @click="previewImage"></image>
            <view class="delete-btn" @click="removeImage">
              <uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
            </view>
          </view>
        </view>
      </view>

      <!-- 发布按钮 -->
      <button class="publish-btn" @click="chooseImage" v-if="imageTempSrc">重新选择图片</button>
      <button class="publish-btn" @click="publishPost">发布</button>
    </view>

    <!-- 标题选择弹窗 -->
    <uni-popup ref="titleSelectPopup" type="dialog">
      <uni-popup-dialog
        mode="list"
        title="选择标题"
        :duration="2000"
        :before-close="true"
        @close="closeTitleSelectPopup"
        @confirm="selectTitle"
      >
        <radio-group @change="onTitleChange">
          <label v-for="(item, index) in titleOptions" :key="index" class="radio-item">
            <radio :value="item" :checked="selectedTitle === item" />
            <text>{{ item }}</text>
          </label>
        </radio-group>
      </uni-popup-dialog>
    </uni-popup>
  </my-page>
</template>

<script>
import myPage from "../../components/myPage.vue";
import { useUserStore } from "../../stores/userStore";
import dayjs from "dayjs";
import tool from "../../utils/tool";
import { putReviewPost } from "../../api/apis";

export default {
  components: { myPage },
  data() {
    return {
      formData: {
        title: "",
        image: "",
        content: "",
      },
      nikcName: "",
      imageTempSrc: "",
      tname: "",
      showTitleModal: false,
      selectedTitle: "",
      titleOptions: [],
    };
  },
  methods: {
    openTitleModal() {
      this.$refs.titleSelectPopup.open();
    },
    closeTitleSelectPopup() {
      this.$refs.titleSelectPopup.close();
    },
    // 选择标题
    onTitleChange(e) {
      this.selectedTitle = e.detail.value;
    },
    selectTitle() {
      if (this.selectTitle) {
        this.formData.title = this.selectedTitle;
      }
      this.closeTitleSelectPopup();
    },

    // 图片上传
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          if (res.tempFilePaths.length) {
            console.log("选择图片:", res);
            this.imageTempSrc = res.tempFilePaths[0];
            this.formData.image = res.tempFiles[0];
          }
        },
        fail: (err) => {
          console.log("选择图片失败", err);
        },
      });
    },

    // 预览图片
    previewImage() {
      if (this.formData.image) {
        uni.previewImage({
          urls: [this.imageTempSrc],
        });
      }
    },

    // 删除图片
    removeImage() {
      uni.showModal({
        title: "提示",
        content: "确定要删除这张图片吗？",
        success: (res) => {
          if (res.confirm) {
            this.formData.image = "";
          }
        },
      });
    },

    // 发布帖子
    async publishPost() {
      if (!this.formData.image) {
        uni.showToast({
          title: "请上传封面图片",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({
          title: "发布中...",
        });
        console.log("准备发帖数据:", this.formData);
        const uploadRes = await tool.oss.upload(this.formData.image, {
          folder: "review-post", // 图片存储文件夹
          progress: (percentage) => {
            // uploadProgress.value = Math.floor(percentage * 100);
            // statusMessage.value = `视频上传中: ${uploadProgress.value}%`;
          },
        });
        const formData = {
          title: this.formData.title,
          jimg: uploadRes.name,
          tname: this.tname,
        };
        await putReviewPost(formData);
        console.log("提交表单：", formData);
      } catch (error) {
        console.log("提交失败", error);
        uni.showToast({
          title: "发布失败，请稍后重试",
          icon: "none",
        });
      }
      uni.hideLoading();
      uni.navigateBack();
    },

    // 重置表单
    resetForm() {
      this.formData = {
        title: "",
        image: "",
        content: "",
      };
    },
  },
  created() {
    const userStore = useUserStore();
    const nikcName = userStore.getUserInfo.nickname;
    this.titleOptions = [
      `${nikcName} ${dayjs().format("MM月DD日")}精彩回顾`,
      `${nikcName} ${dayjs().format("YYYY年MM月")}精彩回顾`,
      `${nikcName} ${dayjs().format("MMDD")}精彩回顾`,
    ];

    this.formData.title = this.titleOptions[0];
  },
  onLoad(options) {
    options = tool.optionsParamsDecode(options);
    this.tname = options.tname;
  },
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20rpx;
}

.tname {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.input-group {
  margin-bottom: 30rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 15rpx;
    font-weight: bold;
  }

  .title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1rpx solid #e5e5e5;
    border-radius: 10rpx;
    padding: 20rpx;
    background-color: #f9f9f9;
    font-size: 32rpx;
    font-weight: bold;

    .title-input {
      flex: 1;
    }
  }

  .upload-container {
    width: 600rpx;
    height: 500rpx;
    margin: 0 auto;
    .upload-btn {
      border: 2rpx dashed #ddd;
      border-radius: 10rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #fafafa;
      width: 100%;
      height: 100%;
      .upload-text {
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
      }
    }

    .image-preview {
      position: relative;
      border-radius: 10rpx;
      overflow: hidden;
      width: 100%;
      height: 100%;
      image {
        width: 100%;
        height: 100%;
      }

      .delete-btn {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .content-input {
    width: 100%;
    min-height: 200rpx;
    border: 1rpx solid #e5e5e5;
    border-radius: 10rpx;
    padding: 20rpx;
    font-size: 28rpx;
    font-weight: bold;
    box-sizing: border-box;
  }
}

.publish-btn {
  width: 100%;
  background-color: #007aff;
  color: #fff;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  font-size: 36rpx;
  font-weight: bold;
  margin-top: 40rpx;
}

.radio-item {
  display: block;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #eee;
}
</style>
