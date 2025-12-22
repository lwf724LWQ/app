<!-- pages/index/index.vue -->
<template>
  <view class="container">
    <!-- 页面标题 -->
    <z-paging
      class="post-list"
      ref="pagingRef"
      use-virtual-list
      :force-close-inner-list="true"
      :cell-height-mode="dynamic"
      @query="queryList"
      @virtualListChange="virtualListChange"
      :auto="false"
    >
      <template #top>
        <top-navigation-bar title="帖子列表" />
        <view class="tab-bar">
          <view
            class="item"
            v-for="item in tnameList"
            :key="item"
            :class="{ activat: currentTname == item }"
            @click="switchTab(item)"
          >
            {{ item }}
          </view>
        </view>
        <!-- <view class="tab-bar" v-show="currentTname !== '全部'">
                    <view class="item" v-for="item in ruleList" :key="item" :class="{ activat: currentRule == item }"
                        @click="switchRuleTab(item)">{{ item }}</view>
                </view> -->
      </template>
      <!-- :id="`zp-id-${item.zp_index}`"和:key="item.zp_index" 必须写，必须写！！！！ -->
      <!-- :id="`zp-id-${item.zp_index}`"必须这么写，不能改动 -->
      <!-- 这里for循环的index不是数组中真实的index了，请使用item.zp_index获取真实的index -->
      <view
        :id="`zp-id-${post.zp_index}`"
        :key="post.zp_index"
        v-for="(post, index) in virtualList"
      >
        <postCard :post="post" />
      </view>
    </z-paging>
  </view>
</template>

<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref, nextTick } from "vue";
import TopNavigationBar from "../../components/TopNavigationBar.vue";
import { apiSelect_by_account } from "@/api/apis.js";
import { getAccount } from "../../utils/request";
import postCard from "../../components/post-card/post-card.vue";

const virtualList = ref([]);
// 监听虚拟列表数组改变并赋值给virtualList进行重新渲染
function virtualListChange(vList) {
  virtualList.value = vList;
}
const pagingRef = ref(null);
const tnameList = ["全部", "排列三", "排列五", "七星彩", "福彩3D"];
const currentTname = ref("全部");
function switchTab(tname) {
  currentTname.value = tname;
  pagingRef.value.reload(true);
}

const ruleList = ref(["预测贴", "规律贴"]);
const currentRule = ref("预测贴");
function switchRuleTab(tname) {
  currentRule.value = tname;
  pagingRef.value.reload(true);
}
function queryList(pageNo, pageSize) {
  // 组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
  // 这里的pageNo和pageSize会自动计算好，直接传给服务器即可
  // 模拟请求服务器获取分页数据，请替换成自己的网络请求
  const params = {
    page: pageNo,
    limit: pageSize,
    tname: currentTname.value,
    // random: this.tabIndex === 1
  };
  if (currentTname.value == "全部") {
    delete params.tname;
  } else if (currentRule.value == "规律贴") {
    params.tname = params.tname + "-规律预测";
  }

  apiSelect_by_account(params)
    .then((res) => {
      pagingRef.value.complete(res.data.list);
    })
    .catch((res) => {
      this.$refs.paging.complete(false);
    });
}

onLoad(() => {
  nextTick(() => {
    pagingRef.value.reload(true);
  });
});
</script>

<style lang="scss">
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
