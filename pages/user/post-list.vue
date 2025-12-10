<!-- pages/index/index.vue -->
<template>
    <view class="container">
        <!-- 页面标题 -->
        <z-paging class="post-list" ref="pagingRef" use-virtual-list :force-close-inner-list="true"
            :cell-height-mode="dynamic" @query="queryList" @virtualListChange="virtualListChange">
            <template #top>
                <top-navigation-bar title="帖子列表" />
                <view class="tab-bar">
                    <view class="item" v-for="item in tnameList" :key="item" :class="{ activat: currentTname == item }"
                        @click="switchTab(item)">{{ item }}</view>
                </view>
                <!-- <view class="tab-bar" v-show="currentTname !== '全部'">
                    <view class="item" v-for="item in ruleList" :key="item" :class="{ activat: currentRule == item }"
                        @click="switchRuleTab(item)">{{ item }}</view>
                </view> -->
            </template>
            <!-- :id="`zp-id-${item.zp_index}`"和:key="item.zp_index" 必须写，必须写！！！！ -->
            <!-- :id="`zp-id-${item.zp_index}`"必须这么写，不能改动 -->
            <!-- 这里for循环的index不是数组中真实的index了，请使用item.zp_index获取真实的index -->
            <view class="post-item" :id="`zp-id-${post.zp_index}`" :key="post.zp_index"
                v-for="(post, index) in virtualList">
                <!-- 标题 -->
                <view class="post-title">{{ post.tname }} 第{{ post.issueno }}期
                    <text class="is-apply-text" :class="{ activat: !post.flag }">{{ post.flag ? '已过审' : '未过审' }}</text>
                </view>

                <!-- 发布时间 -->
                <view class="post-time">{{ formatTime(post.createTime) }}</view>

                <!-- 内容 -->
                <view class="post-content"><text>{{ post.content }}</text></view>

                <!-- 图片 -->
                <view v-if="post.pimg && post.pimg.length > 0" class="post-images">
                    <image v-for="(img, index) in post.pimg" :key="index" :src="img" class="post-image"
                        mode="aspectFill" @tap.stop.prevent="previewImage(post.pimg, index)"></image>
                </view>

                <!-- 底部操作栏 -->
                <view class="post-footer">
                    <view class="footer-item">
                        <text class="icon-like">👍</text>
                        <text class="count">{{ post.likeCount }}</text>
                    </view>
                    <view class="footer-item">
                        <text class="icon-comment">💬</text>
                        <text class="count">{{ post.comment }}</text>
                    </view>
                    <view class="footer-item" @click="handleAppendPost(post)">
                        <uni-icons type="plus" size="18" color="#28B389"></uni-icons>追贴
                    </view>
                </view>
            </view>
        </z-paging>
    </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app"
import { ref } from 'vue'
import TopNavigationBar from '../../components/TopNavigationBar.vue'
import { apiPostListQuery } from '@/api/apis.js'
import forumToos from "./forumToos"
import { getAccount } from "../../utils/request"

const virtualList = ref([])
// 监听虚拟列表数组改变并赋值给virtualList进行重新渲染
function virtualListChange(vList) {
    virtualList.value = vList;
}
const pagingRef = ref(null)
const tnameList = ['全部', '排列三', '排列五', '七星彩', '福彩3D']
const currentTname = ref('全部')
function switchTab(tname) {
    currentTname.value = tname
    pagingRef.value.reload(true)
}

const ruleList = ref(['预测贴', '规律贴'])
const currentRule = ref('预测贴')
function switchRuleTab(tname) {
    currentRule.value = tname
    pagingRef.value.reload(true)
}
function queryList(pageNo, pageSize) {
    // 组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
    // 这里的pageNo和pageSize会自动计算好，直接传给服务器即可
    // 模拟请求服务器获取分页数据，请替换成自己的网络请求
    const params = {
        page: pageNo,
        limit: pageSize,
        account: getAccount(),
        tname: currentTname.value
        // random: this.tabIndex === 1
    }
    if (currentTname.value == '全部') {
        delete params.tname
    } else if (currentRule.value == '规律贴') {
        params.tname = params.tname + '-规律预测'
    }

    apiPostListQuery(params).then(res => {
        pagingRef.value.complete(res.data.records.map(item => ({ ...item, pimg: item.pimg.split(",") })))
    }).catch(res => {
        this.$refs.paging.complete(false);
    })
}

// 跳转到用户详情页
const goToUserDetail = (userId) => {
    // 跳转逻辑
    console.log('跳转到用户详情页', userId)
}
// 时间格式化函数
const formatTime = (datestr) => {
    const timestamp = new Date(datestr).getTime()
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        return '今天'
    } else if (days === 1) {
        return '昨天'
    } else {
        return `${days}天前`
    }
}
// 预览图片
const previewImage = (urls, current) => {
    uni.previewImage({
        urls,
        current
    })
}
// 跳转到帖子详情页面
const goToPostDetail = (postId) => {
    uni.navigateTo({
        url: `/pages/user/post-detail?postId=${postId}`
    })
}

// 处理追帖按钮点击
const handleAppendPost = (post) => {
    console.log('追帖', post)
    forumToos.handleAppendPost(post)
}

onLoad(() => {

})
</script>

<style lang="scss">
.container {}

.post-list {}

.post-item {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.post-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 16rpx;
}

.post-time {
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 20rpx;
}

.post-content {
    font-size: 28rpx;
    color: #666666;
    line-height: 42rpx;
    margin-bottom: 20rpx;
}

.post-images {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20rpx;
}

.post-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
    margin-right: 16rpx;
    margin-bottom: 16rpx;
}

.post-footer {
    display: flex;
    justify-content: flex-start;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.footer-item {
    display: flex;
    align-items: center;
    margin-right: 40rpx;
}

.icon-like,
.icon-comment {
    font-size: 32rpx;
    margin-right: 10rpx;
}

.count {
    font-size: 24rpx;
    color: #999999;
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

.tab-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    align-content: center;
    justify-items: center;
    font-size: 38rpx;
    font-weight: bold;
    box-sizing: border-box;
    padding: 20rpx 10rpx;
    border: 1px solid #f0f0f0;

    .item {
        color: #999;

        &.activat {
            color: #af0f0f;
        }
    }
}

.is-apply-text {
    text-align: right;
    color: yellowgreen;

    &.activat {
        color: #af0f0f;
    }
}
</style>