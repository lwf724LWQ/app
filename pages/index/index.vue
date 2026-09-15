<template>
  <view class="lottery-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
    <!-- 顶部导航栏 -->
    <view class="top-nav-bar">
      <view
        v-for="(item, index) in topNavList"
        :key="item.key"
        class="top-nav-item"
        :class="{ active: currentNavIndex === index }"
        @click="switchTopNav(index)"
      >
        <text class="top-nav-text">{{ item.name }}</text>
        <view class="top-nav-line"></view>
      </view>
    </view>

    <!-- 内容区：通过 swiper 切换 -->
    <swiper
      class="main-swiper"
      :current="currentNavIndex"
      :indicator-dots="false"
      :autoplay="false"
      :circular="false"
      :duration="250"
      easing-function="default"
      @change="mainSwiperChange"
    >
      <!-- ==================== 推荐 ==================== -->
      <swiper-item>
        <scroll-view
          class="tab-scroll"
          scroll-y
          :refresher-enabled="true"
          :refresher-triggered="refresherTriggered"
          refresher-background="#f5f5f5"
          :lower-threshold="120"
          @refresherrefresh="onRefresherRefresh"
          @scrolltolower="onTabScrollToLower"
        >
          <view class="tab-content">
            <!-- 顶部广告轮播图 -->
            <swiper
              class="ad-swiper"
              indicator-dots="true"
              autoplay="true"
              :interval="swiperIndex == 0 ? 10000 : 3000" 
              duration="500"
              circular="true"
              easing-function="default"
              @change="swiperChange"
            >
              <!-- 世界杯专栏 -->
              <!-- <swiper-item>
                <view class="swiper-item" @click="openShijiebei">
                  <image src="/static/images/banner-shijiebei.png" mode="scaleToFill"></image>
                </view>
              </swiper-item> -->
              <swiper-item>
                <view class="swiper-item">
                  <image src="/static/4eec3b5b6deb298f7b35663a70d256bd.png" mode="scaleToFill"></image>
                </view>
              </swiper-item>
              <swiper-item>
                <view class="swiper-item">
                  <image src="/static/aoRed.jpg" mode="scaleToFill"></image>
                </view>
              </swiper-item>
              <swiper-item>
                <view class="swiper-item" @click="toWxchat">
                  <image src="/static/banner3.jpg" mode="scaleToFill"></image>
                </view>
              </swiper-item>
            </swiper>

            <!-- 开奖结果区域 - 福彩3D -->
            <navigator :url="`/pages/table/table?type=福彩3D&period=${fc3dPeriod}`">
              <view class="lottery-results-fc3d">
                <view class="result-item-fc3d">
                  <view class="result-header-fc3d">
                    <view class="lottery-title-fc3d">福彩3D 第{{ fc3dPeriod }}期</view>
                    <view class="lottery-date">{{ fc3dDate }}</view>
                  </view>
                  <view class="winning-numbers-fc3d">
                    <view class="number-wrapper" v-for="(num, index) in fc3dNumbers" :key="index">
                      <view class="number-item-fc3d">{{ num }}</view>
                      <view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
                    </view>
                  </view>
                </view>
              </view>
            </navigator>

            <!-- 开奖结果区域 - 排列五 -->
            <navigator :url="`/pages/table/table?type=排列五&period=${plwPeriod}`">
              <view class="lottery-results-plw">
                <view class="result-item-plw">
                  <view class="result-header-plw">
                    <view class="lottery-title-plw">排列三 排列五 第{{ plwPeriod }}期</view>
                    <view class="lottery-date">{{ plwDate }}</view>
                  </view>
                  <view class="winning-numbers-plw">
                    <view class="number-wrapper" v-for="(num, index) in plwNumbers" :key="index">
                      <view class="number-item-plw">{{ num }}</view>
                      <view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
                    </view>
                  </view>
                </view>
              </view>
            </navigator>

            <!-- 通知横幅 -->

            <swiper
              class="notice-banner-swiper"
              indicator-dots="true"
              autoplay="true"
              interval="7000"
              duration="500"
              circular="true"
              vertical="true"
              easing-function="default"
            >
              <swiper-item>
                <view class="notice-banner" @click="toWxchat">
                  <uni-icons type="sound" size="32" color="#FF8C00"></uni-icons>
                  <text class="notice-text">欢迎各地大师加微详谈！！！</text>
                  <text class="notice-new">NEW</text>
                  <!-- <uni-icons type="right" size="28" color="#999"></uni-icons> -->
                </view>
              </swiper-item>
              <swiper-item>
                <view class="notice-banner" @click="toActivity">
                  <uni-icons type="sound" size="32" color="#FF8C00"></uni-icons>
                  <text class="notice-text">2026 新版本邀请好友福利来了</text>
                  <text class="notice-new">NEW</text>
                  <!-- <uni-icons type="right" size="28" color="#999"></uni-icons> -->
                </view>
              </swiper-item>
            </swiper>

            <!-- 功能图标区（各彩种板块共用） -->
            <functionIcons :tname="currentLotteryTag" />
    
            <!-- <view class="post-container">
              <view class="post-title">
                足球热门讨论
                <view class="more-post-btn" @click="goToZcPostList">
                  更多
                </view>
              </view>
              <zcPostCard v-for="item in zcList" :postData="item" @postCard="openZcPostDetail(item)" />
            </view> -->

            <view class="post-container">
              <view class="post-title">
                中奖精彩合集
                <view class="more-post-btn" @click="goToCollectionList()">
                  更多
                </view>
              </view>
              <zcPostCard v-for="item in collectionList" :postData="item" @postCard="openZcPostDetail(item)" />
            </view>

            <view class="post-container">
              <view class="post-title">
                热门预测贴
              </view>
              <view class="switch-tabs">
                <view
                  v-for="lotteryType in lotteryTag"
                  :key="lotteryType"
                  class="tab-item"
                  :class="{ active: lotteryType === currentLotteryTag }"
                  @click="selectLotteryType(lotteryType)"
                >
                  <text class="tab-text">{{ lotteryType }}</text>
                </view>
              </view>
              <postCard
                v-for="(item, index) in lotteryList"
                :key="index"
                :post="item"
              />
              <view class="no-more">没有更多帖子了</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- ==================== 排列三 ==================== -->
      <swiper-item>
        <scroll-view
          class="tab-scroll"
          scroll-y
          :refresher-enabled="true"
          :refresher-triggered="refresherTriggered"
          refresher-background="#f5f5f5"
          :lower-threshold="120"
          @refresherrefresh="onRefresherRefresh"
          @scrolltolower="onTabScrollToLower"
        >
          <view class="tab-content">
            <!-- 排列三开奖结果 -->
            <navigator :url="`/pages/table/table?type=排列三&period=${plwPeriod}`">
              <view class="lottery-results-plw">
                <view class="result-item-plw">
                  <view class="result-header-plw">
                    <view class="lottery-title-plw">排列三 第{{ plwPeriod }}期</view>
                    <view class="lottery-date">{{ plwDate }}</view>
                  </view>
                  <view class="winning-numbers-plw">
                    <view
                      class="number-wrapper"
                      v-for="(num, index) in pl3DisplayNumbers"
                      :key="'pl3-' + index"
                    >
                      <view class="number-item-plw">{{ num }}</view>
                      <view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
                    </view>
                  </view>
                </view>
              </view>
            </navigator>

            <!-- 功能图标区（各彩种板块共用） -->
            <functionIcons tname="排列三" />

            <!-- 中奖精彩合集（排列三） -->
            <view class="post-container">
              <view class="post-title">
                中奖精彩合集
                <view class="more-post-btn" @click="goToCollectionList('排列三')">
                  更多
                </view>
              </view>
              <zcPostCard
                v-for="item in pl3CollectionList"
                :key="'pl3-collection-' + item.id"
                :postData="item"
                @postCard="openCollectionDetail(item)"
              />
              <view class="no-more" v-if="pl3CollectionLoaded && pl3CollectionList.length === 0">暂无中奖精彩合集</view>
            </view>

            <!-- 排列三预测贴 -->
            <view class="post-container">
              <view class="post-title">排列三 热门预测贴</view>
              <postCard v-for="(item, index) in pl3List" :key="'pl3-post-' + index" :post="item" />
              <view class="no-more" v-if="pl3Loaded && pl3List.length === 0">暂无排列三预测贴</view>
              <view class="no-more" v-else-if="pl3List.length > 0">没有更多帖子了</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- ==================== 排列五 ==================== -->
      <swiper-item>
        <scroll-view
          class="tab-scroll"
          scroll-y
          :refresher-enabled="true"
          :refresher-triggered="refresherTriggered"
          refresher-background="#f5f5f5"
          :lower-threshold="120"
          @refresherrefresh="onRefresherRefresh"
          @scrolltolower="onTabScrollToLower"
        >
          <view class="tab-content">
            <!-- 排列五开奖结果 -->
            <navigator :url="`/pages/table/table?type=排列五&period=${plwPeriod}`">
              <view class="lottery-results-plw">
                <view class="result-item-plw">
                  <view class="result-header-plw">
                    <view class="lottery-title-plw">排列五 第{{ plwPeriod }}期</view>
                    <view class="lottery-date">{{ plwDate }}</view>
                  </view>
                  <view class="winning-numbers-plw">
                    <view
                      class="number-wrapper"
                      v-for="(num, index) in plwNumbers"
                      :key="'pl5-' + index"
                    >
                      <view class="number-item-plw">{{ num }}</view>
                      <view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
                    </view>
                  </view>
                </view>
              </view>
            </navigator>

            <!-- 功能图标区（各彩种板块共用） -->
            <functionIcons tname="排列五" />

            <!-- 中奖精彩合集（排列五） -->
            <view class="post-container">
              <view class="post-title">
                中奖精彩合集
                <view class="more-post-btn" @click="goToCollectionList('排列五')">
                  更多
                </view>
              </view>
              <zcPostCard
                v-for="item in pl5CollectionList"
                :key="'pl5-collection-' + item.id"
                :postData="item"
                @postCard="openCollectionDetail(item)"
              />
              <view class="no-more" v-if="pl5CollectionLoaded && pl5CollectionList.length === 0">暂无中奖精彩合集</view>
            </view>

            <!-- 排列五预测贴 -->
            <view class="post-container">
              <view class="post-title">排列五 热门预测贴</view>
              <postCard v-for="(item, index) in pl5List" :key="'pl5-post-' + index" :post="item" />
              <view class="no-more" v-if="pl5Loaded && pl5List.length === 0">暂无排列五预测贴</view>
              <view class="no-more" v-else-if="pl5List.length > 0">没有更多帖子了</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- ==================== 福彩3D ==================== -->
      <swiper-item>
        <scroll-view
          class="tab-scroll"
          scroll-y
          :refresher-enabled="true"
          :refresher-triggered="refresherTriggered"
          refresher-background="#f5f5f5"
          :lower-threshold="120"
          @refresherrefresh="onRefresherRefresh"
          @scrolltolower="onTabScrollToLower"
        >
          <view class="tab-content">
            <!-- 福彩3D开奖结果 -->
            <navigator :url="`/pages/table/table?type=福彩3D&period=${fc3dPeriod}`">
              <view class="lottery-results-fc3d">
                <view class="result-item-fc3d">
                  <view class="result-header-fc3d">
                    <view class="lottery-title-fc3d">福彩3D 第{{ fc3dPeriod }}期</view>
                    <view class="lottery-date">{{ fc3dDate }}</view>
                  </view>
                  <view class="winning-numbers-fc3d">
                    <view
                      class="number-wrapper"
                      v-for="(num, index) in fc3dNumbers"
                      :key="'fc3d-' + index"
                    >
                      <view class="number-item-fc3d">{{ num }}</view>
                      <view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
                    </view>
                  </view>
                </view>
              </view>
            </navigator>

            <!-- 功能图标区（各彩种板块共用） -->
            <functionIcons tname="福彩3D" />

            <!-- 中奖精彩合集（福彩3D） -->
            <view class="post-container">
              <view class="post-title">
                中奖精彩合集
                <view class="more-post-btn" @click="goToCollectionList('福彩3D')">
                  更多
                </view>
              </view>
              <zcPostCard
                v-for="item in fc3dCollectionList"
                :key="'fc3d-collection-' + item.id"
                :postData="item"
                @postCard="openCollectionDetail(item)"
              />
              <view class="no-more" v-if="fc3dCollectionLoaded && fc3dCollectionList.length === 0">暂无中奖精彩合集</view>
            </view>

            <!-- 福彩3D预测贴 -->
            <view class="post-container">
              <view class="post-title">福彩3D 热门预测贴</view>
              <postCard v-for="(item, index) in fc3dList" :key="'fc3d-post-' + index" :post="item" />
              <view class="no-more" v-if="fc3dLoaded && fc3dList.length === 0">暂无福彩3D预测贴</view>
              <view class="no-more" v-else-if="fc3dList.length > 0">没有更多帖子了</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>

      <!-- ==================== 试机号 ==================== -->
      <swiper-item>
        <scroll-view
          class="tab-scroll"
          scroll-y
          :refresher-enabled="true"
          :refresher-triggered="refresherTriggered"
          refresher-background="#f5f5f5"
          @refresherrefresh="onRefresherRefresh"
        >
          <view class="tab-content">
            <!-- 试机号列表（每个期号一张卡片） -->
            <shijihaoList :list="shijihaoList" :isLoaded="shijihaoLoaded" />
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- <PrivacyPolicyModal :visible="true"></PrivacyPolicyModal> -->
    <!-- <bottomBar current-path="/pages/index/index" /> -->
    <updateAppPupop ref="updateAppPupopRef" />

    <ActivityHover src="/static/images/activity-invite.png" @click="share"></ActivityHover>
  </view>
