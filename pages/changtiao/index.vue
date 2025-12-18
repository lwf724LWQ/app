<template>
  <view class="container">
    <top-navigation-bar>
      <template #center>
        <view class="top-tags">
          <view
            class="tag-list-item"
            :class="{ active: nowPage === pageName.qihao }"
            @click="changePage(pageName.qihao)"
          >
            期号展示
          </view>
          <view
            class="tag-list-item"
            :class="{ active: nowPage === pageName.guilei }"
            @click="changePage(pageName.guilei)"
          >
            归类展示
          </view>
        </view>
      </template>
    </top-navigation-bar>
    <template v-if="isLoad">
      <tag-list-component
        class="tag-list"
        :tags="tagOptions"
        :list-data="listData"
        v-model="tagListActiveTag"
        @tag-change="getChantiaoForNameList"
        v-show="nowPage === pageName.guilei"
      >
        <!-- 归类展示 -->
        <template #list="{ data, activeTag }">
          <view class="custom-list">
            <view class="nodata" v-if="changtiaoForLname.length == 0"
              >暂无数据</view
            >
            <view
              v-for="(item, index) in changtiaoForLname"
              :key="item.id"
              class="custom-list-item"
              @click="toDetail(changtiaoForLname, index, item.issueno)"
            >
              <view
                class="custom-list-item-icon"
                :style="{ backgroundColor: activeTag.color }"
                >{{ activeTag.name }}</view
              >
              <view class="custom-list-item-id">第{{ item.issueno }}期</view>
              <view class="custom-list-item-num" :class="{ active: index < 5 }"
                >{{ numbertext(item) }}<uni-icons type="right" size="18"
              /></view>
            </view>
          </view>
        </template>
      </tag-list-component>

      <view v-show="nowPage === pageName.qihao" class="qihao-list">
        <!-- 期号展示 -->
        <scroll-view class="qihao-scrollbox" :scroll-y="true">
          <view class="qihao-info">
            <view class="qihao-id">第{{ nowIssueNo.issueno }}期</view>
            <view class="qihao-opennum">{{ nowIssueNo.number }}</view>
            <view class="qihao-date">{{ nowIssueNo.opendate }}</view>
          </view>
          <view class="qihao-items">
            <view
              class="qihao-item"
              v-for="(tag, i) in changtiaoForIsseno"
              :key="i"
              @click="toDetail(changtiaoForIsseno, i)"
            >
              <view
                class="qihao-item-name"
                :style="{ backgroundColor: getColor(tag.lname) }"
                >{{ tag.lname }}</view
              >
            </view>
          </view>
          <view class="qihao-tip"
            >本页面部分数据来源于网络以及个人，仅供参考</view
          >
        </scroll-view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";
import TagListComponent from "../../components/tag-list.vue";
import TopNavigationBar from "../../components/TopNavigationBar.vue";
import changtiao from "./changtiao";
import {
  apiGetIssueNo,
  apiFindResult,
  apiTicketQuery,
  apiGetChangtiaoForisseno,
  apiGetChangtiaoForlname,
} from "@/api/apis.js";
import { onLoad } from "@dcloudio/uni-app";
import tool from "@/utils/tool.js";
enum pageName {
  qihao, // 期号展示
  guilei, // 归类展示
}
const nowPage: Ref<pageName> = ref(pageName.qihao);

const tagOptions = ref(changtiao.typeList);
const listData = ref([]);
// 切换页面
function changePage(e: pageName) {
  nowPage.value = e;
}

// 标签切换
const tagListActiveTag = ref(changtiao.typeList[0]);
const changtiaoForLname = ref([]);
async function getChantiaoForNameList(event) {
  event.stop();
  uni.showLoading({
    title: "加载中",
  });
  changtiaoForLname.value = [];
  await apiGetChangtiaoForlname(event.value.name)
    .then((res) => {
      changtiaoForLname.value = res.data.records.map((changtiao) => {
        return {
          ...changtiao,
          number: listData.value.find(
            (item) => changtiao.issueno == item.issueno
          )?.number,
        };
      });
      tagListActiveTag.value = event.value;
    })
    .catch(() => {});

  uni.hideLoading();
}

// 获取指定长条的代表色
function getColor(name: string) {
  return changtiao.typeList.find((item) => item.name == name)?.color;
}

