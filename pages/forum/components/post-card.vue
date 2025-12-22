<template>
  <view
    class="predict-item"
    v-for="(item, index) in isSearching && searchKeyword ? filteredPredictList : predictList"
    :key="index"
  >
    <!-- 帖子头部 -->
    <view class="post-header">
      <view class="user-info">
        <image :src="item.avatar" class="avatar"></image>
        <view class="username-and-url">
          <text class="username">{{ item.username }}</text>
        </view>
      </view>
      <view class="more-options">
        <uni-icons type="more-filled" size="20" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 期号和时间 -->
    <view class="issue-time">
      <text class="issue-no">第{{ item.period }}期</text>
      <text class="post-time">{{ item.time }}</text>
    </view>

    <!-- 帖子内容 -->
    <view class="post-content">
      <text class="content-text">{{ item.content }}</text>
      <!-- 规律帖图片显示 - 支持多张图片 -->
      <view v-if="item.image" class="post-image-container">
        <!-- 单张图片 -->
        <image
          v-if="!isMultipleImages(item.image)"
          :src="
            item.image.startsWith('http')
              ? item.image
              : `http://video.caimizm.com/himg/${item.image}`
          "
          class="post-image"
          mode="aspectFit"
          @click="previewImage(item.image, [item.image])"
        />
        <!-- 多张图片 -->
        <view v-else class="multiple-images">
          <view
            v-for="(imageUrl, index) in getImageUrls(item.image)"
            :key="index"
            class="image-item"
          >
            <image
              :src="
                imageUrl.startsWith('http') ? imageUrl : `http://video.caimizm.com/himg/${imageUrl}`
              "
              class="post-image-small"
              mode="aspectFit"
              @click="previewImage(imageUrl, getImageUrls(item.image))"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 帖子底部操作 -->
    <view class="post-footer">
      <view
        class="action-item"
        :class="{ 'liked-disabled': item.isLiked }"
        @click="handleLike(item)"
      >
        <uni-icons type="hand-up" size="18" :color="item.isLiked ? '#ff4757' : '#999'"></uni-icons>
        <text class="count" :class="{ liked: item.isLiked }">{{ item.likes }}</text>
      </view>
      <view class="action-item">
        <uni-icons type="redo" size="18" color="#999"></uni-icons>
        <text class="count">{{ item.shares }}</text>
      </view>
      <view class="action-item">
        <uni-icons type="chatbubble" size="18" color="#999"></uni-icons>
        <text class="count">{{ item.comments }}</text>
      </view>
      <view class="action-item append-btn" @click="handleAppendPost(item)">
        <uni-icons type="plus" size="18" color="#28B389"></uni-icons>
        <text class="count">追帖</text>
      </view>
    </view>
  </view>
</template>