</template>

<script>
import { apiFindResult } from "@/api/apis.js";
import { mode } from "crypto-js";
import PrivacyPolicyModal from "../../components/PrivacyPolicyModal.vue";
import { useUserStore } from "../../stores/userStore";
import tool from "../../utils/tool";
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";
import updateAppPupop from "../../components/updateApp-pupop/updateApp-pupop.vue";
import ActivityHover from "@/components/activity-hover.vue";
import { createShareUrl } from "@/utils/createShareUrl";
import { useLoadLotteryList } from "./loadLotteryPostListHooks.js";
import postCard from "../../components/post-card/post-card.vue";
import zcPostCard from "../zc/components/post-card.vue"
import useZcPostListHooks from "./zc-postListHooks.js"
import usecollectionHooks from "./loadCollectionHooks.js"
import useShijihaoList from "./loadShijihaoHooks.js"
import functionIcons from "./components/function-icons.vue"
import shijihaoList from "./components/shijihao-list.vue"

export default {
  inject: ["useOldManModeStore"],
  components: { PrivacyPolicyModal, bottomBar, updateAppPupop, ActivityHover, postCard, zcPostCard, functionIcons, shijihaoList },
  data() {
    this.lotteryListHooks = useLoadLotteryList()
    this.pl3ListHooks = useLoadLotteryList()
    this.pl5ListHooks = useLoadLotteryList()
    this.fc3dListHooks = useLoadLotteryList()
    // 中奖精彩合集按彩种区分：推荐页为全部彩种，各彩种板块按需加载
    this.pl3CollectionHooks = usecollectionHooks("排列三", false)
    this.pl5CollectionHooks = usecollectionHooks("排列五", false)
    this.fc3dCollectionHooks = usecollectionHooks("福彩3D", false)
    this.shijihaoHooks = useShijihaoList()
    this.zcPostListHooks = useZcPostListHooks()
    this.collectionHooks = usecollectionHooks()
    return {
      currentTab: "plw",

      // 顶部导航栏（内容通过 swiper 切换）
      topNavList: [
        { key: "recommend", name: "推荐" },
        { key: "pl3", name: "排列三" },
        { key: "pl5", name: "排列五" },
        { key: "fc3d", name: "福彩3D" },
        { key: "shijihao", name: "试机号" },
      ],
      currentNavIndex: 0,
      refresherTriggered: false,
      pl3Loaded: false,
      pl5Loaded: false,
      fc3dLoaded: false,
      pl3CollectionLoaded: false,
      pl5CollectionLoaded: false,
      fc3dCollectionLoaded: false,
      shijihaoLoaded: false,
      pl3Numbers: [],

      fc3dNumbers: ["3", "8", "5"],
      plwNumbers: ["9", "0", "5", "3", "2"],
      qxcNumbers: ["8", "0", "6", "5", "7", "9", "7"],
      fc3dPeriod: "第25123期",
      plwPeriod: "第25285期",
      qxcPeriod: "第25123期",
      fc3dDate: "10.26 周日",
      plwDate: "10.26 周日",
      qxcDate: "10.26 周日",
      isLoadingResults: false, // 添加加载锁

      swiperIndex: 0,

      // 彩票帖子
      lotteryTag: ["排列三", "排列五","福彩3D"],
      currentLotteryTag: "排列五"
    };
  },
  computed: {
    lotteryList(){
      return this.lotteryListHooks.list.value
    },
    // 排列三预测贴
    pl3List(){
      return this.pl3ListHooks.list.value
    },
    // 排列五预测贴
    pl5List(){
      return this.pl5ListHooks.list.value
    },
    // 福彩3D预测贴
    fc3dList(){
      return this.fc3dListHooks.list.value
    },
    // 各彩种的中奖精彩合集
    pl3CollectionList(){
      return this.pl3CollectionHooks.list.value
    },
    pl5CollectionList(){
      return this.pl5CollectionHooks.list.value
    },
    fc3dCollectionList(){
      return this.fc3dCollectionHooks.list.value
    },
    // 试机号列表
    shijihaoList(){
      return this.shijihaoHooks.list.value
    },
    // 排列三开奖号码：接口未返回排列三时，取排列五前三位（两者同期开奖）
    pl3DisplayNumbers(){
      if (this.pl3Numbers && this.pl3Numbers.length) {
        return this.pl3Numbers
      }
      return this.plwNumbers.slice(0, 3)
    },
    zcList(){
      return this.zcPostListHooks.list.value
    },
    collectionList(){
      return this.collectionHooks.list.value
    }
  },
  methods: {
    openZcPostDetail(item){
      this.zcPostListHooks.openDetail(item)
    },
    swiperChange(e){
      this.swiperIndex = e.detail.current
    },
    // 点击顶部导航切换
    switchTopNav(index){
      if (this.currentNavIndex === index) return
      this.currentNavIndex = index
      this.ensureTabData(index)
    },
    // swiper 滑动切换
    mainSwiperChange(e){
      const index = e.detail.current
      this.currentNavIndex = index
      this.ensureTabData(index)
    },
    // 按需加载当前 tab 的数据
    ensureTabData(index = this.currentNavIndex){
      const nav = this.topNavList[index]
      if (!nav) return
      if (nav.key === "pl3") {
        if (!this.pl3Loaded) this.loadPl3List(true)
        if (!this.pl3CollectionLoaded) this.loadPl3Collection()
      } else if (nav.key === "pl5") {
        if (!this.pl5Loaded) this.loadPl5List(true)
        if (!this.pl5CollectionLoaded) this.loadPl5Collection()
      } else if (nav.key === "fc3d") {
        if (!this.fc3dLoaded) this.loadFc3dList(true)
        if (!this.fc3dCollectionLoaded) this.loadFc3dCollection()
      } else if (nav.key === "shijihao") {
        if (!this.shijihaoLoaded) this.loadShijihaoList()
      }
    },
    // 试机号列表
    async loadShijihaoList(){
      try {
        await this.shijihaoHooks.getList()
      } finally {
        this.shijihaoLoaded = this.shijihaoHooks.isLoaded.value
      }
    },
    // 各彩种的中奖精彩合集
    async loadPl3Collection(){
      try {
        await this.pl3CollectionHooks.getList()
      } finally {
        this.pl3CollectionLoaded = true
      }
    },
    async loadPl5Collection(){
      try {
        await this.pl5CollectionHooks.getList()
      } finally {
        this.pl5CollectionLoaded = true
      }
    },
    async loadFc3dCollection(){
      try {
        await this.fc3dCollectionHooks.getList()
      } finally {
        this.fc3dCollectionLoaded = true
      }
    },
    // 排列三预测贴
    async loadPl3List(isRefresher = false){
      try {
        await this.pl3ListHooks.loadLotteryData(isRefresher, "排列三")
      } catch (error) {
        console.error("加载排列三预测贴失败:", error)
      } finally {
        this.pl3Loaded = true
      }
    },
    // 排列五预测贴
    async loadPl5List(isRefresher = false){
      try {
        await this.pl5ListHooks.loadLotteryData(isRefresher, "排列五")
      } catch (error) {
        console.error("加载排列五预测贴失败:", error)
      } finally {
        this.pl5Loaded = true
      }
    },
    // 福彩3D预测贴
    async loadFc3dList(isRefresher = false){
      try {
        await this.fc3dListHooks.loadLotteryData(isRefresher, "福彩3D")
      } catch (error) {
        console.error("加载福彩3D预测贴失败:", error)
      } finally {
        this.fc3dLoaded = true
      }
    },
    // 当前 tab 的 scroll-view 触底
    onTabScrollToLower(){
      const nav = this.topNavList[this.currentNavIndex]
      if (!nav) return
      if (nav.key === "recommend") {
        this.loadLotteryList()
      } else if (nav.key === "pl3") {
        this.loadPl3List()
      } else if (nav.key === "pl5") {
        this.loadPl5List()
      } else if (nav.key === "fc3d") {
        this.loadFc3dList()
      }
    },
    // 下拉刷新（由各 tab 的 scroll-view 触发）
    async onRefresherRefresh(){
      if (this.refresherTriggered) return
      this.refresherTriggered = true
      const nav = this.topNavList[this.currentNavIndex]
      try {
        await this.loadLotteryResults()
        if (!nav || nav.key === "recommend") {
          await this.loadLotteryList(true)
          await this.collectionHooks.getList()
          await this.zcPostListHooks.getList()
        } else if (nav.key === "pl3") {
          await this.loadPl3List(true)
          await this.loadPl3Collection()
        } else if (nav.key === "pl5") {
          await this.loadPl5List(true)
          await this.loadPl5Collection()
        } else if (nav.key === "fc3d") {
          await this.loadFc3dList(true)
          await this.loadFc3dCollection()
        } else if (nav.key === "shijihao") {
          await this.loadShijihaoList()
        }
      } catch (error) {
        console.error("刷新失败:", error)
      }
      setTimeout(() => {
        this.refresherTriggered = false
      }, 200)
    },
    // 功能图标区的交互统一放在 components/function-icons.vue 内
    toChangtiao() {
      if (tool.isLogin()) {
        uni.navigateTo({
          url: "/pages/changtiao/index",
        });
      }
    },
    goToDreamInterpretation() {
      const userStore = useUserStore();
      if (userStore.getUserInfo.account) {
        uni.navigateTo({
          url: "/pages/dream-interpretation/dream-interpretation",
        });
      } else {
        uni.showModal({
          title: "提示",
          content: "该功能需要登录，是否前往",
          success: async (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: "/pages/login/login" });
            }
          },
          showCancel: true,
        });
      }
    },
    toWxchat() {
      uni.navigateTo({
        url: "/pages/share/wxchat",
      });
    },
    showAboutAs() {
      uni.navigateTo({
        url: "/pages/login/agreement?type=AboutAs",
      });
    },
    // 加载开奖结果
    async loadLotteryResults() {
      // 防止重复调用
      if (this.isLoadingResults) {
        return;
      }

      try {
        this.isLoadingResults = true;
        // uni.showLoading({ title: "加载中..." });

        const response = await apiFindResult();

        // uni.hideLoading();

        if (response.code === 200 && response.data) {
          const results = response.data;

          // 检查数据格式 - 可能是一个数组
          let dataArray = results;
          if (Array.isArray(results)) {
            dataArray = results;
          } else if (results.records && Array.isArray(results.records)) {
            dataArray = results.records;
          } else if (results.data && Array.isArray(results.data)) {
            dataArray = results.data;
          }

          // 遍历数据，根据彩票名称匹配
          dataArray.forEach((item) => {
            const tname = item.tname || item.name;

            // 福彩3D
            if (tname && tname.includes("福彩3D")) {
              this.fc3dNumbers = this.parseNumbers(item.number);
              this.fc3dPeriod = item.issueno;
              // 更新日期
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.fc3dDate = this.formatDate(date);
              }
            }

            // 排列五
            if (tname && tname.includes("排列五")) {
              this.plwNumbers = this.parseNumbers(item.number);
              this.plwPeriod = item.issueno;
              // 更新日期
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.plwDate = this.formatDate(date);
              }
            }

            // 排列三
            if (tname && tname.includes("排列三")) {
              // 排列三和排列五共用期号
              this.plwPeriod = item.issueno;
              // 排列三开奖号码
              const pl3 = this.parseNumbers(item.number);
              if (pl3.length) {
                this.pl3Numbers = pl3;
              }
              // 排列三的日期会覆盖排列五的日期（因为排列五在前面）
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.plwDate = this.formatDate(date);
              }
            }

            // 七星彩
            if (tname && tname.includes("七星彩")) {
              let numbers = this.parseNumbers(item.number);
              // 如果有refernumber，添加到末尾
              if (item.refernumber) {
                numbers.push(item.refernumber);
              }
              this.qxcNumbers = numbers;
              this.qxcPeriod = item.issueno;
              // 更新日期
              if (item.opendate || item.date || item.createTime) {
                const date = item.opendate || item.date || item.createTime;
                this.qxcDate = this.formatDate(date);
              }
            }
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error("加载开奖结果失败:", error);
        // 保持默认数据，不显示错误提示
      } finally {
        this.isLoadingResults = false;
      }
    },
    // 解析中奖号码（支持字符串和数组格式）
    parseNumbers(numbers) {
      if (!numbers) {
        return [];
      }

      if (Array.isArray(numbers)) {
        return numbers.map((n) => String(n));
      }

      if (typeof numbers === "string") {
        // 如果是空格分隔的字符串（如 "1 7 2"）
        if (numbers.includes(" ")) {
          return numbers
            .split(" ")
            .map((n) => n.trim())
            .filter((n) => n)
            .map((n) => String(n));
        }
        // 如果是逗号分隔的字符串
        if (numbers.includes(",")) {
          return numbers
            .split(",")
            .map((n) => n.trim())
            .filter((n) => n)
            .map((n) => String(n));
        }
        // 如果是普通字符串，按字符分割
        return numbers
          .split("")
          .map((n) => n.trim())
          .filter((n) => n)
          .map((n) => String(n));
      }

      // 如果是数字，转为字符串
      if (typeof numbers === "number") {
        return String(numbers).split("");
      }

      return [];
    },
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return "10.26 周日";

      try {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const weekday = weekdays[date.getDay()];

        return `${month}.${day} ${weekday}`;
      } catch (e) {
        return "10.26 周日";
      }
    },
    goToSearchuser() {
      uni.navigateTo({
        url: "/pages/index/searchUser",
      });
    },
    toActivity() {
      if (tool.isLogin("登录后邀请对方注册后双方可得10金币！")) {
        uni.navigateTo({
          url: "/pages/activity-page/activity-page",
        });
      }
    },
    toFollowList() {
      if (tool.isLogin("当前未登录，请先登录")) {
        uni.navigateTo({
          url: "/pages/user/follow-list?type=follow",
        });
      }
    },
    toWxchat() {
      uni.navigateTo({
        url: "/pages/share/wxchat",
      });
    },
    share() {
      uni.showModal({
        title: "提示",
        content: "请分享后让好友将链接复制到浏览器中打开",
        showCancel: false,
        success: (res) => {
          uni.shareWithSystem({
            provider: "weixin",
            type: "text",
            href: createShareUrl(),
            summary: createShareUrl(),
            scene: "WXSceneSession",
            success(res) {},
            fail(err) {},
          });
        },
      });
    },
    loadLotteryList(isRefresher = false){
      uni.showLoading()
      return this.lotteryListHooks.loadLotteryData(isRefresher, this.currentLotteryTag)
      .finally(uni.hideLoading)
      
    },
    openShijiebei(){
      uni.setStorageSync("toShijiebei", true)
      uni.switchTab({
        url: "/pages/zc/index"
      })
    },
    goToZcPostList(){
      uni.setStorageSync("openZcPostList", true)
      uni.switchTab({
        url: "/pages/zc/index"
      })
    },
    // 打开中奖精彩合集详情
    openCollectionDetail(item){
      this.collectionHooks.openDetail(item)
    },
    // 更多：跳到彩友圈的精彩合集；带彩种时定位到对应彩种
    goToCollectionList(tname){
      if (typeof tname === "string" && tname) {
        uni.setStorageSync("openCollectionTname", tname)
      }
      uni.setStorageSync("openCollectionList", true)
      uni.switchTab({
        url: "/pages/forum/forum"
      })
    },
    selectLotteryType(lotteryName){
      this.currentLotteryTag = lotteryName
      this.loadLotteryList(true)
    }
  },
  onShow() {
    // 加载开奖结果
    this.loadLotteryResults();
  },
  onReachBottom(){
    // 页面触底 加载当前 tab 的帖子
    this.onTabScrollToLower()
  },
  mounted() {
    this.$refs.updateAppPupopRef.check();
    
    this.loadLotteryList(true)

  },
  // 页面级下拉刷新（正常由各 tab 的 scroll-view 触发，这里做兜底）
  async onPullDownRefresh(){
    try {
      await this.onRefresherRefresh()
    } catch (error) {
      
    }
    setTimeout(uni.stopPullDownRefresh, 200)
    
  },
  onLoad() {
    // tool.checkAppUpdate();
  },
};
</script>