function numbertext(item) {
  if (item.number instanceof Array) {
    return item.number.split(" ").join("");
  } else {
    return item.number;
  }
}

//去详情
function toDetail(
  list: any[],
  index: string,
  issueno = nowIssueNo.value.issueno
) {
  uni.previewImage({
    current: index,
    urls: list.map((item) => tool.oss.getFullUrl(item.limg)),
  });
  // const param = tool.formatUrlParams({
  //   title: title,
  //   issueno,
  //   img: img,
  // });
  // uni.navigateTo({
  //   url: "/pages/changtiao/detail?" + param,
  // });
}

const nowIssueNo: Ref<{ issueno: string; opendate: string; number: string }> =
  ref({
    issueno: "-",
    opendate: "-",
    number: "待开奖",
  });
const changtiaoForIsseno = ref([]);
const isLoad = ref(false);
onLoad(async () => {
  uni.showLoading({
    title: "加载中",
  });
  // 获取当期期号
  await apiGetIssueNo({ tname: "排列五" }).then((res) => {
    nowIssueNo.value = { ...nowIssueNo.value, ...res.data };
  });

  // 当期开奖
  await apiFindResult().then((res) => {
    const pailiewu = res.data.find((item) => item.tname === "排列五");
    if (pailiewu.issueno == nowIssueNo.value.issueno) {
      nowIssueNo.value = { ...nowIssueNo.value, number: pailiewu.number };
    }
  });

  await Promise.all([
    // 获取开奖号码
    apiTicketQuery({ tname: "排列五", page: 1, limit: 10 }).then((res) => {
      if (nowIssueNo.value.number == "待开奖") {
        res.data.records.unshift({
          id: "0",
          number: "待开奖",
          issueno: nowIssueNo.value.issueno,
        });
      }
      listData.value = res.data.records;
    }),
    // 获取当期长条
    apiGetChangtiaoForisseno(nowIssueNo.value.issueno).then((res) => {
      changtiaoForIsseno.value = res.data;
    }),
  ]);
  uni.hideLoading();
  isLoad.value = true;
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  // 顶部切换
  .top-tags {
    display: flex;
    align-items: center;
    justify-items: center;

    gap: 20rpx;

    .tag-list-item {
      height: 50rpx;
      box-sizing: content-box;
      font-size: 28rpx;

      &.active {
        font-size: 32rpx;
        color: rgb(223, 34, 34);
        border-bottom: 8rpx solid rgb(223, 34, 34);
      }
    }
  }

  // 归类展示
  .tag-list,
  .qihao-list {
    flex: 1;
    overflow: hidden;
  }

  .custom-tags {
    height: 100%;
    background-color: #efefef;

    .custom-tag-btn {
      padding: 28rpx 40rpx;

      &.active {
        color: rgb(223, 34, 34);
        background-color: #fff;
      }
    }
  }

  .qihao-scrollbox {
    height: 100%;

    .qihao-info {
      display: flex;
      height: 70rpx;
      align-items: center;
      text-align: center;

      .qihao-id {
        flex: 1.4;
      }

      .qihao-opennum {
        flex: 2;
        color: #f00;
      }

      .qihao-date {
        flex: 2;
      }
    }

    .qihao-items {
      display: grid;
      grid-template-columns: repeat(4, 1fr);

      .qihao-item {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 20rpx;
        border: 1px solid #e7e7e741;
      }
      .qihao-item-name {
        height: 100rpx;
        width: 100rpx;
        font-size: 36rpx;
        font-weight: bold;
      }
    }
  }

  .custom-list-item {
    display: flex;
    align-items: center;

    height: 100rpx;
    padding: 0 20rpx;

    border-bottom: 1px solid #e7e7e741;

    font-size: 26rpx;
    .custom-list-item-icon {
      margin-right: 20rpx;
    }
    .custom-list-item-id {
      flex: 1;
    }
    .custom-list-item-num {
      &.active {
        color: #f00;
      }
    }
  }

  .nodata,
  .qihao-tip {
    text-align: center;
    margin: 40rpx 0;
  }

  .qihao-item-name,
  .custom-list-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    text-align: center;
    font-size: 28rpx;
    line-height: 34rpx;

    height: 80rpx;
    width: 80rpx;

    border-radius: 8rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }
}
</style>