<style lang="scss" scoped>
.lottery-container:not(.old-man-mode) {
  display: flex;
  flex-direction: column;
  // 固定高度容器：内容在各自的 scroll-view 内滚动，swiper 才能正常切换
  height: calc(100vh - var(--window-bottom, 0px));
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f5f5f5;
  padding-top: var(--status-bar-height);

  /* 轮播图样式 */
  .ad-swiper {
    width: 100%;
    height: 320rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-sizing: border-box;
  }

  .swiper-item {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    overflow: hidden;
  }

  .swiper-item image {
    width: 100%;
    height: 100%;
  }

  /* 福彩3D开奖结果 */
  .lottery-results-fc3d {
    margin: 0 20rpx 20rpx 20rpx;
  }

  .result-item-fc3d {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-fc3d {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .lottery-title-fc3d {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .winning-numbers-fc3d {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-fc3d {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  /* 排列五开奖结果 */
  .lottery-results-plw {
    margin: 0 20rpx 20rpx 20rpx;
  }

  .result-item-plw {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-plw {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .lottery-title-plw {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .lottery-date {
    font-size: 24rpx;
    color: #666;
  }

  .winning-numbers-plw {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .number-item-plw {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  .number-label {
    font-size: 20rpx;
    color: #999;
  }

  /* 七星彩开奖结果 */
  .lottery-results-qxc {
    margin: 0 20rpx 20rpx 20rpx;
  }

  .result-item-qxc {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-qxc {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .lottery-title-qxc {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
  }

  .winning-numbers-qxc {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-qxc {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
  }

  /* 七星彩最后一个号码球显示为绿色 */
  .number-item-qxc.qxc-special {
    background-color: #28b389;
  }

  /* 通知横幅 */
  .notice-banner {
    display: flex;
    align-items: center;
    margin: 0 20rpx 20rpx 20rpx;
    padding: 20rpx;
    background-color: #fff;
    border-radius: 10rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  /* 通知横幅图标样式 */
  .notice-banner uni-icons[type="sound"] {
    margin-right: 10rpx;
  }

  .notice-banner uni-icons[type="right"] {
    margin-left: 0;
  }

  .notice-text {
    font-size: 26rpx;
    color: #e74c3c;
    flex: 1;
  }

  .notice-new {
    font-size: 20rpx;
    color: #fff;
    background-color: #e74c3c;
    padding: 4rpx 10rpx;
    border-radius: 4rpx;
    margin-right: 10rpx;
  }

  /* 功能图标区样式见 components/function-icons.vue */
}

.lottery-container.old-man-mode {
  display: flex;
  flex-direction: column;
  // 固定高度容器：内容在各自的 scroll-view 内滚动，swiper 才能正常切换
  height: calc(100vh - var(--window-bottom, 0px));
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f5f5f5;
  padding-top: var(--status-bar-height);

  /* 轮播图样式 */
  .ad-swiper {
    width: 100%;
    height: 300rpx;
  }

  .swiper-item {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 30rpx;
    overflow: hidden;
  }

  .swiper-item image {
    width: 100%;
    height: 100%;
  }

  /* 顶部导航栏（老年模式） */
  .top-nav-bar {
    height: 110rpx;
  }

  .top-nav-text {
    font-size: 42rpx;
    color: #353434;
  }

  .top-nav-item.active .top-nav-text {
    font-size: 46rpx;
  }

  .top-nav-item.active .top-nav-line {
    width: 72rpx;
    height: 8rpx;
  }

  /* 福彩3D开奖结果 */
  .lottery-results-fc3d {
  }

  .result-item-fc3d {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-fc3d {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lottery-title-fc3d {
    font-size: 40rpx;
    font-weight: bold;
    color: #000;
  }

  .winning-numbers-fc3d {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-fc3d {
    width: 80rpx;
    height: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: #fff;
    margin-bottom: 8rpx;
  }

  /* 排列五开奖结果 */
  .lottery-results-plw {
    margin: 0;
  }

  .result-item-plw {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-plw {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lottery-title-plw {
    font-size: 38rpx;
    font-weight: bold;
    color: #000;
  }

  .lottery-date {
    font-size: 44rpx;
    color: #000;
    font-weight: bold;
  }

  .winning-numbers-plw {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .number-item-plw {
    width: 80rpx;
    height: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: #fff;
    margin-bottom: 8rpx;
  }

  .number-label {
    font-size: 35rpx;
    font-weight: bold;
    color: #000000;
  }

  /* 七星彩开奖结果 */
  .lottery-results-qxc {
    margin: 0 0;
  }

  .result-item-qxc {
    background-color: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .result-header-qxc {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }

  .lottery-title-qxc {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }

  .winning-numbers-qxc {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10rpx;
  }

  .number-item-qxc {
    width: 80rpx;
    height: 80rpx;
    font-size: 72rpx;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e74c3c;
    border-radius: 50%;
    color: #fff;
  }

  /* 七星彩最后一个号码球显示为绿色 */
  .number-item-qxc.qxc-special {
    background-color: #28b389;
  }

  /* 通知横幅 */
  .notice-banner {
    display: flex;
    align-items: center;
    height: 105rpx;
    padding: 0 20rpx;
    background-color: #fff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  /* 通知横幅图标样式 */
  .notice-banner uni-icons[type="sound"] {
    margin-right: 10rpx;
  }

  .notice-banner uni-icons[type="right"] {
    margin-left: 0;
  }

  .notice-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #e74c3c;
    flex: 1;
  }

  .notice-new {
    font-size: 20rpx;
    color: #fff;
    background-color: #e74c3c;
    padding: 4rpx 10rpx;
    margin-right: 10rpx;
  }

  /* 功能图标区样式见 components/function-icons.vue */
}
.notice-banner-swiper {
  margin: 10rpx 0;
  height: 105rpx;
}

/* ==================== 顶部导航栏 ==================== */
.top-nav-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 88rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);
  z-index: 10;
}

.top-nav-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.top-nav-text {
  font-size: 28rpx;
  color: #666;
  transition: color 0.2s ease;
}

.top-nav-line {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 6rpx;
  border-radius: 6rpx;
  background-color: #ff4757;
  transition: width 0.2s ease;
}

.top-nav-item.active .top-nav-text {
  color: #ff4757;
  font-weight: bold;
  font-size: 30rpx;
}

.top-nav-item.active .top-nav-line {
  width: 48rpx;
}

/* ==================== 内容 swiper ==================== */
.main-swiper {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tab-scroll {
  width: 100%;
  height: 100%;
}

.tab-content {
  padding-bottom: 40rpx;
}

.no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 28rpx;
  padding-bottom: 150rpx;
}

.post-container{
  
  .post-title{
    border-left: 6rpx solid #F00;
    padding: 12rpx;
    margin: 12rpx 0;
    font-weight: bold;
    font-size: 38rpx;
    display: flex;
    
    justify-content: space-between;
    // background-color: #f0f69e;
  }
  .more-post-btn{
    font-size: 36rpx;
    font-weight: lighter;
  }

}

/* 切换标签栏 */
.switch-tabs {
  left: 0;
  right: 0;
  height: 88rpx;
  flex-basis: 88rpx;
  background-color: #fff;
  z-index: 998;
  display: flex;
  /* 优化触摸性能 */
  touch-action: manipulation;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 4rpx solid transparent;
  /* 优化触摸性能 */
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #000000;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #ff4757;
}

</style>
